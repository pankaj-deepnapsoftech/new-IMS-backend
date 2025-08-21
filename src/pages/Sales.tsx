// @ts-nocheck
import { MdOutlineRefresh } from "react-icons/md";
import { FiSearch, FiPlus, FiShoppingCart, FiDownload } from "react-icons/fi";
import AddNewSale from "../components/Drawers/Sales/AddNewSale";
// import UpdateSale from "../components/Drawers/Sales/UpdateSale";
import { useState, useEffect } from "react";
import SalesTable from "../components/Table/SalesTable";
import AssignEmployee from "../components/Drawers/Sales/AssignEmployee";
import Pagination from "./Pagination";
import { useCookies } from "react-cookie";
import { toast } from "react-toastify";
import axios from "axios";
import { colors } from "../theme/colors";
import * as XLSX from "xlsx";

const Sales = () => {
  const [page, setPage] = useState(1);
  const [show, setShow] = useState(false);
  // const [editshow, seteditsale] = useState(false);
  const [cookies] = useCookies(["access_token", "role"]);
  const [purchases, setPurchases] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const role = cookies?.role;
  const token = cookies?.access_token;
  const [filterText, setFilterText] = useState("");
  const [filterDate, setFilterDate] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filteredPurchases, setFilteredPurchases] = useState([]);
  // const [selectedSale, setSelectedSale] = useState([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [editTable, setEditTable] = useState(null);
  // const handleDataFromChild = (data) => {
  //     setSelectedSale(data);
  //     seteditsale(true);
  // };
  const [isExporting, setIsExporting] = useState(false);

