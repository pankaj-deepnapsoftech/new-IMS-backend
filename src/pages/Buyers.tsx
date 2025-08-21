// @ts-nocheck
import { Button, FormControl, FormLabel, Input } from "@chakra-ui/react";
import { MdOutlineRefresh, MdAdd } from "react-icons/md";
import AgentTable from "../components/Table/AgentTable";
import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { colors } from "../theme/colors";
import {
  closeAddBuyerDrawer,
  closeBuyerDetailsDrawer,
  closeUpdateBuyerDrawer,
  openAddBuyerDrawer,
  openBuyerDetailsDrawer,
  openUpdateBuyerDrawer,
} from "../redux/reducers/drawersSlice";
import SampleCSV from "../assets/csv/agent-sample.csv";
import { toast } from "react-toastify";
import { useCookies } from "react-cookie";
import AddBuyer from "../components/Drawers/Buyer/AddBuyer";
import UpdateBuyer from "../components/Drawers/Buyer/UpdateBuyer";
import {
  useAgentBulKUploadMutation,
  useDeleteAgentMutation,
} from "../redux/api/api";
import BuyerDetails from "../components/Drawers/Buyer/BuyerDetails";
import { AiFillFileExcel } from "react-icons/ai";
import { RxCross2 } from "react-icons/rx";
import { FiSearch } from "react-icons/fi";
import { Users } from "lucide-react";

