// @ts-nocheck

import {
  Select,
  Table,
  TableContainer,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
} from "@chakra-ui/react";
import moment from "moment";
import { useMemo, useState } from "react";
import { FaCaretDown, FaCaretUp } from "react-icons/fa";
import { MdDeleteOutline, MdEdit, MdOutlineVisibility } from "react-icons/md";
import { FcApproval } from "react-icons/fc";
import { FaArrowUpLong, FaArrowDownLong } from "react-icons/fa6";
import { usePagination, useSortBy, useTable, Column } from "react-table";
import { toast } from "react-toastify";
import Loading from "../../ui/Loading";
import EmptyData from "../../ui/emptyData";
import { colors } from "../../theme/colors";
import { useCookies } from "react-cookie";
import axios from "axios";

const capitalizeWords = (str: string | undefined | null): string => {
  if (!str) return "";
  return str.replace(/\b\w/g, (char) => char.toUpperCase());
};

interface ProductTableProps {
  products: Array<any>;
  isLoadingProducts: boolean;
  openUpdateProductDrawerHandler?: (id: string) => void;
  openProductDetailsDrawerHandler?: (id: string) => void;
  deleteProductHandler?: (id: string) => void;
  bulkDeleteProductsHandler?: (productIds: string[]) => void;
  approveProductHandler?: (id: string) => void;
}

