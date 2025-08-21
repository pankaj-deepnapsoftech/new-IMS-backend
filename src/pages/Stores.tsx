// @ts-nocheck
import { Button, FormControl, FormLabel, Input } from "@chakra-ui/react";
import { MdOutlineRefresh, MdAdd } from "react-icons/md";
import { useDispatch, useSelector } from "react-redux";
import SampleCSV from "../assets/csv/store-sample.csv";
import { colors } from "../theme/colors";
import {
  closeAddStoreDrawer,
  closeStoreDetailsDrawer,
  closeUpdateStoreDrawer,
  openAddStoreDrawer,
  openStoreDetailsDrawer,
  openUpdateStoreDrawer,
} from "../redux/reducers/drawersSlice";
import { useCookies } from "react-cookie";
import { toast } from "react-toastify";
import { useEffect, useRef, useState } from "react";
import StoreTable from "../components/Table/StoreTable";
import AddStore from "../components/Drawers/Store/AddStore";
import StoreDetails from "../components/Drawers/Store/StoreDetails";
import UpdateStore from "../components/Drawers/Store/UpdateStore";
import {
  useDeleteStoresMutation,
  useStoreBulKUploadMutation,
} from "../redux/api/api";
import { AiFillFileExcel } from "react-icons/ai";
import { RxCross2 } from "react-icons/rx";
import { FiSearch } from "react-icons/fi";
import { Store } from "lucide-react";

const Stores: React.FC = () => {
  const { isSuper, allowedroutes } = useSelector((state: any) => state.auth);
  const isAllowed = isSuper || allowedroutes.includes("store");
  const [isLoadingStores, setIsLoadingStores] = useState<boolean>(false);
  const [showBulkUploadMenu, setShowBulkUploadMenu] = useState<boolean>(false);
  const [bulkUploading, setBulkUploading] = useState<boolean>(false);
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [searchKey, setSearchKey] = useState<string | undefined>();
  const [storeId, setStoreId] = useState<string | undefined>(); // Store Id to be updated or deleted
  const [stores, setStores] = useState<any>([]);
  const [filteredStores, setFilteredStores] = useState<any>([]);
  const {
    isAddStoreDrawerOpened,
    isUpdateStoreDrawerOpened,
    isStoreDetailsDrawerOpened,
  } = useSelector((state: any) => state.drawers);
  const dispatch = useDispatch();
  const [cookies] = useCookies();

  const [deleteStore] = useDeleteStoresMutation();
  const [bulkUpload] = useStoreBulKUploadMutation();

  const openAddStoreDrawerHandler = () => {
    dispatch(openAddStoreDrawer());
  };

  const closeAddStoreDrawerHandler = () => {
    dispatch(closeAddStoreDrawer());
  };

  const openUpdateStoreDrawerHandler = (id: string) => {
    setStoreId(id);
    dispatch(openUpdateStoreDrawer());
  };

  const closeUpdateStoreDrawerHandler = () => {
    dispatch(closeUpdateStoreDrawer());
  };

  const openStoreDetailsDrawerHandler = (id: string) => {
    setStoreId(id);
    dispatch(openStoreDetailsDrawer());
  };

  const closeStoreDetailsDrawerHandler = () => {
    dispatch(closeStoreDetailsDrawer());
  };

  const fetchStoresHandler = async () => {
    try {
      setIsLoadingStores(true);
      const response = await fetch(
        process.env.REACT_APP_BACKEND_URL + "store/all",
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
      setStores(data.stores);
      setFilteredStores(data.stores);
    } catch (err: any) {
      toast.error(err?.data?.message || err?.message || "Something went wrong");
    } finally {
      setIsLoadingStores(false);
    }
  };

  const deleteStoreHandler = async (id: string) => {
    try {
      const response = await deleteStore(id).unwrap();
      toast.success(response.message);
      fetchStoresHandler();
    } catch (error: any) {
      toast.error(error?.message || "Something went wrong");
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
    fetchStoresHandler();
  }, []);

  useEffect(() => {
    const searchTxt = searchKey?.toLowerCase();
    const results = stores.filter(
      (st: any) =>
        st.name?.toLowerCase()?.includes(searchTxt) ||
        st.gst_number?.toLowerCase()?.includes(searchTxt) ||
        st.address_line1
          ?.toString()
          ?.toLowerCase()
          ?.toString()
          .includes(searchTxt) ||
        st.address_line2?.toLowerCase()?.includes(searchTxt) ||
        st.pincode?.toString().toString().includes(searchTxt) ||
        st?.city?.toString()?.includes(searchTxt) ||
        st?.state?.toString()?.includes(searchTxt) ||
        (st?.createdAt &&
          new Date(st?.createdAt)
            ?.toISOString()
            ?.substring(0, 10)
            ?.split("-")
            .reverse()
            .join("")
            ?.includes(searchTxt?.replaceAll("/", "") || "")) ||
        (st?.updatedAt &&
          new Date(st?.updatedAt)
            ?.toISOString()
            ?.substring(0, 10)
            ?.split("-")
            ?.reverse()
            ?.join("")
            ?.includes(searchTxt?.replaceAll("/", "") || ""))
    );
    setFilteredStores(results);
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
        {/* Add Store Drawer */}
        {isAddStoreDrawerOpened && (
          <AddStore
            fetchStoresHandler={fetchStoresHandler}
            closeDrawerHandler={closeAddStoreDrawerHandler}
          />
        )}
        {/* Update Store Drawer */}
        {isUpdateStoreDrawerOpened && (
          <UpdateStore
            storeId={storeId}
            fetchStoresHandler={fetchStoresHandler}
            closeDrawerHandler={closeUpdateStoreDrawerHandler}
          />
        )}
        {/* Store Details Drawer */}
        {isStoreDetailsDrawerOpened && (
          <StoreDetails
            storeId={storeId}
            closeDrawerHandler={closeStoreDetailsDrawerHandler}
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
              <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-3 rounded-xl shadow-lg">
                <Store className="text-white" size={24} />
              </div>
              <div>
                <h1
                  className="text-2xl lg:text-3xl font-bold"
                  style={{ color: colors.text.primary }}
                >
                  Store Management
                </h1>
                <p
                  className="text-sm mt-1"
                  style={{ color: colors.text.secondary }}
                >
                  Manage store locations and warehouse details
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={openAddStoreDrawerHandler}
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
                Add Store
              </button>

              <button
                onClick={fetchStoresHandler}
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
                Search Stores
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
                  placeholder="Search by name, GST, address..."
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
                  Bulk Upload Stores
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

        {/* Store Table */}
        <div
          className="rounded-xl shadow-sm border border-gray-100 overflow-hidden"
          style={{
            backgroundColor: colors.background.card,
            borderColor: colors.border.light,
          }}
        >
          <StoreTable
            stores={filteredStores}
            isLoadingStores={isLoadingStores}
            deleteStoreHandler={deleteStoreHandler}
            openStoreDetailsDrawerHandler={openStoreDetailsDrawerHandler}
            openUpdateStoreDrawerHandler={openUpdateStoreDrawerHandler}
          />
        </div>
      </div>
    </div>
  );
};

export default Stores;
