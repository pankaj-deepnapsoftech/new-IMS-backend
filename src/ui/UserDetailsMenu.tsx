import { Avatar } from "@chakra-ui/react";
import { BiLogOutCircle, BiX } from "react-icons/bi";
import { Link } from "react-router-dom";
interface UserDetailsMenuProps {
  email: string;
  firstname: string;
  lastname: string;
  logoutHandler: () => void;
  closeUserDetailsMenu: () => void;
}

const UserDetailsMenu: React.FC<UserDetailsMenuProps> = ({
  email,
  firstname,
  lastname,
  logoutHandler,
  closeUserDetailsMenu,
}) => {
  return (
    <div className="bg-white rounded-xl shadow-xl border border-gray-200 min-w-[280px] overflow-hidden">
      {/* User Profile Section */}
      <Link to="/userprofile">
        <div
          onClick={closeUserDetailsMenu}
          className="flex items-center p-4 hover:bg-gray-50 transition-colors duration-200 border-b border-gray-100"
        >
          <Avatar
            size="md"
            name={firstname + " " + lastname}
            className="border-2 border-blue-200"
          />
          <div className="ml-3">
            <p className="text-sm font-semibold text-gray-900">
              {firstname + " " + lastname}
            </p>
            <p className="text-xs text-gray-600 mt-1">{email}</p>
          </div>
        </div>
      </Link>

      {/* Menu Actions */}
      <div className="p-2">
        <button
          className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-700 hover:bg-red-50 rounded-lg transition-colors duration-200"
          onClick={logoutHandler}
        >
          <BiLogOutCircle className="text-base" />
          Logout
        </button>

        <button
          onClick={closeUserDetailsMenu}
          className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors duration-200 mt-1"
        >
          <BiX className="text-base" />
          Close
        </button>
      </div>
    </div>
  );
};

export default UserDetailsMenu;