const ProductTable: React.FC<ProductTableProps> = ({
  products,
  isLoadingProducts,
  openUpdateProductDrawerHandler,
  openProductDetailsDrawerHandler,
  deleteProductHandler,
  bulkDeleteProductsHandler,
  approveProductHandler,
}) => {
  const columns: Column<any>[] = useMemo(
    () => [
      { Header: "ID", accessor: "product_id" },
      {
        Header: "Name",
        accessor: "name",
        Cell: ({ value }: { value: string }) => capitalizeWords(value),
      },
      {
        Header: "Inventory Category",
        accessor: "inventory_category",
        Cell: ({ value }: { value: string }) => capitalizeWords(value) || "N/A",
      },
      {
        Header: "Category",
        accessor: "category",
        Cell: ({ value }: { value: string }) => capitalizeWords(value),
      },
      {
        Header: "Sub Category",
        accessor: "sub_category",
        Cell: ({ value }: { value: string }) => capitalizeWords(value) || "N/A",
      },
      {
        Header: "Type",
        accessor: "item_type",
        Cell: ({ value }: { value: string }) => capitalizeWords(value) || "N/A",
      },
      { Header: "Product/Service", accessor: "product_or_service" },
      { Header: "UOM", accessor: "uom" },
      { Header: "Price", accessor: "price" },
      { Header: "Latest Price", accessor: "latest_price" },
      { Header: "Current stock", accessor: "current_stock" },
      { Header: "Last Change", accessor: "change" },
      { Header: "Min stock", accessor: "min_stock" },
      { Header: "Max stock", accessor: "max_stock" },
      { Header: "Created On", accessor: "createdAt" },
      { Header: "Last Updated", accessor: "updatedAt" },
    ],
    []
  );
  const [showDeletePage, setshowDeletePage] = useState(false);
  const [deleteId, setdeleteId] = useState("");

  // Bulk selection states
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);

  const inventoryCategoryStyles = {
    indirect: { text: "#e70000" },
    direct: { text: "#25d98b" },
  };

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    prepareRow,
    page,
    nextPage,
    previousPage,
    canNextPage,
    canPreviousPage,
    state: { pageIndex, pageSize },
    pageCount,
    setPageSize,
  } = useTable(
    { columns, data: products, initialState: { pageIndex: 0 } },
    useSortBy,
    usePagination
  );

  const [cookies] = useCookies();
  // Bulk selection functions
  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedProducts(page.map((row) => row.original._id));
    } else {
      setSelectedProducts([]);
    }
  };

  const handleSelectProduct = (productId, checked) => {
    if (checked) {
      setSelectedProducts((prev) => [...prev, productId]);
    } else {
      setSelectedProducts((prev) => prev.filter((id) => id !== productId));
    }
  };

  const handleBulkDelete = async () => {
    if (
      isBulkDeleting ||
      selectedProducts.length === 0 ||
      !bulkDeleteProductsHandler
    )
      return;
    setIsBulkDeleting(true);

    try {
      // Use the new bulk delete handler
      await bulkDeleteProductsHandler(selectedProducts);

      setSelectedProducts([]);
      setShowBulkDeleteModal(false);
    } catch (error) {
      console.error("Error in bulk delete:", error);
      toast.error("Failed to delete products. Please try again.");
    } finally {
      setIsBulkDeleting(false);
    }
  };

  const isAllSelected =
    page.length > 0 && selectedProducts.length === page.length;
  const isIndeterminate =
    selectedProducts.length > 0 && selectedProducts.length < page.length;

  return (
    <div className="p-6">
      {isLoadingProducts && (
        <div className="flex items-center justify-center py-20">
          <div className="flex items-center gap-3">
            <div
              className="animate-spin rounded-full h-8 w-8 border-b-2"
              style={{ borderColor: colors.primary[500] }}
            ></div>
            <span
              className="font-medium"
              style={{ color: colors.text.secondary }}
            >
              Loading products...
            </span>
          </div>
        </div>
      )}

      {!isLoadingProducts && products.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div
            className="rounded-full p-6 mb-4"
            style={{ backgroundColor: colors.gray[100] }}
          >
            <svg
              className="w-12 h-12"
              style={{ color: colors.gray[400] }}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
              />
            </svg>
          </div>
          <h3
            className="text-lg font-semibold mb-2"
            style={{ color: colors.text.primary }}
          >
            No products found
          </h3>
          <p className="max-w-md" style={{ color: colors.text.muted }}>
            Get started by adding your first product to manage your inventory.
          </p>
        </div>
      )}

      {!isLoadingProducts && products.length > 0 && (
        <>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-6">
              <div>
                <h3
                  className="text-lg font-semibold"
                  style={{ color: colors.text.primary }}
                >
                  {products.length} Product{products.length !== 1 ? "s" : ""}{" "}
                  Found
                </h3>
                {/* {selectedProducts.length > 0 && (
                  <p className="text-sm mt-1" style={{ color: colors.text.secondary }}>
                    {selectedProducts.length} selected
                  </p>
                )} */}
              </div>

              {/* Bulk Actions */}
              {selectedProducts.length > 0 && (
                <div className="flex items-center gap-3">
                  {bulkDeleteProductsHandler && (
                    <button
                      onClick={() => setShowBulkDeleteModal(true)}
                      className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-sm font-medium rounded-lg transition-colors"
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
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                      Delete Selected ({selectedProducts.length})
                    </button>
                  )}
                  <button
                    onClick={() => setSelectedProducts([])}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-400 hover:bg-gray-500 text-white text-sm font-medium rounded-lg transition-colors"
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
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                    Clear Selection
                  </button>
                </div>
              )}
            </div>

            <div className="flex items-center gap-3">
              <span
                className="text-sm font-medium"
                style={{ color: colors.text.secondary }}
              >
                Show:
              </span>
              <Select
                onChange={(e) => setPageSize(Number(e.target.value))}
                value={pageSize} // this keeps the default value selected
                size="sm"
                width="auto"
                borderRadius="lg"
                borderColor={colors.border.light}
                _focus={{
                  borderColor: colors.primary[500],
                  boxShadow: `0 0 0 1px ${colors.primary[500]}`,
                }}
              >
                {[5, 10, 20, 50, 100, 100000].map((size) => (
                  <option key={size} value={size}>
                    {size === 100000 ? "All" : size}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          {/* Enhanced Table */}
          <div
            className="rounded-xl shadow-sm overflow-hidden"
            style={{
              backgroundColor: colors.background.card,
              border: `1px solid ${colors.border.light}`,
            }}
          >
            <div className="overflow-auto max-h-[600px]">
              <table className="w-full">
                <thead
                  style={{
                    backgroundColor: colors.table.header,
                    position: "sticky",
                    top: 0,
                    zIndex: 2,
                  }}
                >
                  <tr
                    style={{ borderBottom: `1px solid ${colors.table.border}` }}
                  >
                    <th
                      className="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap"
                      style={{
                        color: colors.table.headerText,
                        width: "60px",
                        minWidth: "60px",
                      }}
                    >
                      {cookies?.role === "admin" && (
                        <input
                          type="checkbox"
                          checked={isAllSelected}
                          ref={(el) => {
                            if (el) el.indeterminate = isIndeterminate;
                          }}
                          onChange={(e) => handleSelectAll(e.target.checked)}
                          className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                        />
                      )}
                    </th>
                    <th
                      className="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap"
                      style={{
                        color: colors.table.headerText,
                        width: "160px", // Fixed width
                        minWidth: "160px",
                      }}
                    >
                      Product Id
                    </th>

                    <th
                      className="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap"
                      style={{
                        color: colors.table.headerText,
                        position: "sticky",
                        top: 0,
                        left: 0,
                        zIndex: 3,
                        backgroundColor: colors.table.header,
                        width: "160px",
                        minWidth: "160px",
                      }}
                    >
                      Name
                    </th>
                    <th
                      className="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap"
                      style={{ color: colors.table.headerText }}
                    >
                      Inventory Type
                    </th>
                    <th
                      className="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap"
                      style={{ color: colors.table.headerText }}
                    >
                      Inventory Category
                    </th>
                    <th
                      className="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap"
                      style={{ color: colors.table.headerText }}
                    >
                      Type
                    </th>
                    <th
                      className="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap"
                      style={{ color: colors.table.headerText }}
                    >
                      UOM
                    </th>
                    <th
                      className="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap"
                      style={{ color: colors.table.headerText }}
                    >
                      Price
                    </th>
                    <th
                      className="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap"
                      style={{ color: colors.table.headerText }}
                    >
                      Current Stock
                    </th>
                    <th
                      className="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap"
                      style={{ color: colors.table.headerText }}
                    >
                      Total Available Stocks
                    </th>
                    <th
                      className="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap"
                      style={{ color: colors.table.headerText }}
                    >
                      Last Change
                    </th>
                    <th
                      className="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap"
                      style={{ color: colors.table.headerText }}
                    >
                      Created On
                    </th>
                    <th
                      className="px-4 py-3 text-center text-sm font-semibold whitespace-nowrap"
                      style={{ color: colors.table.headerText }}
                    >
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {page.map((row, index) => {
                    prepareRow(row);
                    return (
                      <tr
                        key={row.id}
                        className="transition-colors hover:shadow-sm"
                        style={{
                          backgroundColor:
                            index % 2 === 0
                              ? colors.background.card
                              : colors.table.stripe,
                          borderBottom: `1px solid ${colors.table.border}`,
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor =
                            colors.table.hover;
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor =
                            index % 2 === 0
                              ? colors.background.card
                              : colors.table.stripe;
                        }}
                      >
                        <td
                          className="px-4 py-3 text-sm whitespace-nowrap"
                          style={{
                            color: colors.text.secondary,
                            width: "60px",
                            minWidth: "60px",
                          }}
                        >
                          {cookies?.role === "admin" && (
                            <input
                              type="checkbox"
                              checked={selectedProducts.includes(
                                row.original._id
                              )}
                              onChange={(e) =>
                                handleSelectProduct(
                                  row.original._id,
                                  e.target.checked
                                )
                              }
                              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                            />
                          )}
                        </td>
                        <td
                          className="px-4 py-3 text-sm font-mono whitespace-nowrap"
                          style={{
                            color: colors.text.secondary,
                            width: "160px",
                            minWidth: "160px",
                          }}
                        >
                          {row.original.product_id || "N/A"}
                        </td>

                        <td
                          className="px-4 py-3 text-sm font-medium whitespace-nowrap max-w-xs truncate"
                          style={{
                            color: colors.text.secondary,
                            position: "sticky",
                            left: 0,
                            zIndex: 1,
                            backgroundColor:
                              index % 2 === 0
                                ? colors.background.card
                                : colors.table.stripe,
                            width: "160px",
                            minWidth: "160px",
                          }}
                          title={row.original.name}
                        >
                          {capitalizeWords(row.original.name) || "N/A"}
                        </td>
                        <td
                          className="px-4 py-3 text-sm whitespace-nowrap"
                          style={{ color: colors.text.secondary }}
                        >
                          {capitalizeWords(row.original.category) || "N/A"}
                        </td>
                        <td className="px-4 py-3 text-sm whitespace-nowrap">
                          {row.original.inventory_category && (
                            <span
                              className="px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap"
                              style={{
                                backgroundColor:
                                  row.original.inventory_category === "direct"
                                    ? colors.success[100]
                                    : colors.error[100],
                                color:
                                  row.original.inventory_category === "direct"
                                    ? colors.success[700]
                                    : colors.error[700],
                              }}
                            >
                              {capitalizeWords(row.original.inventory_category)}
                            </span>
                          )}
                        </td>
                        <td
                          className="px-4 py-3 text-sm whitespace-nowrap"
                          style={{ color: colors.text.secondary }}
                        >
                          {capitalizeWords(row.original.item_type) || "N/A"}
                        </td>
                        <td
                          className="px-4 py-3 text-sm whitespace-nowrap"
                          style={{ color: colors.text.secondary }}
                        >
                          {row.original.uom || "N/A"}
                        </td>
                        <td className="px-4 py-3 text-sm whitespace-nowrap">
                          <div className="flex flex-col">
                            <span
                              className="font-medium"
                              style={{ color: colors.success[600] }}
                            >
                              ₹{row.original.price || "0"}
                            </span>
                            {row.original.latest_price &&
                              row.original.latest_price !==
                                row.original.price && (
                                <span
                                  className="text-xs font-medium"
                                  style={{ color: colors.primary[600] }}
                                >
                                  Latest: ₹
                                  {row.original.latest_price.toFixed(2)}
                                </span>
                              )}
                          </div>
                        </td>

                        <td className="px-4 py-3 text-sm whitespace-nowrap">
                          <div className="flex flex-col">
                            <span style={{ color: colors.text.secondary }}>
                              {(row.original.current_stock || 0) +
                                (row.original.updated_stock || 0) -
                                (row.original.updated_stock || 0)}
                            </span>
                            {row.original.updated_stock &&
                              row.original.updated_stock !== null && (
                                <span
                                  className="text-xs font-medium"
                                  style={{ color: colors.primary[600] }}
                                >
                                  Updated: +{row.original.updated_stock}
                                </span>
                              )}
                          </div>
                        </td>
                        <td
                          className="px-4 py-3 text-sm whitespace-nowrap font-semibold"
                          style={{ color: colors.success[600] }}
                        >
                          {(row.original.current_stock || 0) +
                            (row.original.updated_stock || 0)}
                        </td>
                        <td className="px-4 py-3 text-sm whitespace-nowrap">
                          {row.original.change_type && (
                            <div className="flex gap-1 items-center whitespace-nowrap">
                              {row.original.change_type === "increase" ? (
                                <FaArrowUpLong
                                  size={16}
                                  style={{ color: colors.success[500] }}
                                />
                              ) : (
                                <FaArrowDownLong
                                  size={16}
                                  style={{ color: colors.error[500] }}
                                />
                              )}
                              <span
                                style={{
                                  color:
                                    row.original.change_type === "increase"
                                      ? colors.success[600]
                                      : colors.error[600],
                                }}
                              >
                                {row.original.quantity_changed}
                              </span>
                            </div>
                          )}
                        </td>
                        <td
                          className="px-4 py-3 text-sm whitespace-nowrap"
                          style={{ color: colors.text.secondary }}
                        >
                          {row.original.createdAt
                            ? moment(row.original.createdAt).format(
                                "DD/MM/YYYY"
                              )
                            : "N/A"}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-center gap-2">
                            {openProductDetailsDrawerHandler && (
                              <button
                                onClick={() =>
                                  openProductDetailsDrawerHandler(
                                    row.original._id
                                  )
                                }
                                className="p-2 rounded-lg transition-all duration-200 hover:shadow-md"
                                style={{
                                  color: colors.secondary[600],
                                  backgroundColor: colors.secondary[50],
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.backgroundColor =
                                    colors.secondary[100];
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.backgroundColor =
                                    colors.secondary[50];
                                }}
                                title="View product details"
                              >
                                <MdOutlineVisibility size={16} />
                              </button>
                            )}
                            {openUpdateProductDrawerHandler && (
                              <button
                                onClick={() =>
                                  openUpdateProductDrawerHandler(
                                    row.original._id
                                  )
                                }
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
                                title="Edit product"
                              >
                                <MdEdit size={16} />
                              </button>
                            )}

                            {deleteProductHandler &&
                              cookies?.role === "admin" && (
                                <button
                                  onClick={() => {
                                    setdeleteId(row.original._id);
                                    setshowDeletePage(true);
                                  }}
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
                                  title="Delete product"
                                >
                                  <MdDeleteOutline size={16} />
                                </button>
                              )}
                            {approveProductHandler && (
                              <button
                                onClick={() =>
                                  approveProductHandler(row.original._id)
                                }
                                className="p-2 rounded-lg transition-all duration-200 hover:shadow-md"
                                style={{
                                  color: colors.success[600],
                                  backgroundColor: colors.success[50],
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.backgroundColor =
                                    colors.success[100];
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.backgroundColor =
                                    colors.success[50];
                                }}
                                title="Approve product"
                              >
                                <FcApproval size={16} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Enhanced Pagination */}
          <div
            className="flex items-center justify-center px-6 py-4 border-t mt-4"
            style={{
              backgroundColor: colors.gray[50],
              borderColor: colors.border.light,
            }}
          >
            <div className="flex items-center gap-2">
              <button
                disabled={!canPreviousPage}
                onClick={previousPage}
                className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                style={{
                  color: colors.text.primary,
                  backgroundColor: colors.background.card,
                  border: `1px solid ${colors.border.light}`,
                }}
                onMouseEnter={(e) => {
                  if (!e.currentTarget.disabled) {
                    e.currentTarget.style.backgroundColor = colors.gray[50];
                  }
                }}
                onMouseLeave={(e) => {
                  if (!e.currentTarget.disabled) {
                    e.currentTarget.style.backgroundColor =
                      colors.background.card;
                  }
                }}
              >
                <svg
                  className="w-4 h-4 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
                Previous
              </button>

              <span
                className="mx-4 text-sm"
                style={{ color: colors.text.secondary }}
              >
                Page {pageIndex + 1} of {pageCount}
              </span>

              <button
                disabled={!canNextPage}
                onClick={nextPage}
                className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                style={{
                  color: colors.text.primary,
                  backgroundColor: colors.background.card,
                  border: `1px solid ${colors.border.light}`,
                }}
                onMouseEnter={(e) => {
                  if (!e.currentTarget.disabled) {
                    e.currentTarget.style.backgroundColor = colors.gray[50];
                  }
                }}
                onMouseLeave={(e) => {
                  if (!e.currentTarget.disabled) {
                    e.currentTarget.style.backgroundColor =
                      colors.background.card;
                  }
                }}
              >
                Next
                <svg
                  className="w-4 h-4 ml-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            </div>
          </div>
        </>
      )}

      {/* Enhanced Delete Modal */}
      {showDeletePage && (
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
                    <svg
                      className="w-6 h-6 flex-shrink-0"
                      style={{ color: colors.error[500] }}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z"
                      />
                    </svg>
                    <div>
                      <p
                        className="font-medium text-center"
                        style={{ color: colors.error[800] }}
                      >
                        Delete Product
                      </p>
                      <p
                        className="text-sm text-center"
                        style={{ color: colors.error[600] }}
                      >
                        This action cannot be undone. All Product data will be
                        permanently removed.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setshowDeletePage(false)}
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
                  onClick={() => {
                    deleteProductHandler(deleteId);
                    setshowDeletePage(false);
                  }}
                  className="flex-1 px-4 py-2 rounded-lg transition-all duration-200"
                  style={{
                    backgroundColor: colors.error[500],
                    color: colors.text.inverse,
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Delete Confirmation Modal */}
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
                    <svg
                      className="w-5 h-5"
                      style={{ color: colors.text.secondary }}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                )}
              </div>

              <div className="mb-6">
                <div
                  className="rounded-lg p-4 mb-4"
                  style={{ backgroundColor: colors.error[50] }}
                >
                  <div className="flex flex-col items-center gap-3">
                    <svg
                      className="w-6 h-6 flex-shrink-0"
                      style={{ color: colors.error[500] }}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z"
                      />
                    </svg>
                    <div>
                      <p
                        className="font-medium text-center"
                        style={{ color: colors.error[800] }}
                      >
                        Delete {selectedProducts.length} Product
                        {selectedProducts.length > 1 ? "s" : ""}
                      </p>
                      <p
                        className="text-sm text-center"
                        style={{ color: colors.error[600] }}
                      >
                        This action cannot be undone. All selected product data
                        will be permanently removed from the system.
                      </p>
                    </div>
                  </div>
                </div>

                {/* {isBulkDeleting && (
                  <div
                    className="rounded-lg p-4 mb-4"
                    style={{ backgroundColor: colors.primary[50] }}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="animate-spin rounded-full h-5 w-5 border-2 border-b-transparent"
                        style={{ borderColor: colors.primary[500] }}
                      ></div>
                      <div>
                        <p
                          className="font-medium text-sm"
                          style={{ color: colors.primary[800] }}
                        >
                          Deleting products...
                        </p>
                        <p
                          className="text-xs"
                          style={{ color: colors.primary[600] }}
                        >
                          Please wait while we process your request.
                        </p>
                      </div>
                    </div>
                  </div>
                )} */}
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
                  {isBulkDeleting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-b-transparent border-white"></div>
                      Deleting...
                    </>
                  ) : (
                    `Delete ${selectedProducts.length} Product${
                      selectedProducts.length > 1 ? "s" : ""
                    }`
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductTable;
