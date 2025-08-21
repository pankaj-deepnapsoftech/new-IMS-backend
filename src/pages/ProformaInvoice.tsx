import { Button } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import ProformaInvoiceTable from "../components/Table/ProformaInvoiceTable";
import { toast } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";
import {
  closeAddProformaInvoiceDrawer,
  closeProformaInvoiceDetailsDrawer,
  closeUpdateProformaInvoiceDrawer,
  openAddProformaInvoiceDrawer,
  openProformaInvoiceDetailsDrawer,
  openUpdateProformaInvoiceDrawer,
} from "../redux/reducers/drawersSlice";
import AddProformaInvoice from "../components/Drawers/Proforma Invoice/AddProformaInvoice";
import { useCookies } from "react-cookie";
import { MdOutlineRefresh } from "react-icons/md";
import { useDeleteProformaInvoiceMutation } from "../redux/api/api";
import ProformaInvoiceDetails from "../components/Drawers/Proforma Invoice/ProformaInvoiceDetails";
import UpdateProformaInvoice from "../components/Drawers/Proforma Invoice/UpdateProformaInvoice";
import { FiSearch } from "react-icons/fi";

const ProformaInvoice: React.FC = () => {
  const { isSuper, allowedroutes } = useSelector((state: any) => state.auth);
  const isAllowed = isSuper || allowedroutes.includes("sale & purchase");
  const [cookies] = useCookies();
  const [searchKey, setSearchKey] = useState<string | undefined>();
  const [data, setData] = useState<any[] | []>([]);
  const [filteredData, setFilteredData] = useState<any[] | []>([]);
  const [isLoadingProformaInvoices] = useState<boolean>(false);
  const [allItems, setAllItems] = useState<any[] | []>([]); // Add this to store all items for PDF generation
  
  const {
    isAddProformaInvoiceDrawerOpened,
    isUpdateProformaInvoiceDrawerOpened,
    isProformaInvoiceDetailsDrawerOpened,
  } = useSelector((state: any) => state.drawers);
  const dispatch = useDispatch();
  const [id, setId] = useState<string | undefined>();

  const [deleteProformaInvoice] = useDeleteProformaInvoiceMutation();

  const openAddProformaInvoiceDrawerHandler = () => {
    dispatch(openAddProformaInvoiceDrawer());
  };
  const closeAddProformaInvoiceDrawerHandler = () => {
    dispatch(closeAddProformaInvoiceDrawer());
  };

  const openProformaInvoiceDetailsDrawerHandler = (id: string) => {
    setId(id);
    dispatch(openProformaInvoiceDetailsDrawer());
  };
  const closeProformaInvoiceDetailsDrawerHandler = () => {
    dispatch(closeProformaInvoiceDetailsDrawer());
  };

  const openProformaInvoiceUpdateDrawerHandler = (id: string) => {
    setId(id);
    dispatch(openUpdateProformaInvoiceDrawer());
  };
  const closeProformaInvoiceUpdateDrawerHandler = () => {
    dispatch(closeUpdateProformaInvoiceDrawer());
  };

  const fetchProformaInvoiceHandler = async () => {
    try {
      const response = await fetch(
        process.env.REACT_APP_BACKEND_URL + "proforma-invoice/all",
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
 
      setData(data.proforma_invoices);
      setFilteredData(data.proforma_invoices);
    } catch (error: any) {
      toast.error(error?.message || "Something went wrong");
    }
  };

  // Fetch all items for PDF generation
  const fetchItemsHandler = async () => {
    try {
      const response = await fetch(
        process.env.REACT_APP_BACKEND_URL + "product/all",
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
      setAllItems(results.products);
    } catch (error: any) {
      toast.error(error?.message || "Something went wrong");
    }
  };

  const deleteProformaInvoiceHandler = async (id: string) => {
    try {
      const response = await deleteProformaInvoice(id).unwrap();
      if (!response.success) {
        throw new Error(response.message);
      }
      toast.success(response.message);
      fetchProformaInvoiceHandler();
    } catch (error: any) {
      toast.error(error.message || "Something went wrong");
    }
  };

  useEffect(() => {
    fetchProformaInvoiceHandler();
    fetchItemsHandler(); // Fetch items for PDF generation
  }, []);

  useEffect(() => {
    const searchText = searchKey?.toLowerCase();
    const results = data.filter(
      (pi: any) =>
        pi.creator.first_name?.toLowerCase()?.includes(searchText) ||
        pi?.creator?.last_name?.toLowerCase()?.includes(searchText) ||
        pi?.subtotal?.toString()?.toLowerCase()?.includes(searchText) ||
        pi?.total?.toString()?.toLowerCase()?.includes(searchText) ||
        pi?.supplier?.name?.toLowerCase()?.includes(searchText) ||
        pi?.buyer?.name?.toLowerCase()?.includes(searchText) ||
        (pi?.createdAt &&
          new Date(pi?.createdAt)
            ?.toISOString()
            ?.substring(0, 10)
            ?.split("-")
            .reverse()
            .join("")
            ?.includes(searchText?.replaceAll("/", "") || "")) ||
        (pi?.updatedAt &&
          new Date(pi?.updatedAt)
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
      <div className="text-center text-red-500">
        You are not allowed to access this route.
      </div>
    );
  }
 
  console.log(filteredData)

  return (
    <div className="min-h-screen bg-gray-50 p-2 lg:p-3">
      {isAddProformaInvoiceDrawerOpened && (
        <AddProformaInvoice
          closeDrawerHandler={closeAddProformaInvoiceDrawerHandler}
          fetchProformaInvoicesHandler={fetchProformaInvoiceHandler}
        />
      )} 
      {isProformaInvoiceDetailsDrawerOpened && (
        <ProformaInvoiceDetails
          closeDrawerHandler={closeProformaInvoiceDetailsDrawerHandler}
          id={id}
        />
      )}
      {isUpdateProformaInvoiceDrawerOpened && (
        <UpdateProformaInvoice
          closeDrawerHandler={closeProformaInvoiceUpdateDrawerHandler}
          id={id}
          fetchProformaInvoicesHandler={fetchProformaInvoiceHandler}
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
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Proforma Invoices
              </h1>
              <p className="text-gray-600 mt-1">
                Manage proforma invoices and quotations
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-4 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 flex items-center justify-center gap-2"
              onClick={openAddProformaInvoiceDrawerHandler}
            >
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
              Add New Invoice
            </button>
            <button
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2.5 px-4 rounded-lg border border-gray-300 transition-all duration-200 hover:shadow-md flex items-center justify-center gap-2"
              onClick={fetchProformaInvoiceHandler}
            >
              <MdOutlineRefresh className="text-base" />
              Refresh
            </button>
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
              placeholder="Search invoices..."
              value={searchKey || ""}
              onChange={(e) => setSearchKey(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <ProformaInvoiceTable
          isLoadingProformaInvoices={isLoadingProformaInvoices}
          proformaInvoices={filteredData}
          deleteProformaInvoiceHandler={deleteProformaInvoiceHandler}
          openProformaInvoiceDetailsHandler={
            openProformaInvoiceDetailsDrawerHandler
          }
          openUpdateProformaInvoiceDrawer={
            openProformaInvoiceUpdateDrawerHandler
          }
          // allItems={allItems} // Pass allItems to the table for PDF generation
        />
      </div>
    </div>
  );
};

export default ProformaInvoice;