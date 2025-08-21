// @ts-nocheck

import { useMemo } from "react";
import {
  Cell,
  Column,
  HeaderGroup,
  TableInstance,
  usePagination,
  useSortBy,
  useTable,
} from "react-table";
import Loading from "../../ui/Loading";
import { FcApproval, FcDatabase } from "react-icons/fc";
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
import { FaCaretDown, FaCaretUp } from "react-icons/fa";
import moment from "moment";
import { MdDeleteOutline, MdEdit, MdOutlineVisibility } from "react-icons/md";
import EmptyData from "../../ui/emptyData";

interface PaymentTableProps {
  payments: Array<{
    creator: string;
    createdAt: string;
    updatedAt: string;
    customer?: string;
    amount: string;
    date: string;
    mode: string;
  }>;
  isLoadingPayments: boolean;
  openPaymentDetailsDrawerHandler?: (id: string) => void;
  openUpdatePaymentDrawer?: (id: string) => void;
}

const PaymentTable: React.FC<AgentTableProps> = ({
  payments,
  isLoadingPayments,
  openPaymentDetailsDrawerHandler,
  openUpdatePaymentDrawer,
}) => {

  


  const columns = useMemo(
    () => [
      { Header: "Created By", accessor: "creator" },
      { Header: "Customer", accessor: "customer" },
      { Header: "Amount", accessor: "amount" },
      { Header: "Payment Mode", accessor: "mode" },
      { Header: "Created At", accessor: "createdAt" },
      { Header: "Updated At", accessor: "updatedAt" },
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
    state: { pageIndex, pageSize },
    pageCount,
    setPageSize,
  }: TableInstance<{
    creator: string;
    created_on: string;
    customer?: string;
    amount: string;
    date: string;
    mode: string;
  }> = useTable(
    {
      columns,
      data: payments,
      initialState: { pageIndex: 0 },
    },
    useSortBy,
    usePagination
  );

  return (
    <div>
      {isLoadingPayments && <Loading />}
      {payments.length === 0 && !isLoadingPayments && <EmptyData />}
      {!isLoadingPayments && payments.length > 0 && (
        <div>
          <div className="flex justify-end mb-2">
            <Select
              onChange={(e) => setPageSize(e.target.value)}
              color="white"
              width="80px"
              size="sm"
              borderRadius="md"
              border="1px solid white"
              sx={{
                option: {
                  backgroundColor: "#444e5b", // Default background
                  color: "white",
                },
              }}
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
              <option value={100000}>All</option>
            </Select>
          </div>

          <TableContainer maxHeight="600px" overflowY="auto">
            <Table variant="simple" {...getTableProps()}>
              <Thead className="text-sm font-semibold">
                {headerGroups.map(
                  (
                    hg: HeaderGroup<{
                      creator: string;
                      created_on: string;
                      customer?: string;
                      amount: string;
                      date: string;
                      mode: string;
                    }>
                  ) => {
                    return (
                      <Tr {...hg.getHeaderGroupProps()}>
                        {hg.headers.map((column: any) => {
                          return (
                            <Th
                              textTransform="capitalize"
                              fontSize="12px"
                              fontWeight="700"
                              color="black"
                              backgroundColor="#fafafa"
                              borderLeft="1px solid #d7d7d7"
                              borderRight="1px solid #d7d7d7"
                              {...column.getHeaderProps(
                                column.getSortByToggleProps()
                              )}
                              px={4}
                              py={3}
                            >
                              <p className="flex">
                                {column.render("Header")}
                                {column.isSorted && (
                                  <span>
                                    {column.isSortedDesc ? (
                                      <FaCaretDown />
                                    ) : (
                                      <FaCaretUp />
                                    )}
                                  </span>
                                )}
                              </p>
                            </Th>
                          );
                        })}
                        <Th
                          textTransform="capitalize"
                          fontSize="12px"
                          fontWeight="700"
                          color="black"
                          backgroundColor="#fafafa"
                          borderLeft="1px solid #d7d7d7"
                          borderRight="1px solid #d7d7d7"
                          px={4}
                          py={3}
                        >
                          Actions
                        </Th>
                      </Tr>
                    );
                  }
                )}
              </Thead>
              <Tbody {...getTableBodyProps()}>
                {page.map((row: any) => {
                  prepareRow(row);

                  return (
                    <Tr
                      className="relative hover:bg-[#e4e4e4] hover:cursor-pointer text-base lg:text-sm"
                      {...row.getRowProps()}
                    >
                      {row.cells.map((cell: Cell) => {
                        return (
                          <Td
                            fontWeight="500"
                            {...cell.getCellProps()}
                            px={4}
                            py={3}
                          >
                            {cell.column.id !== "createdAt" &&
                              cell.column.id !== "updatedAt" &&
                              cell.column.id !== "creator" &&
                              cell.column.id !== "customer" &&
                              cell.render("Cell")}

                            {cell.column.id === "createdAt" &&
                              row.original?.createdAt && (
                                <span>
                                  {moment(row.original?.createdAt).format(
                                    "DD/MM/YYYY"
                                  )}
                                </span>
                              )}
                            {cell.column.id === "updatedAt" &&
                              row.original?.updatedAt && (
                                <span>
                                  {moment(row.original?.updatedAt).format(
                                    "DD/MM/YYYY"
                                  )}
                                </span>
                              )}
                            {cell.column.id === "creator" && (
                              <span>
                                {row.original?.creator?.first_name +
                                  " " +
                                  row.original?.creator?.last_name}
                              </span>
                            )}
                            {cell.column.id === "customer" && (
                              <span>
                                {row.original?.invoice?.buyer
                                  ? row.original?.invoice?.buyer?.name
                                  : row.original.invoice?.supplier?.name}
                              </span>
                            )}
                          </Td>
                        );
                      })}
                      <Td className="flex gap-x-2" px={4} py={3}>
                        {openPaymentDetailsDrawerHandler && (
                          <MdOutlineVisibility
                            className="hover:scale-110"
                            size={16}
                            onClick={() =>
                              openPaymentDetailsDrawerHandler(row.original?._id)
                            }
                          />
                        )}
                        {openUpdatePaymentDrawer && (
                          <MdEdit
                            className="hover:scale-110"
                            size={16}
                            onClick={() =>
                              openUpdatePaymentDrawer(row.original?._id)
                            }
                          />
                        )}
                      </Td>
                    </Tr>
                  );
                })}
              </Tbody>
            </Table>
          </TableContainer>

          <div className="w-[max-content] m-auto my-7">
            <button
              className="text-sm mt-2 bg-[#1640d6] py-1 px-4 text-white border-[1px] border-[#1640d6] rounded-3xl disabled:bg-[#b2b2b2] disabled:border-[#b2b2b2] disabled:cursor-not-allowed md:text-lg md:py-1 md:px-4 lg:text-xl lg:py-1 xl:text-base"
              disabled={!canPreviousPage}
              onClick={previousPage}
            >
              Prev
            </button>
            <span className="mx-3 text-sm md:text-lg lg:text-xl xl:text-base">
              {pageIndex + 1} of {pageCount}
            </span>
            <button
              className="text-sm mt-2 bg-[#1640d6] py-1 px-4 text-white border-[1px] border-[#1640d6] rounded-3xl disabled:bg-[#b2b2b2] disabled:border-[#b2b2b2] disabled:cursor-not-allowed md:text-lg md:py-1 md:px-4 lg:text-xl lg:py-1 xl:text-base"
              disabled={!canNextPage}
              onClick={nextPage}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentTable;
