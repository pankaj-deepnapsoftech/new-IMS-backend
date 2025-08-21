import { BiLockAlt, BiUser, BiPhone } from "react-icons/bi";
import { FaStarOfLife } from "react-icons/fa";
import { Link } from "react-router-dom";
import { IoEyeOffOutline, IoEyeOutline } from "react-icons/io5";
import { MdEmail } from "react-icons/md";
import React, { useState } from "react";
import { useRegisterMutation } from "../../redux/api/api";
import { toast } from "react-toastify";

interface RegisterComponentProps {
  email: string | undefined;
  setEmail: (email: string | undefined) => void;
  setShowRegisterComponent: (show: boolean) => void;
  setShowOTPVerificationComponent: (show: boolean) => void;
  setShowLoginComponent: (show: boolean) => void;
}

const RegisterComponent: React.FC<RegisterComponentProps> = ({
  email,
  setEmail,
  setShowRegisterComponent,
  setShowOTPVerificationComponent,
  setShowLoginComponent,
}) => {
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [firstname, setFirstname] = useState<string | undefined>();
  const [lastname, setLastname] = useState<string | undefined>();
  const [password, setPassword] = useState<string | undefined>();
  const [phone, setPhone] = useState<string | undefined>();
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState<boolean>(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const [register] = useRegisterMutation();


  const validatePassword = (value: string) => {
    const minLength = 8;
    const hasUpper = /[A-Z]/.test(value);
    const hasLower = /[a-z]/.test(value);
    const hasNumber = /\d/.test(value);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(value);

    if (value.length < minLength) return "Password must be at least 8 characters.";
    if (!hasUpper) return "Password must contain at least one uppercase letter.";
    if (!hasLower) return "Password must contain at least one lowercase letter.";
    if (!hasNumber) return "Password must contain at least one number.";
    if (!hasSpecial) return "Password must contain at least one special character.";

    return null;
  };

  const registerHandler = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (passwordError) {
      toast.error("Fix password errors before proceeding");
      return;
    }

    try {
      setIsRegistering(true);
      const response = await register({
        first_name: firstname,
        last_name: lastname,
        email,
        password,
        phone,
      }).unwrap();
      toast.success(response.message);
      setShowRegisterComponent(false);
      setShowOTPVerificationComponent(true);
    } catch (err: any) {
      toast.error(err?.message || err?.data?.message || "Something went wrong");
    } finally {
      setIsRegistering(false);
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto">
      <div className="bg-[#fff] backdrop-blur-sm rounded-2xl shadow-2xl p-8 border border-white/20 max-h-[90vh] overflow-y-auto">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Create Account
          </h1>
          <p className="text-gray-600">Join us today and get started</p>
        </div>

        <form onSubmit={registerHandler} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                <FaStarOfLife size={6} className="text-red-500" />
                First Name
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                  <BiUser size={18} />
                </div>
                <input
                  value={firstname || ""}
                  required
                  onChange={(e) => setFirstname(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-500 
                      focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-gray-400"
                  type="text"
                  placeholder="First name"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">
                Last Name
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                  <BiUser size={18} />
                </div>
                <input
                  value={lastname || ""}
                  onChange={(e) => setLastname(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-500 
                      focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-gray-400"
                  type="text"
                  placeholder="Last name"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
              <FaStarOfLife size={6} className="text-red-500" />
              Phone Number
            </label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                <BiPhone size={18} />
              </div>
              <input
                value={phone || ""}
                required
                onChange={(e) => setPhone(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-500 
                    focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-gray-400"
                type="tel"
                placeholder="Enter your phone number"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
              <FaStarOfLife size={6} className="text-red-500" />
              Email Address
            </label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                <MdEmail size={18} />
              </div>
              <input
                value={email || ""}
                required
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-500 
                    focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-gray-400"
                type="email"
                placeholder="Enter your email"
              />
            </div>
          </div>

          {/* ✅ Password Field with Validation */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
              <FaStarOfLife size={6} className="text-red-500" />
              Password
            </label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                <BiLockAlt size={18} />
              </div>
              <input
                value={password || ""}
                required
                onChange={(e) => {
                  const value = e.target.value;
                  setPassword(value);
                  const error = validatePassword(value);
                  setPasswordError(error);
                }}
                className={`w-full pl-10 pr-12 py-2.5 rounded-lg bg-white text-gray-900 placeholder-gray-500 
                    focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-gray-400
                    ${passwordError ? "border-red-500" : "border-gray-300"}`}
                type={showPassword ? "text" : "password"}
                placeholder="Create a strong password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <IoEyeOutline size={18} /> : <IoEyeOffOutline size={18} />}
              </button>
            </div>
            {passwordError && (
              <p className="text-sm text-red-500 mt-1">{passwordError}</p>
            )}
            
          </div>

          {password && (
            <div className="text-sm mt-2 space-y-1 text-gray-600">
              <div className="flex items-center gap-2">
                {password.length >= 8 ? (
                  <span className="text-green-600">✔️</span>
                ) : (
                  <span className="text-red-500">❌</span>
                )}
                <span>Password must be at least 8 characters</span>
              </div>
              <div className="flex items-center gap-2">
                {/[A-Z]/.test(password) ? (
                  <span className="text-green-600">✔️</span>
                ) : (
                  <span className="text-red-500">❌</span>
                )}
                <span>At least one uppercase letter</span>
              </div>
              <div className="flex items-center gap-2">
                {/[a-z]/.test(password) ? (
                  <span className="text-green-600">✔️</span>
                ) : (
                  <span className="text-red-500">❌</span>
                )}
                <span>At least one lowercase letter</span>
              </div>
              <div className="flex items-center gap-2">
                {/\d/.test(password) ? (
                  <span className="text-green-600">✔️</span>
                ) : (
                  <span className="text-red-500">❌</span>
                )}
                <span>At least one number</span>
              </div>
              <div className="flex items-center gap-2">
                {/[!@#$%^&*(),.?":{}|<>]/.test(password) ? (
                  <span className="text-green-600">✔️</span>
                ) : (
                  <span className="text-red-500">❌</span>
                )}
                <span>At least one special character</span>
              </div>
            </div>
          )}


          {/* Confirm Password Field */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
              <FaStarOfLife size={6} className="text-red-500" />
              Confirm Password
            </label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                <BiLockAlt size={18} />
              </div>
              <input
                value={confirmPassword}
                required
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full pl-10 pr-12 py-2.5 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-500 
                  focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-gray-400"
                type={showPassword ? "text" : "password"}
                placeholder="Confirm your password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <IoEyeOutline size={18} /> : <IoEyeOffOutline size={18} />}
              </button>
            </div>
          </div>

          <div className="text-center">
            <button
              type="button"
              onClick={() => {
                setShowRegisterComponent(false);
                setShowLoginComponent(true);
              }}
              className="text-blue-600 hover:text-blue-700 font-medium text-sm transition-colors"
            >
              Already have an account? Sign in
            </button>
          </div>

          <button
            type="submit"
            disabled={isRegistering || passwordError !== null}
            className={`w-full py-3 px-4 rounded-lg font-semibold text-white transition-all duration-200 
              ${isRegistering || passwordError
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700 active:bg-blue-800 transform hover:scale-[1.02] active:scale-[0.98]"
              } shadow-lg hover:shadow-xl`}
          >
            {isRegistering ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Creating account...
              </div>
            ) : (
              "Create Account"
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default RegisterComponent;
