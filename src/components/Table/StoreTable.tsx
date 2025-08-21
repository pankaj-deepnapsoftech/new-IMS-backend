// @ts-nocheck
import React, { useMemo } from "react";
import {
  Table,
  TableContainer,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  Select,
  Button,
  useDisclosure,
} from "@chakra-ui/react";
import {
  usePagination,
  useSortBy,
  useTable,
  Column,
  TableInstance,
  HeaderGroup,
  Cell,
} from "react-table";
import { FaCaretDown, FaCaretUp, FaEdit, FaTrash, FaEye } from "react-icons/fa";
import moment from "moment";
import Loading from "../../ui/Loading";
import EmptyData from "../../ui/emptyData";
import { colors } from "../../theme/colors";
import { MdDeleteOutline, MdEdit, MdOutlineVisibility } from "react-icons/md";

interface StoreTableProps {
  stores: Array<{
    _id: string;
    name: string;
    address_line1: string;
    pincode: number;
    city: string;
    state: string;
    approved: boolean;
    createdAt: string;
    updatedAt: string;
  }>;
  isLoadingStores: boolean;
  openUpdateStoreDrawerHandler?: (id: string) => void;
  openStoreDetailsDrawerHandler?: (id: string) => void;
  deleteStoreHandler?: (id: string) => void;
}