const Buyers: React.FC = () => {
  const { isSuper, allowedroutes } = useSelector((state: any) => state.auth);
  const isAllowed = isSuper || allowedroutes.includes("agent");
  const [cookies] = useCookies();
  const [showBulkUploadMenu, setShowBulkUploadMenu] = useState<boolean>(false);
  const [bulkUploading, setBulkUploading] = useState<boolean>(false);
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [searchKey, setSearchKey] = useState<string | undefined>();
  const [buyerId, setBuyerId] = useState<string | undefined>();
  const [isLoadingBuyers, setIsLoadingBuyers] = useState<boolean>(false);
  const [buyers, setBuyers] = useState<any[]>([]);
  const [filteredBuyers, setFilteredBuyers] = useState<any[]>([]);

  const {
    isAddBuyerDrawerOpened,
    isUpdateBuyerDrawerOpened,
    isBuyerDetailsDrawerOpened,
  } = useSelector((state: any) => state.drawers);
  const dispatch = useDispatch();

  const [deleteBuyer] = useDeleteAgentMutation();
  const [bulkUpload] = useAgentBulKUploadMutation();

  const openAddBuyerDrawerHandler = () => {
    dispatch(openAddBuyerDrawer());
  };
  const closeAddBuyerDrawerHandler = () => {
    dispatch(closeAddBuyerDrawer());
  };
  const openUpdateBuyerDrawerHandler = (id: string) => {
    setBuyerId(id);
    dispatch(openUpdateBuyerDrawer());
  };
  const closeUpdateBuyerDrawerHandler = () => {
    dispatch(closeUpdateBuyerDrawer());
  };
  const openBuyerDetailsDrawerHandler = (id: string) => {
    setBuyerId(id);
    dispatch(openBuyerDetailsDrawer());
  };
  const closeBuyerDetailsDrawerHandler = () => {
    dispatch(closeBuyerDetailsDrawer());
  };

  const fetchBuyersHandler = async () => {
    try {
      setIsLoadingBuyers(true);
      const response = await fetch(
        process.env.REACT_APP_BACKEND_URL + "agent/buyers",
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
      setBuyers(data.agents);
      setFilteredBuyers(data.agents);
    } catch (error: any) {
      toast.error(error?.message || "Something went wrong");
    } finally {
      setIsLoadingBuyers(false);
    }
  };

  const deleteBuyerHandler = async (id: string) => {
    try {
      const response = await deleteBuyer(id).unwrap();
      toast.success(response.message);
      fetchBuyersHandler();
    } catch (error: any) {
      toast.error(error?.message || "Something went wrong");
    } finally {
      setIsLoadingBuyers(false);
    }
  };

  const bulkUploadHandler = async (e: React.FormEvent) => {
    e.preventDefault();

    const file = fileRef?.current?.files?.[0];
    if (!file) {
      toast.error("CSV file not selected");
      return;
    }

    try {
      setBulkUploading(true);
      const formData = new FormData();
      formData.append("excel", file);

      const response = await bulkUpload(formData).unwrap();
      toast.success(response.message);
    } catch (err: any) {
      toast.error(err?.data?.message || err?.message || "Something went wrong");
    } finally {
      setBulkUploading(false);
    }
  };

  useEffect(() => {
    fetchBuyersHandler();
  }, []);

  useEffect(() => {
    const searchTxt = searchKey?.toLowerCase();
    const results = buyers.filter(
      (buyer: any) =>
        buyer.name?.toLowerCase()?.includes(searchTxt) ||
        buyer.email?.toLowerCase()?.includes(searchTxt) ||
        buyer.phone?.toLowerCase()?.includes(searchTxt) ||
        buyer?.gst_number?.toLowerCase()?.includes(searchTxt) ||
        buyer.company_name.toLowerCase().includes(searchTxt) ||
        buyer.company_email.toLowerCase().includes(searchTxt) ||
        buyer.company_phone.toLowerCase().includes(searchTxt) ||
        buyer.address_line1.toLowerCase().includes(searchTxt) ||
        buyer?.address_line2?.toLowerCase()?.includes(searchTxt) ||
        buyer?.pincode?.toLowerCase()?.includes(searchTxt) ||
        buyer.city.toLowerCase().includes(searchTxt) ||
        buyer.state.toLowerCase().includes(searchTxt) ||
        (buyer?.createdAt &&
          new Date(buyer?.createdAt)
            ?.toISOString()
            ?.substring(0, 10)
            ?.split("-")
            .reverse()
            .join("")
            ?.includes(searchTxt?.replaceAll("/", "") || "")) ||
        (buyer?.updatedAt &&
          new Date(buyer?.updatedAt)
            ?.toISOString()
            ?.substring(0, 10)
            ?.split("-")
            ?.reverse()
            ?.join("")
            ?.includes(searchTxt?.replaceAll("/", "") || ""))
    );
    setFilteredBuyers(results);
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
        {/* Add Buyer Drawer */}
        {isAddBuyerDrawerOpened && (
          <AddBuyer
            fetchBuyersHandler={fetchBuyersHandler}
            closeDrawerHandler={closeAddBuyerDrawerHandler}
          />
        )}
        {/* Update Buyer Drawer */}
        {isUpdateBuyerDrawerOpened && (
          <UpdateBuyer
            buyerId={buyerId}
            closeDrawerHandler={closeUpdateBuyerDrawerHandler}
            fetchBuyersHandler={fetchBuyersHandler}
          />
        )}
        {/* Buyer Details Drawer */}
        {isBuyerDetailsDrawerOpened && (
          <BuyerDetails
            buyerId={buyerId}
            closeDrawerHandler={closeBuyerDetailsDrawerHandler}
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
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-3 rounded-xl shadow-lg">
                <Users className="text-white" size={24} />
              </div>
              <div>
                <h1
                  className="text-2xl lg:text-3xl font-bold"
                  style={{ color: colors.text.primary }}
                >
                  Buyer Management
                </h1>
                <p
                  className="text-sm mt-1"
                  style={{ color: colors.text.secondary }}
                >
                  Manage customer and buyer information
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={openAddBuyerDrawerHandler}
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
                Add Buyer
              </button>

              <button
                onClick={fetchBuyersHandler}
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

              <button
                onClick={() => setShowBulkUploadMenu(true)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors"
                style={{
                  backgroundColor: colors.button.secondary,
                  color: colors.text.inverse,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor =
                    colors.button.secondaryHover;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor =
                    colors.button.secondary;
                }}
              >
                <AiFillFileExcel size="20px" />
                Bulk Upload
              </button>
            </div>
          </div>

          {/* Search and Filters Row */}
          <div className="mt-6 flex flex-col lg:flex-row gap-4 items-end">
            {/* Search Input */}
            <div className="flex-1 max-w-md">
              <label
                className="block text-sm font-medium mb-2"
                style={{ color: colors.text.primary }}
              >
                Search Buyers
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
                  placeholder="Search by name, email, company..."
                  value={searchKey || ""}
                  onChange={(e) => setSearchKey(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Bulk Upload Modal */}
        {showBulkUploadMenu && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div
              className="rounded-xl shadow-xl max-w-md w-full p-6"
              style={{ backgroundColor: colors.background.card }}
            >
              <div className="flex items-center justify-between mb-4">
                <h3
                  className="text-lg font-semibold"
                  style={{ color: colors.text.primary }}
                >
                  Bulk Upload Buyers
                </h3>
                <button
                  onClick={() => setShowBulkUploadMenu(false)}
                  className="p-1 rounded-lg transition-colors"
                  style={{ color: colors.text.secondary }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = colors.gray[100];
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "transparent";
                  }}
                >
                  <RxCross2 size="20px" />
                </button>
              </div>

              <form onSubmit={bulkUploadHandler}>
                <div className="mb-4">
                  <label
                    className="block text-sm font-medium mb-2"
                    style={{ color: colors.text.primary }}
                  >
                    Choose File (.csv or .xlsx)
                  </label>
                  <input
                    ref={fileRef}
                    type="file"
                    accept=".csv, .xlsx"
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-3 transition-colors"
                    style={{
                      backgroundColor: colors.input.background,
                      borderColor: colors.input.border,
                      color: colors.text.primary,
                    }}
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    type="submit"
                    disabled={bulkUploading}
                    className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
                    style={{
                      backgroundColor: colors.button.primary,
                      color: colors.text.inverse,
                    }}
                  >
                    {bulkUploading ? "Uploading..." : "Upload"}
                    <AiFillFileExcel size="16px" />
                  </button>

                  <a href={SampleCSV} className="flex-1">
                    <button
                      type="button"
                      className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium border transition-colors"
                      style={{
                        borderColor: colors.border.medium,
                        color: colors.text.primary,
                        backgroundColor: colors.background.card,
                      }}
                    >
                      Sample CSV
                      <AiFillFileExcel size="16px" />
                    </button>
                  </a>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Buyer Table */}
        <div
          className="rounded-xl shadow-sm border border-gray-100 overflow-hidden"
          style={{
            backgroundColor: colors.background.card,
            borderColor: colors.border.light,
          }}
        >
          <AgentTable
            agents={filteredBuyers}
            openUpdateAgentDrawerHandler={openUpdateBuyerDrawerHandler}
            openAgentDetailsDrawerHandler={openBuyerDetailsDrawerHandler}
            isLoadingAgents={isLoadingBuyers}
            deleteAgentHandler={deleteBuyerHandler}
          />
        </div>
      </div>
    </div>
  );
};

export default Buyers;
