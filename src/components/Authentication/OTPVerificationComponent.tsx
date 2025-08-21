import { useEffect, useState } from "react";
import { FaStarOfLife } from "react-icons/fa";
import { IoMdArrowBack } from "react-icons/io";
import { useNavigate } from "react-router-dom";
import {
  useResendOTPMutation,
  useVerifyUserMutation,
} from "../../redux/api/api";
import { toast } from "react-toastify";
import { TbPasswordMobilePhone } from "react-icons/tb";
import { colors } from "../../theme/colors";

interface OTPVerificationComponentProps {
  email: string | undefined;
}

const OTPVerificationComponent: React.FC<OTPVerificationComponentProps> = ({
  email,
}) => {
  const navigate = useNavigate();

  const [otp, setOtp] = useState<string | undefined>();

  const [isVerifyingOTP, setIsVerifyingOTP] = useState<boolean>(false);
  const [isResendingOTP, setIsResendingOTP] = useState<boolean>(false);

  const [canResend, setCanResend] = useState<boolean>(false);
  const [secondsLeft, setSecondsLeft] = useState<number>(30);

  const [verify] = useVerifyUserMutation();
  const [resendOTP] = useResendOTPMutation();

  const verifyHandler = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsVerifyingOTP(true);
      const data = await verify({
        email: email,
        otp: otp,
      }).unwrap();
      toast.success(data?.message);
      navigate(0);
    } catch (err: any) {
      toast.error(err?.data?.message || err?.message || "Something went wrong");
    } finally {
      setIsVerifyingOTP(false);
    }
  };

  const resendOTPHandler = async () => {
    try {
      const data = await resendOTP({ email }).unwrap();
      toast.success(data.message);
      setCanResend(false);
      setSecondsLeft(30);
    } catch (err: any) {
      toast.error(err?.data?.message || err?.message || "Something went wrong");
    } finally {
      setIsResendingOTP(false);
    }
  };

  useEffect(() => {
    setSecondsLeft(30);
    setCanResend(false);
  }, []);

  useEffect(() => {
    if (!canResend) {
      const interval = setInterval(() => {
        setSecondsLeft((prevSeconds) => {
          if (prevSeconds <= 1) {
            setCanResend(true);
            clearInterval(interval);
          }

          return prevSeconds - 1;
        });
      }, 1000);

      return () => {
        clearInterval(interval);
      };
    }
  }, [canResend]);

  return (
    <div className="w-full max-w-md mx-auto">
      {/* OTP Verification Card */}
      <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-8 border border-white/20">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="flex items-center justify-center mb-4">
            <button
              onClick={() => navigate(0)}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors mr-3"
            >
              <IoMdArrowBack size={24} className="text-gray-600" />
            </button>
            <h1 className="text-2xl font-bold text-gray-800">
              Verify Your Email
            </h1>
          </div>
          <p className="text-gray-600">
            Enter the 4-digit verification code sent to <br />
            <span className="font-semibold text-gray-800">{email}</span>
          </p>
        </div>

        {/* Verification Form */}
        <form onSubmit={verifyHandler} className="space-y-6">
          {/* OTP Field */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
              <FaStarOfLife size={4} className="text-red-500" />
              Verification Code
            </label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                <TbPasswordMobilePhone size={20} />
              </div>
              <input
                value={otp || ""}
                required
                onChange={(e) => setOtp(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-500 text-center text-lg tracking-widest
                  focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-gray-400"
                type="text"
                placeholder="000000"
                maxLength={4}
                pattern="[0-9]{4}"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            {/* Verify Button */}
            <button
              type="submit"
              disabled={isVerifyingOTP}
              className={`w-full py-3 px-4 rounded-lg font-semibold text-white transition-all duration-200 
                ${
                  isVerifyingOTP
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700 active:bg-blue-800 transform hover:scale-[1.02] active:scale-[0.98]"
                } shadow-lg hover:shadow-xl`}
            >
              {isVerifyingOTP ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Verifying...
                </div>
              ) : (
                "Verify Email"
              )}
            </button>

            {/* Resend Button */}
            <button
              type="button"
              onClick={resendOTPHandler}
              disabled={!canResend || isResendingOTP}
              className={`w-full py-3 px-4 rounded-lg font-semibold transition-all duration-200 border-2
                ${
                  !canResend || isResendingOTP
                    ? "bg-gray-100 border-gray-300 text-gray-400 cursor-not-allowed"
                    : "bg-white border-blue-600 text-blue-600 hover:bg-blue-50 active:bg-blue-100"
                }`}
            >
              {isResendingOTP ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-blue-600/30 border-t-blue-600 rounded-full animate-spin"></div>
                  Sending...
                </div>
              ) : canResend ? (
                "Resend Code"
              ) : (
                `Resend in ${secondsLeft}s`
              )}
            </button>
          </div>
        </form>

        {/* Help Text */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            Didn't receive the code? Check your spam folder or try resending.
          </p>
        </div>
      </div>
    </div>
  );
};

export default OTPVerificationComponent;
