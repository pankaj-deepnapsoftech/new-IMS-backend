// @ts-nocheck

import React, { useState, useEffect } from "react";
import { MdDeleteOutline, MdEdit, MdOutlineVisibility } from "react-icons/md";
import { BiSolidTrash, BiX } from "react-icons/bi";
import { colors } from "../../theme/colors";
import { useCookies } from "react-cookie";
import axios from "axios";
import { toast } from "react-toastify";
import { PDFDownloadLink } from "@react-pdf/renderer";
import PurchaseOrderPDF from "../PDF/PurchaseOrderPDF";
import { FaFilePdf } from "react-icons/fa";

interface PurchaseOrder {
  _id: string;
  poOrder: string;
  date: string;
  itemName: string;
  supplierName: string;
  supplierEmail: string;
  supplierShippedGSTIN: string;
  supplierBillGSTIN: string;
  supplierShippedTo: string;
  supplierBillTo: string;
  modeOfPayment: string;
  GSTApply: string;
  billingAddress: string;
  additionalImportant?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface PurchaseOrderTableProps {
  refreshTrigger?: number;
  onEdit?: (order: PurchaseOrder) => void;
  filteredPurchaseOrders: PurchaseOrder[];
  onDelete?: (id: string) => void;
  onRefresh?: () => void;
}

const PurchaseOrderTable: React.FC<PurchaseOrderTableProps> = ({
  refreshTrigger,
  onEdit,
  filteredPurchaseOrders,
  onDelete,
  onRefresh,
}) => {
  const [cookies] = useCookies();
  const [loading, setLoading] = useState(true);
  const [limit, setLimit] = useState(10);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [viewOrder, setViewOrder] = useState<PurchaseOrder | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  // Bulk delete states
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);

  // Single delete states
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState<string>("");

  // Auto-refresh setup
  useEffect(() => {
    setLoading(false);
  }, []);

  // Handle delete purchase order
  const handleDelete = async (id: string) => {
    setDeleteId(id);
    setShowDeleteModal(true);
  };

  // Confirm single delete
  const confirmSingleDelete = async () => {
    if (!deleteId) return;

    setDeletingId(deleteId);
    try {
      const response = await axios.delete(
        `${process.env.REACT_APP_BACKEND_URL}purchase-order/${deleteId}`,
        {
          headers: { Authorization: `Bearer ${cookies?.access_token}` },
        }
      );

      if (response.data.success) {
        toast.success("Purchase order deleted successfully!");
        if (onDelete) {
          onDelete(deleteId);
        }
      } else {
        throw new Error(
          response.data.message || "Failed to delete purchase order"
        );
      }
    } catch (error: any) {
      console.error("Error deleting purchase order:", error);
      toast.error(error.message || "Failed to delete purchase order");
    } finally {
      setDeletingId(null);
      setShowDeleteModal(false);
      setDeleteId("");
    }
  };

