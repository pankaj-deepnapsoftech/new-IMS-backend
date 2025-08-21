import { useEffect, useState } from "react";
import { useCookies } from "react-cookie";
import { BiX } from "react-icons/bi";
import { toast } from "react-toastify";
import Loading from "../../../ui/Loading";
import Drawer from "../../../ui/Drawer";
import { colors } from "../../../theme/colors";

interface UserRoleDetailsProps {
  closeDrawerHandler: () => void;
  roleId: string | undefined;
}

const UserRoleDetails: React.FC<UserRoleDetailsProps> = ({
  closeDrawerHandler,
  roleId,
}) => {
  const [cookies] = useCookies();
  const [isLoadinRole, setIsLoadingRole] = useState<boolean>(false);
  const [role, setRole] = useState<string | undefined>();
  const [description, setDescription] = useState<string | undefined>();
  const [permissions, setPermissions] = useState<string[]>([]);

  const fetchRoleDetailsHandler = async () => {
    try {
      setIsLoadingRole(true);
      const response = await fetch(
        process.env.REACT_APP_BACKEND_URL + `role/${roleId}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${cookies?.access_token}`,
          },
        }
      );
      const data = await response.json();
      if (!data.success) {
        throw new Error(data.message);
      }
      setRole(data.userRole.role);
      setDescription(data.userRole?.description || "N/A");
      setPermissions(data.userRole?.permissions || []);
    } catch (error: any) {
      toast.error(error?.message || "Something went wrong");
    } finally {
      setIsLoadingRole(false);
    }
  };

  useEffect(() => {
    fetchRoleDetailsHandler();
  }, []);

  return (
    // <Drawer closeDrawerHandler={closeDrawerHandler}>

    // </Drawer>
    <div
      className="absolute overflow-auto h-[100vh] w-[99vw] md:w-[350px] bg-white right-0 top-0 z-50 py-3 border-l border-gray-200"
      style={{
        boxShadow:
          "rgba(0, 0, 0, 0.08) 0px 6px 16px 0px, rgba(0, 0, 0, 0.12) 0px 3px 6px -4px, rgba(0, 0, 0, 0.05) 0px 9px 28px 8px",
      }}
    >
      <div
        className="flex items-center justify-between p-6 border-b"
        style={{ borderColor: colors.border.light }}
      >
        <h1
          className="text-xl font-semibold"
          style={{ color: colors.text.primary }}
        >
          User Role Details
        </h1>
        <button
          onClick={closeDrawerHandler}
          className="p-2 rounded-lg transition-colors duration-200"
          style={{
            color: colors.text.secondary,
            backgroundColor: colors.gray[100],
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = colors.gray[200];
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = colors.gray[100];
          }}
        >
          <BiX size={20} />
        </button>
      </div>

      <div className="mt-8 px-5">
        {isLoadinRole && <Loading />}
        {!isLoadinRole && (
          <div>
            <div className="mt-3 mb-5">
              <p className="font-bold text-gray-700 mb-2">Role</p>
              <p className="text-gray-600 bg-gray-50 p-3 rounded-md border">
                {role}
              </p>
            </div>
            <div className="mt-3 mb-5">
              <p className="font-bold text-gray-700 mb-2">Description</p>
              <p className="text-gray-600 bg-gray-50 p-3 rounded-md border">
                {description}
              </p>
            </div>
            <div className="mt-3 mb-5">
              <p className="font-bold text-gray-700 mb-2">Permissions</p>
              <div className="bg-gray-50 p-3 rounded-md border">
                <ul className="space-y-2">
                  {permissions.map((permission, index) => (
                    <li key={index} className="flex items-center text-gray-600">
                      <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                      {permission.charAt(0).toUpperCase() + permission.slice(1)}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserRoleDetails;
