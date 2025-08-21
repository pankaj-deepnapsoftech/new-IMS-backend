import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";
import {
  closeAddInvoiceDrawer,
  closeAddPaymentDrawer,
  closeInvoiceDetailsDrawer,
  closeUpdateInvoiceDrawer,
  openAddInvoiceDrawer,
  openAddPaymentDrawer,
  openInvoiceDetailsDrawer,
  openUpdateInvoiceDrawer,
} from "../redux/reducers/drawersSlice";
import { useCookies } from "react-cookie";
import { MdAdd, MdOutlineRefresh } from "react-icons/md";
import { FiSearch } from "react-icons/fi";
import { useDeleteInvoiceMutation } from "../redux/api/api";
import InvoiceTable from "../components/Table/InvoiceTable";
import AddInvoice from "../components/Drawers/Invoice/AddInvoice";
import InvoiceDetails from "../components/Drawers/Invoice/InvoiceDetails";
import UpdateInvoice from "../components/Drawers/Invoice/UpdateInvoice";
import AddPayment from "../components/Drawers/Payment/AddPayment";
import { colors } from "../theme/colors";
import { Button } from "@chakra-ui/react";

const Invoice: React.FC = () => {
  const { isSuper, allowedroutes } = useSelector((state: any) => state.auth);
  const isAllowed = isSuper || allowedroutes.includes("sale & purchase");
  const [cookies] = useCookies();
  const [searchKey, setSearchKey] = useState<string | undefined>();
  const [data, setData] = useState<any[] | []>([]);
  const [filteredData, setFilteredData] = useState<any[] | []>([]);
  const [isLoadingInvoices, setIsLoadingInvoices] = useState<boolean>(false);
  const {
    isAddInvoiceDrawerOpened,
    isUpdateInvoiceDrawerOpened,
    isInvoiceDetailsDrawerOpened,
    isAddPaymentDrawerOpened,
  } = useSelector((state: any) => state.drawers);
  const dispatch = useDispatch();
  const [id, setId] = useState<string | undefined>();

  const [deleteInvoice] = useDeleteInvoiceMutation();

  const openAddInvoiceDrawerHandler = () => {
    dispatch(openAddInvoiceDrawer());
  };
  const closeAddInvoiceDrawerHandler = () => {
    dispatch(closeAddInvoiceDrawer());
  };

  const openInvoiceDetailsDrawerHandler = (id: string) => {
    setId(id);
    dispatch(openInvoiceDetailsDrawer());
  };
  const closeInvoiceDetailsDrawerHandler = () => {
    dispatch(closeInvoiceDetailsDrawer());
  };

  const openInvoiceUpdateDrawerHandler = (id: string) => {
    setId(id);
    dispatch(openUpdateInvoiceDrawer());
  };
  const closeInvoiceUpdateDrawerHandler = () => {
    dispatch(closeUpdateInvoiceDrawer());
  };

  const openAddPaymentHandler = (id: string) => {
    setId(id);
    dispatch(openAddPaymentDrawer());
  };
  const closePaymentDrawerHandler = () => {
    dispatch(closeAddPaymentDrawer());
  };

  const fetchInvoiceHandler = async () => {
    try {
      const response = await fetch(
        process.env.REACT_APP_BACKEND_URL + "invoice/all",
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

      setData(data.invoices);
      setFilteredData(data.invoices);
    } catch (error: any) {
      toast.error(error?.message || "Something went wrong");
    }
  };

  const deleteInvoiceHandler = async (id: string) => {
    try {
      const response = await deleteInvoice(id).unwrap();
      if (!response.success) {
        throw new Error(response.message);
      }
      toast.success(response.message);
      fetchInvoiceHandler();
    } catch (error: any) {
      toast.error(error.message || "Something went wrong");
    }
  };

  useEffect(() => {
    fetchInvoiceHandler();
  }, []);

  useEffect(() => {
    const searchText = searchKey?.toLowerCase();
    const results = data.filter(
      (i: any) =>
        i.creator.first_name?.toLowerCase()?.includes(searchText) ||
        i?.creator?.last_name?.toLowerCase()?.includes(searchText) ||
        i?.subtotal?.toString()?.toLowerCase()?.includes(searchText) ||
        i?.total?.toString()?.toLowerCase()?.includes(searchText) ||
        i?.supplier?.name?.toLowerCase()?.includes(searchText) ||
        i?.buyer?.name?.toLowerCase()?.includes(searchText) ||
        (i?.createdAt &&
          new Date(i?.createdAt)
            ?.toISOString()
            ?.substring(0, 10)
            ?.split("-")
            .reverse()
            .join("")
            ?.includes(searchText?.replaceAll("/", "") || "")) ||
        (i?.updatedAt &&
          new Date(i?.updatedAt)
            ?.toISOString()
            ?.substring(0, 10)
            ?.split("-")
            ?.reverse()
            ?.join("")
            ?.includes(searchText?.replaceAll("/", "") || ""))
    );
    setFilteredData(results);
  }, [searchKey]);

  if (!isAllowed) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div
            className="text-lg font-semibold mb-2"
            style={{ color: colors.error[600] }}
          >
            Access Denied
          </div>
          <div style={{ color: colors.text.secondary }}>
            You are not allowed to access this route.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: colors.background.page }}
    >
      {/* Drawers */}
      {isAddInvoiceDrawerOpened && (
        <AddInvoice
          closeDrawerHandler={closeAddInvoiceDrawerHandler}
          fetchInvoicesHandler={fetchInvoiceHandler}
        />
      )}
      {isInvoiceDetailsDrawerOpened && (
        <InvoiceDetails
          closeDrawerHandler={closeInvoiceDetailsDrawerHandler}
          id={id}
        />
      )}
      {isUpdateInvoiceDrawerOpened && (
        <UpdateInvoice
          closeDrawerHandler={closeInvoiceUpdateDrawerHandler}
          id={id}
          fetchInvoicesHandler={fetchInvoiceHandler}
        />
      )}
      {isAddPaymentDrawerOpened && (
        <AddPayment id={id} closeDrawerHandler={closePaymentDrawerHandler} />
      )}

      <div className="p-2 lg:p-3">
        {/* Header */}

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
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
                  Tax Invoice Management
                </h1>
                <p className="text-gray-600 mt-1">
                  Manage invoices for your business.
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={openAddInvoiceDrawerHandler}
                colorScheme="blue"
                size="md"
                leftIcon={
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    />
                  </svg>
                }
                style={{
                  backgroundColor: colors.primary[600],
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = colors.primary[700];
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = colors.primary[600];
                }}
                className="flex items-center px-6 py-3 text-white text-sm font-medium rounded-lg transition-all duration-200 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2"
                _hover={{ transform: "translateY(-1px)" }}
              >
                Add New Tax Invoice
              </Button>
              <Button
                onClick={fetchInvoiceHandler}
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
          <div className="mt-4 flex justify-center sm:justify-end">
            <div className="relative w-full max-w-md">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiSearch className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 shadow-sm"
                placeholder="Search roles..."
                value={searchKey || ""}
                onChange={(e) => setSearchKey(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Table Section */}
        <InvoiceTable
          isLoadingInvoices={isLoadingInvoices}
          invoices={filteredData}
          deleteInvoiceHandler={deleteInvoiceHandler}
          openInvoiceDetailsHandler={openInvoiceDetailsDrawerHandler}
          openUpdateInvoiceDrawer={openInvoiceUpdateDrawerHandler}
          openPaymentDrawer={openAddPaymentHandler}
        />
      </div>
    </div>
  );
};

export default Invoice;
