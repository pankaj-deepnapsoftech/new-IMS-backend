const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { TryCatch, ErrorHandler } = require("../utils/error");
const User = require("../models/user");
const OTP = require("../models/otp");
const { generateOTP } = require("../utils/generateOTP");
const { sendEmail } = require("../utils/sendEmail");

exports.create = TryCatch(async (req, res) => {
  const userDetails = req.body;
  const totalUsers = await User.find().countDocuments();

  let isSuper = false;
  // If it is the first user then make it the super admin
  if (totalUsers === 0) {
    isSuper = true;
  }

  const user = await User.create({ ...userDetails, isSuper });
  user.password = undefined;

  let otp = generateOTP(4);
  await OTP.create({ email: user?.email, otp });

  sendEmail(
    "Account Verification",
    `
      <strong>Dear ${user.first_name}</strong>,
  
      <p>Thank you for registering with us! To complete your registration and verify your account, please use the following One-Time Password (OTP): <strong>${otp}</strong></p>

      <p>This OTP is valid for 5 minutes. Do not share your OTP with anyone.</p>
      `,
    user?.email
  );

  res.status(200).json({
    status: 200,
    success: true,
    message:
      "User has been created successfully. OTP has been successfully sent to your email id",
    user,
  });
});
exports.verifyUser = TryCatch(async (req, res) => {
  const { email } = req.body;
  await OTP.findOneAndDelete({ email });
  await User.findOneAndUpdate({ email }, { isVerified: true });
  res.status(200).json({
    status: 200,
    success: true,
    message: "Your account has been verified successfully",
  });
});
exports.update = TryCatch(async (req, res) => {
  const {_id, role} = req.body;

  if(!_id || !role){
    throw new ErrorHandler('Please provide all the fields', 400);
  }

  const user = await User.findByIdAndUpdate(
    _id,
    { role, isSuper: false },
    { new: true }
  );
  if (!user) {
    throw new ErrorHandler("User doesn't exist", 400);
  }
  user.password = undefined;

  res.status(200).json({
    status: 200,
    success: true,
    message: "User has been updated successfully",
    user,
  });
});
exports.remove = TryCatch(async (req, res) => {
  const userId = req.user._id;

  const user = await User.findById(userId);
  if (!user) {
    throw new ErrorHandler("User doesn't exist", 400);
  }
  await user.deleteOne();

  res.status(200).json({
    status: 200,
    success: true,
    message: "User has been deleted successfully",
  });
});
exports.details = TryCatch(async (req, res) => {
  const userId = req.user._id;

  const user = await User.findById(userId).populate("role");
  if (!user) {
    throw new ErrorHandler("User doesn't exist", 400);
  }

  res.status(200).json({
    status: 200,
    success: true,
    user,
  });
});
exports.employeeDetails = TryCatch(async (req, res) => {
  const userId = req.params._id;

  if(!userId){
    throw new ErrorHandler("User id not found", 400);
  }

  const user = await User.findById(userId);
  if (!user) {
    throw new ErrorHandler("User doesn't exist", 400);
  }

  res.status(200).json({
    status: 200,
    success: true,
    user,
  });
});
exports.loginWithPassword = TryCatch(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select(
    "first_name last_name email phone role isSuper password"
  ).populate('role');
  if (!user) {
    throw new Error("User doesn't exist", 400);
  }

  const isMatched = await bcrypt.compare(password, user.password);
  if (!isMatched) {
    throw new ErrorHandler(
      "Make sure you have entered correct Email Id and Password",
      401
    );
  }

  // CREATING JWT TOKEN
  const token = jwt.sign(
    {
      email: user.email,
      iat: Math.floor(Date.now() / 1000) - 30,
    },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );

  user.password = undefined;

  res.status(200).json({
    status: 200,
    success: false,
    message: "Logged in successfully",
    user,
    token,
  });
});
exports.loginWithToken = TryCatch(async (req, res) => {
  const token = req.headers?.authorization?.split(" ")[1];

  if (!token) {
    throw new ErrorHandler("Authorization token not provided", 401);
  }

  const verified = jwt.verify(token, process.env.JWT_SECRET);
  const currentTimeInSeconds = Math.floor(Date.now() / 1000);

  if (
    verified &&
    verified.iat < currentTimeInSeconds &&
    verified.exp > currentTimeInSeconds
  ) {
    const user = await User.findOne({ email: verified?.email }).populate('role');
    if (!user) {
      throw new ErrorHandler("User doesn't exist", 401);
    }

    const newToken = jwt.sign(
      {
        email: user.email,
        iat: Math.floor(Date.now() / 1000) - 30,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    return res.status(200).json({
      status: 200,
      success: true,
      message: "Logged in successfully",
      user,
      token: newToken,
    });
  }
  throw new ErrorHandler("Session expired, login again", 401);
});
exports.resetPasswordRequest = TryCatch(async (req, res) => {
  const {email} = req.body;
  if(!email){
    throw new ErrorHandler("Email Id not provided", 400);
  }
  const user = await User.findOne({email});
  if (!user) {
    throw new ErrorHandler("User doesn't exist", 400);
  }

  let isExistingOTP = await OTP.findOne({ email: user.email });
  if (isExistingOTP) {
    sendEmail(
      "Reset Password Verification",
      `
        <strong>Dear ${user.first_name}</strong>,
    
        <p>We received a request to reset the password for your account associated with this email address.</p>
        <br>
        <p>To reset your password, please use the following One-Time Password (OTP): <strong>${isExistingOTP.otp}</strong></p>
    
        <p>This OTP is valid for 5 minutes. Do not share your OTP with anyone.</p>
        `,
      user?.email
    );
    return res.status(200).json({
      status: 200,
      success: false,
      message: "OTP has been successfully sent to your email id",
    });
  }

  let otp = generateOTP(4);
  await OTP.create({ email: user?.email, otp });

  sendEmail(
    "Reset Password Verification",
    `
    <strong>Dear ${user?.first_name}</strong>,

    <p>We received a request to reset the password for your account associated with this email address.</p>
    <br>
    <p>To reset your password, please use the following One-Time Password (OTP): <strong>${otp}</strong></p>

    <p>This OTP is valid for 5 minutes. Do not share your OTP with anyone.</p>
    `,
    user?.email
  );

  res.status(200).json({
    status: 200,
    success: false,
    message: "OTP has been successfully sent to your email id",
  });
});
exports.resetPassword = TryCatch(async (req, res) => {
  const { email, password } = req.body;

  if (!password) {
    throw new ErrorHandler("Password is a required field", 400);
  }

  await OTP.findOneAndDelete({ email });
  await User.findOneAndUpdate({ email }, { password });

  res.status(200).json({
    success: true,
    status: 200,
    message: "Your password has been updated successfully",
  });
});
exports.resendOtp = TryCatch(async (req, res) => {
  const { email } = req.body;
  if (!email) {
    throw new ErrorHandler("Email Id not provided", 400);
  }
  const user = await User.findOne({ email });
  if (!user) {
    throw new ErrorHandler("User doesn't exist", 400);
  }
  let isExistingOTP = await OTP.findOne({ email: user.email });
  if (isExistingOTP) {
    sendEmail(
      "Reset Password Verification",
      `
        <strong>Dear ${user.first_name}</strong>,
    
        <p>We received a request to reset the password for your account associated with this email address.</p>
        <br>
        <p>To reset your password, please use the following One-Time Password (OTP): <strong>${isExistingOTP.otp}</strong></p>
    
        <p>This OTP is valid for 5 minutes. Do not share your OTP with anyone.</p>
        `,
      user?.email
    );
    return res.status(200).json({
      status: 200,
      success: false,
      message: "OTP has been successfully sent to your email id",
    });
  }

  let otp = generateOTP(4);
  await OTP.create({ email: user?.email, otp });

  sendEmail(
    "Reset Password Verification",
    `
    <strong>Dear ${user?.first_name}</strong>,

    <p>We received a request to reset the password for your account associated with this email address.</p>
    <br>
    <p>To reset your password, please use the following One-Time Password (OTP): <strong>${otp}</strong></p>

    <p>This OTP is valid for 5 minutes. Do not share your OTP with anyone.</p>
    `,
    user?.email
  );

  return res.status(200).json({
    status: 200,
    success: false,
    message: "OTP has been successfully sent to your email id",
  });
});
exports.all = TryCatch(async (req, res)=>{
  const users = await User.find({}).populate('role');
  res.status(200).json({
    status: 200,
    success: true,
    users
  })
})