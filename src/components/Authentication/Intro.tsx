import logo from "../../assets/images/logo/logo.png";  
import { Link } from "react-router-dom";

const Intro: React.FC = () => {
  return (
    <div className="hidden xl:flex bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 h-[100vh] w-[50%] flex-col justify-center items-center relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-white rounded-full blur-3xl transform -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-blue-300 rounded-full blur-3xl transform translate-x-1/2 translate-y-1/2"></div>
      </div>

      <div className="relative z-10 max-w-md mx-auto text-center px-8">
        {/* Logo Section */}
        <div className="mb-12">
          <Link to="/" className="inline-block">
            <img
              className="w-60 h-auto filter brightness-0 invert drop-shadow-lg hover:scale-105 transition-transform duration-300"
              src={logo}
              alt="Company Logo"
            />
          </Link>
        </div>

        {/* Main Heading */}
        <div className="mb-10">
          <h1 className="text-3xl font-extrabold text-white mb-4 leading-tight">
            Streamline Your Business
            <span className="block text-blue-200 text-2xl font-semibold mt-2">
              All-in-One Management Platform
            </span>
          </h1>
          <p className="text-blue-100 text-lg font-medium">
            Powerful tools to grow and manage your enterprise
          </p>
        </div>
      </div>
    </div>
  );
};

export default Intro;