const StoreTable: React.FC<StoreTableProps> = ({
  stores,
  isLoadingStores,
  openUpdateStoreDrawerHandler,
  openStoreDetailsDrawerHandler,
  deleteStoreHandler,
}) => {
  const {
    isOpen: isDeleteModalOpen,
    onOpen: onDeleteModalOpen,
    onClose: onDeleteModalClose,
  } = useDisclosure();
  const [storeToDelete, setStoreToDelete] = React.useState<string | null>(null);

  const columns: Column<any>[] = useMemo(
    () => [
      { Header: "Name", accessor: "name" },
      { Header: "Address", accessor: "address_line1" },
      { Header: "City", accessor: "city" },
      { Header: "State", accessor: "state" },
      { Header: "Pincode", accessor: "pincode" },
      { Header: "Status", accessor: "approved" },
      { Header: "Created On", accessor: "createdAt" },
      { Header: "Last Updated", accessor: "updatedAt" },
    ],
    []
  );

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
    state: { pageIndex },
    setPageSize,
    pageCount,
  }: TableInstance<any> = useTable(
    {
      columns,
      data: stores,
      initialState: { pageIndex: 0, pageSize: 10 },
    },
    useSortBy,
    usePagination
  );

  const handleDeleteClick = (id: string) => {
    setStoreToDelete(id);
    onDeleteModalOpen();
  };

  const handleDeleteConfirm = () => {
    if (storeToDelete && deleteStoreHandler) {
      deleteStoreHandler(storeToDelete);
    }
    setStoreToDelete(null);
    onDeleteModalClose();
  };

  if (isLoadingStores) {
    return <Loading />;
  }

  if (!isLoadingStores && stores.length === 0) {
    return <EmptyData />;
  }
  console.log(stores)
  return (
    <div className="p-4 space-y-4">
      {/* Page Size Selector */}
      <div className="flex justify-end">
        <Select
          onChange={(e) => setPageSize(Number(e.target.value))}
          width="120px"
          size="sm"
          style={{
            backgroundColor: colors.input.background,
            borderColor: colors.input.border,
            color: colors.text.primary,
          }}
          _hover={{ borderColor: colors.input.borderHover }}
          _focus={{
            borderColor: colors.input.borderFocus,
            boxShadow: `0 0 0 3px ${colors.primary[100]}`,
          }}
        >
          {[5,10, 20, 50, 100, 100000].map((size) => (
            <option
              key={size}
              value={size}
              style={{
                backgroundColor: colors.input.background,
                color: colors.text.primary,
              }}
            >
              {size === 100000 ? "All" : size}
            </option>
          ))}
        </Select>
      </div>

      {/* Table */}
      <TableContainer
        style={{
          backgroundColor: colors.background.card,
          borderRadius: "12px",
          border: `1px solid ${colors.border.light}`,
          boxShadow: colors.shadow.sm,
        }}
        maxHeight="600px"
        overflowY="auto"
      >
        <Table variant="simple" {...getTableProps()}>
          <Thead
            style={{ backgroundColor: colors.table.header }}
            position="sticky"
            top="0"
            zIndex="1"
          >
            {headerGroups.map((hg: HeaderGroup<any>) => (
              <Tr {...hg.getHeaderGroupProps()}>
                {hg.headers.map((column: any) => (
                  <Th
                    {...column.getHeaderProps(column.getSortByToggleProps())}
                    style={{
                      color: colors.table.headerText,
                      borderColor: colors.table.border,
                    }}
                    fontSize="sm"
                    fontWeight="semibold"
                    textTransform="none"
                    py={4}
                    px={4}
                    cursor="pointer"
                    _hover={{ bg: colors.table.hover }}
                  >
                    <div className="flex items-center gap-2">
                      {column.render("Header")}
                      {column.isSorted &&
                        (column.isSortedDesc ? (
                          <FaCaretDown className="text-xs" />
                        ) : (
                          <FaCaretUp className="text-xs" />
                        ))}
                    </div>
                  </Th>
                ))}
                <Th
                  style={{
                    color: colors.table.headerText,
                    borderColor: colors.table.border,
                  }}
                  fontSize="sm"
                  fontWeight="semibold"
                  textTransform="none"
                  py={4}
                  px={4}
                >
                  Actions
                </Th>
              </Tr>
            ))}
          </Thead>

          <Tbody {...getTableBodyProps()}>
            {page.map((row: any, index: number) => {
              prepareRow(row);
              return (
                <Tr
                  {...row.getRowProps()}
                  style={{
                    backgroundColor:
                      index % 2 === 0
                        ? colors.background.card
                        : colors.table.stripe,
                  }}
                  _hover={{ bg: colors.table.hover }}
                >
                  {row.cells.map((cell: Cell) => {
                    const colId = cell.column.id;
                    const original = row.original;

                    let displayValue;
                    if (colId === "name") {
                      displayValue = original.name || "N/A";
                    } else if (colId === "address_line1") {
                      displayValue = original.address_line1 || "N/A";
                    } else if (colId === "city") {
                      displayValue = original.city || "N/A";
                    } else if (colId === "state") {
                      displayValue = original.state || "N/A";
                    } else if (colId === "pincode") {
                      displayValue = original.pincode || "N/A";
                    } else if (colId === "approved") {
                      displayValue = (
                        <span
                          className="px-2 py-1 rounded-full text-xs font-medium"
                          style={{
                            backgroundColor: original.approved
                              ? colors.success[100]
                              : colors.error[100],
                            color: original.approved
                              ? colors.success[800]
                              : colors.error[800],
                          }}
                        >
                          {original.approved ? "Approved" : "Pending"}
                        </span>
                      );
                    } else if (colId === "createdAt") {
                      displayValue = original.createdAt
                        ? moment(original.createdAt).format("DD/MM/YYYY")
                        : "N/A";
                    } else if (colId === "updatedAt") {
                      displayValue = original.updatedAt
                        ? moment(original.updatedAt).format("DD/MM/YYYY")
                        : "N/A";
                    } else {
                      displayValue = cell.render("Cell");
                    }

                    return (
                      <Td
                        {...cell.getCellProps()}
                        style={{
                          color: colors.text.primary,
                          borderColor: colors.table.border,
                        }}
                        fontSize="sm"
                        py={3}
                        px={4}
                        className="whitespace-nowrap truncate max-w-xs"
                        title={
                          typeof displayValue === "string" ? displayValue : ""
                        }
                      >
                        {displayValue}
                      </Td>
                    );
                  })}

                  {/* Actions */}
                  <Td
                    style={{ borderColor: colors.table.border }}
                    py={3}
                    px={4}
                  >
                    <div className="flex items-center gap-2">
                      {openStoreDetailsDrawerHandler && (
                        <Button
                          size="sm"
                          style={{
                            backgroundColor: colors.secondary[50],
                            color: colors.secondary[600],
                          }}
                          _hover={{ bg: colors.button.primaryHover }}
                          onClick={() =>
                            openStoreDetailsDrawerHandler(row.original._id)
                          }
                        >
                          <MdOutlineVisibility size={16} />
                        </Button>
                      )}

                      {openUpdateStoreDrawerHandler && (
                        <Button
                          size="sm"
                          style={{
                            color: colors.primary[600],
                            backgroundColor: colors.primary[50],
                          }}
                          _hover={{ bg: colors.button.secondaryHover }}
                          onClick={() =>
                            openUpdateStoreDrawerHandler(row.original._id)
                          }
                        >
                          <MdEdit size={16} />
                        </Button>
                      )}

                      {deleteStoreHandler && (
                        <Button
                          size="sm"
                          style={{
                            color: colors.error[600],
                            backgroundColor: colors.error[50],
                          }}
                          _hover={{ bg: colors.button.dangerHover }}
                          onClick={() => handleDeleteClick(row.original._id)}
                        >
                          <MdDeleteOutline size={16} />
                        </Button>
                      )}
                    </div>
                  </Td>
                </Tr>
              );
            })}
          </Tbody>
        </Table>
      </TableContainer>

      {/* Pagination */}
      <div className="flex items-center justify-center gap-4">
        <button
          onClick={previousPage}
          disabled={!canPreviousPage}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            backgroundColor: canPreviousPage
              ? colors.button.primary
              : colors.gray[300],
            color: canPreviousPage ? colors.text.inverse : colors.gray[500],
          }}
          onMouseEnter={(e) => {
            if (canPreviousPage) {
              e.currentTarget.style.backgroundColor =
                colors.button.primaryHover;
            }
          }}
          onMouseLeave={(e) => {
            if (canPreviousPage) {
              e.currentTarget.style.backgroundColor = colors.button.primary;
            }
          }}
        >
          Previous
        </button>

        <span
          className="text-sm font-medium"
          style={{ color: colors.text.secondary }}
        >
          Page {pageIndex + 1} of {pageCount}
        </span>

        <button
          onClick={nextPage}
          disabled={!canNextPage}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            backgroundColor: canNextPage
              ? colors.button.primary
              : colors.gray[300],
            color: canNextPage ? colors.text.inverse : colors.gray[500],
          }}
          onMouseEnter={(e) => {
            if (canNextPage) {
              e.currentTarget.style.backgroundColor =
                colors.button.primaryHover;
            }
          }}
          onMouseLeave={(e) => {
            if (canNextPage) {
              e.currentTarget.style.backgroundColor = colors.button.primary;
            }
          }}
        >
          Next
        </button>
      </div>

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div
            className="rounded-xl p-6 max-w-md w-full mx-4"
            style={{
              backgroundColor: colors.background.card,
              boxShadow: colors.shadow.xl,
            }}
          >
            <h3
              className="text-lg font-semibold mb-4"
              style={{ color: colors.text.primary }}
            >
              Confirm Delete
            </h3>
            <p style={{ color: colors.text.secondary }} className="mb-6">
              Are you sure you want to delete this store? This action cannot be
              undone.
            </p>
            <div className="flex justify-end gap-3">
              <Button
                size="sm"
                style={{
                  backgroundColor: colors.gray[200],
                  color: colors.text.primary,
                }}
                _hover={{ bg: colors.gray[300] }}
                onClick={onDeleteModalClose}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                style={{
                  backgroundColor: colors.button.danger,
                  color: colors.text.inverse,
                }}
                _hover={{ bg: colors.button.dangerHover }}
                onClick={handleDeleteConfirm}
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StoreTable;
