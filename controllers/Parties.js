const { PartiesModels } = require("../models/Parties");
const { TryCatch, ErrorHandler } = require("../utils/error");

const generateCustomerId = async () => {
  const lastParty = await PartiesModels.findOne().sort({ createdAt: -1 });
  if (!lastParty) return "C001";
  const lastId = lastParty.cust_id.replace("C", "");
  const nextId = Number(lastId) + 1;
  return `C${nextId.toString().padStart(3, "0")}`;
};

exports.CreateParties = TryCatch(async (req, res) => {
  const data = req.body;
  const cust_id = await generateCustomerId();
  
  const result = await PartiesModels.create({ ...data, cust_id });
  return res.status(201).json({
    message: "Party added successfully",
    result,
  });
});

exports.GetParties = TryCatch(async (req, res) => {
  const { page, limit } = req.query;
  const pages = parseInt(page) || 1;
  const limits = parseInt(limit) || 10;
  const skip = (pages - 1) * limits;
  const totalData = await PartiesModels.find().countDocuments();
  const data = await PartiesModels.find({})
    .sort({ _id: -1 })
    .skip(skip)
    .limit(limits);
  return res.status(200).json({
    message: "Data",
    data,
    totalData,
  });
});


exports.DeleteParties = TryCatch(async (req, res) => {
  const { id } = req.params;
  const find = await PartiesModels.findById(id);
  if (!find) {
    throw new ErrorHandler(" Party not found ", 400);
  }

  await PartiesModels.findByIdAndDelete(id);
  return res.status(200).json({
    message: "Party Deleted",
  });
});

exports.UpdateParties = TryCatch(async (req, res) => {
  const data = req.body;
  const { id } = req.params;
  const find = await PartiesModels.findById(id);
  if (!find) {
    throw new ErrorHandler("Party not register", 400);
  }
  await PartiesModels.findByIdAndUpdate(id, data, { new: true });
  return res.status(200).json({
    message: "data updated successful",
  });
});   

