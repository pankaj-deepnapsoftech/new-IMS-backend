import { useEffect, useState } from "react";
import { useCookies } from "react-cookie";
import { BiX } from "react-icons/bi";
import { toast } from "react-toastify";
import Loading from "../../../ui/Loading";
import Drawer from "../../../ui/Drawer";
import { colors } from "../../../theme/colors";

interface EmployeeDetailsProps {
  closeDrawerHandler: () => void;
  employeeId: string | undefined;
}

const EmployeeDetails: React.FC<EmployeeDetailsProps> = ({
  closeDrawerHandler,
  employeeId,
}) => {
  const [cookies] = useCookies();
  const [isLoadingEmployee, setIsLoadingEmployee] = useState<boolean>(false);
  const [firstname, setFirstname] = useState<string | undefined>();
  const [lastname, setLastname] = useState<string | undefined>();
  const [phone, setPhone] = useState<string | undefined>();
  const [email, setEmail] = useState<string | undefined>();
  const [role, setRole] = useState<any | undefined>();
  const [isSuper, setIsSuper] = useState<boolean | undefined>();
  const [isVerified, setIsVerified] = useState<string | undefined>();

  const fetchUserDetailsHandler = async () => {
    try {
      setIsLoadingEmployee(true);
      const response = await fetch(
        process.env.REACT_APP_BACKEND_URL + `auth/user/${employeeId}`,
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
      setFirstname(data.user.first_name);
      setLastname(data.user?.last_name);
      setEmail(data.user.email);
      setPhone(data.user.phone);
      setRole(data.user?.role);
      setIsVerified(data.user.isVerified);
      setIsSuper(data.user.isSuper);
    } catch (error: any) {
      toast.error(error?.message || "Something went wrong");
    } finally {
      setIsLoadingEmployee(false);
    }
  };

  useEffect(() => {
    fetchUserDetailsHandler();
  }, []);

  return (
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
          Employee Details
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
        {isLoadingEmployee && <Loading />}
        {!isLoadingEmployee && (
          <div>
            <div className="mt-3 mb-5">
              <p className="font-bold text-gray-700 mb-2">First Name</p>
              <p className="text-gray-600 bg-gray-50 p-3 rounded-md border">
                {firstname}
              </p>
            </div>
            <div className="mt-3 mb-5">
              <p className="font-bold text-gray-700 mb-2">Last Name</p>
              <p className="text-gray-600 bg-gray-50 p-3 rounded-md border">
                {lastname}
              </p>
            </div>
            <div className="mt-3 mb-5">
              <p className="font-bold text-gray-700 mb-2">Email</p>
              <p className="text-gray-600 bg-gray-50 p-3 rounded-md border">
                {email}
              </p>
            </div>
            <div className="mt-3 mb-5">
              <p className="font-bold text-gray-700 mb-2">Phone</p>
              <p className="text-gray-600 bg-gray-50 p-3 rounded-md border">
                {phone}
              </p>
            </div>
            <div className="mt-3 mb-5">
              <p className="font-bold text-gray-700 mb-2">Is Verified</p>
              <p className="text-gray-600 bg-gray-50 p-3 rounded-md border">
                {isVerified ? "Verified" : "Not Verified"}
              </p>
            </div>
            <div className="mt-3 mb-5">
              <p className="font-bold text-gray-700 mb-2">Role</p>
              <p className="text-gray-600 bg-gray-50 p-3 rounded-md border">
                {(isSuper && "Super Admin") || role?.role || "N/A"}
              </p>
            </div>
            <div className="mt-3 mb-5">
              <p className="font-bold text-gray-700 mb-2">Permissions</p>
              <div className="bg-gray-50 p-3 rounded-md border">
                {!role?.permissions && <p className="text-gray-600">N/A</p>}
                {role?.permissions && (
                  <ul className="space-y-2">
                    {role.permissions.map((permission: any, index: number) => (
                      <li
                        key={index}
                        className="flex items-center text-gray-600"
                      >
                        <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                        {permission}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployeeDetails;
