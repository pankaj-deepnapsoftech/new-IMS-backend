// @ts-nocheck
import { MdOutlineRefresh } from "react-icons/md";
import { FiSearch, FiPlus, FiUsers, FiDownload } from "react-icons/fi";
import { AiFillFileExcel } from "react-icons/ai";
import { RxCross2 } from "react-icons/rx";
import AddParties from "../components/Drawers/Parties/AddParties";
import PartiesTable from "../components/Table/PartiesTable";
import { useEffect, useState, useRef } from "react";
import { useCookies } from "react-cookie";
import Pagination from "./Pagination";
import { colors } from "../theme/colors";
import * as XLSX from 'xlsx';
import { toast } from "react-toastify";
import SampleCSV from "../assets/csv/parties-sample.csv";

const Parties = () => {
  const [showData, setshowData] = useState(false);
  const [counter, setCounter] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [selectedRole, setSelectedRole] = useState("");
  const [partiesData, setPartiesData] = useState([]);
  const [cookies] = useCookies();
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [edittable, setEditTable] = useState(null);
  const [limit, setLimit] = useState(10);
  const [isExporting, setIsExporting] = useState(false);

  // Bulk upload states
  const [showBulkUploadMenu, setShowBulkUploadMenu] = useState(false);
  const [bulkUploading, setBulkUploading] = useState(false);
  const fileRef = useRef(null);

  const fetchPartiesData = async () => {
    try {
      setIsLoading(true);
      const res = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}parties/get?page=${page}&&limit=${limit}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${cookies?.access_token}`,
          },
        }
      );
      const data = await res.json();
      setPartiesData(data?.data);
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAllPartiesForExport = async () => {
    try {
      setIsExporting(true);
      const res = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}parties/get?page=1&limit=10000`, // Get all data
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${cookies?.access_token}`,
          },
        }
      );
      const data = await res.json();
      return data?.data || [];
    } catch (error) {
      console.error("Error fetching parties data for export:", error);
      return [];
    } finally {
      setIsExporting(false);
    }
  };

  const bulkUploadHandler = async (e) => {
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

      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}parties/bulk`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${cookies?.access_token}`,
          },
          body: formData,
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Something went wrong");
      }

      toast.success(result.message);
      setShowBulkUploadMenu(false);
      fetchPartiesData(); // Refresh the data

      // Reset file input
      if (fileRef.current) {
        fileRef.current.value = "";
      }
    } catch (err) {
      toast.error(err.message || "Something went wrong");
    } finally {
      setBulkUploading(false);
    }
  };

  const exportToExcel = async () => {
    try {
      const allPartiesData = await fetchAllPartiesForExport();

      if (!allPartiesData || allPartiesData.length === 0) {
        toast.error("No data available to export");
        return;
      }

      const excelData = allPartiesData.map((party, index) => ({
        'Sr. No.': index + 1,
        'Customer ID': party.cust_id || 'N/A',
        'Date Added': party.createdAt ? new Date(party.createdAt).toLocaleDateString() : 'N/A',
        'Consignee Name': party?.consignee_name?.[0] || "N/A",
        'Company Name': party.company_name || 'N/A',
        'Email': Array.isArray(party.email_id) && party.email_id.length > 0
          ? party.email_id.join(', ')
          : party.email_id || 'N/A',
        'Phone Number': Array.isArray(party.contact_number) && party.contact_number.length > 0
          ? party.contact_number.join(', ')
          : party.contact_number || 'N/A',
        'Type': party.type || 'N/A',
        'Merchant Type': party.parties_type || 'N/A',
        'Shipped To': party.shipped_to || 'N/A',
        'Bill To': party.bill_to || 'N/A',
        'Shipped GSTIN': party.shipped_gst_to || 'N/A',
        'Bill GSTIN': party.bill_gst_to || 'N/A'
      }));

      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(excelData);

      const colWidths = [
        { wch: 8 },
        { wch: 12 },
        { wch: 12 },
        { wch: 20 },
        { wch: 20 },
        { wch: 25 },
        { wch: 15 },
        { wch: 12 },
        { wch: 15 },
        { wch: 30 },
        { wch: 30 },
        { wch: 30 },
        { wch: 30 }
      ];
      ws['!cols'] = colWidths;

      XLSX.utils.book_append_sheet(wb, ws, "Parties Data");

      const currentDate = new Date().toISOString().split('T')[0];
      const filename = `Parties_Data_${currentDate}.xlsx`;

      XLSX.writeFile(wb, filename);
    } catch (error) {
      toast.error("Error exporting data to Excel. Please try again.");
    }
  };

  useEffect(() => {
    fetchPartiesData(page);
  }, [counter, page, limit]);

  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: colors.background.page }}
    >
      <div className="p-2 lg:p-3">
        {/* Header Section */}
        <div
          className="rounded-xl shadow-sm border border-gray-100 p-6 mb-6"
          style={{
            backgroundColor: colors.background.card,
            borderColor: colors.border.light,
          }}
        >
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
            {/* Title and Icon */}
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-2 rounded-lg shadow">
                <FiUsers className="text-white" size={22} />
              </div>
              <div>
                <h1 className="text-2xl font-semibold" style={{ color: colors.text.primary }}>
                  Merchant Management
                </h1>
                <p className="text-sm" style={{ color: colors.text.secondary }}>
                  Manage your buyers and sellers
                </p>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex flex-wrap sm:flex-nowrap gap-2 text-sm">
              {/* Add Merchant */}
              <button
                onClick={() => {
                  setshowData(!showData);
                  setEditTable(null);
                }}
                className="flex items-center gap-1 px-3 py-2 text-white font-medium rounded-md transition-all duration-150 hover:shadow focus:outline-none focus:ring-2"
                style={{
                  backgroundColor: colors.primary[600],
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = colors.primary[700])}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = colors.primary[600])}
              >
                <FiPlus size={16} />
                Add Merchant
              </button>

              <button
                onClick={() => setShowBulkUploadMenu(true)}
                className="flex items-center gap-2 px-6 py-3 text-white text-sm font-medium rounded-lg transition-all duration-200 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2"
                style={{
                  backgroundColor: colors.warning[600],
                  focusRingColor: colors.warning[500],
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = colors.warning[700];
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = colors.warning[600];
                }}
              >
                <AiFillFileExcel size={20} />
                Bulk Upload
              </button>

              {/* Excel Export Button */}
              <button
                onClick={exportToExcel}
                disabled={isExporting}
                className="flex items-center gap-1 px-3 py-2 text-white font-medium rounded-md transition-all duration-150 hover:shadow focus:outline-none focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  backgroundColor: colors.success[600],
                }}
                onMouseEnter={(e) => {
                  if (!isExporting) e.currentTarget.style.backgroundColor = colors.success[700];
                }}
                onMouseLeave={(e) => {
                  if (!isExporting) e.currentTarget.style.backgroundColor = colors.success[600];
                }}
              >
                <FiDownload size={16} />
                {isExporting ? 'Exporting...' : 'Export Excel'}
              </button>
              {/* Bulk Upload */}
    

       

              {/* Refresh */}
              <button
                onClick={fetchPartiesData}
                className="flex items-center gap-1 px-3 py-2 rounded-md border transition-all duration-150 hover:shadow-sm focus:outline-none focus:ring-2"
                style={{
                  borderColor: colors.border.medium,
                  color: colors.text.primary,
                  backgroundColor: colors.background.card,
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = colors.gray[50])}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = colors.background.card)}
              >
                <MdOutlineRefresh size={16} />
                Refresh
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
                Search Merchant
              </label>
              <div className="relative">
                <FiSearch
                  className="absolute left-3 top-1/2 transform -translate-y-1/2"
                  style={{ color: colors.text.secondary }}
                  size={16}
                />
                <input
                  type="text"
                  placeholder="Search party..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 text-sm border rounded-lg transition-colors focus:outline-none focus:ring-2"
                  style={{
                    backgroundColor: colors.input.background,
                    borderColor: colors.input.border,
                    color: colors.text.primary,
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = colors.input.borderFocus;
                    e.target.style.boxShadow = `0 0 0 3px ${colors.primary[100]}`;
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = colors.input.border;
                    e.target.style.boxShadow = "none";
                  }}
                />
              </div>
            </div>

            {/* Type Filter */}
            <div className="w-full lg:w-48">
              <label
                className="block text-sm font-medium mb-2"
                style={{ color: colors.text.primary }}
              >
                Type
              </label>
              <select
                className="w-full px-4 py-3 text-sm border rounded-lg transition-colors focus:outline-none focus:ring-2"
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                style={{
                  backgroundColor: colors.input.background,
                  borderColor: colors.input.border,
                  color: colors.text.primary,
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = colors.input.borderFocus;
                  e.target.style.boxShadow = `0 0 0 3px ${colors.primary[100]}`;
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = colors.input.border;
                  e.target.style.boxShadow = "none";
                }}
              >
                <option value="">Select Type</option>
                <option value="Individual">Individual</option>
                <option value="Company">Company</option>
              </select>
            </div>

            {/* Role Filter */}
            <div className="w-full lg:w-48">
              <label
                className="block text-sm font-medium mb-2"
                style={{ color: colors.text.primary }}
              >
                Merchant Type
              </label>
              <select
                className="w-full px-4 py-3 text-sm border rounded-lg transition-colors focus:outline-none focus:ring-2"
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                style={{
                  backgroundColor: colors.input.background,
                  borderColor: colors.input.border,
                  color: colors.text.primary,
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = colors.input.borderFocus;
                  e.target.style.boxShadow = `0 0 0 3px ${colors.primary[100]}`;
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = colors.input.border;
                  e.target.style.boxShadow = "none";
                }}
              >
                <option value="">Select Type</option>
                <option value="Buyer">Buyer</option>
                <option value="Seller">Seller</option>
              </select>
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
                  Bulk Upload Merchants
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

        {/* Table Section */}
        <div
          className="rounded-xl shadow-sm border border-gray-100 overflow-hidden"
          style={{
            backgroundColor: colors.background.card,
            borderColor: colors.border.light,
          }}
        >
          <PartiesTable
            setshowData={setshowData}
            setEditTable={setEditTable}
            counter={counter}
            searchTerm={searchTerm}
            selectedType={selectedType}
            selectedRole={selectedRole}
            partiesData={partiesData}
            setPartiesData={setPartiesData}
            isLoading={isLoading}
            fetchPartiesData={fetchPartiesData}
            setLimit={setLimit}
            limit={limit}
          />
        </div>

        {/* Pagination */}
        <div className="mt-6">
          <Pagination
            page={page}
            setPage={setPage}
            hasNextPage={partiesData?.length === limit}
          />
        </div>
      </div>

      {/* Add Parties Drawer */}
      <AddParties
        fetchPartiesData={fetchPartiesData}
        setEditTable={setEditTable}
        edittable={edittable}
        showData={showData}
        setshowData={setshowData}
        setCounter={setCounter}
      />
    </div>
  );
};

export default Parties; 