  // Handle select all
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedOrders(filteredPurchaseOrders.map((order) => order._id));
    } else {
      setSelectedOrders([]);
    }
  };

  // Handle select individual order
  const handleSelectOrder = (orderId: string, checked: boolean) => {
    if (checked) {
      setSelectedOrders((prev) => [...prev, orderId]);
    } else {
      setSelectedOrders((prev) => prev.filter((id) => id !== orderId));
    }
  };

  // Handle bulk delete
  const handleBulkDelete = async () => {
    if (isBulkDeleting || selectedOrders.length === 0) return;
    setIsBulkDeleting(true);

    try {
      const response = await axios.delete(
        `${process.env.REACT_APP_BACKEND_URL}purchase-order/bulk-delete`,
        {
          headers: { Authorization: `Bearer ${cookies?.access_token}` },
          data: { ids: selectedOrders },
        }
      );

      if (response.data.success) {
        toast.success(
          `Successfully deleted ${response.data.deletedCount} purchase order(s)`
        );
        // Remove deleted orders from local state
        if (onDelete) {
          selectedOrders.forEach((orderId) => onDelete(orderId));
        }
        setSelectedOrders([]);
        setShowBulkDeleteModal(false);
      } else {
        throw new Error(
          response.data.message || "Failed to delete purchase orders"
        );
      }
    } catch (error: any) {
      console.error("Error in bulk delete:", error);
      toast.error(
        error?.response?.data?.message || "Error deleting purchase orders"
      );
    } finally {
      setIsBulkDeleting(false);
    }
  };

  // Handle view purchase order
  const handleView = (order: PurchaseOrder) => {
    setViewOrder(order);
    setIsViewModalOpen(true);
  };

  // Close view modal
  const closeViewModal = () => {
    setIsViewModalOpen(false);
    setViewOrder(null);
  };

  // Handle PDF download - Removed as we'll use PDFDownloadLink component instead

  // Sort purchase orders by createdAt in descending order
  const sortedPurchaseOrders = [...filteredPurchaseOrders].sort((a, b) => {
    const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    return dateB - dateA;
  });

  // Selection state helpers
  const isAllSelected =
    filteredPurchaseOrders.length > 0 &&
    selectedOrders.length === filteredPurchaseOrders.length;
  const isIndeterminate =
    selectedOrders.length > 0 &&
    selectedOrders.length < filteredPurchaseOrders.length;

  return (
    <div className="p-6">
      {/* Header with count */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
        <div className="flex flex-col md:flex-row gap-3">
          <div>
            <h3
              className="text-lg font-semibold"
              style={{ color: colors.text.primary }}
            >
              {filteredPurchaseOrders.length} Purchase Order
              {filteredPurchaseOrders.length !== 1 ? "s" : ""} Found
            </h3>
          </div>

          {/* Bulk Actions */}
          {selectedOrders.length > 0 && (
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3">
              <button
                onClick={() => setShowBulkDeleteModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-sm font-medium rounded-lg transition-colors w-full sm:w-auto"
              >
                <BiSolidTrash size={16} />
                Delete Selected ({selectedOrders.length})
              </button>
              <button
                onClick={() => setSelectedOrders([])}
                className="flex items-center gap-2 px-4 py-2 bg-gray-400 hover:bg-gray-500 text-white text-sm font-medium rounded-lg transition-colors w-full sm:w-auto"
              >
                <BiX size={16} />
                Clear Selection
              </button>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          {/* Limit Selector */}
          <span
            className="text-sm font-medium"
            style={{ color: colors.text.secondary }}
          >
            Show:
          </span>
          <select
            onChange={(e) => setLimit(Number(e.target.value))}
            className="px-3 py-2 text-sm rounded-lg border transition-colors"
            style={{
              backgroundColor: colors.input.background,
              borderColor: colors.border.light,
              color: colors.text.primary,
            }}
          >
            {[5, 10, 20, 50, 100].map((size) => (
              <option key={size} value={size}>
                {size === 100 ? "All" : size}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* View Modal */}
      {isViewModalOpen && viewOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div
            className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto shadow-lg"
            style={{ border: `1px solid ${colors.border.light}` }}
          >
            <h2
              className="text-xl font-bold mb-4"
              style={{ color: colors.text.primary }}
            >
              Purchase Order Details
            </h2>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label
                  className="block text-sm font-medium"
                  style={{ color: colors.text.secondary }}
                >
                  P.O. Number
                </label>
                <p
                  className="mt-1 text-sm"
                  style={{ color: colors.text.primary }}
                >
                  {viewOrder.poOrder || "N/A"}
                </p>
              </div>
              <div>
                <label
                  className="block text-sm font-medium"
                  style={{ color: colors.text.secondary }}
                >
                  Order Date
                </label>
                <p
                  className="mt-1 text-sm"
                  style={{ color: colors.text.primary }}
                >
                  {viewOrder.date
                    ? new Date(viewOrder.date).toLocaleDateString()
                    : "N/A"}
                </p>
              </div>
              <div>
                <label
                  className="block text-sm font-medium"
                  style={{ color: colors.text.secondary }}
                >
                  Item Name
                </label>
                <p
                  className="mt-1 text-sm"
                  style={{ color: colors.text.primary }}
                >
                  {viewOrder.itemName || "N/A"}
                </p>
              </div>
              <div>
                <label
                  className="block text-sm font-medium"
                  style={{ color: colors.text.secondary }}
                >
                  Supplier Name
                </label>
                <p
                  className="mt-1 text-sm"
                  style={{ color: colors.text.primary }}
                >
                  {viewOrder.supplierName || "N/A"}
                </p>
              </div>
              <div>
                <label
                  className="block text-sm font-medium"
                  style={{ color: colors.text.secondary }}
                >
                  Supplier Email
                </label>
                <p
                  className="mt-1 text-sm"
                  style={{ color: colors.text.primary }}
                >
                  {viewOrder.supplierEmail || "N/A"}
                </p>
              </div>
              <div>
                <label
                  className="block text-sm font-medium"
                  style={{ color: colors.text.secondary }}
                >
                  Shipped GSTIN
                </label>
                <p
                  className="mt-1 text-sm"
                  style={{ color: colors.text.primary }}
                >
                  {viewOrder.supplierShippedGSTIN || "N/A"}
                </p>
              </div>
              <div>
                <label
                  className="block text-sm font-medium"
                  style={{ color: colors.text.secondary }}
                >
                  Bill GSTIN
                </label>
                <p
                  className="mt-1 text-sm"
                  style={{ color: colors.text.primary }}
                >
                  {viewOrder.supplierBillGSTIN || "N/A"}
                </p>
              </div>
              <div>
                <label
                  className="block text-sm font-medium"
                  style={{ color: colors.text.secondary }}
                >
                  Shipped To
                </label>
                <p
                  className="mt-1 text-sm"
                  style={{ color: colors.text.primary }}
                >
                  {viewOrder.supplierShippedTo || "N/A"}
                </p>
              </div>
              <div>
                <label
                  className="block text-sm font-medium"
                  style={{ color: colors.text.secondary }}
                >
                  Bill To
                </label>
                <p
                  className="mt-1 text-sm"
                  style={{ color: colors.text.primary }}
                >
                  {viewOrder.supplierBillTo || "N/A"}
                </p>
              </div>
              <div>
                <label
                  className="block text-sm font-medium"
                  style={{ color: colors.text.secondary }}
                >
                  Mode of Payment
                </label>
                <p
                  className="mt-1 text-sm"
                  style={{ color: colors.text.primary }}
                >
                  {viewOrder.modeOfPayment || "N/A"}
                </p>
              </div>
              <div>
                <label
                  className="block text-sm font-medium"
                  style={{ color: colors.text.secondary }}
                >
                  GST Apply
                </label>
                <p
                  className="mt-1 text-sm"
                  style={{ color: colors.text.primary }}
                >
                  {viewOrder.GSTApply
                    ? viewOrder.GSTApply.toUpperCase()
                    : "N/A"}
                </p>
              </div>
              {/* <div>
                <label
                  className="block text-sm font-medium"
                  style={{ color: colors.text.secondary }}
                >
                  Billing Address
                </label>
                <p
                  className="mt-1 text-sm"
                  style={{ color: colors.text.primary }}
                >
                  {viewOrder.billingAddress || "N/A"}
                </p>
              </div> */}
              <div>
                <label
                  className="block text-sm font-medium"
                  style={{ color: colors.text.secondary }}
                >
                  Additional Information
                </label>
                <p
                  className="mt-1 text-sm"
                  style={{ color: colors.text.primary }}
                >
                  {viewOrder.additionalImportant || "N/A"}
                </p>
              </div>
              <div>
                <label
                  className="block text-sm font-medium"
                  style={{ color: colors.text.secondary }}
                >
                  Created At
                </label>
                <p
                  className="mt-1 text-sm"
                  style={{ color: colors.text.primary }}
                >
                  {viewOrder.createdAt
                    ? new Date(viewOrder.createdAt).toLocaleString()
                    : "N/A"}
                </p>
              </div>
              <div>
                <label
                  className="block text-sm font-medium"
                  style={{ color: colors.text.secondary }}
                >
                  Updated At
                </label>
                <p
                  className="mt-1 text-sm"
                  style={{ color: colors.text.primary }}
                >
                  {viewOrder.updatedAt
                    ? new Date(viewOrder.updatedAt).toLocaleString()
                    : "N/A"}
                </p>
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <button
                onClick={closeViewModal}
                className="px-4 py-2 rounded-lg font-medium transition-all duration-200 hover:shadow-md"
                style={{
                  backgroundColor: colors.primary[50],
                  color: colors.primary[600],
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = colors.primary[100];
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = colors.primary[50];
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      <div
        className="rounded-xl shadow-sm overflow-hidden"
        style={{
          backgroundColor: colors.background.card,
          border: `1px solid ${colors.border.light}`,
        }}
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead style={{ backgroundColor: colors.table.header }}>
              <tr style={{ borderBottom: `1px solid ${colors.table.border}` }}>
                <th
                  className="px-4 py-3 text-center text-sm font-semibold whitespace-nowrap"
                  style={{ color: colors.table.headerText }}
                >
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    ref={(input) => {
                      if (input) input.indeterminate = isIndeterminate;
                    }}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </th>
                <th
                  className="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap"
                  style={{ color: colors.table.headerText }}
                >
                  P.O. Number
                </th>
                <th
                  className="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap"
                  style={{ color: colors.table.headerText }}
                >
                  Order Date
                </th>
                {/* <th
                  className="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap"
                  style={{ color: colors.table.headerText }}
                >
                  Item Name
                </th> */}
                <th
                  className="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap"
                  style={{ color: colors.table.headerText }}
                >
                  Supplier Name
                </th>
                <th
                  className="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap"
                  style={{ color: colors.table.headerText }}
                >
                  Supplier Email
                </th>
                <th
                  className="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap"
                  style={{ color: colors.table.headerText }}
                >
                  Shipped GSTIN
                </th>
                <th
                  className="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap"
                  style={{ color: colors.table.headerText }}
                >
                  Bill GSTIN
                </th>
                <th
                  className="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap"
                  style={{ color: colors.table.headerText }}
                >
                  Shipped To
                </th>
                <th
                  className="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap"
                  style={{ color: colors.table.headerText }}
                >
                  Bill To
                </th>
                <th
                  className="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap"
                  style={{ color: colors.table.headerText }}
                >
                  Mode of Payment
                </th>
                <th
                  className="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap"
                  style={{ color: colors.table.headerText }}
                >
                  GST Apply
                </th>
                {/* <th
                  className="px-4 py-3 text-left text-sm font-medium whitespace-nowrap"
                  style={{ color: colors.table.headerText }}
                >
                  Billing Address
                </th> */}
                <th
                  className="px-4 py-3 text-center text-sm font-semibold whitespace-nowrap"
                  style={{ color: colors.table.headerText }}
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={14} className="px-4 py-8 text-center">
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                      <span className="ml-2">Loading...</span>
                    </div>
                  </td>
                </tr>
              ) : sortedPurchaseOrders.length === 0 ? (
                <tr>
                  <td colSpan={14} className="px-4 py-8 text-center">
                    <span style={{ color: colors.text.secondary }}>
                      No purchase orders found
                    </span>
                  </td>
                </tr>
              ) : (
                sortedPurchaseOrders
                  .slice(0, limit)
                  .map((order: PurchaseOrder, index: number) => (
                    <tr
                      key={order._id || index}
                      className="transition-colors hover:shadow-sm"
                      style={{
                        backgroundColor:
                          index % 2 === 0
                            ? colors.background.card
                            : colors.table.stripe,
                        borderBottom: `1px solid ${colors.table.border}`,
                        opacity: deletingId === order._id ? 0.5 : 1,
                      }}
                      onMouseEnter={(e) => {
                        if (deletingId !== order._id) {
                          e.currentTarget.style.backgroundColor =
                            colors.table.hover;
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (deletingId !== order._id) {
                          e.currentTarget.style.backgroundColor =
                            index % 2 === 0
                              ? colors.background.card
                              : colors.table.stripe;
                        }
                      }}
                    >
                      <td className="px-4 py-3 text-center">
                        <input
                          type="checkbox"
                          checked={selectedOrders.includes(order._id)}
                          onChange={(e) =>
                            handleSelectOrder(order._id, e.target.checked)
                          }
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </td>
                      <td
                        className="px-4 py-3 text-sm whitespace-nowrap"
                        style={{ color: colors.text.secondary }}
                      >
                        {order.poOrder || "N/A"}
                      </td>
                      <td
                        className="px-4 py-3 text-sm whitespace-nowrap"
                        style={{ color: colors.text.secondary }}
                      >
                        {order.date
                          ? new Date(order.date).toLocaleDateString()
                          : "N/A"}
                      </td>
                      {/* <td
                        className="px-4 py-3 text-sm font-medium whitespace-nowrap truncate max-w-xs"
                        style={{ color: colors.text.primary }}
                        title={order.itemName || "N/A"}
                      >
                        {order.itemName || "N/A"}
                      </td> */}
                      <td
                        className="px-4 py-3 text-sm font-medium whitespace-nowrap truncate max-w-xs"
                        style={{ color: colors.text.primary }}
                        title={order.supplierName || "N/A"}
                      >
                        {order.supplierName || "N/A"}
                      </td>
                      <td
                        className="px-4 py-3 text-sm whitespace-nowrap truncate max-w-xs"
                        style={{ color: colors.text.secondary }}
                        title={order.supplierEmail || "N/A"}
                      >
                        {order.supplierEmail || "N/A"}
                      </td>
                      <td
                        className="px-4 py-3 text-sm whitespace-nowrap truncate max-w-xs"
                        style={{ color: colors.text.secondary }}
                        title={order.supplierShippedGSTIN || "N/A"}
                      >
                        {order.supplierShippedGSTIN || "N/A"}
                      </td>
                      <td
                        className="px-4 py-3 text-sm whitespace-nowrap truncate max-w-xs"
                        style={{ color: colors.text.secondary }}
                        title={order.supplierBillGSTIN || "N/A"}
                      >
                        {order.supplierBillGSTIN || "N/A"}
                      </td>
                      <td
                        className="px-4 py-3 text-sm max-w-xs truncate whitespace-nowrap"
                        style={{ color: colors.text.secondary }}
                        title={order.supplierShippedTo || "N/A"}
                      >
                        {order.supplierShippedTo || "N/A"}
                      </td>
                      <td
                        className="px-4 py-3 text-sm max-w-xs truncate whitespace-nowrap"
                        style={{ color: colors.text.secondary }}
                        title={order.supplierBillTo || "N/A"}
                      >
                        {order.supplierBillTo || "N/A"}
                      </td>
                      <td className="px-4 py-3 text-sm whitespace-nowrap">
                        <span
                          className="px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap"
                          style={{
                            backgroundColor: colors.primary[100],
                            color: colors.primary[700],
                          }}
                        >
                          {order.modeOfPayment || "N/A"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm whitespace-nowrap">
                        <span
                          className="px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap"
                          style={{
                            backgroundColor: colors.success[100],
                            color: colors.success[700],
                          }}
                        >
                          {order.GSTApply
                            ? order.GSTApply.toUpperCase()
                            : "N/A"}
                        </span>
                      </td>
                      {/* <td
                        className="px-4 py-3 text-sm max-w-xs truncate whitespace-nowrap"
                        style={{ color: colors.text.secondary }}
                        title={order.billingAddress || "N/A"}
                      >
                        {order.billingAddress || "N/A"}
                      </td> */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleView(order)}
                            className="p-2 rounded-lg transition-all duration-200 hover:shadow-md"
                            style={{
                              color: colors.primary[600],
                              backgroundColor: colors.primary[50],
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor =
                                colors.primary[100];
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor =
                                colors.primary[50];
                            }}
                            title="View purchase order"
                            disabled={deletingId === order._id}
                          >
                            <MdOutlineVisibility size={16} />
                          </button>
                          <button
                            onClick={() => {
                              console.log("Edit order:", order._id);
                              if (onEdit) {
                                onEdit(order);
                              }
                            }}
                            className="p-2 rounded-lg transition-all duration-200 hover:shadow-md"
                            style={{
                              color: colors.primary[600],
                              backgroundColor: colors.primary[50],
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor =
                                colors.primary[100];
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor =
                                colors.primary[50];
                            }}
                            title="Edit purchase order"
                            disabled={deletingId === order._id}
                          >
                            <MdEdit size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(order._id)}
                            className="p-2 rounded-lg transition-all duration-200 hover:shadow-md"
                            style={{
                              color: colors.error[600],
                              backgroundColor: colors.error[50],
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor =
                                colors.error[100];
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor =
                                colors.error[50];
                            }}
                            title="Delete purchase order"
                            disabled={deletingId === order._id}
                          >
                            {deletingId === order._id ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-500"></div>
                            ) : (
                              <MdDeleteOutline size={16} />
                            )}
                          </button>
                          <PDFDownloadLink
                            document={
                              <PurchaseOrderPDF purchaseOrder={order} />
                            }
                            fileName={`purchase_order_${
                              order.poOrder || order._id
                            }.pdf`}
                            className="p-2 rounded-lg transition-all duration-200 hover:shadow-md inline-flex items-center"
                            style={{
                              color: colors.warning[600],
                              backgroundColor: colors.warning[50],
                              textDecoration: "none",
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor =
                                colors.warning[100];
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor =
                                colors.warning[50];
                            }}
                          >
                            {({ loading }) =>
                              loading ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-500"></div>
                              ) : (
                                <FaFilePdf className="w-4 h-4" />
                              )
                            }
                          </PDFDownloadLink>
                        </div>
                      </td>
                    </tr>
                  ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Single Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div
            className="w-full max-w-md mx-4 rounded-xl shadow-xl"
            style={{ backgroundColor: colors.background.card }}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2
                  className="text-lg font-semibold"
                  style={{ color: colors.text.primary }}
                >
                  Confirm Deletion
                </h2>
              </div>

              <div className="mb-6">
                <div
                  className="rounded-lg p-4 mb-4"
                  style={{ backgroundColor: colors.error[50] }}
                >
                  <div className="flex flex-col items-center gap-3">
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: colors.error[100] }}
                    >
                      <BiSolidTrash className="w-6 h-6" style={{ color: colors.error[600] }} />
                    </div>
                    <div className="text-center">
                      <p
                        className="font-medium mb-1"
                        style={{ color: colors.error[800] }}
                      >
                        Delete Purchase Order
                      </p>
                      <p
                        className="text-sm"
                        style={{ color: colors.error[600] }}
                      >
                        This action cannot be undone
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setDeleteId("");
                  }}
                  className="flex-1 px-4 py-2 rounded-lg border transition-all duration-200"
                  style={{
                    borderColor: colors.border.medium,
                    color: colors.text.secondary,
                    backgroundColor: colors.background.card,
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={confirmSingleDelete}
                  disabled={deletingId === deleteId}
                  className="flex-1 px-4 py-2 rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
                  style={{
                    backgroundColor: colors.error[500],
                    color: colors.text.inverse,
                    opacity: deletingId === deleteId ? 0.7 : 1,
                  }}
                >
                  {deletingId === deleteId && (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  )}
                  {deletingId === deleteId ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Delete Modal */}
      {showBulkDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div
            className="w-full max-w-md mx-4 rounded-xl shadow-xl"
            style={{ backgroundColor: colors.background.card }}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2
                  className="text-lg font-semibold"
                  style={{ color: colors.text.primary }}
                >
                  Confirm Bulk Deletion
                </h2>
                {!isBulkDeleting && (
                  <button
                    onClick={() => setShowBulkDeleteModal(false)}
                    className="p-1 rounded-lg transition-colors hover:bg-gray-100"
                  >
                    <BiX className="w-5 h-5" style={{ color: colors.text.secondary }} />
                  </button>
                )}
              </div>

              <div className="mb-6">
                <div
                  className="rounded-lg p-4 mb-4"
                  style={{ backgroundColor: colors.error[50] }}
                >
                  <div className="flex flex-col items-center gap-3">
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: colors.error[100] }}
                    >
                      <BiSolidTrash className="w-6 h-6" style={{ color: colors.error[600] }} />
                    </div>
                    <div className="text-center">
                      <p
                        className="font-medium mb-1"
                        style={{ color: colors.error[800] }}
                      >
                        Delete {selectedOrders.length} Purchase Order{selectedOrders.length !== 1 ? "s" : ""}
                      </p>
                      <p
                        className="text-sm"
                        style={{ color: colors.error[600] }}
                      >
                        This action cannot be undone
                      </p>
                    </div>
                  </div>
                </div>

                <p
                  className="text-sm text-center"
                  style={{ color: colors.text.secondary }}
                >
                  Are you sure you want to delete {selectedOrders.length} selected
                  purchase order{selectedOrders.length !== 1 ? "s" : ""}?
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowBulkDeleteModal(false)}
                  disabled={isBulkDeleting}
                  className="flex-1 px-4 py-2 rounded-lg border transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    borderColor: colors.border.medium,
                    color: colors.text.secondary,
                    backgroundColor: colors.background.card,
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleBulkDelete}
                  disabled={isBulkDeleting}
                  className="flex-1 px-4 py-2 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  style={{
                    backgroundColor: colors.error[500],
                    color: colors.text.inverse,
                  }}
                >
                  {isBulkDeleting && (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  )}
                  {isBulkDeleting ? "Deleting..." : "Delete All"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PurchaseOrderTable;
