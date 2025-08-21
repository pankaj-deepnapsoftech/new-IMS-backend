// @ts-nocheck

import { useState, useEffect } from "react";
import AssignEmployee from "../Drawers/Sales/AssignEmployee";
import UploadInvoice from "../Drawers/Sales/UploadInvoice";
import ViewPayment from "../Drawers/Sales/ViewPayment";
import ViewDesign from "../Drawers/Sales/ViewDesign";
import ApproveSample from "../Drawers/Sales/ApproveSample";
import Loading from "../../ui/Loading";
import EmptyData from "../../ui/emptyData";
import { colors } from "../../theme/colors";
import {
  FaEdit,
  FaUserPlus,
  FaImage,
  FaFileImage,
  FaCheckCircle,
  FaEye,
} from "react-icons/fa";
import { MdRefresh } from "react-icons/md";
import SalesOrderPDF from "../PDF/SalesOrderPDF";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { Textarea } from "@chakra-ui/react";
import { toast } from "react-toastify";
import axios from "axios";
import { useCookies } from "react-cookie";

const statusColorMap = {
  "production started": "bg-green-100 text-green-800",
  "request for allow inventory": "bg-yellow-100 text-yellow-800",
  "raw material approval pending": "bg-red-100 text-red-800",
  "inventory in transit": "bg-orange-100 text-orange-800",
  "Inventory Allocated": "bg-purple-100 text-purple-800",
};

