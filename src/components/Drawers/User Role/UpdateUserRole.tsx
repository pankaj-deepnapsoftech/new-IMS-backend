import { Button, FormControl, FormLabel, Input } from "@chakra-ui/react";
import Drawer from "../../../ui/Drawer";
import { BiX } from "react-icons/bi";
import { useEffect, useState } from "react";
import Select from "react-select";
import { useUpdateRoleMutation } from "../../../redux/api/api";
import { toast } from "react-toastify";
import { useCookies } from "react-cookie";
import Loading from "../../../ui/Loading";
import { colors } from "../../../theme/colors";

interface UpdateUserRoleProps {
  fetchUserRolesHandler: () => void;
  closeDrawerHandler: () => void;
  roleId: string | undefined;
}

const UpdateUserRole: React.FC<UpdateUserRoleProps> = ({
  closeDrawerHandler,
  fetchUserRolesHandler,
  roleId,
}) => {
  const [cookies, setCookie] = useCookies();
  const [isLoadingRole, setIsLoadingRole] = useState<boolean>(false);
  const [isUpdatingRole, setIsUpdatingRole] = useState<boolean>(false);
  const [role, setRole] = useState<string | undefined>();
  const [description, setDescription] = useState<string | undefined>();
  const [permissions, setPermissions] = useState<
    { value: string; label: string }[]
  >([]);

  const permissionOptions = [
    { value: "inventory", label: "Inventory" },
    { value: "direct", label: "Direct" },
    { value: "store", label: "Store" },
    { value: "approval", label: "Approval" },
    { value: "agent", label: "Agent" },
    { value: "production", label: "Production" },
    { value: "parties", label: "Parties" },
    { value: "sales", label: "Sales" },
    { value: "task", label: "Task" },
    { value: "bom", label: "Bom" },
    { value: "merchant", label: "Merchant" },
  ];

  const [updateRole] = useUpdateRoleMutation();

  const updateRoleHandler = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !role ||
      !description ||
      role.trim().length === 0 ||
      description.trim().length === 0
    ) {
      toast.error("Please provide all the required fields");
      return;
    }
    if (permissions.length === 0) {
      toast.error("Select atleast 1 permission");
      return;
    }

    const modifiedPermissions = permissions.map(
      (permission: any) => permission.value
    );

    try {
      setIsUpdatingRole(true);
      const response = await updateRole({
        _id: roleId,
        role,
        description,
        permissions: modifiedPermissions,
      }).unwrap();
      // console.log({
      //   _id: roleId,
      //   role,
      //   description,
      //   permissions: modifiedPermissions,
      // });

      toast.success(response.message);
      fetchUserRolesHandler();
      closeDrawerHandler();
    } catch (error: any) {
      toast.error(error?.data?.message || "Something went wrong");
    } finally {
      setIsUpdatingRole(false);
    }
  };

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
      const modifiedPermissions = data.userRole?.permissions?.map(
        (permission: any) => ({
          value: permission,
          label: permission.charAt(0).toUpperCase() + permission.slice(1),
        })
      );

      setPermissions(modifiedPermissions);
    } catch (error: any) {
      toast.error(error?.message || "Something went wrong");
    } finally {
      setIsLoadingRole(false);
    }
  };

  useEffect(() => {
    fetchRoleDetailsHandler();
  }, []);
  const customStyles = {
    control: (provided: any) => ({
      ...provided,
      backgroundColor: "white",
      borderColor: "#d1d5db",
      color: "#374151",
      minHeight: "40px",
    }),
    singleValue: (provided: any) => ({
      ...provided,
      color: "#374151",
    }),
    input: (provided: any) => ({
      ...provided,
      color: "#374151",
    }),
    placeholder: (provided: any) => ({
      ...provided,
      color: "#9ca3af",
    }),
    menu: (provided: any) => ({
      ...provided,
      backgroundColor: "white",
      border: "1px solid #d1d5db",
    }),
    option: (provided: any, state: any) => ({
      ...provided,
      backgroundColor: state.isFocused ? "#e5e7eb" : "white",
      color: "#374151",
      cursor: "pointer",
    }),
    multiValue: (provided: any) => ({
      ...provided,
      backgroundColor: "#e5e7eb",
      color: "#374151",
    }),
    multiValueLabel: (provided: any) => ({
      ...provided,
      color: "#374151",
    }),
    multiValueRemove: (provided: any) => ({
      ...provided,
      color: "#6b7280",
      ":hover": {
        backgroundColor: "#ef4444",
        color: "white",
      },
    }),
  };

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
          Update Role
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
        {isLoadingRole && <Loading />}
        {!isLoadingRole && (
          <form onSubmit={updateRoleHandler}>
            <FormControl className="mt-3 mb-5 " isRequired>
              <FormLabel fontWeight="500" color="gray.700">
                Role
              </FormLabel>
              <Input
                value={role}
                onChange={(e) => setRole(e.target.value)}
                type="text"
                placeholder="Role"
                bg="white"
                borderColor="gray.300"
                _focus={{
                  borderColor: "blue.500",
                  boxShadow: "0 0 0 1px #3182ce",
                }}
                _placeholder={{ color: "gray.500" }}
              />
            </FormControl>

            <FormControl className="mt-3 mb-5">
              <FormLabel fontWeight="500" color="gray.700">
                Description
              </FormLabel>
              <Input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                type="text"
                placeholder="Description"
                bg="white"
                borderColor="gray.300"
                _focus={{
                  borderColor: "blue.500",
                  boxShadow: "0 0 0 1px #3182ce",
                }}
                _placeholder={{ color: "gray.500" }}
              />
            </FormControl>

            <FormControl>
              <FormLabel fontWeight="500" color="gray.700">
                Permissions
              </FormLabel>
              <Select
                required
                className="rounded mt-2"
                options={permissionOptions}
                placeholder="Select"
                value={permissions}
                name="item_name"
                onChange={(d: any) => {
                  setPermissions(d);
                }}
                isMulti
                styles={customStyles}
              />
            </FormControl>

            <div>
              <Button
                isLoading={isUpdatingRole}
                type="submit"
                className="mt-5"
                colorScheme="blue"
                size="md"
                width="full"
              >
                Submit
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default UpdateUserRole;
