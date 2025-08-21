import { Button } from "@chakra-ui/react";
import { useState, useEffect } from "react";
import { MdOutlineRefresh, MdAdd } from "react-icons/md";
import ProcessTable from "../components/Table/ProcessTable";
import { toast } from "react-toastify";
import { useCookies } from "react-cookie";
import { useDispatch, useSelector } from "react-redux";
import {
  closeAddProcessDrawer,
  closeProcessDetailsDrawer,
  closeUpdateProcessDrawer,
  openAddProcessDrawer,
  openProcessDetailsDrawer,
  openUpdateProcessDrawer,
} from "../redux/reducers/drawersSlice";
import AddProcess from "../components/Drawers/Process/AddProcess";
import ProcessDetails from "../components/Drawers/Process/ProcessDetails";
import UpdateProcess from "../components/Drawers/Process/UpdateProcess";
import { useDeleteProcessMutation } from "../redux/api/api";
import { FiSearch } from "react-icons/fi";
import { colors } from "../theme/colors";
import { Settings } from "lucide-react";

const Process: React.FC = () => {
  const { isSuper, allowedroutes } = useSelector((state: any) => state.auth);
  const isAllowed = isSuper || allowedroutes.includes("production");
  const [searchKey, setSearchKey] = useState<string | undefined>();
  const [data, setData] = useState<any[] | []>([]);
  const [filteredData, setFilteredData] = useState<any[] | []>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [cookies] = useCookies();
  const [id, setId] = useState<string | undefined>();

  const fetchProcessHandler = async () => {
  try {
    setIsLoading(true); // Set loading state
    const response = await fetch(
      `${process.env.REACT_APP_BACKEND_URL}production-process/all`,
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

    // Filter out processes with status "production started"
    const filteredProcesses = data.production_processes.filter((process: any) => {
      const status = process.status?.toLowerCase();
      return status !== "production started" &&
        status !== "production in progress" &&
        status !== "completed" &&
        status !== "moved to inventory" &&
        status !== "allocated finish goods" &&
        status !== "out finish goods" &&
        status !== "received"	
    });


    console.log("filtered processes (excluding production started)", filteredProcesses);
    setData(filteredProcesses);
    setFilteredData(filteredProcesses);
  } catch (error: any) {
    toast.error(error.message || "Something went wrong");
  } finally {
    setIsLoading(false);
  }
};
  const {
    isAddProcessDrawerOpened,
    isUpdateProcessDrawerOpened,
    isProcessDetailsDrawerOpened,
  } = useSelector((state: any) => state.drawers);
  const dispatch = useDispatch();

  const [deleteProcess] = useDeleteProcessMutation();

  const openAddProcessDrawerHandler = () => {
    dispatch(openAddProcessDrawer());
  };
  const closeAddProcessDrawerHandler = () => {
    dispatch(closeAddProcessDrawer());
  };
  const openProcessDetailsDrawerHandler = (id: string) => {
    setId(id);
    dispatch(openProcessDetailsDrawer());
  };
  const closeProcessDetailsDrawerHandler = () => {
    dispatch(closeProcessDetailsDrawer());
  };
  const openUpdateProcessDrawerHandler = (id: string) => {
    setId(id);
    dispatch(openUpdateProcessDrawer());
  };
  const closeUpdateProcessDrawerHandler = () => {
    dispatch(closeUpdateProcessDrawer());
  };

  const deleteProcessHandler = async (id: string) => {
    try {
      const response = await deleteProcess(id).unwrap();
      toast.success(response.message);
      fetchProcessHandler();
    } catch (error: any) {
      console.log(error.message || "Something went wrong");
    }
  };

  useEffect(() => {
    fetchProcessHandler();
  }, []);

  useEffect(() => {
    const searchText = searchKey?.toLowerCase();
    const results = data.filter(
      (p: any) =>
        p.creator.first_name?.toLowerCase()?.includes(searchText) ||
        p?.creator?.last_name?.toLowerCase()?.includes(searchText) ||
        p?.item?.name?.toLowerCase()?.includes(searchText) ||
        p?.status?.toLowerCase()?.includes(searchText) ||
        p?.em_store?.name?.toLowerCase()?.includes(searchText) ||
        p?.fg_store?.name?.toLowerCase()?.includes(searchText) ||
        p?.scrap_store?.name?.toLowerCase()?.includes(searchText) ||
        (p?.createdAt &&
          new Date(p?.createdAt)
            ?.toISOString()
            ?.substring(0, 10)
            ?.split("-")
            .reverse()
            .join("")
            ?.includes(searchText?.replaceAll("/", "") || "")) ||
        (p?.updatedAt &&
          new Date(p?.updatedAt)
            ?.toISOString()
            ?.substring(0, 10)
            ?.split("-")
            ?.reverse()
            ?.join("")
            ?.includes(searchText?.replaceAll("/", "") || ""))
    );
    console.log("search results", results);
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
    <div
      className="min-h-screen"
      style={{ backgroundColor: colors.background.page }}
    >
      <div className="p-2 lg:p-3">
        {/* Add Process Drawer */}
        {isAddProcessDrawerOpened && (
          <AddProcess
            fetchProcessHandler={fetchProcessHandler}
            closeDrawerHandler={closeAddProcessDrawerHandler}
          />
        )}
        {/* Process Details Drawer */}
        {isProcessDetailsDrawerOpened && (
          <ProcessDetails
            id={id}
            closeDrawerHandler={closeProcessDetailsDrawerHandler}
          />
        )}
        {/* Update Process Drawer */}
        {isUpdateProcessDrawerOpened && (
          <UpdateProcess
            id={id}
            closeDrawerHandler={closeUpdateProcessDrawerHandler}
            fetchProcessHandler={fetchProcessHandler}
          />
        )}

        {/* Header Section */}
        <div
          className="rounded-xl shadow-sm border border-gray-100 p-6 mb-6"
          style={{
            backgroundColor: colors.background.card,
            borderColor: colors.border.light,
          }}
        >
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-3 rounded-xl shadow-lg">
                <Settings className="text-white" size={24} />
              </div>
              <div>
                <h1
                  className="text-2xl lg:text-3xl font-bold"
                  style={{ color: colors.text.primary }}
                >
                  Pre Production 
                </h1>
                <p
                  className="text-sm mt-1"
                  style={{ color: colors.text.secondary }}
                >
                  Manage your production processes and workflows
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={openAddProcessDrawerHandler}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors"
                style={{
                  backgroundColor: colors.button.primary,
                  color: colors.text.inverse,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor =
                    colors.button.primaryHover;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = colors.button.primary;
                }}
              >
                <MdAdd size="20px" />
                Add New Process
              </button>

              <button
                onClick={fetchProcessHandler}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium border transition-colors"
                style={{
                  borderColor: colors.border.medium,
                  color: colors.text.primary,
                  backgroundColor: colors.background.card,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = colors.gray[50];
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor =
                    colors.background.card;
                }}
              >
                <MdOutlineRefresh size="20px" />
                Refresh
              </button>
            </div>
          </div>

          {/* Search Row */}
          <div className="mt-6 flex flex-col lg:flex-row gap-4 items-end">
            <div className="flex-1 max-w-md">
              <label
                className="block text-sm font-medium mb-2"
                style={{ color: colors.text.primary }}
              >
                Search Processes
              </label>
              <div className="relative">
                <FiSearch
                  className="absolute left-3 top-1/2 transform -translate-y-1/2"
                  style={{ color: colors.text.secondary }}
                />
                <input
                  className="w-full pl-10 pr-4 py-2.5 border rounded-lg focus:outline-none focus:ring-3 transition-colors"
                  style={{
                    backgroundColor: colors.input.background,
                    borderColor: colors.input.border,
                    color: colors.text.primary,
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor =
                      colors.input.borderFocus;
                    e.currentTarget.style.boxShadow = `0 0 0 3px ${colors.primary[100]}`;
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = colors.input.border;
                    e.currentTarget.style.boxShadow = "none";
                  }}
                  placeholder="Search by creator, item, status, store..."
                  value={searchKey || ""}
                  onChange={(e) => setSearchKey(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Process Table */}
        <div
          className="rounded-xl shadow-sm border border-gray-100 overflow-hidden"
          style={{
            backgroundColor: colors.background.card,
            borderColor: colors.border.light,
          }}
        >
          <ProcessTable 
            isLoadingProcess={isLoading}
            proces={filteredData}
            deleteProcessHandler={deleteProcessHandler}
            openUpdateProcessDrawerHandler={openUpdateProcessDrawerHandler}
            fetchProcessHandler={fetchProcessHandler}
          />
        </div>
      </div>
    </div>
  );
};

export default Process;
