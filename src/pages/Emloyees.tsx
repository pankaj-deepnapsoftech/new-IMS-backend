import { Button } from "@chakra-ui/react";
import { MdOutlineRefresh } from "react-icons/md";
import { FiSearch } from "react-icons/fi";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useCookies } from "react-cookie";
import { useDispatch, useSelector } from "react-redux";
import {
  closeAddEmployeeDrawer,
  closeEmployeeDetailsDrawer,
  closeUpdateEmployeeDrawer,
  openAddEmployeeDrawer,
  openEmployeeDetailsDrawer,
  openUpdateEmployeeDrawer,
} from "../redux/reducers/drawersSlice";
import EmployeeTable from "../components/Table/EmployeeTable";
import EmployeeDetails from "../components/Drawers/Employee/EmployeeDetails";
import UpdateEmployee from "../components/Drawers/Employee/UpdateEmployee";

const Employees: React.FC = () => {
  const { isSuper, allowedroutes } = useSelector((state: any) => state.auth);
  const isAllowed = isSuper || allowedroutes.includes("employee");
  const [cookies] = useCookies();
  const [data, setData] = useState([]);
  const [employeeId, setEmployeeId] = useState<string | undefined>();
  const [searchKey, setSearchKey] = useState<string | undefined>();
  const [filteredData, setFilteredData] = useState<any>([]);

  const { isUpdateEmployeeDrawerOpened, isEmployeeDetailsDrawerOpened } =
    useSelector((state: any) => state.drawers);
  const dispatch = useDispatch();

  const openUpdateEmployeeDrawerHandler = (id: string) => {
    setEmployeeId(id);
    dispatch(openUpdateEmployeeDrawer());
  };

  const closeUpdateEmployeeDrawerHandler = () => {
    dispatch(closeUpdateEmployeeDrawer());
  };

  const openEmployeeDetailsDrawerHandler = (id: string) => {
    setEmployeeId(id);
    dispatch(openEmployeeDetailsDrawer());
  };

  const closeEmployeeDetailsDrawerHandler = () => {
    dispatch(closeEmployeeDetailsDrawer());
  };

  const [isLoadingEmployees, setIsLoadingEmployees] = useState<boolean>(false);

  const fetchEmployeesHandler = async () => {
    try {
      setIsLoadingEmployees(true);
      const response = await fetch(
        process.env.REACT_APP_BACKEND_URL + "auth/all",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${cookies?.access_token}`,
          },
        }
      );
      const results = await response.json();
      if (!results.success) {
        throw new Error(results?.message);
      }
      setData(results.users);
      setFilteredData(results.users);
    } catch (error: any) {
      toast.error(error?.message || "Something went wrong");
    } finally {
      setIsLoadingEmployees(false);
    }
  };

  useEffect(() => {
    fetchEmployeesHandler();
  }, []);

  useEffect(() => {
    const searchTxt = searchKey?.toLowerCase();
    const results = data.filter(
      (emp: any) =>
        emp.first_name?.toLowerCase()?.includes(searchTxt) ||
        emp.last_name?.toLowerCase().includes(searchTxt) ||
        emp.email.toLowerCase()?.includes(searchTxt) ||
        emp.phone.toLowerCase().toString().includes(searchTxt) ||
        emp?.role?.role?.toLowerCase()?.includes(searchTxt) ||
        emp?.employeeId?.toLowerCase()?.includes(searchTxt) ||
        (emp?.createdAt &&
          new Date(emp?.createdAt)
            ?.toISOString()
            ?.substring(0, 10)
            ?.split("-")
            .reverse()
            .join("")
            ?.includes(searchTxt?.replaceAll("/", "") || "")) ||
        (emp?.updatedAt &&
          new Date(emp?.updatedAt)
            ?.toISOString()
            ?.substring(0, 10)
            ?.split("-")
            ?.reverse()
            ?.join("")
            ?.includes(searchTxt?.replaceAll("/", "") || ""))
    );
    setFilteredData(results);
  }, [searchKey]);

  if (!isAllowed) {
    return (
      <div className="text-center text-red-500">
        You are not allowed to access this route.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-2 lg:p-3">
      {/* Update Employee Drawer */}
      {isUpdateEmployeeDrawerOpened && (
        <UpdateEmployee
          closeDrawerHandler={closeUpdateEmployeeDrawerHandler}
          employeeId={employeeId}
          fetchEmployeesHandler={fetchEmployeesHandler}
        />
      )}
      {/* Employee Details Drawer */}
      {isEmployeeDetailsDrawerOpened && (
        <EmployeeDetails
          closeDrawerHandler={closeEmployeeDetailsDrawerHandler}
          employeeId={employeeId}
        />
      )}

      {/* Header Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          {/* Title Section */}
          <div className="flex items-center gap-4">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-3 rounded-xl shadow-lg">
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Employees</h1>
              <p className="text-gray-600 mt-1">
                Manage employee information and roles
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={fetchEmployeesHandler}
              leftIcon={<MdOutlineRefresh />}
              variant="outline"
              colorScheme="gray"
              size="md"
              className="border-gray-300 hover:border-gray-400 transition-all duration-200"
              _hover={{ bg: "gray.50", transform: "translateY(-1px)" }}
            >
              Refresh
            </Button>
          </div>
        </div>

        {/* Search Section */}
        <div className="mt-6 flex justify-center sm:justify-end">
          <div className="relative w-full max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiSearch className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 shadow-sm"
              placeholder="Search employees..."
              value={searchKey || ""}
              onChange={(e) => setSearchKey(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <EmployeeTable
          employees={filteredData}
          openEmployeeDetailsDrawerHandler={openEmployeeDetailsDrawerHandler}
          openUpdateEmployeeDrawerHandler={openUpdateEmployeeDrawerHandler}
          isLoadingEmployees={isLoadingEmployees}
        />
      </div>
    </div>
  );
};

export default Employees;
