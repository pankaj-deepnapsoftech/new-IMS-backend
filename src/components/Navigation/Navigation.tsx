// @ts-nocheck

import { FaAngleDown, FaAngleUp, FaSignOutAlt } from "react-icons/fa";
import routes from "../../routes/routes";
import { NavLink, Navigate, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { IoCloseSharp } from "react-icons/io5";
import { RiMenu2Line } from "react-icons/ri";
import logo from "../../assets/images/logo/logo.png";
import { useCookies } from "react-cookie";
import { toast } from "react-toastify";

const Navigation: React.FC = () => {
  const navigate = useNavigate();
  const [cookie, _, removeCookie] = useCookies();
  const { allowedroutes, isSuper } = useSelector((state: any) => state.auth);
  const [checkMenu, setCheckMenu] = useState(false);
  const [showIcon, setShowIcon] = useState(false);
  const [openSubMenus, setOpenSubMenus] = useState<{ [key: string]: boolean }>(
    {}
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowIcon(true);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  const handleCloseMenu = () => {
    if (window.innerWidth < 800) {
      setCheckMenu(false);
    }
  };

  const toggleSubMenusHandler = (path: string) => {
    setOpenSubMenus((prev) => ({
      ...prev,
      [path]: !prev[path],
    }));
  };
  const logoutHandler = () => {
    try {
      removeCookie("access_token");
      toast.success("Logged out successfully");
      navigate("/login");
    } catch (error: any) {
      toast.error(error.message || "Something went wrong");
    }
  };
  return (
    <>
     
      <div
        className={`absolute top-2 z-40 lg:hidden transition-all duration-300 ease-in-out ${
          checkMenu ? "left-[250px]" : "left-4"
        }`}
      >
        <button
          onClick={() => setCheckMenu(!checkMenu)}
          className="p-3 rounded-xl bg-white    transition-all duration-300 hover:scale-105"
        >
          {checkMenu ? (
            <IoCloseSharp size={24} className="text-gray-700" />
          ) : (
            <RiMenu2Line size={24} className="text-gray-700" />
          )}
        </button>
      </div>

    
      {checkMenu && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-10 lg:hidden transition-opacity duration-300"
          onClick={() => setCheckMenu(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`bg-white border-r border-gray-200 shadow-xl h-full overflow-y-auto
         lg:block lg:relative lg:translate-x-0
         ${checkMenu ? "translate-x-0" : "-translate-x-full"}
         fixed z-30 w-80 lg:w-[16.6rem] top-0 left-0 transition-transform duration-300 ease-in-out`}
      >
        {/* Logo */}
        <div className="border-b border-gray-100">
          <img
            src="/company logo.png"
            alt="Logo"
            className="w-[220px] h-auto "
          />
        </div>

        {/* Menu List */}
        <div className="px-4 py-6">
          <ul className="space-y-2 whitespace-nowrap">
            {routes.map((route, ind) => {
              const isAllowed =
                isSuper ||
                allowedroutes.includes(route.path.replaceAll("/", ""));

              if (route.isSublink) {
                return (
                  <div key={ind}>
                    <li
                      className={`flex items-center justify-between  px-4 py-3 rounded-lg cursor-pointer transition-all duration-200 group
                        ${
                          isAllowed
                            ? "hover:bg-blue-50 hover:text-blue-700 text-gray-700"
                            : "text-gray-400 cursor-not-allowed"
                        }`}
                      onClick={() =>
                        isAllowed && toggleSubMenusHandler(route.path)
                      }
                    >
                      <div className="flex items-center gap-3 whitespace-nowrap">
                        <span className="text-xl">{route.icon}</span>
                        <span className="font-medium ">{route.name}</span>
                      </div>
                      {isAllowed && (
                        <span className="transition-transform duration-200">
                          {openSubMenus[route.path] ? (
                            <FaAngleUp className="text-sm" />
                          ) : (
                            <FaAngleDown className="text-sm" />
                          )}
                        </span>
                      )}
                    </li>
                    {openSubMenus[route.path] && (
                      <div className="ml-4 mt-2 space-y-1">
                        {route.sublink?.map((sublink, index) => (
                          <NavLink
                            onClick={handleCloseMenu}
                            key={index}
                            to={route.path + "/" + sublink.path}
                            className={({ isActive }) =>
                              `block px-4 py-2 rounded-lg transition-all duration-200 ${
                                isActive
                                  ? "bg-blue-100 text-blue-700 border-l-4 border-blue-500"
                                  : isAllowed
                                  ? "text-gray-600 hover:bg-gray-50 hover:text-gray-800"
                                  : "text-gray-400 cursor-not-allowed"
                              }`
                            }
                            style={{
                              pointerEvents: isAllowed ? "auto" : "none",
                            }}
                          >
                            <div className="flex items-center gap-3">
                              <span className="text-lg">{sublink.icon}</span>
                              <span className="font-medium">
                                {sublink.name}
                              </span>
                            </div>
                          </NavLink>
                        ))}
                      </div>
                    )}
                  </div>
                );
              } else if (route.name === "Approval" && isSuper) {
                return (
                  <NavLink
                    onClick={handleCloseMenu}
                    key={ind}
                    to={route.path || ""}
                    className={({ isActive }) =>
                      `block px-4 py-3 rounded-lg transition-all duration-200 ${
                        isActive
                          ? "bg-blue-100 text-blue-700 border-l-4 border-blue-500"
                          : isAllowed
                          ? "text-gray-700 hover:bg-blue-50 hover:text-blue-700"
                          : "text-gray-400 cursor-not-allowed"
                      }`
                    }
                    style={{
                      pointerEvents: isAllowed ? "auto" : "none",
                    }}
                  >
                    <li className="flex items-center gap-3">
                      <span className="text-xl">{route.icon}</span>
                      <span className="font-medium">{route.name}</span>
                    </li>
                  </NavLink>
                );
              } else if (route.name !== "Approval") {
                return (
                  <NavLink
                    onClick={handleCloseMenu}
                    key={ind}
                    to={route.path || ""}
                    className={({ isActive }) =>
                      `block px-4 py-3 rounded-lg transition-all duration-200 ${
                        isActive
                          ? "bg-blue-100 text-blue-700 border-l-4 border-blue-500"
                          : isAllowed
                          ? "text-gray-700 hover:bg-blue-50 hover:text-blue-700"
                          : "text-gray-400 cursor-not-allowed"
                      }`
                    }
                    style={{
                      pointerEvents: isAllowed ? "auto" : "none",
                    }}
                  >
                    <li className="flex items-center gap-3">
                      <span className="text-xl">{route.icon}</span>
                      <span className="font-medium">{route.name}</span>
                    </li>
                  </NavLink>
                );
              }
            })}
          </ul>
        </div>

        <div className="p-4 border-t border-gray-100 bg-white">
          <button
            onClick={logoutHandler}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-50 text-red-700 hover:bg-red-100 hover:text-red-800 rounded-lg font-medium transition-all duration-200 hover:shadow-md"
          >
            <FaSignOutAlt className="text-sm" />
            Log Out
          </button>
        </div>
      </div>
    </>
  );
};

export default Navigation;