const SalesTable = ({
  filteredPurchases,
  empData,
  isLoading,
  setEditTable,
  setShow,
  fetchPurchases,
}) => {
  const [showassign, setShowAssign] = useState(false);
  const [salesOrderStatuses, setSalesOrderStatuses] = useState({});
  const [loadingStatuses, setLoadingStatuses] = useState({});
  const [showInventoryDetails, setShowInventoryDetails] = useState({});
  const [showProductionDetails, setShowProductionDetails] = useState({});
  const [cookies] = useCookies();
  const [isApproved, setIsApproved] = useState(false);

  // Function to update process status (same as BOMRawMaterialTable)
  const updateProcessStatus = async (id, status) => {
    try {
      const res = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}production-process/update-status`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${cookies?.access_token}`,
          },
          body: JSON.stringify({ _id: id, status }),
        }
      );

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.message);
      }

      toast.success(data.message || "Status updated");
      // Refresh the specific sales order status instead of full page reload
      if (filteredPurchases && filteredPurchases.length > 0) {
        fetchAllSalesOrdersStatus();
      }
    } catch (err) {
      toast.error(err.message || "Failed to update status");
    }
  };

  // Function to handle out allotted inventory (same as BOMRawMaterialTable)
  const handleOutAllottedInventory = async (process_id) => {
    console.log("process_id", process_id);

    try {
      const res = await axios.put(
        `${process.env.REACT_APP_BACKEND_URL}production-process/inventory-in-transit`,
        { _id: process_id },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${cookies?.access_token}`,
          },
        }
      );

      if (!res.data.success) {
        throw new Error(res.data.message);
      }

      toast.success("Status updated to Inventory in Transit");
      // Refresh the specific sales order status instead of full page reload
      if (filteredPurchases && filteredPurchases.length > 0) {
        fetchAllSalesOrdersStatus();
      }
    } catch (err) {
      toast.error(err.message || "Something went wrong");
    }
  };
  
  const calculateTotalPrice = (price: number, qty: number, gst: number) => {
    const basePrice = price * qty;
    const gstVal = (basePrice * gst) / 100;
    const totalPrice = basePrice + gstVal;
    return totalPrice;
  };
  const [selectedSale, setSelectedSale] = useState([]);
  const [paymentshow, setPaymentshow] = useState(false);
  const [isOpen, setViewDesign] = useState(false);
  const [isChecked, setIsChecked] = useState(false);

  // Function to fetch comprehensive sales order status
  const fetchSalesOrderStatus = async (salesOrderId) => {
    if (!salesOrderId) return;
    
    console.log("Fetching status for sales order:", salesOrderId);
    
    // Always fetch fresh data for real-time updates
    setLoadingStatuses(prev => ({ ...prev, [salesOrderId]: true }));
    
    try {
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}bom/sales-order-status/${salesOrderId}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${cookies?.access_token}`
          }
        }
      );
      
      console.log("Individual status response:", response.status);
      
      if (response.ok) {
        const data = await response.json();
        setSalesOrderStatuses(prev => ({
          ...prev,
          [salesOrderId]: data
        }));
      } else {
        console.error('Failed to fetch sales order status for:', salesOrderId);
        setSalesOrderStatuses(prev => ({
          ...prev,
          [salesOrderId]: {
            overallStatus: "Error",
            inventoryDetails: [],
            productionDetails: null,
            bomDetails: null
          }
        }));
      }
    } catch (error) {
      console.error('Error fetching sales order status for:', salesOrderId, error);
      setSalesOrderStatuses(prev => ({
        ...prev,
        [salesOrderId]: {
          overallStatus: "Error",
          inventoryDetails: [],
          productionDetails: null,
          bomDetails: null
        }
      }));
    } finally {
      setLoadingStatuses(prev => ({ ...prev, [salesOrderId]: false }));
    }
  };

  // Function to toggle inventory details visibility
  const toggleInventoryDetails = (salesOrderId) => {
    setShowInventoryDetails(prev => ({
      ...prev,
      [salesOrderId]: !prev[salesOrderId]
    }));
  };

  // Function to toggle production details visibility
  const toggleProductionDetails = (salesOrderId) => {
    setShowProductionDetails(prev => ({
      ...prev,
      [salesOrderId]: !prev[salesOrderId]
    }));
  };

  // Function to request inventory allocation
  const handleRequestInventory = async (salesOrderId) => {
    try {
      const statusData = salesOrderStatuses[salesOrderId];
      if (!statusData?.bomId) {
        throw new Error("BOM not found");
      }

      const res = await axios.get(
        `${process.env.REACT_APP_BACKEND_URL}production-process/allocation?_id=${statusData.bomId}`,
        {
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${cookies?.access_token}`,
          },
        }
      );

      if (!res.data.success) {
        throw new Error(res.data.message);
      }

      toast.success("Inventory allocation requested successfully");
      // Refresh status
      fetchSalesOrderStatus(salesOrderId);
    } catch (err) {
      toast.error(err.message || "Something went wrong");
    }
  };

  // Function to start production
  const handleStartProduction = async (salesOrderId) => {
    try {
      const statusData = salesOrderStatuses[salesOrderId];
      if (!statusData?.productionProcessId) {
        throw new Error("Production process not found");
      }

      const res = await axios.put(
        `${process.env.REACT_APP_BACKEND_URL}production-process/start-production`,
        { _id: statusData.productionProcessId },
        {
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${cookies?.access_token}`,
          },
        }
      );

      if (!res.data.success) {
        throw new Error(res.data.message);
      }

      toast.success("Production started successfully");
      // Refresh status
      fetchSalesOrderStatus(salesOrderId);
    } catch (err) {
      toast.error(err.message || "Something went wrong");
    }
  };

  // Function to approve inventory
  const handleApproveInventory = async (materialId) => {
    try {
      const res = await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}bom/approve/inventory/raw-materials`,
        { _id: materialId },
        {
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${cookies?.access_token}`,
          },
        }
      );

      if (!res.data.success) {
        throw new Error(res.data.message);
      }

      toast.success("Raw material approved successfully");
      // Refresh all sales order statuses
      if (filteredPurchases && filteredPurchases.length > 0) {
        filteredPurchases.forEach(purchase => {
          if (purchase._id) {
            fetchSalesOrderStatus(purchase._id);
          }
        });
      }
    } catch (err) {
      toast.error(err.message || "Something went wrong");
    }
  };

  // Function to create BOM
  const handleCreateBOM = async (salesOrderId) => {
    try {
      // Get sales order details first
      const salesOrder = filteredPurchases.find(p => p._id === salesOrderId);
      
      const res = await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}bom/`,
        {
          sale_id: salesOrderId,
          bom_name: `BOM-${salesOrder?.order_id || salesOrderId.slice(-6)}`,
          finished_good: {
            item: salesOrder?.items?.[0]?.product_id || "PRODUCT_ID",
            quantity: salesOrder?.items?.[0]?.quantity || 10
          },
          raw_materials: salesOrder?.items?.map(item => ({
            item: item.product_id,
            quantity: item.quantity,
            description: item.description || "",
            comments: item.comments || ""
          })) || [
            {
              item: "RAW_MATERIAL_ID",
              quantity: 5
            }
          ],
          processes: ["Production"],
          manpower: [
            {
              number: "1"
            }
          ],
          resources: [
            {
              resource_id: "RESOURCE_ID",
              type: "Assembly line",
              specification: "Production line"
            }
          ]
        },
        {
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${cookies?.access_token}`,
          },
        }
      );

      if (!res.data.success) {
        throw new Error(res.data.message);
      }

      toast.success("BOM created successfully");
      // Refresh status for this sales order
      fetchSalesOrderStatus(salesOrderId);
    } catch (err) {
      toast.error(err.message || "Something went wrong");
    }
  };

  // Fetch all sales orders status when component mounts or purchases change
  useEffect(() => {
    console.log("useEffect triggered, filteredPurchases length:", filteredPurchases?.length);
    if (filteredPurchases && filteredPurchases.length > 0) {
      fetchAllSalesOrdersStatus();
    }
  }, [filteredPurchases]);

  // Update summary data when salesOrderStatuses changes
  useEffect(() => {
    if (Object.keys(salesOrderStatuses).length > 0) {
      const statuses = Object.values(salesOrderStatuses);
      const approvedBOMs = statuses.filter(status => status.bomStatus === "Approved").length;
      const activeProductions = statuses.filter(status => 
        status.productionStatus === "production started" || 
        status.productionStatus === "production in progress"
      ).length;
      const completedOrders = statuses.filter(status => 
        status.overallStatus === "Completed"
      ).length;
      
      setSummaryData(prev => ({
        ...prev,
        approvedBOMs,
        activeProductions,
        completedOrders
      }));
    }
  }, [salesOrderStatuses]);

  // Function to refresh all statuses
  const refreshAllStatuses = () => {
    if (filteredPurchases && filteredPurchases.length > 0) {
      filteredPurchases.forEach(purchase => {
        if (purchase._id) {
          fetchSalesOrderStatus(purchase._id);
        }
      });
    }
  };

  // State for summary data
  const [summaryData, setSummaryData] = useState({
    totalSalesOrders: 0,
    totalPreProductionProcesses: 0,
    totalBOMs: 0,
    totalRawMaterials: 0,
    approvedBOMs: 0,
    activeProductions: 0,
    completedOrders: 0
  });

  // Function to fetch all sales orders status at once
  const fetchAllSalesOrdersStatus = async () => {
    console.log("Fetching all sales orders status...");
    setLoadingStatuses(prev => ({ ...prev, all: true }));
    
    try {
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}bom/sales-order-status/all`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${cookies?.access_token}`
          }
        }
      );
      
      console.log("Response status:", response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log("Response data:", data);
        
        if (data.success && data.salesOrdersStatus) {
          const allStatuses = {};
          data.salesOrdersStatus.forEach(status => {
            allStatuses[status.salesOrderId] = status;
          });
          console.log("Setting statuses:", allStatuses);
          // setSalesOrderStatuses(prev => ({...allStatuses, ...prev }));
          
          // Calculate summary data
          const approvedBOMs = data.salesOrdersStatus.filter(status => status.bomStatus === "Approved").length;
          const activeProductions = data.salesOrdersStatus.filter(status => 
            status.productionStatus === "production started" || 
            status.productionStatus === "production in progress"
          ).length;
          const completedOrders = data.salesOrdersStatus.filter(status => 
            status.overallStatus === "Completed"
          ).length;
          
          setSummaryData({
            totalSalesOrders: data.totalSalesOrders,
            totalPreProductionProcesses: data.totalPreProductionProcesses,
            totalBOMs: data.totalBOMs,
            totalRawMaterials: data.totalRawMaterials,
            approvedBOMs,
            activeProductions,
            completedOrders
          });
          
          // Show summary with all counts
          // const summary = `Loaded: ${data.totalSalesOrders} Sales Orders, ${data.totalPreProductionProcesses} Pre-Production Processes, ${data.totalBOMs} BOMs, ${data.totalRawMaterials} Raw Materials`;
          // toast.success(summary);
        }
      } else {
        console.error('Failed to fetch all sales orders status');
        toast.error('Failed to fetch all sales orders status');
      }
    } catch (error) {
      console.error('Error fetching all sales orders status:', error);
      toast.error('Error fetching all sales orders status');
    } finally {
      setLoadingStatuses(prev => ({ ...prev, all: false }));
    }
  };

  const handleSampleDesign = (designFile) => {
    if (designFile) {
      window.open(designFile, "_blank");
    } else {
      toast.error("Design file not available.");
    }
  };

  const handleUpdatedDesign = (designFile) => {
    if (designFile) {
      window.open(designFile, "_blank");
    } else {
      toast.error("Design file not available.");
    }
  };

  if (isLoading) {
    return <Loading />;
  }

  if (!filteredPurchases || filteredPurchases.length === 0) {
    return <EmptyData />;
  }

  console.log("Filtered Purchases:", filteredPurchases);

  return (
    <div className="w-full">
      {/* Summary Section */}
      {/* {Object.keys(salesOrderStatuses).length > 0 && (
        <div className="mb-4 p-4 rounded-lg border" style={{ 
          backgroundColor: colors.background.secondary,
          borderColor: colors.border.light 
        }}>
          <h3 className="text-lg font-semibold mb-3" style={{ color: colors.text.primary }}>
            📊 System Summary
          </h3>
                     <div className="grid grid-cols-3 gap-4">
             <div className="text-center">
               <div className="text-2xl font-bold" style={{ color: colors.primary[500] }}>
                 {summaryData.totalSalesOrders}
               </div>
               <div className="text-sm" style={{ color: colors.text.secondary }}>
                 Sales Orders
               </div>
             </div>
             <div className="text-center">
               <div className="text-2xl font-bold" style={{ color: colors.success[500] }}>
                 {summaryData.approvedBOMs}
               </div>
               <div className="text-sm" style={{ color: colors.text.secondary }}>
                 Approved BOMs
               </div>
             </div>
             <div className="text-center">
               <div className="text-2xl font-bold" style={{ color: colors.warning[500] }}>
                 {summaryData.activeProductions}
               </div>
               <div className="text-sm" style={{ color: colors.text.secondary }}>
                 Active Productions
               </div>
             </div>
          </div>
          
          <div className="mt-4 pt-4 border-t" style={{ borderColor: colors.border.light }}>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-lg font-semibold" style={{ color: colors.secondary[500] }}>
                  {summaryData.totalPreProductionProcesses}
                </div>
                <div className="text-xs" style={{ color: colors.text.secondary }}>
                  Pre-Production Processes
                </div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold" style={{ color: colors.gray[500] }}>
                  {summaryData.totalBOMs}
                </div>
                <div className="text-xs" style={{ color: colors.text.secondary }}>
                  Total BOMs
                </div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold" style={{ color: colors.error[500] }}>
                  {summaryData.totalRawMaterials}
                </div>
                <div className="text-xs" style={{ color: colors.text.secondary }}>
                  Raw Materials
                </div>
              </div>
            </div>
          </div>
        </div>
      )} */}

      <div className="overflow-x-auto">
        <div className="space-y-4 bg-[#f8f9fa]">
          {filteredPurchases?.map((purchase: any) => (
            <div
              key={purchase?._id}
              className="rounded-xl shadow-sm border border-gray-100 p-6"
              style={{
                backgroundColor: colors.background.card,
                borderColor: colors.border.light,
              }}
            >
              {/* Sale Header */}
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-4">
                <div>
                  <h3
                    className="text-lg font-semibold"
                    style={{ color: colors.text.primary }}
                  >
                    Order Id : {purchase.order_id}
                  </h3>
                  <p
                    className="text-sm mt-1"
                    style={{ color: colors.text.secondary }}
                  >
                    Created by{" "}
                    <span className="font-medium">
                      {purchase?.user_id[0]?.first_name || "N/A"}
                    </span>{" "}
                    • {new Date(purchase?.createdAt).toLocaleDateString()}
                  </p>
                </div>
                {/* Edit and Assign buttons moved to top right */}
                <div className="flex gap-2">
                  <button
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium border transition-colors"
                    style={{
                      borderColor: colors.border.medium,
                      color: colors.text.primary,
                      backgroundColor: colors.background.card,
                    }}
                    onClick={() => {
                      setShow(true);
                      setEditTable(purchase);
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = colors.gray[50];
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor =
                        colors.background.card;
                    }}
                  >
                    <FaEdit size="16px" />
                    Edit
                  </button>

                  <button
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors"
                    style={{
                      backgroundColor: colors.button.primary,
                      color: colors.text.inverse,
                    }}
                    onClick={() => {
                      setShowAssign(!showassign);
                      setSelectedSale(purchase);
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor =
                        colors.button.primaryHover;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = colors.button.primary;
                    }}
                  >
                    <FaUserPlus size="16px" />
                    Assign
                  </button>

                  <PDFDownloadLink
                    document={<SalesOrderPDF sale={purchase} />}
                    fileName={`SalesOrder_${purchase.order_id}.pdf`}
                  >
                    {({ loading }) =>
                      loading ? (
                        "Preparing PDF..."
                      ) : (
                        <button className="inline-flex items-center gap-2 px-4 py-2 border rounded-lg">
                          Download PDF
                        </button>
                      )
                    }
                  </PDFDownloadLink>
                </div>
              </div>

              {/* Sale Details Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <div className="space-y-3">
                  <div>
                    <span
                      className="text-sm font-medium"
                      style={{ color: colors.text.secondary }}
                    >
                      Merchant:
                    </span>
                    <span
                      className="ml-2 text-sm"
                      style={{ color: colors.text.primary }}
                    >
                      {purchase?.party?.consignee_name?.length > 0
                        ? purchase?.party?.consignee_name
                        : purchase?.party?.company_name}
                    </span>
                  </div>
                  <div>
                    <span
                      className="text-sm font-medium"
                      style={{ color: colors.text.secondary }}
                    >
                      Bill To Address:
                    </span>
                    <span
                      className="ml-2 text-sm"
                      style={{ color: colors.text.primary }}
                    >
                      {purchase?.party?.bill_to || "N/A"}
                    </span>
                  </div>
                  <div>
                    <span
                      className="text-sm font-medium"
                      style={{ color: colors.text.secondary }}
                    >
                      Product:
                    </span>
                    <span
                      className="ml-2 text-sm"
                      style={{ color: colors.text.primary }}
                    >
                      {purchase?.product_id[0]?.name || "N/A"}
                    </span>
                  </div>
                  <div>
                    <span
                      className="text-sm font-medium"
                      style={{ color: colors.text.secondary }}
                    >
                      Quantity:
                    </span>
                    <span
                      className="ml-2 text-sm"
                      style={{ color: colors.text.primary }}
                    >
                      {purchase?.product_qty}
                    </span>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <span
                      className="text-sm font-medium"
                      style={{ color: colors.text.secondary }}
                    >
                      Unit Price:
                    </span>
                    <span
                      className="ml-2 text-sm"
                      style={{ color: colors.text.primary }}
                    >
                      ₹{purchase?.price || "N/A"}
                    </span>
                  </div>
                  {/* <div>
                    <span
                      className="text-sm font-medium"
                      style={{ color: colors.text.secondary }}
                    >
                      Subtotal:
                    </span>
                    <span
                      className="ml-2 text-sm"
                      style={{ color: colors.text.primary }}
                    >
                      ₹{purchase?.price * purchase?.product_qty}
                    </span>
                    
                  </div> */}
                  <div>
                    <span
                      className="text-sm font-medium"
                      style={{ color: colors.text.secondary }}
                    >
                      GST:
                    </span>
                    <span
                      className="ml-2 text-sm"
                      style={{ color: colors.text.primary }}
                    >
                      {purchase?.GST}%
                    </span>
                  </div>
                  <div>
                    <span
                      className="text-sm font-medium"
                      style={{ color: colors.text.secondary }}
                    >
                      Total Price:
                    </span>
                    <span
                      className="ml-2 text-sm font-semibold"
                      style={{ color: colors.success[600] }}
                    >
                      ₹
                      {calculateTotalPrice(
                        purchase?.price,
                        purchase?.product_qty,
                        purchase?.GST
                      ).toFixed(2)}
                    </span>
                  </div>
                  <div>
                    <span
                      className="text-sm font-medium"
                      style={{ color: colors.text.secondary }}
                    >
                      Mode of Payment:
                    </span>
                    <span
                      className="ml-2 text-sm"
                      style={{ color: colors.text.primary }}
                    >
                      {purchase?.mode_of_payment || "N/A"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Terms of Delivery Section */}
              <div className="flex items-center gap-2 -mt-3">
                <span
                  className="text-sm font-medium w-40"
                  style={{ color: colors.text.secondary }}
                >
                  Terms of Delivery:
                </span>
                <Textarea
                  className="mt-1 p-2 w-full rounded-lg border border-gray-200 text-sm"
                  style={{
                    backgroundColor: colors.background.card,
                    color: colors.text.primary,
                  }}
                  isDisabled={true}
                >
                  {purchase?.terms_of_delivery || purchase?.comment || "N/A"}
                </Textarea>
              </div>
              

              {/* Action Buttons */}
              {/* <div
                className="flex flex-wrap gap-3 pt-4 "
                style={{ borderColor: colors.border.light }}
              > */}
              {/* <button
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium border transition-colors"
                  style={{
                    borderColor: colors.warning[300],
                    color: colors.warning[700],
                    backgroundColor: colors.background.card,
                  }}
                  onClick={() => handleSampleDesign(purchase?.productFile)}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = colors.warning[50];
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = colors.background.card;
                  }}
                >
                  <FaImage size="16px" />
                  Sample Design
                </button>

                <button
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium border transition-colors"
                  style={{
                    borderColor: colors.secondary[300],
                    color: colors.secondary[700],
                    backgroundColor: colors.background.card,
                  }}
                  onClick={() => handleUpdatedDesign(purchase?.designFile)}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = colors.secondary[50];
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = colors.background.card;
                  }}
                >
                  <FaFileImage size="16px" />
                  Updated Design
                </button> */}

              {/* {purchase?.boms[0]?.production_processes?.every((processGroup) =>
                  processGroup?.processes?.every(
                    (process) => process?.done === true
                  )
                ) && (
                  <button
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors"
                    style={{
                      backgroundColor: colors.success[500],
                      color: colors.text.inverse,
                    }}
                    onClick={() => setIsChecked(!isChecked)}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = colors.success[600];
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = colors.success[500];
                    }}
                  >
                    <FaCheckCircle size="16px" />
                    Approve Sample
                  </button>
                )} */}
              {/* </div> */}

              {/* Status Footer */}
              {/* <div
                className="flex justify-between items-center pt-3 mt-3 border-t"
                style={{ borderColor: colors.border.light }}
              >
                <span className="text-sm" style={{ color: colors.text.secondary }}>
                  Design Approval Status:
                </span>
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                    purchase?.assinedto?.[0]?.isCompleted === "Completed"
                      ? "bg-green-100 text-green-800"
                      : purchase?.assinedto?.[0]?.isCompleted === "UnderProcessing"
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {purchase?.assinedto?.[0]?.isCompleted || "Not Assigned"}
                </span>
              </div> */}

              {/* BOM Status (same as BOMRawMaterialTable) */}
              {/* <div
                className="flex justify-between items-center pt-2 mt-2"
                style={{ borderColor: colors.border.light }}
              >
                <span className="text-sm" style={{ color: colors.text.secondary }}>
                  BOM Status:
                </span>
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                    statusColorMap[purchase?.bom_status] || "bg-gray-200 text-gray-800"
                  }`}
                >
                  {purchase?.bom_status || "N/A"}
                </span>
              </div> */}

              {/* Comprehensive Status Section */}
              {/* <div className="space-y-3 pt-3 mt-3 border-t" style={{ borderColor: colors.border.light }}>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium" style={{ color: colors.text.secondary }}>
                    Overall Status:
                  </span>
                  {loadingStatuses[purchase._id] ? (
                    <span className="text-sm text-gray-500">Loading...</span>
                  ) : !salesOrderStatuses[purchase._id] ? (
                    <span className="text-sm text-red-500">No Status Data</span>
                  ) : (
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                        salesOrderStatuses[purchase._id]?.overallStatus === "Completed"
                          ? "bg-green-100 text-green-800"
                          : salesOrderStatuses[purchase._id]?.overallStatus === "Production Started" || 
                            salesOrderStatuses[purchase._id]?.overallStatus === "Production in Progress"
                          ? "bg-blue-100 text-blue-800"
                          : salesOrderStatuses[purchase._id]?.overallStatus === "Ready for Production"
                          ? "bg-purple-100 text-purple-800"
                          : salesOrderStatuses[purchase._id]?.overallStatus === "Inventory Approved"
                          ? "bg-green-100 text-green-800"
                          : salesOrderStatuses[purchase._id]?.overallStatus === "Partially Approved"
                          ? "bg-yellow-100 text-yellow-800"
                          : salesOrderStatuses[purchase._id]?.overallStatus === "No BOM assigned"
                          ? "bg-gray-100 text-gray-600"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {salesOrderStatuses[purchase._id]?.overallStatus || "Pending"}
                    </span>
                  )}
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm" style={{ color: colors.text.secondary }}>
                    BOM Status:
                  </span>
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                        salesOrderStatuses[purchase._id]?.bomStatus === "Approved"
                          ? "bg-green-100 text-green-800"
                          : salesOrderStatuses[purchase._id]?.bomStatus === "Not Created"
                          ? "bg-gray-100 text-gray-600"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {salesOrderStatuses[purchase._id]?.bomStatus || "Pending"}
                    </span>
                    {salesOrderStatuses[purchase._id]?.bomName && 
                     salesOrderStatuses[purchase._id]?.bomName !== "N/A" && (
                      <span className="text-xs px-2 py-1 rounded bg-blue-100 text-blue-800">
                        {salesOrderStatuses[purchase._id]?.bomName}
                      </span>
                    )}
                    {salesOrderStatuses[purchase._id]?.bomDetails?.bom_id && (
                      <span className="text-xs px-2 py-1 rounded bg-purple-100 text-purple-800">
                        {salesOrderStatuses[purchase._id]?.bomDetails?.bom_id}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm" style={{ color: colors.text.secondary }}>
                    Inventory Status:
                  </span>
                  {loadingStatuses[purchase._id] ? (
                    <span className="text-sm text-gray-500">Loading...</span>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                          salesOrderStatuses[purchase._id]?.inventoryStatus === "Approved"
                            ? "bg-green-100 text-green-800"
                            : salesOrderStatuses[purchase._id]?.inventoryStatus === "Partially Approved"
                            ? "bg-yellow-100 text-yellow-800"
                            : salesOrderStatuses[purchase._id]?.inventoryStatus === "No Materials"
                            ? "bg-gray-100 text-gray-600"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {salesOrderStatuses[purchase._id]?.inventoryStatus || "Pending"}
                      </span>
                      
                      {salesOrderStatuses[purchase._id]?.inventoryDetails && 
                       salesOrderStatuses[purchase._id]?.inventoryDetails.length > 0 && (
                        <button
                          onClick={() => toggleInventoryDetails(purchase._id)}
                          className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded-md transition-colors"
                          style={{
                            backgroundColor: colors.button.primary,
                            color: colors.text.inverse,
                          }}
                        >
                          <FaEye size="12px" />
                          {showInventoryDetails[purchase._id] ? "Hide" : "View"} Materials
                        </button>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm" style={{ color: colors.text.secondary }}>
                    Production Status:
                  </span>
                  {loadingStatuses[purchase._id] ? (
                    <span className="text-sm text-gray-500">Loading...</span>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                          salesOrderStatuses[purchase._id]?.productionStatus === "completed"
                            ? "bg-green-100 text-green-800"
                          : salesOrderStatuses[purchase._id]?.productionStatus === "production started" || 
                            salesOrderStatuses[purchase._id]?.productionStatus === "production in progress"
                            ? "bg-blue-100 text-blue-800"
                          : salesOrderStatuses[purchase._id]?.productionStatus === "inventory in transit"
                            ? "bg-orange-100 text-orange-800"
                          : salesOrderStatuses[purchase._id]?.productionStatus === "request for allow inventory"
                            ? "bg-yellow-100 text-yellow-800"
                          : salesOrderStatuses[purchase._id]?.productionStatus === "inventory allocated"
                            ? "bg-purple-100 text-purple-800"
                          : salesOrderStatuses[purchase._id]?.productionStatus === "raw material approval pending"
                            ? "bg-red-100 text-red-800"
                          : salesOrderStatuses[purchase._id]?.productionStatus === "Not Started"
                            ? "bg-gray-100 text-gray-600"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {salesOrderStatuses[purchase._id]?.productionStatus || "Not Started"}
                      </span>
                      
                      {salesOrderStatuses[purchase._id]?.productionDetails && (
                        <button
                          onClick={() => toggleProductionDetails(purchase._id)}
                          className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded-md transition-colors"
                          style={{
                            backgroundColor: colors.button.primary,
                            color: colors.text.inverse,
                          }}
                        >
                          <FaEye size="12px" />
                          {showProductionDetails[purchase._id] ? "Hide" : "View"} Details
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {showInventoryDetails[purchase._id] && 
                 salesOrderStatuses[purchase._id]?.inventoryDetails && 
                 salesOrderStatuses[purchase._id]?.inventoryDetails.length > 0 && (
                  <div className="mt-3 p-3 rounded-lg border" style={{ 
                    backgroundColor: colors.background.secondary,
                    borderColor: colors.border.light 
                  }}>
                    <h4 className="text-sm font-medium mb-2" style={{ color: colors.text.primary }}>
                      Raw Materials Status:
                    </h4>
                    <div className="space-y-2">
                      {salesOrderStatuses[purchase._id]?.inventoryDetails.map((material, index) => (
                        <div key={index} className="flex justify-between items-center text-xs">
                          <div className="flex-1">
                            <span className="font-medium" style={{ color: colors.text.primary }}>
                              {material.name || material.product_id || "Unknown Material"}
                            </span>
                            <div className="text-xs" style={{ color: colors.text.secondary }}>
                              {material.inventory_category} • {material.uom} • Stock: {material.current_stock || 0}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {showProductionDetails[purchase._id] && 
                 salesOrderStatuses[purchase._id]?.productionDetails && (
                  <div className="mt-3 p-3 rounded-lg border" style={{ 
                    backgroundColor: colors.background.secondary,
                    borderColor: colors.border.light 
                  }}>
                    <h4 className="text-sm font-medium mb-2" style={{ color: colors.text.primary }}>
                      Production Process Details:
                    </h4>
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between">
                        <span style={{ color: colors.text.secondary }}>Status:</span>
                        <span style={{ color: colors.text.primary }}>{salesOrderStatuses[purchase._id]?.productionDetails.status}</span>
                      </div>
                      <div className="flex justify-between">
                        <span style={{ color: colors.text.secondary }}>Quantity:</span>
                        <span style={{ color: colors.text.primary }}>{salesOrderStatuses[purchase._id]?.productionDetails.quantity}</span>
                      </div>
                      <div className="flex justify-between">
                        <span style={{ color: colors.text.secondary }}>Creator:</span>
                        <span style={{ color: colors.text.primary }}>
                          {salesOrderStatuses[purchase._id]?.productionDetails.creator?.first_name} {salesOrderStatuses[purchase._id]?.productionDetails.creator?.last_name}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span style={{ color: colors.text.secondary }}>Item:</span>
                        <span style={{ color: colors.text.primary }}>
                          {salesOrderStatuses[purchase._id]?.productionDetails.item?.name} ({salesOrderStatuses[purchase._id]?.productionDetails.item?.product_id})
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span style={{ color: colors.text.secondary }}>RM Store:</span>
                        <span style={{ color: colors.text.primary }}>
                          {salesOrderStatuses[purchase._id]?.productionDetails.rm_store?.name}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span style={{ color: colors.text.secondary }}>FG Store:</span>
                        <span style={{ color: colors.text.primary }}>
                          {salesOrderStatuses[purchase._id]?.productionDetails.fg_store?.name}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span style={{ color: colors.text.secondary }}>Created:</span>
                        <span style={{ color: colors.text.primary }}>
                          {new Date(salesOrderStatuses[purchase._id]?.productionDetails.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div> */}

              {/* Action Buttons for Status Management */}
              <div className="flex flex-wrap gap-3 pt-4 mt-3 border-t" style={{ borderColor: colors.border.light }}>
                
                {/* Create BOM Button - Commented out */}
                {/* {salesOrderStatuses[purchase._id]?.canCreateBOM && (
                  <button
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors"
                    style={{
                      backgroundColor: colors.primary[500],
                      color: colors.text.inverse,
                    }}
                    onClick={() => handleCreateBOM(purchase._id)}
                  >
                    <FaCheckCircle size="16px" />
                    Create BOM
                  </button>
                )} */}

                {/* Request Inventory Allocation Button - Commented out */}
                {/* {salesOrderStatuses[purchase._id]?.canRequestInventory && (
                  <button
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors"
                    style={{
                      backgroundColor: colors.primary[500],
                      color: colors.text.inverse,
                    }}
                    onClick={() => handleRequestInventory(purchase._id)}
                  >
                    <FaCheckCircle size="16px" />
                    Request Inventory Allocation
                  </button>
                )} */}

                {/* Out Allotted Inventory Button - Commented out */}
                {/* {salesOrderStatuses[purchase._id]?.canOutAllotInventory && (
                  <button
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors"
                    style={{
                      backgroundColor: colors.warning[500],
                      color: colors.text.inverse,
                    }}
                    onClick={() => handleOutAllottedInventory(salesOrderStatuses[purchase._id]?.productionProcessId)}
                  >
                    Out Allotted Inventory
                  </button>
                )} */}

                {/* Start Production Button - Commented out */}
                {/* {salesOrderStatuses[purchase._id]?.canStartProduction && (
                  <button
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors"
                    style={{
                      backgroundColor: colors.success[500],
                      color: colors.text.inverse,
                    }}
                    onClick={() => handleStartProduction(purchase._id)}
                  >
                    <FaCheckCircle size="16px" />
                    Start Production
                  </button>
                )} */}

                {/* Refresh Status Button - Commented out */}
                {/* <button
                  onClick={() => fetchSalesOrderStatus(purchase._id)}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors"
                  style={{
                    backgroundColor: colors.gray[500],
                    color: colors.text.inverse,
                  }}
                >
                  <MdRefresh size="16px" />
                  Refresh
                </button> */}

                {/* Load All Status Button */}
                {/* <button
                  onClick={fetchAllSalesOrdersStatus}
                  disabled={loadingStatuses.all}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors"
                  style={{
                    backgroundColor: colors.primary[500],
                    color: colors.text.inverse,
                    opacity: loadingStatuses.all ? 0.6 : 1,
                  }}
                >
                  <MdRefresh size="16px" />
                  {loadingStatuses.all ? "Loading..." : "Load All Status"}
                </button> */}

                {/* Legacy Approve Button (for backward compatibility) - Commented out */}
                {/* {!salesOrderStatuses[purchase._id] && (
                  <button
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors"
                    style={{
                      backgroundColor:
                        isApproved ||
                        purchase?.bom_status !== "raw material approval pending" ||
                        purchase?.isInventoryApprovalClicked
                          ? colors.success[700]
                          : colors.success[500],
                      color: colors.text.inverse,
                      cursor:
                        isApproved ||
                        purchase?.bom_status !== "raw material approval pending" ||
                        purchase?.isInventoryApprovalClicked
                          ? "not-allowed"
                          : "pointer",
                    }}
                    onClick={() => {
                      setIsApproved(true);
                    }}
                    disabled={
                      isApproved ||
                      purchase?.bom_status !== "raw material approval pending" ||
                      purchase?.isInventoryApprovalClicked
                    }
                  >
                    <FaCheckCircle size="16px" />
                    {isApproved ||
                    purchase?.bom_status !== "raw material approval pending" ||
                    purchase?.isInventoryApprovalClicked
                      ? "Approved"
                      : "Approve"}
                  </button>
                )} */}
              </div>
            </div>
          ))}

          <AssignEmployee
            show={showassign}
            setShow={setShowAssign}
            employeeData={empData}
            saleData={selectedSale}
            fetchPurchases={fetchPurchases}
          />
          <ApproveSample isChecked={isChecked} setIsChecked={setIsChecked} />
        </div>
      </div>
    </div>
  );
};

export default SalesTable;