const fetchPurchases = async (currentPage = page) => {
  try {
    setIsLoading(true);
    if (!token) throw new Error("Authentication token not found");

    const url =
      role === "admin"
        ? `${process.env.REACT_APP_BACKEND_URL}sale/getAll?page=${currentPage}&&limit=10`
        : `${process.env.REACT_APP_BACKEND_URL}sale/getOne?page=${currentPage}&&limit=10`;

    const response = await axios.get(url, {
      headers: { Authorization: `Bearer ${token}` },
    });

    // Force new reference to trigger re-render
    setPurchases([...response?.data?.data]);
  } catch (error: any) {
    toast.error(
      error.response?.data?.message ||
        error.message ||
        "Failed to fetch sale data"
    );
  } finally {
    setIsLoading(false);
  }
};


  const fetchEmployees = async () => {
    try {
      if (!token) throw new Error("Authentication token not found");

      const response = await axios.get(
        `${process.env.REACT_APP_BACKEND_URL}auth/all`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const filteredEmployees = (response?.data?.users || []).filter(
        (user) => user.role
      );
      setEmployees(filteredEmployees);
    } catch (error: any) {
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Failed to fetch employees"
      );
    }
  };
  const fetchAllSalesOrderForExport = async () => {
    try {
      setIsExporting(true);
      const res = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}sale/getAll?page=1&limit=10000`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${cookies?.access_token}`,
          },
        }
      );

      const data = await res.json();
      console.log(data);
      return data?.data || [];
    } catch (error) {
      console.error("Error fetching parties data for export:", error);
      return [];
    } finally {
      setIsExporting(false);
    }
  };
  const exportToExcel = async () => {
    try {
      setIsExporting(true);
      const res = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}sale/getAll?page=1&limit=10000`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${cookies?.access_token}`,
          },
        }
      );

      const result = await res.json();
      const allSalesData = result?.data || [];

      if (!allSalesData.length) {
        toast.warning("No data available to export");
        return;
      }

      const excelData = allSalesData.map((sale, index) => ({
        "Sr. No.": index + 1,
        Date: sale?.createdAt
          ? new Date(sale.createdAt).toLocaleDateString()
          : "N/A",
        "Sale ID": sale.order_id || "N/A",
        "Merchant Name": sale?.party?.consignee_name?.[0] || "N/A",
        Product: sale?.product_id?.[0]?.name || "N/A",
        Quantity: sale?.product_qty || 0,
        Price: sale?.price || 0,
        SubTotal:
          sale?.price && sale?.product_qty
            ? sale.price * sale.product_qty
            : "N/A",
        "GST (%)": sale?.GST || 0,
        "Total Price (Incl. GST)": sale?.total_price || 0,
        // "Employee": sale?.user_id?.[0]?.first_name || "N/A",
        Status:
          sale?.Status ||
          (sale?.assinedto?.some(
            (item) => item?.isCompleted?.toLowerCase() === "pending"
          )
            ? "Pending"
            : sale?.assinedto?.some(
                (item) => item?.isCompleted?.toLowerCase() === "inprogress"
              )
            ? "In Progress"
            : "Completed"),
      }));

      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(excelData);

      ws["!cols"] = [
        { wch: 8 },
        { wch: 25 },
        { wch: 20 },
        { wch: 20 },
        { wch: 20 },
        { wch: 15 },
        { wch: 15 },
      ];

      XLSX.utils.book_append_sheet(wb, ws, "Sales Data");

      const currentDate = new Date().toISOString().split("T")[0];
      const filename = `Sales_Data_${currentDate}.xlsx`;

      XLSX.writeFile(wb, filename);
    } catch (error) {
      console.error("Error exporting to Excel:", error);
      toast.error("Error exporting sales data.");
    } finally {
      setIsExporting(false);
    }
  };

  useEffect(() => {
    fetchPurchases(page);
    fetchEmployees();
    fetchAllSalesOrderForExport();
  }, [page]);

  useEffect(() => {
    const filtered = purchases.filter((purchase) => {
      const matchesText =
        !filterText ||
        [
          purchase?.order_id,
          purchase?.user_id?.[0]?.first_name,
          purchase?.user_id?.[0]?.last_name,
          purchase?.product_id?.[0]?.name,
          purchase?.party?.consignee_name,
          purchase?.party?.company_name,
          purchase?.party_id?.[0]?.full_name,
          purchase?.party_id?.[0]?.company_name,
          purchase?.party_id?.[0]?.consignee_name,
        ]
          .filter(Boolean)
          .some((field) =>
            field?.toString().toLowerCase().includes(filterText.toLowerCase())
          );

      const matchesDate =
        !filterDate ||
        new Date(purchase?.createdAt).toISOString().split("T")[0] ===
          filterDate;
      const assignedList = purchase?.assinedto || [];

      const derivedStatus = assignedList.some(
        (item) => item?.isCompleted?.toLowerCase() === "pending"
      )
        ? "pending"
        : assignedList.some(
            (item) => item?.isCompleted?.toLowerCase() === "inprogress"
          )
        ? "inprogress"
        : "completed";

      const matchesStatus =
        !filterStatus || derivedStatus === filterStatus.toLowerCase();
      return matchesText && matchesDate && matchesStatus;
    });

    setFilteredPurchases(filtered);
  }, [filterText, filterDate, filterStatus, purchases]);

  

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
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="bg-gradient-to-r from-green-500 to-green-600 p-3 rounded-xl shadow-lg">
                <FiShoppingCart className="text-white" size={24} />
              </div>
              <div>
                <h1
                  className="text-2xl md:text-3xl font-bold"
                  style={{ color: colors.text.primary }}
                >
                  Sales Management
                </h1>
                <p
                  className="text-sm mt-1"
                  style={{ color: colors.text.secondary }}
                >
                  Track and manage all sales transactions
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => {
                  setShow(!show);
                  setEditTable(null);
                }}
                className="flex items-center gap-2 px-4 py-3 text-white text-sm font-medium rounded-lg transition-all duration-200 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2"
                style={{
                  backgroundColor: colors.primary[600],
                  focusRingColor: colors.primary[500],
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = colors.primary[700];
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = colors.primary[600];
                }}
              >
                <FiPlus size={16} />
                Add New Sale
              </button>
              <button
                onClick={exportToExcel}
                disabled={isExporting}
                className="flex items-center gap-2 px-6 py-3 text-white text-sm font-medium rounded-lg transition-all duration-200 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  backgroundColor: colors.success[600],
                  focusRingColor: colors.success[500],
                }}
                onMouseEnter={(e) => {
                  if (!isExporting) {
                    e.currentTarget.style.backgroundColor = colors.success[700];
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isExporting) {
                    e.currentTarget.style.backgroundColor = colors.success[600];
                  }
                }}
              >
                <FiDownload size={16} />
                {isExporting ? "Exporting..." : "Export to Excel"}
              </button>
              <button
                onClick={fetchPurchases}
                className="flex items-center gap-2 px-6 py-3 text-sm font-medium rounded-lg border transition-all duration-200 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2"
                style={{
                  backgroundColor: colors.background.card,
                  borderColor: colors.border.medium,
                  color: colors.text.secondary,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = colors.gray[50];
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor =
                    colors.background.card;
                }}
              >
                <MdOutlineRefresh size={16} />
                Refresh
              </button>
            </div>
          </div>

          <div className="mt-6 flex flex-col lg:flex-row gap-4 items-end">
            {/* Search Input */}
            <div className="flex-1 max-w-md">
              <label
                className="block text-sm font-medium mb-2"
                style={{ color: colors.text.primary }}
              >
                Search Sales
              </label>
              <div className="relative">
                <FiSearch
                  className="absolute left-3 top-1/2 transform -translate-y-1/2"
                  style={{ color: colors.text.secondary }}
                  size={16}
                />
                <input
                  type="text"
                  placeholder="Search by Order ID, Party Name, Product Name..."
                  value={filterText}
                  onChange={(e) => setFilterText(e.target.value)}
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

            {/* Status Filter */}
            <div className="w-full lg:w-48">
              <label
                className="block text-sm font-medium mb-2"
                style={{ color: colors.text.primary }}
              >
                Status
              </label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-4 py-3 text-sm border rounded-lg transition-colors focus:outline-none focus:ring-2"
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
                <option value="">Filter by sale status</option>
                <option value="Pending">Pending</option>
                <option value="inProgress">In Progress</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
          </div>
        </div>

        {/* Table Section */}
        <div
          className="rounded-xl  overflow-hidden"
          style={{
            backgroundColor: colors.background.card,
            borderColor: colors.border.light,
          }}
        >
          <SalesTable
            setShow={setShow}
            setEditTable={setEditTable}
            filteredPurchases={filteredPurchases}
            empData={employees}
            isLoading={isLoading}
            fetchPurchases={fetchPurchases}
          />
        </div>

        {/* Pagination */}
        <div className="mt-6">
          <Pagination
            page={page}
            setPage={setPage}
            hasNextPage={purchases.length === 10}
          />
        </div>
      </div>

      {/* Drawers */}
      <AddNewSale 
        editTable={editTable}
        show={show}
        setShow={setShow}
        fetchPurchases={fetchPurchases}
      />
      {/* <UpdateSale editshow={editshow} sale={selectedSale} seteditsale={seteditsale} refresh={fetchPurchases} /> */}
    </div>
  );
};

export default Sales;
