import { toast } from "react-toastify";
import Drawer from "../../../ui/Drawer";
import { useCookies } from "react-cookie";
import { useEffect, useState } from "react";
import Loading from "../../../ui/Loading";
import { BiX } from "react-icons/bi";
import {
  MdAccountBalance,
  MdAttachMoney,
  MdDateRange,
  MdInventory,
  MdPerson,
  MdStore,
} from "react-icons/md";
import moment from "moment";
import { colors } from "../../../theme/colors";

interface InvoiceDetailsProps {
  closeDrawerHandler: () => void;
  id: string | undefined;
}

const InvoiceDetails: React.FC<InvoiceDetailsProps> = ({
  closeDrawerHandler,
  id,
}) => {
  const [cookies] = useCookies();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [buyer, setBuyer] = useState<string | undefined>();
  const [supplier, setSupplier] = useState<string | undefined>();
  const [invoiceNo, setInvoiceNo] = useState<string | undefined>();
  const [documentDate, setDocumentDate] = useState<string | undefined>();
  const [category, setCategory] = useState<string | undefined>();
  const [salesOrderDate, setSalesOrderDate] = useState<string | undefined>();
  const [note, setNote] = useState<string | undefined>();
  const [subtotal, setSubtotal] = useState<number | undefined>(0);
  const [total, setTotal] = useState<number | undefined>();
  const [balance, setBalance] = useState<number | undefined>();
  const [items, setItems] = useState<any[] | []>([]);
  const [store, setStore] = useState<string | undefined>();
  const [tax, setTax] = useState<any | undefined>();
  const [creator, setCreator] = useState<any | undefined>();
  const taxOptions = [
    { value: 0.18, label: "GST 18%" },
    { value: 0, label: "No Tax 0%" },
  ];

  const fetchInvoiceDetails = async (id: string) => {
    try {
      const response = await fetch(
        process.env.REACT_APP_BACKEND_URL + `invoice/${id}`,
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
      setInvoiceNo(data.invoice.invoice_no);
      setDocumentDate(data.invoice.document_date);
      setSalesOrderDate(data.invoice.sales_order_date);
      setNote(data.invoice?.note || "Not Available");
      setSubtotal(data.invoice.subtotal);
      setTotal(data.invoice.total);
      setBalance(data.invoice.balance);
      setTax(data.invoice.tax);
      setItems(data.invoice.items);
      setStore(data.invoice.store.name);
      setCategory(data.invoice.category);
      setBuyer(data.invoice?.buyer?.name);
      setSupplier(data.invoice?.supplier?.name);
      setCreator(data.invoice.creator);
    } catch (error: any) {
      toast.error(error.messsage || "Something went wrong");
    }
  };

  useEffect(() => {
    fetchInvoiceDetails(id || "");
  }, [id]);

  return (
    <div
      className="absolute overflow-auto h-[100vh] w-[100vw]  bg-white right-0 top-0 z-50 py-3 border-l border-gray-200"
      style={{
        backgroundColor: colors.background.drawer,
        boxShadow: colors.shadow.xl,
      }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between p-6 border-b"
        style={{ borderColor: colors.border.light }}
      >
        <h1
          className="text-xl font-semibold"
          style={{ color: colors.text.primary }}
        >
          Invoice Details
        </h1>
        <button
          onClick={closeDrawerHandler}
          className="p-2 rounded-lg transition-colors duration-200"
          style={{
            color: colors.text.secondary,
            backgroundColor: colors.gray[100],
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = colors.gray[200];
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = colors.gray[100];
          }}
        >
          <BiX size={20} />
        </button>
      </div>

      {/* Content */}
      <div className="p-6">
        {isLoading && <Loading />}

        {!isLoading && (
          <div className="space-y-6">
            {/* Creator Information */}
            <div
              className="p-4 rounded-lg"
              style={{
                backgroundColor: colors.primary[50],
                border: `1px solid ${colors.primary[200]}`,
              }}
            >
              <div className="flex items-center gap-3 mb-3">
                <div
                  className="p-2 rounded-lg"
                  style={{ backgroundColor: colors.primary[100] }}
                >
                  <MdPerson
                    size={20}
                    style={{ color: colors.primary[600] }}
                  />
                </div>
                <h3
                  className="font-semibold"
                  style={{ color: colors.text.primary }}
                >
                  Created By
                </h3>
              </div>
              <p
                className="text-lg font-medium"
                style={{ color: colors.text.primary }}
              >
                {creator?.first_name} {creator?.last_name}
              </p>
            </div>

            {/* Invoice Information Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Category */}
              <div
                className="p-4 rounded-lg"
                style={{ backgroundColor: colors.gray[50] }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <div
                    className="text-sm font-medium"
                    style={{ color: colors.text.secondary }}
                  >
                    Category
                  </div>
                </div>
                <div
                  className="inline-block px-3 py-1 rounded-full text-sm font-medium"
                  style={{
                    backgroundColor:
                      category === "sale"
                        ? colors.success[100]
                        : colors.warning[100],
                    color:
                      category === "sale"
                        ? colors.success[700]
                        : colors.warning[700],
                  }}
                >
                  {category?.toUpperCase()}
                </div>
              </div>

              {/* Invoice Number */}
              <div
                className="p-4 rounded-lg"
                style={{ backgroundColor: colors.gray[50] }}
              >
                <div
                  className="text-sm font-medium mb-2"
                  style={{ color: colors.text.secondary }}
                >
                  Invoice Number
                </div>
                <div
                  className="font-semibold"
                  style={{ color: colors.text.primary }}
                >
                  {invoiceNo}
                </div>
              </div>
            </div>

            {/* Customer Information */}
            {(buyer || supplier) && (
              <div
                className="p-4 rounded-lg"
                style={{
                  backgroundColor: colors.secondary[50],
                  border: `1px solid ${colors.secondary[200]}`,
                }}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div
                    className="p-2 rounded-lg"
                    style={{ backgroundColor: colors.secondary[100] }}
                  >
                    <MdPerson
                      size={20}
                      style={{ color: colors.secondary[600] }}
                    />
                  </div>
                  <h3
                    className="font-semibold"
                    style={{ color: colors.text.primary }}
                  >
                    {buyer ? "Buyer" : "Supplier"}
                  </h3>
                </div>
                <p
                  className="text-lg font-medium"
                  style={{ color: colors.text.primary }}
                >
                  {buyer || supplier}
                </p>
              </div>
            )}

            {/* Dates */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div
                className="p-4 rounded-lg"
                style={{ backgroundColor: colors.gray[50] }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <MdDateRange
                    size={16}
                    style={{ color: colors.text.secondary }}
                  />
                  <div
                    className="text-sm font-medium"
                    style={{ color: colors.text.secondary }}
                  >
                    Document Date
                  </div>
                </div>
                <div
                  className="font-medium"
                  style={{ color: colors.text.primary }}
                >
                  {moment(documentDate).format("DD/MM/YYYY")}
                </div>
              </div>

              <div
                className="p-4 rounded-lg"
                style={{ backgroundColor: colors.gray[50] }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <MdDateRange
                    size={16}
                    style={{ color: colors.text.secondary }}
                  />
                  <div
                    className="text-sm font-medium"
                    style={{ color: colors.text.secondary }}
                  >
                    Sales Order Date
                  </div>
                </div>
                <div
                  className="font-medium"
                  style={{ color: colors.text.primary }}
                >
                  {moment(salesOrderDate).format("DD/MM/YYYY")}
                </div>
              </div>
            </div>

            {/* Store Information */}
            <div
              className="p-4 rounded-lg"
              style={{
                backgroundColor: colors.warning[50],
                border: `1px solid ${colors.warning[200]}`,
              }}
            >
              <div className="flex items-center gap-3 mb-2">
                <div
                  className="p-2 rounded-lg"
                  style={{ backgroundColor: colors.warning[100] }}
                >
                  <MdStore size={20} style={{ color: colors.warning[600] }} />
                </div>
                <h3
                  className="font-semibold"
                  style={{ color: colors.text.primary }}
                >
                  Store
                </h3>
              </div>
              <p
                className="text-lg font-medium"
                style={{ color: colors.text.primary }}
              >
                {store}
              </p>
            </div>

            {/* Items List */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div
                  className="p-2 rounded-lg"
                  style={{ backgroundColor: colors.primary[100] }}
                >
                  <MdInventory
                    size={20}
                    style={{ color: colors.primary[600] }}
                  />
                </div>
                <h3
                  className="font-semibold text-lg"
                  style={{ color: colors.text.primary }}
                >
                  Items
                </h3>
              </div>
              <div
                className="rounded-lg border overflow-hidden"
                style={{
                  backgroundColor: colors.background.card,
                  borderColor: colors.border.light,
                }}
              >
                <div
                  className="grid grid-cols-3 gap-4 p-3 text-sm font-medium"
                  style={{
                    backgroundColor: colors.table.header,
                    color: colors.table.headerText,
                  }}
                >
                  <div>Item Name</div>
                  <div className="text-center">Quantity</div>
                  <div className="text-right">Amount</div>
                </div>
                {items?.map((item: any, index: number) => (
                  <div
                    key={index}
                    className="grid grid-cols-3 gap-4 p-3 text-sm border-t"
                    style={{
                      borderColor: colors.border.light,
                      backgroundColor:
                        index % 2 === 0
                          ? colors.background.card
                          : colors.table.stripe,
                    }}
                  >
                    <div
                      className="font-medium"
                      style={{ color: colors.text.primary }}
                    >
                      {item.item.name}
                    </div>
                    <div
                      className="text-center"
                      style={{ color: colors.text.secondary }}
                    >
                      {item.quantity}
                    </div>
                    <div
                      className="text-right font-semibold"
                      style={{ color: colors.primary[600] }}
                    >
                      ₹{item.amount?.toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Note */}
            {note && note !== "Not Available" && (
              <div
                className="p-4 rounded-lg"
                style={{ backgroundColor: colors.gray[50] }}
              >
                <div
                  className="text-sm font-medium mb-2"
                  style={{ color: colors.text.secondary }}
                >
                  Note
                </div>
                <p style={{ color: colors.text.primary }}>{note}</p>
              </div>
            )}

            {/* Financial Summary */}
            <div
              className="p-6 rounded-lg"
              style={{
                backgroundColor: colors.success[50],
                border: `1px solid ${colors.success[200]}`,
              }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div
                  className="p-2 rounded-lg"
                  style={{ backgroundColor: colors.success[100] }}
                >
                  <MdAttachMoney
                    size={20}
                    style={{ color: colors.success[600] }}
                  />
                </div>
                <h3
                  className="font-semibold text-lg"
                  style={{ color: colors.text.primary }}
                >
                  Financial Summary
                </h3>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span style={{ color: colors.text.secondary }}>
                    Subtotal:
                  </span>
                  <span
                    className="font-semibold"
                    style={{ color: colors.text.primary }}
                  >
                    ₹{subtotal?.toLocaleString()}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span style={{ color: colors.text.secondary }}>
                    Tax ({tax?.tax_name}):
                  </span>
                  <span
                    className="font-semibold"
                    style={{ color: colors.text.primary }}
                  >
                    ₹{((total || 0) - (subtotal || 0))?.toLocaleString()}
                  </span>
                </div>

                <div
                  className="flex justify-between items-center pt-3 border-t"
                  style={{ borderColor: colors.success[200] }}
                >
                  <span
                    className="font-semibold"
                    style={{ color: colors.text.primary }}
                  >
                    Total:
                  </span>
                  <span
                    className="text-xl font-bold"
                    style={{ color: colors.success[600] }}
                  >
                    ₹{total?.toLocaleString()}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span style={{ color: colors.text.secondary }}>
                    Balance:
                  </span>
                  <span
                    className="font-semibold"
                    style={{
                      color:
                        (balance || 0) > 0
                          ? colors.error[600]
                          : colors.success[600],
                    }}
                  >
                    ₹{balance?.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InvoiceDetails;
