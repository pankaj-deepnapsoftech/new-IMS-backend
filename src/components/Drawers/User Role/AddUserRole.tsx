import { Button, FormControl, FormLabel, Input } from "@chakra-ui/react";
import Drawer from "../../../ui/Drawer";
import { BiX } from "react-icons/bi";
import { useState } from "react";
import Select from "react-select";
import { useAddRoleMutation } from "../../../redux/api/api";
import { toast } from "react-toastify";
import { useCookies } from "react-cookie";
import { colors } from "../../../theme/colors";
// import Select from "react-select";
interface AddUserRoleProps {
  fetchUserRolesHandler: () => void;
  closeDrawerHandler: () => void;
}

const AddUserRole: React.FC<AddUserRoleProps> = ({
  closeDrawerHandler,
  fetchUserRolesHandler,
}) => {
  // const [cookies, setCookie] = useCookies();
  const [isAddingRole, setIsAddingRole] = useState<boolean>(false);
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
    { value: "sale & purchase", label: "Sale & Purchase" },
    { value: "parties", label: "Parties" },
    { value: "sales", label: "Sales" },
    { value: "task", label: "Task" },
    { value: "bom", label: "Bom" },
    { value: "merchant", label: "Merchant" }, 
    
  ];

  const [addRole] = useAddRoleMutation();

  const addRoleHandler = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!role || role.trim().length === 0) {
      toast.error("Please provide all the required fields");
      return;
    }
    if (role !== "Man Power" && permissions.length === 0) {
      toast.error("Select at least 1 permission");
      return;
    }

    const modifiedPermissions = permissions.map(
      (permission: any) => permission.value
    );

    try {
      setIsAddingRole(true);
      const response = await addRole({
        role,
        description,
        permissions: modifiedPermissions,
      }).unwrap();
      toast.success(response.message);
      fetchUserRolesHandler();
      closeDrawerHandler();
    } catch (error: any) {
      toast.error(error?.data?.message || "Something went wrong");
    } finally {
      setIsAddingRole(false);
    }
  };


  const customStyles = {
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
      "&:hover": {
        backgroundColor: "#ef4444",
        color: "white",
      },
    }),
    menu: (provided: any) => ({
      ...provided,
      zIndex: 9999,
      backgroundColor: "white",
      border: "1px solid #d1d5db",
    }),
    placeholder: (provided: any) => ({
      ...provided,
      color: "#9ca3af",
    }),
  };

  return (
    // <Drawer closeDrawerHandler={closeDrawerHandler}>

    // </Drawer>
    <div
      className="absolute overflow-auto h-[100vh] w-[99vw] md:w-[450px] bg-white right-0 top-0 z-50 py-3 border-l border-gray-200"
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
          Add New Role
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

      <div className="mt-8 px-5 ">
        <form onSubmit={addRoleHandler}>
          <FormControl className="mt-3 mb-5" isRequired>
            <FormLabel fontWeight="bold" color="gray.700">
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
            <FormLabel fontWeight="bold" color="gray.700">
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
            <FormLabel fontWeight="bold" color="gray.700">
              Permissions
            </FormLabel>
            <Select
              className="rounded mt-2 border "
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
          <Button
            isLoading={isAddingRole}
            type="submit"
            className="mt-5"
            colorScheme="blue"
            size="md"
            width="full"
          >
            Submit
          </Button>
        </form>
      </div>
    </div>
  );
};

export default AddUserRole;
