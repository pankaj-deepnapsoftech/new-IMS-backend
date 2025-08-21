import { Button, FormControl, FormLabel } from "@chakra-ui/react";
import Drawer from "../../../ui/Drawer";
import { BiX } from "react-icons/bi";
import { useEffect, useState } from "react";
import Select from "react-select";
import { useUpdateEmployeeMutation } from "../../../redux/api/api";
import { toast } from "react-toastify";
import { useCookies } from "react-cookie";
import Loading from "../../../ui/Loading";
import { colors } from "../../../theme/colors";

interface UpdateEmployeeProps {
  employeeId: string | undefined;
  fetchEmployeesHandler: () => void;
  closeDrawerHandler: () => void;
}

const UpdateEmployee: React.FC<UpdateEmployeeProps> = ({
  closeDrawerHandler,
  fetchEmployeesHandler,
  employeeId,
}) => {
  const [cookies, setCookie] = useCookies();
  const [isLoadingEmployee, setIsLoadingEmployee] = useState<boolean>(false);
  const [isUpdatingEmployee, setIsUpdatingEmployee] = useState<boolean>(false);
  const [firstname, setFirstname] = useState<string | undefined>();
  const [lastname, setLastname] = useState<string | undefined>();
  const [phone, setPhone] = useState<string | undefined>();
  const [email, setEmail] = useState<string | undefined>();
  const [role, setRole] = useState<any | undefined>();
  const [isSuper, setIsSuper] = useState<boolean | undefined>();
  const [isVerified, setIsVerified] = useState<string | undefined>();

  const [roleOptions, setRoleOptions] = useState<
    { value: string; label: string }[] | []
  >([]);

  const [updateEmployee] = useUpdateEmployeeMutation();

  const updateEmployeeHandler = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!role || !role?.value) {
      toast.error("Please provide all the required fields");
      return;
    }
    try {
      setIsUpdatingEmployee(true);
      const response = await updateEmployee({
        _id: employeeId,
        role: role.value,
      }).unwrap();
      toast.success(response.message);
      fetchEmployeesHandler();
      closeDrawerHandler();
    } catch (error: any) {
      toast.error(error?.data?.message || "Something went wrong");
    } finally {
      setIsUpdatingEmployee(false);
    }
  };

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

  const fetchRolesHandler = async () => {
    try {
      const response = await fetch(
        process.env.REACT_APP_BACKEND_URL + `role/`,
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
      const roles = data.roles;
      const modifiedRoles = roles.map((role: any) => ({
        value: role._id,
        label: role.role,
      }));
      setRoleOptions(modifiedRoles);
    } catch (error: any) {
      toast.error(error?.message || "Something went wrong");
    } finally {
      setIsLoadingEmployee(false);
    }
  };

  useEffect(() => {
    fetchUserDetailsHandler();
    fetchRolesHandler();
  }, []);

  return (
    // <Drawer closeDrawerHandler={closeDrawerHandler}>

    // </Drawer>

    <div
      className="absolute overflow-auto h-screen w-[99vw] md:w-[450px] bg-white right-0 top-0 z-50 py-3 border-l border-gray-200"
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
          Update Employee
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
          <form onSubmit={updateEmployeeHandler}>
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <h3 className="font-semibold text-gray-700 mb-2">First Name</h3>
                <p className="text-gray-600">{firstname}</p>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <h3 className="font-semibold text-gray-700 mb-2">Last Name</h3>
                <p className="text-gray-600">{lastname}</p>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <h3 className="font-semibold text-gray-700 mb-2">Email</h3>
                <p className="text-gray-600">{email}</p>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <h3 className="font-semibold text-gray-700 mb-2">Phone</h3>
                <p className="text-gray-600">{phone}</p>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <h3 className="font-semibold text-gray-700 mb-2">
                  Is Verified
                </h3>
                <p className="text-gray-600">
                  {isVerified ? "Verified" : "Not Verified"}
                </p>
              </div>

              <FormControl className="mt-3 mb-5" isRequired>
                <FormLabel fontWeight="bold" color="gray.700">
                  Role
                </FormLabel>
                <Select
                  required
                  value={role}
                  options={roleOptions}
                  onChange={(e: any) => setRole(e)}
                  styles={{
                    control: (provided: any) => ({
                      ...provided,
                      backgroundColor: "white",
                      borderColor: "#d1d5db",
                      color: "#374151",
                      minHeight: "40px",
                      "&:hover": {
                        borderColor: "#9ca3af",
                      },
                    }),
                    option: (provided: any, state: any) => ({
                      ...provided,
                      backgroundColor: state.isFocused ? "#e5e7eb" : "white",
                      color: "#374151",
                      "&:hover": {
                        backgroundColor: "#f3f4f6",
                      },
                    }),
                    placeholder: (provided: any) => ({
                      ...provided,
                      color: "#9ca3af",
                    }),
                    singleValue: (provided: any) => ({
                      ...provided,
                      color: "#374151",
                    }),
                    menu: (provided: any) => ({
                      ...provided,
                      zIndex: 9999,
                      backgroundColor: "white",
                      border: "1px solid #d1d5db",
                    }),
                  }}
                />
              </FormControl>

              <Button
                isLoading={isUpdatingEmployee}
                type="submit"
                className="mt-1 w-full"
                colorScheme="blue"
                size="lg"
                _hover={{ bg: "blue.600" }}
              >
                Update Employee
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default UpdateEmployee;
