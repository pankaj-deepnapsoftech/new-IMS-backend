import { FormControl, FormLabel, Input, Button } from "@chakra-ui/react";
import Drawer from "../../../ui/Drawer";
import { BiX } from "react-icons/bi";
import { MdEdit, MdReceipt } from "react-icons/md";
import {
  FaFileInvoice,
  FaCalendarAlt,
  FaStore,
  FaUser,
  FaTags,
} from "react-icons/fa";
import React, { useEffect, useState, useCallback } from "react";
import Select from "react-select";
import { useUpdateInvoiceMutation } from "../../../redux/api/api";
import { useCookies } from "react-cookie";
import Loading from "../../../ui/Loading";
import moment from "moment";
import AddItems from "../../Dynamic Add Components/AddItems";
import { colors } from "../../../theme/colors";
import { toast } from "react-toastify";

interface UpdateInvoiceProps {
  closeDrawerHandler: () => void;
  fetchInvoicesHandler: () => void;
  id: string | undefined;
}

const UpdateInvoice: React.FC<UpdateInvoiceProps> = ({
  closeDrawerHandler,
  fetchInvoicesHandler,
  id,
}) => {
  const [cookies] = useCookies();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const [buyer, setBuyer] = useState<
    { value: string; label: string } | undefined
  >();
  const [supplier, setSupplier] = useState<
    { value: string; label: string } | undefined
  >();
  const [invoiceNo, setInvoiceNo] = useState<string | undefined>();
  const [documentDate, setDocumentDate] = useState<string | undefined>();
  const [salesOrderDate, setSalesOrderDate] = useState<string | undefined>();
  const [note, setNote] = useState<string | undefined>();
  const [subtotal, setSubtotal] = useState<number | undefined>(0);
  const [total, setTotal] = useState<number | undefined>();
  const [items, setItems] = useState<any[] | []>([]);
  const [allItems, setAllItems] = useState<any[] | []>([]);
  const [itemOptions, setItemOptions] = useState<
    { value: string; label: string }[] | []
  >([]);
  const [buyers, setBuyers] = useState<any[] | []>([]);
  const [buyerOptions, setBuyerOptions] = useState<
    { value: string; label: string }[] | []
  >([]);
  const [suppliers, setSuppliers] = useState<any[] | []>([]);
  const [supplierOptions, setSupplierOptions] = useState<
    { value: string; label: string }[] | []
  >([]);
  const [category, setCategory] = useState<
    { value: string; label: string } | undefined
  >();
  const categoryOptions = [
    { value: "sale", label: "Sales" },
    { value: "purchase", label: "Purchase" },
  ];
  const [store, setStore] = useState<
    { value: string; label: string } | undefined
  >();
  const [storeOptions, setStoreOptions] = useState<
    { value: string; label: string }[] | []
  >([]);
  const [tax, setTax] = useState<
    { value: number; label: string } | undefined
  >();
  const taxOptions = [
    { value: 0.18, label: "GST 18%" },
    { value: 0, label: "No Tax 0%" },
  ];
  const [inputs, setInputs] = useState<
    {
      item: { value: string; label: string };
      quantity: number;
      price: number;
    }[]
  >([{ item: { value: "", label: "" }, quantity: 0, price: 0 }]);

  const [updateInvoice] = useUpdateInvoiceMutation();

  // Custom styles for react-select to match modern theme
  const customSelectStyles = {
    control: (provided: any, state: any) => ({
      ...provided,
      backgroundColor: "white",
      borderColor: state.isFocused ? colors.primary[500] : colors.gray[300],
      borderRadius: "8px",
      minHeight: "44px",
      boxShadow: state.isFocused ? `0 0 0 3px ${colors.primary[100]}` : "none",
      "&:hover": {
        borderColor: colors.primary[400],
      },
    }),
    option: (provided: any, state: any) => ({
      ...provided,
      backgroundColor: state.isSelected
        ? colors.primary[500]
        : state.isFocused
        ? colors.primary[50]
        : "white",
      color: state.isSelected ? "white" : colors.gray[900],
      padding: "12px",
      cursor: "pointer",
    }),
    singleValue: (provided: any) => ({
      ...provided,
      color: colors.gray[900],
    }),
    placeholder: (provided: any) => ({
      ...provided,
      color: colors.gray[500],
    }),
    menu: (provided: any) => ({
      ...provided,
      backgroundColor: "white",
      border: `1px solid ${colors.gray[200]}`,
      borderRadius: "8px",
      boxShadow:
        "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
      zIndex: 9999,
    }),
  };

  const updateInvoiceHandler = async (e: React.FormEvent) => {
    e.preventDefault();

    const data = {
      _id: id,
      buyer: buyer?.value,
      invoice_no: invoiceNo,
      document_date: documentDate,
      sales_order_date: salesOrderDate,
      note: note,
      tax: { tax_amount: tax?.value, tax_name: tax?.label },
      subtotal: subtotal,
      total: total,
      store: store?.value,
      items: inputs.map((item: any) => ({
        item: item.item.value,
        quantity: item.quantity,
        amount: item.price,
      })),
    };

    try {
      setIsUpdating(true);
      const response = await updateInvoice(data).unwrap();
      if (!response.success) {
        throw new Error(response.message);
      }
      toast.success(response.message);
      closeDrawerHandler();
      fetchInvoicesHandler();
    } catch (error: any) {
      toast.error(error?.message || "Something went wrong");
    } finally {
      setIsUpdating(false);
    }
  };

  const fetchInvoiceDetailsHandler = useCallback(
    async (id: string) => {
      try {
        setIsLoading(true);
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

        // Handle buyer/supplier safely
        if (data.invoice.buyer) {
          setBuyer({
            value: data.invoice?.buyer?._id,
            label: data.invoice?.buyer?.name,
          });
        } else if (data.invoice.supplier) {
          setSupplier({
            value: data.invoice?.supplier?._id,
            label: data.invoice?.supplier?.name,
          });
        }

        setInvoiceNo(data.invoice.invoice_no || data.invoice.invoiceNo || "");
        setDocumentDate(
          moment(data.invoice.document_date).format("YYYY-MM-DD")
        );
        setSalesOrderDate(
          moment(data.invoice.sales_order_date).format("YYYY-MM-DD")
        );
        setSubtotal(data.invoice.subtotal || 0);
        setTotal(data.invoice.total || 0);
        setNote(data.invoice?.note || "");

        // Handle store safely
        if (data.invoice.store) {
          setStore({
            value: data.invoice.store._id,
            label: data.invoice.store.name,
          });
        }

        // Handle tax safely
        if (data.invoice.tax) {
          setTax({
            value: data.invoice.tax?.tax_amount || 0,
            label: data.invoice.tax?.tax_name || "No Tax",
          });
        }

        // Handle category safely
        if (data.invoice.category) {
          setCategory({
            value: data.invoice.category,
            label:
              data.invoice.category.charAt(0).toUpperCase() +
              data.invoice.category.slice(1),
          });
        }

        // Handle items safely
        if (data.invoice.items && Array.isArray(data.invoice.items)) {
          setInputs(
            data.invoice.items.map((item: any) => ({
              item: {
                value: item.item?._id || item.item || "",
                label: item.item?.name || "Unknown Item",
              },
              price: item.amount || 0,
              quantity: item.quantity || 0,
            }))
          );
        }
      } catch (error: any) {
        toast.error(error.message || "Something went wrong");
      } finally {
        setIsLoading(false);
      }
    },
    [cookies?.access_token]
  );

  const fetchBuyersHandler = useCallback(async () => {
    try {
      const response = await fetch(
        process.env.REACT_APP_BACKEND_URL + "agent/buyers",
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

      const buyers = data.agents.map((buyer: any) => ({
        value: buyer._id,
        label: buyer.name,
      }));
      setBuyerOptions(buyers);
    } catch (error: any) {
      toast.error(error?.message || "Something went wrong");
    }
  }, [cookies?.access_token]);

  const fetchSuppliersHandler = useCallback(async () => {
    try {
      const response = await fetch(
        process.env.REACT_APP_BACKEND_URL + "agent/suppliers",
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

      const suppliers = data.agents.map((supplier: any) => ({
        value: supplier._id,
        label: supplier.name,
      }));
      setSupplierOptions(suppliers);
    } catch (error: any) {
      toast.error(error?.message || "Something went wrong");
    }
  }, [cookies?.access_token]);

  const fetchItemsHandler = useCallback(async () => {
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
      const products = results.products.map((product: any) => ({
        value: product._id,
        label: product.name,
      }));
      setItemOptions(products);
      setAllItems(results.products);
    } catch (error: any) {
      toast.error(error?.message || "Something went wrong");
    }
  }, [cookies?.access_token]);

  const fetchStoresHandler = useCallback(async () => {
    try {
      const response = await fetch(
        process.env.REACT_APP_BACKEND_URL + "store/all",
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
      const stores = data.stores.map((store: any) => ({
        value: store._id,
        label: store.name,
      }));
      setStoreOptions(stores);
    } catch (error: any) {
      toast.error(error?.message || "Something went wrong");
    }
  }, [cookies?.access_token]);

  useEffect(() => {
    if (tax && subtotal) {
      setTotal(subtotal + tax?.value * subtotal);
    }
  }, [tax, subtotal]);

  useEffect(() => {
    const price = inputs.reduce((acc: number, curr: any) => {
      return acc + (curr?.price * curr?.quantity || 0);
    }, 0);
    setSubtotal(price);
  }, [inputs]);

  useEffect(() => {
    fetchBuyersHandler();
    fetchItemsHandler();
    fetchStoresHandler();
    fetchSuppliersHandler();
  }, [
    fetchBuyersHandler,
    fetchItemsHandler,
    fetchStoresHandler,
    fetchSuppliersHandler,
  ]);

  useEffect(() => {
    fetchInvoiceDetailsHandler(id || "");
  }, [id, fetchInvoiceDetailsHandler]);

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40" />

      {/* Drawer */}
      <div className="fixed inset-y-0 right-0 z-50 w-full bg-white shadow-2xl transform transition-transform duration-300 ease-in-out">
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="px-6 py-4 flex items-center justify-between border-b">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <MdEdit className="h-5 w-5 text-blue-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">
                Update Invoice
              </h2>
            </div>
            <button
              onClick={closeDrawerHandler}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
            >
              <BiX size={24} className="text-gray-600" />
            </button>
          </div>

          {/* Form Content */}
          <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
            {isLoading && <Loading />}
            {!isLoading && (
              <form onSubmit={updateInvoiceHandler} className="space-y-6">
                {/* Invoice Type Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <FaTags className="h-5 w-5 text-blue-600" />
                      Invoice Type
                    </h3>
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                        <MdReceipt className="h-4 w-4 text-gray-500" />
                        Category *
                      </label>
                      <Select
                        styles={customSelectStyles}
                        isDisabled
                        value={category}
                        options={categoryOptions}
                        placeholder="Select category"
                        className="text-sm"
                      />
                    </div>
                  </div>

                  {/* Customer/Supplier Section */}
                  {(category?.value === "sale" ||
                    category?.value === "purchase") && (
                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <FaUser className="h-5 w-5 text-green-600" />
                        {category?.value === "sale"
                          ? "Customer Details"
                          : "Supplier Details"}
                      </h3>

                      {category.value === "sale" && (
                        <div className="space-y-2">
                          <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                            <FaUser className="h-4 w-4 text-gray-500" />
                            Buyer *
                          </label>
                          <Select
                            styles={customSelectStyles}
                            isDisabled
                            value={buyer}
                            options={buyerOptions}
                            placeholder="Select buyer"
                            className="text-sm"
                          />
                        </div>
                      )}

                      {category.value === "purchase" && (
                        <div className="space-y-2">
                          <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                            <FaUser className="h-4 w-4 text-gray-500" />
                            Supplier *
                          </label>
                          <Select
                            styles={customSelectStyles}
                            isDisabled
                            value={supplier}
                            options={supplierOptions}
                            placeholder="Select supplier"
                            className="text-sm"
                          />
                        </div>
                      )}
                    </div>
                  )}
                </div>
                {/* Invoice Details Section */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                    <FaFileInvoice className="h-5 w-5 text-purple-600" />
                    Invoice Details
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                        <FaFileInvoice className="h-4 w-4 text-gray-500" />
                        Invoice No. *
                      </label>
                      <input
                        type="text"
                        value={invoiceNo || ""}
                        onChange={(e) => setInvoiceNo(e.target.value)}
                        placeholder="Enter invoice number"
                        className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white text-gray-900"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                        <FaStore className="h-4 w-4 text-gray-500" />
                        Store *
                      </label>
                      <Select
                        styles={customSelectStyles}
                        value={store}
                        options={storeOptions}
                        placeholder="Select store"
                        onChange={(e: any) => setStore(e)}
                        className="text-sm"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                        <FaCalendarAlt className="h-4 w-4 text-gray-500" />
                        Document Date *
                      </label>
                      <input
                        type="date"
                        value={documentDate || ""}
                        onChange={(e) => setDocumentDate(e.target.value)}
                        className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white text-gray-900"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                        <FaCalendarAlt className="h-4 w-4 text-gray-500" />
                        Sales Order Date *
                      </label>
                      <input
                        type="date"
                        value={salesOrderDate || ""}
                        onChange={(e) => setSalesOrderDate(e.target.value)}
                        className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white text-gray-900"
                        required
                      />
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <label className="text-sm font-medium text-gray-700">
                        Note
                      </label>
                      <textarea
                        value={note || ""}
                        onChange={(e) => setNote(e.target.value)}
                        placeholder="Enter any additional notes..."
                        rows={3}
                        className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white text-gray-900 resize-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Items Section */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <FaTags className="h-5 w-5 text-orange-600" />
                    Items *
                  </h3>
                  <AddItems inputs={inputs} setInputs={setInputs} />
                </div>

                {/* Pricing Section */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                    <FaFileInvoice className="h-5 w-5 text-green-600" />
                    Pricing & Tax
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">
                        Subtotal
                      </label>
                      <input
                        type="number"
                        value={subtotal || ""}
                        readOnly
                        className="w-full px-3 py-2.5 border border-gray-300 rounded-lg bg-gray-100 text-gray-600 cursor-not-allowed"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">
                        Tax *
                      </label>
                      <Select
                        styles={customSelectStyles}
                        value={tax}
                        options={taxOptions}
                        placeholder="Select tax"
                        onChange={(e: any) => setTax(e)}
                        className="text-sm"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">
                        Total Amount
                      </label>
                      <input
                        type="number"
                        value={total || ""}
                        readOnly
                        className="w-full px-3 py-2.5 border border-gray-300 rounded-lg bg-gray-100 text-gray-600 cursor-not-allowed font-semibold text-lg"
                      />
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="bg-white border-t p-6 -mx-6 -mb-6">
                  <button
                    type="submit"
                    disabled={isUpdating}
                    className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-lg transition-colors duration-200 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center justify-center gap-2"
                  >
                    {isUpdating ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Updating...
                      </>
                    ) : (
                      <>
                        <MdEdit className="h-4 w-4" />
                        Update Invoice
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default UpdateInvoice;
