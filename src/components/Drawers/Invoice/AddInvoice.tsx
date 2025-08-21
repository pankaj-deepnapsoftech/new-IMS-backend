import React, { useState, useEffect, useCallback } from "react";
import { BiX, BiMapPin, BiCreditCard, BiPackage, BiEdit } from "react-icons/bi";
import { toast } from "react-toastify";
import { useCookies } from "react-cookie";
import { useCreateInvoiceMutation } from "../../../redux/api/api";
import { useFormik } from "formik";
import * as Yup from "yup";
import AddItems from "../../Dynamic Add Components/AddItems";

const colors = {
  background: { drawer: "#fff", card: "#fff" },
  border: { light: "#e2e8f0" },
  text: {
    primary: "#1a202c",
    secondary: "#4b5563",
    muted: "#6b7280",
    inverse: "#fff",
  },
  primary: { 50: "#eff6ff", 100: "#dbeafe", 500: "#3b82f6" },
  gray: { 100: "#f3f4f6", 200: "#e5e7eb" },
  input: {
    background: "#fff",
    border: "#d1d5db",
    borderFocus: "#3b82f6",
    borderHover: "#9ca3af",
  },
  shadow: {
    xl: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
  },
};

interface AddInvoiceProps {
  closeDrawerHandler: () => void;
  fetchInvoicesHandler: () => void;
}

interface BuyerOption {
  value: string;
  label: string;
  data: any;
}

const AddInvoice: React.FC<AddInvoiceProps> = ({
  closeDrawerHandler,
  fetchInvoicesHandler,
}) => {
  const [cookies] = useCookies();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [buyerOptions, setBuyerOptions] = useState<BuyerOption[]>([]);
  const [isLoadingBuyers, setIsLoadingBuyers] = useState(false);

  // Items management
  const [items, setItems] = useState<
    {
      item: { value: string; label: string };
      quantity: number;
      price: number;
      uom?: string;
    }[]
  >([{ item: { value: "", label: "" }, quantity: 0, price: 0, uom: "" }]);

  // Tax and totals
  const [tax, setTax] = useState<{ value: number; label: string } | undefined>({
    value: 0.18,
    label: "GST 18%",
  });
  const [subtotal, setSubtotal] = useState<number>(0);
  const [total, setTotal] = useState<number>(0);

  const taxOptions = [
    { value: 0.18, label: "GST 18%" },
    { value: 0.12, label: "GST 12%" },
    { value: 0.05, label: "GST 5%" },
    { value: 0, label: "No Tax 0%" },
  ];

  const validationSchema = Yup.object({
    // invoiceNo: Yup.string().required("Invoice number is required"),

    // sellerAddress: Yup.string().required("Seller address is required"),

    consigneeShipTo: Yup.string().required("Please select a buyer"),
    address: Yup.string().required("Address is required"),
    gstin: Yup.string(),
    // pincode: Yup.string().required("Pincode is required"),
    // state: Yup.string().required("State is required"),

    // billerBillTo: Yup.string().required("Biller bill to is required"),
    billerAddress: Yup.string().required("Biller address is required"),
    billerGSTIN: Yup.string(),
    // billerPincode: Yup.string().required("Biller pincode is required"),
    // billerState: Yup.string().required("Biller state is required"),

    deliveryNote: Yup.string(),
    modeTermsOfPayment: Yup.string().required(
      "Mode/Terms of payment is required"
    ),
    referenceNo: Yup.string(),
    otherReferences: Yup.string(),
    buyersOrderNo: Yup.string().required("Buyer's order no is required"),
    date: Yup.date().required("Date is required"),
    dispatchDocNo: Yup.string(),
    deliveryNoteDate: Yup.date(),
    dispatchedThrough: Yup.string(),
    destination: Yup.string(),

    termsOfDelivery: Yup.string(),
    remarks: Yup.string(),
  });

  const [addInvoice] = useCreateInvoiceMutation();

  const formik = useFormik({
    initialValues: {
      // Basic Invoice Info
      invoiceNo: `INV-${Date.now()}`,

      // sellerAddress: "",

      consigneeShipTo: "",
      address: "",
      gstin: "",
      // pincode: "",
      // state: "",

      // billerBillTo: "",
      billerAddress: "",
      billerGSTIN: "",
      // billerPincode: "",
      // billerState: "",

      deliveryNote: "",
      modeTermsOfPayment: "",
      referenceNo: "",
      otherReferences: "",
      buyersOrderNo: "",
      date: new Date().toISOString().split("T")[0],
      dispatchDocNo: "",
      deliveryNoteDate: "",
      dispatchedThrough: "",
      destination: "",

      termsOfDelivery: "",
      remarks: "",
    },
    validationSchema,
    onSubmit: async (values) => {
      if (isSubmitting) return;
      setIsSubmitting(true);

      try {
        // Validate items
        if (!items.length || items.every((item) => !item.item.value)) {
          toast.error("Please add at least one item to the invoice");
          return;
        }

        // Prepare data with both new comprehensive fields and essential legacy fields
        const invoiceData = {
          // New comprehensive fields
          ...values,

          // Essential fields for invoice functionality
          invoice_no: values.invoiceNo,
          document_date: new Date(values.date).toISOString(),
          sales_order_date: new Date(values.date).toISOString(),
          category: "sale",
          note: values.remarks || "",
          buyer: values.consigneeShipTo,

          // Items with proper mapping
          items: items
            .filter((item) => item.item.value && item.quantity > 0)
            .map((item) => ({
              item: item.item.value,
              quantity: item.quantity,
              amount: item.price,
            })),

          // Financial calculations
          subtotal: subtotal,
          total: total,
          tax: {
            tax_amount: tax?.value || 0,
            tax_name: tax?.label || "No Tax",
          },
        };

        console.log("Sending invoice data:", invoiceData);
        const response = await addInvoice(invoiceData).unwrap();
        if (!response.success) {
          throw new Error(response.message);
        }
        toast.success(response.message || "Invoice created successfully!");
        fetchInvoicesHandler();

        // Reset form and items
        formik.resetForm();
        setItems([
          { item: { value: "", label: "" }, quantity: 0, price: 0, uom: "" },
        ]);
        setSubtotal(0);
        setTotal(0);

        closeDrawerHandler();
      } catch (error: any) {
        console.error(error);
        toast.error(error?.message || "Something went wrong!");
      } finally {
        setIsSubmitting(false);
      }
    },
  });

  // Fetch buyers (parties with merchant type "Buyer")
  const fetchBuyersHandler = useCallback(async () => {
    try {
      setIsLoadingBuyers(true);
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}parties/get?page=1&limit=1000`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${cookies?.access_token}`,
          },
        }
      );
      const data = await response.json();
      if (!data?.data) {
        throw new Error("Failed to fetch parties data");
      }

      // Filter for buyers and map to dropdown options
      const buyers = data.data
        .filter((party: any) => party.parties_type === "Buyer")
        .map((buyer: any) => ({
          value: buyer._id,
          label: buyer.consignee_name?.[0] || buyer.company_name || "Unknown",
          data: buyer, // Store full data for later use
        }));

      setBuyerOptions(buyers);
    } catch (error: any) {
      console.error("Error fetching buyers:", error);
      toast.error(error?.message || "Failed to fetch buyers");
    } finally {
      setIsLoadingBuyers(false);
    }
  }, [cookies?.access_token]);

  const handleBuyerSelect = (buyerId: string) => {
    const selectedBuyer = buyerOptions.find((buyer) => buyer.value === buyerId);
    if (selectedBuyer && selectedBuyer.data) {
      formik.setValues({
        ...formik.values,
        consigneeShipTo: buyerId,
        // Ship To fields
        address: selectedBuyer.data.shipped_to || "",
        gstin: selectedBuyer.data.shipped_gst_to || "",
        // Bill To fields - auto-fill from the same buyer's bill_to data
        billerAddress:
          selectedBuyer.data.bill_to || selectedBuyer.data.shipped_to || "",
        billerGSTIN:
          selectedBuyer.data.bill_gst_to ||
          selectedBuyer.data.shipped_gst_to ||
          "",
      });
    }
  };

  useEffect(() => {
    fetchBuyersHandler();
  }, [fetchBuyersHandler]);

  // Calculate subtotal when items change
  useEffect(() => {
    const newSubtotal = items.reduce((acc, curr) => acc + (curr.price || 0), 0);
    setSubtotal(newSubtotal);
  }, [items]);

  // Calculate total when subtotal or tax changes
  useEffect(() => {
    if (tax && subtotal) {
      const taxAmount = subtotal * (tax.value || 0);
      setTotal(subtotal + taxAmount);
    } else {
      setTotal(subtotal);
    }
  }, [tax, subtotal]);

  // const addInvoiceHandler = async (e: React.FormEvent) => {
  //   e.preventDefault();

  //   const data = {
  //     invoice_no: invoiceNo,
  //     document_date: documentDate,
  //     sales_order_date: salesOrderDate,
  //     note: note,
  //     tax: { tax_amount: tax?.value, tax_name: tax?.label },
  //     subtotal: subtotal,
  //     total: total,
  //     store: store?.value,
  //     items: inputs.map((item: any) => ({
  //       item: item.item.value,
  //       quantity: item.quantity,
  //       amount: item.price,
  //     })),
  //     category: category?.value,
  //     buyer: buyer?.value,
  //     supplier: supplier?.value,
  //   };

  //   try {
  //     setIsAdding(true);
  //     const response = await addInvoice(data).unwrap();
  //     if (!response.success) {
  //       throw new Error(response.message);
  //     }
  //     toast.success(response.message);
  //     closeDrawerHandler();
  //     fetchInvoicesHandler();
  //   } catch (error: any) {
  //     toast.error(error?.message || "Something went wrong");
  //   } finally {
  //     setIsAdding(false);
  //   }
  // };

  // const fetchBuyersHandler = async () => {
  //   try {
  //     const response = await fetch(
  //       process.env.REACT_APP_BACKEND_URL + "agent/buyers",
  //       {
  //         method: "GET",
  //         headers: {
  //           Authorization: `Bearer ${cookies?.access_token}`,
  //         },
  //       }
  //     );
  //     const data = await response.json();
  //     if (!data.success) {
  //       throw new Error(data.message);
  //     }

  //     const buyers = data.agents.map((buyer: any) => ({
  //       value: buyer._id,
  //       label: buyer.name,
  //     }));
  //     setBuyerOptions(buyers);
  //   } catch (error: any) {
  //     toast.error(error?.message || "Something went wrong");
  //   }
  // };

  // const fetchSuppliersHandler = async () => {
  //   try {
  //     const response = await fetch(
  //       process.env.REACT_APP_BACKEND_URL + "agent/suppliers",
  //       {
  //         method: "GET",
  //         headers: {
  //           Authorization: `Bearer ${cookies?.access_token}`,
  //         },
  //       }
  //     );
  //     const data = await response.json();
  //     if (!data.success) {
  //       throw new Error(data.message);
  //     }

  //     const suppliers = data.agents.map((supplier: any) => ({
  //       value: supplier._id,
  //       label: supplier.name,
  //     }));
  //     setSupplierOptions(suppliers);
  //   } catch (error: any) {
  //     toast.error(error?.message || "Something went wrong");
  //   }
  // };

  // const fetchItemsHandler = async () => {
  //   try {
  //     const response = await fetch(
  //       process.env.REACT_APP_BACKEND_URL + "product/all",
  //       {
  //         method: "GET",
  //         headers: {
  //           Authorization: `Bearer ${cookies?.access_token}`,
  //         },
  //       }
  //     );
  //     const results = await response.json();
  //     if (!results.success) {
  //       throw new Error(results?.message);
  //     }
  //     const products = results.products.map((product: any) => ({
  //       value: product._id,
  //       label: product.name,
  //     }));
  //     setItemOptions(products);
  //     setAllItems(results.products);
  //   } catch (error: any) {
  //     toast.error(error?.message || "Something went wrong");
  //   }
  // };

  // const fetchStoresHandler = async () => {
  //   try {
  //     const response = await fetch(
  //       process.env.REACT_APP_BACKEND_URL + "store/all",
  //       {
  //         method: "GET",
  //         headers: {
  //           Authorization: `Bearer ${cookies?.access_token}`,
  //         },
  //       }
  //     );
  //     const data = await response.json();
  //     if (!data.success) {
  //       throw new Error(data.message);
  //     }
  //     const stores = data.stores.map((store: any) => ({
  //       value: store._id,
  //       label: store.name,
  //     }));
  //     setStoreOptions(stores);
  //   } catch (error: any) {
  //     toast.error(error?.message || "Something went wrong");
  //   }
  // };

  // useEffect(() => {
  //   if (tax && subtotal) {
  //     setTotal(subtotal + tax?.value * subtotal);
  //   }
  // }, [tax, subtotal]);

  // useEffect(() => {
  //   const price = inputs.reduce((acc: number, curr: any) => {
  //     return acc + (curr?.price * curr?.quantity || 0);
  //   }, 0);
  //   setSubtotal(price);
  // }, [inputs]);

  // useEffect(() => {
  //   fetchBuyersHandler();
  //   fetchItemsHandler();
  //   fetchStoresHandler();
  //   fetchSuppliersHandler();
  // }, []);

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
          Add New Invoice
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

      {/* Form */}
      <div className="p-6">
        <form onSubmit={formik.handleSubmit} className="space-y-6">
          {/* Invoice Basic Details Section */}
          {/* <div
            className="p-6 rounded-xl border"
            style={{
              backgroundColor: colors.background.card,
              borderColor: colors.border.light,
            }}
          >
            <div className="flex items-center gap-3 mb-6">
              <div
                className="p-2 rounded-lg"
                style={{ backgroundColor: colors.primary[50] }}
              >
                <BiPackage size={20} style={{ color: colors.primary[500] }} />
              </div>
              <h3
                className="text-lg font-semibold"
                style={{ color: colors.text.primary }}
              >
                Invoice Details
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label
                  className="block text-sm font-medium mb-2"
                  style={{ color: colors.text.primary }}
                >
                  Invoice Number *
                </label>
                <input
                  type="text"
                  name="invoiceNo"
                  value={formik.values.invoiceNo}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className="w-full px-4 py-2 text-sm rounded-lg border transition-colors duration-200"
                  style={{
                    backgroundColor: colors.input.background,
                    borderColor:
                      formik.touched.invoiceNo && formik.errors.invoiceNo
                        ? "#ef4444"
                        : colors.input.border,
                    color: colors.text.primary,
                  }}
                  placeholder="Enter invoice number"
                />
                {formik.touched.invoiceNo && formik.errors.invoiceNo && (
                  <p className="text-red-500 text-xs mt-1">
                    {formik.errors.invoiceNo}
                  </p>
                )}
              </div>
            </div>
          </div> */}

          {/* Seller Details Section */}
          {/* <div
            className="p-6 rounded-xl border"
            style={{
              backgroundColor: colors.background.card,
              borderColor: colors.border.light,
            }}
          >
            <div className="flex items-center gap-3 mb-6">
              <div
                className="p-2 rounded-lg"
                style={{ backgroundColor: colors.primary[50] }}
              >
                <BiUser size={20} style={{ color: colors.primary[500] }} />
              </div>
              <h3
                className="text-lg font-semibold"
                style={{ color: colors.text.primary }}
              >
                Seller Details
              </h3>
            </div>

            <div>
              <label
                className="block text-sm font-medium mb-2"
                style={{ color: colors.text.primary }}
              >
                Seller Address *
              </label>
              <input
                name="sellerAddress"
                value={formik.values.sellerAddress}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className="w-full px-4 py-2 text-sm rounded-lg border transition-colors duration-200 resize-none"
                style={{
                  backgroundColor: colors.input.background,
                  borderColor:
                    formik.touched.sellerAddress && formik.errors.sellerAddress
                      ? "#ef4444"
                      : colors.input.border,
                  color: colors.text.primary,
                }}
                placeholder="Enter seller address"
              />
              {formik.touched.sellerAddress && formik.errors.sellerAddress && (
                <p className="text-red-500 text-xs mt-1">
                  {formik.errors.sellerAddress}
                </p>
              )}
            </div>
          </div> */}

          {/* Consignee Ship To Section */}
          <div
            className="p-6 rounded-xl border"
            style={{
              backgroundColor: colors.background.card,
              borderColor: colors.border.light,
            }}
          >
            <div className="flex items-center gap-3 mb-6">
              <div
                className="p-2 rounded-lg"
                style={{ backgroundColor: colors.primary[50] }}
              >
                <BiMapPin size={20} style={{ color: colors.primary[500] }} />
              </div>
              <h3
                className="text-lg font-semibold"
                style={{ color: colors.text.primary }}
              >
                Ship To
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <label
                  className="block text-sm font-medium mb-2"
                  style={{ color: colors.text.primary }}
                >
                  Consignee Name (Buyer) *
                </label>
                <select
                  name="consigneeShipTo"
                  value={formik.values.consigneeShipTo}
                  onChange={(e) => {
                    formik.handleChange(e);
                    // Also handle auto-fill when selection changes
                    if (e.target.value) {
                      handleBuyerSelect(e.target.value);
                    }
                  }}
                  onBlur={formik.handleBlur}
                  className="w-full px-4 py-2 text-sm rounded-lg border transition-colors duration-200"
                  style={{
                    backgroundColor: colors.input.background,
                    borderColor:
                      formik.touched.consigneeShipTo &&
                      formik.errors.consigneeShipTo
                        ? "#ef4444"
                        : colors.input.border,
                    color: colors.text.primary,
                  }}
                  disabled={isLoadingBuyers}
                >
                  <option value="">
                    {isLoadingBuyers ? "Loading buyers..." : "Select a buyer"}
                  </option>
                  {buyerOptions.map((buyer) => (
                    <option key={buyer.value} value={buyer.value}>
                      {buyer.label}
                    </option>
                  ))}
                </select>
                {formik.touched.consigneeShipTo &&
                  formik.errors.consigneeShipTo && (
                    <p className="text-red-500 text-xs mt-1">
                      {formik.errors.consigneeShipTo}
                    </p>
                  )}
              </div>

              <div>
                <label
                  className="block text-sm font-medium mb-2"
                  style={{ color: colors.text.primary }}
                >
                  GSTIN
                </label>
                <input
                  type="text"
                  name="gstin"
                  value={formik.values.gstin}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className="w-full px-4 py-2 text-sm rounded-lg border transition-colors duration-200"
                  style={{
                    backgroundColor: colors.input.background,
                    borderColor:
                      formik.touched.gstin && formik.errors.gstin
                        ? "#ef4444"
                        : colors.input.border,
                    color: colors.text.primary,
                  }}
                  placeholder="Enter GSTIN"
                />
                {formik.touched.gstin && formik.errors.gstin && (
                  <p className="text-red-500 text-xs mt-1">
                    {formik.errors.gstin}
                  </p>
                )}
              </div>

              <div>
                <label
                  className="block text-sm font-medium mb-2"
                  style={{ color: colors.text.primary }}
                >
                  Address *
                </label>
                <input
                  name="address"
                  value={formik.values.address}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className="w-full px-4 py-2 text-sm rounded-lg border transition-colors duration-200 resize-none"
                  style={{
                    backgroundColor: colors.input.background,
                    borderColor:
                      formik.touched.address && formik.errors.address
                        ? "#ef4444"
                        : colors.input.border,
                    color: colors.text.primary,
                  }}
                  placeholder="Enter address"
                />
                {formik.touched.address && formik.errors.address && (
                  <p className="text-red-500 text-xs mt-1">
                    {formik.errors.address}
                  </p>
                )}
              </div>

              {/*<div>
                <label
                  className="block text-sm font-medium mb-2"
                  style={{ color: colors.text.primary }}
                >
                  Pincode *
                </label>
                <input
                  type="text"
                  name="pincode"
                  value={formik.values.pincode}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className="w-full px-4 py-2 text-sm rounded-lg border transition-colors duration-200"
                  style={{
                    backgroundColor: colors.input.background,
                    borderColor:
                      formik.touched.pincode && formik.errors.pincode
                        ? "#ef4444"
                        : colors.input.border,
                    color: colors.text.primary,
                  }}
                  placeholder="Enter pincode"
                />
                {formik.touched.pincode && formik.errors.pincode && (
                  <p className="text-red-500 text-xs mt-1">
                    {formik.errors.pincode}
                  </p>
                )}
              </div>*/}

              {/* <div>
                <label
                  className="block text-sm font-medium mb-2"
                  style={{ color: colors.text.primary }}
                >
                  State *
                </label>
                <input
                  type="text"
                  name="state"
                  value={formik.values.state}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className="w-full px-4 py-2 text-sm rounded-lg border transition-colors duration-200"
                  style={{
                    backgroundColor: colors.input.background,
                    borderColor:
                      formik.touched.state && formik.errors.state
                        ? "#ef4444"
                        : colors.input.border,
                    color: colors.text.primary,
                  }}
                  placeholder="Enter state"
                />
                {formik.touched.state && formik.errors.state && (
                  <p className="text-red-500 text-xs mt-1">
                    {formik.errors.state}
                  </p>
                )}
              </div> */}
            </div>
          </div>

          {/* Biller (Bill To) Section */}
          <div
            className="p-6 rounded-xl border"
            style={{
              backgroundColor: colors.background.card,
              borderColor: colors.border.light,
            }}
          >
            <div className="flex items-center gap-3 mb-6">
              <div
                className="p-2 rounded-lg"
                style={{ backgroundColor: colors.primary[50] }}
              >
                <BiCreditCard
                  size={20}
                  style={{ color: colors.primary[500] }}
                />
              </div>
              <h3
                className="text-lg font-semibold"
                style={{ color: colors.text.primary }}
              >
                Bill To
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* <div>
                <label
                  className="block text-sm font-medium mb-2"
                  style={{ color: colors.text.primary }}
                >
                  Name *
                </label>
                <input
                  type="text"
                  name="billerBillTo"
                  value={formik.values.billerBillTo}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className="w-full px-4 py-2 text-sm rounded-lg border transition-colors duration-200"
                  style={{
                    backgroundColor: colors.input.background,
                    borderColor:
                      formik.touched.billerBillTo && formik.errors.billerBillTo
                        ? "#ef4444"
                        : colors.input.border,
                    color: colors.text.primary,
                  }}
                  placeholder="Enter biller name"
                />
                {formik.touched.billerBillTo && formik.errors.billerBillTo && (
                  <p className="text-red-500 text-xs mt-1">
                    {formik.errors.billerBillTo}
                  </p>
                )}
              </div> */}

              <div>
                <label
                  className="block text-sm font-medium mb-2"
                  style={{ color: colors.text.primary }}
                >
                  GSTIN
                </label>
                <input
                  type="text"
                  name="billerGSTIN"
                  value={formik.values.billerGSTIN}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className="w-full px-4 py-2 text-sm rounded-lg border transition-colors duration-200"
                  style={{
                    backgroundColor: colors.input.background,
                    borderColor:
                      formik.touched.billerGSTIN && formik.errors.billerGSTIN
                        ? "#ef4444"
                        : colors.input.border,
                    color: colors.text.primary,
                  }}
                  placeholder="Enter biller GSTIN"
                />
                {formik.touched.billerGSTIN && formik.errors.billerGSTIN && (
                  <p className="text-red-500 text-xs mt-1">
                    {formik.errors.billerGSTIN}
                  </p>
                )}
              </div>

              <div>
                <label
                  className="block text-sm font-medium mb-2"
                  style={{ color: colors.text.primary }}
                >
                  Address *
                </label>
                <input
                  name="billerAddress"
                  value={formik.values.billerAddress}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className="w-full px-4 py-2 text-sm rounded-lg border transition-colors duration-200 resize-none"
                  style={{
                    backgroundColor: colors.input.background,
                    borderColor:
                      formik.touched.billerAddress &&
                      formik.errors.billerAddress
                        ? "#ef4444"
                        : colors.input.border,
                    color: colors.text.primary,
                  }}
                  placeholder="Enter biller address"
                />
                {formik.touched.billerAddress &&
                  formik.errors.billerAddress && (
                    <p className="text-red-500 text-xs mt-1">
                      {formik.errors.billerAddress}
                    </p>
                  )}
              </div>

              {/* <div>
                <label
                  className="block text-sm font-medium mb-2"
                  style={{ color: colors.text.primary }}
                >
                  Pincode *
                </label>
                <input
                  type="text"
                  name="billerPincode"
                  value={formik.values.billerPincode}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className="w-full px-4 py-2 text-sm rounded-lg border transition-colors duration-200"
                  style={{
                    backgroundColor: colors.input.background,
                    borderColor:
                      formik.touched.billerPincode &&
                      formik.errors.billerPincode
                        ? "#ef4444"
                        : colors.input.border,
                    color: colors.text.primary,
                  }}
                  placeholder="Enter biller pincode"
                />
                {formik.touched.billerPincode &&
                  formik.errors.billerPincode && (
                    <p className="text-red-500 text-xs mt-1">
                      {formik.errors.billerPincode}
                    </p>
                  )}
              </div> */}

              {/* <div>
                <label
                  className="block text-sm font-medium mb-2"
                  style={{ color: colors.text.primary }}
                >
                  State *
                </label>
                <input
                  type="text"
                  name="billerState"
                  value={formik.values.billerState}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className="w-full px-4 py-2 text-sm rounded-lg border transition-colors duration-200"
                  style={{
                    backgroundColor: colors.input.background,
                    borderColor:
                      formik.touched.billerState && formik.errors.billerState
                        ? "#ef4444"
                        : colors.input.border,
                    color: colors.text.primary,
                  }}
                  placeholder="Enter biller state"
                />
                {formik.touched.billerState && formik.errors.billerState && (
                  <p className="text-red-500 text-xs mt-1">
                    {formik.errors.billerState}
                  </p>
                )}
              </div> */}
            </div>
          </div>

          {/* Order Details Section */}
          <div
            className="p-6 rounded-xl border"
            style={{
              backgroundColor: colors.background.card,
              borderColor: colors.border.light,
            }}
          >
            <div className="flex items-center gap-3 mb-6">
              <div
                className="p-2 rounded-lg"
                style={{ backgroundColor: colors.primary[50] }}
              >
                <BiPackage size={20} style={{ color: colors.primary[500] }} />
              </div>
              <h3
                className="text-lg font-semibold"
                style={{ color: colors.text.primary }}
              >
                Order Details
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label
                  className="block text-sm font-medium mb-2"
                  style={{ color: colors.text.primary }}
                >
                  Delivery Note
                </label>
                <input
                  type="text"
                  name="deliveryNote"
                  value={formik.values.deliveryNote}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className="w-full px-4 py-2 text-sm rounded-lg border transition-colors duration-200"
                  style={{
                    backgroundColor: colors.input.background,
                    borderColor: colors.input.border,
                    color: colors.text.primary,
                  }}
                  placeholder="Enter delivery note"
                />
              </div>

              <div>
                <label
                  className="block text-sm font-medium mb-2"
                  style={{ color: colors.text.primary }}
                >
                  Mode/Terms of Payment *
                </label>
                <select
                  name="modeTermsOfPayment"
                  value={formik.values.modeTermsOfPayment}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className="w-full px-4 py-2 text-sm rounded-lg border transition-colors duration-200"
                  style={{
                    backgroundColor: colors.input.background,
                    borderColor:
                      formik.touched.modeTermsOfPayment &&
                      formik.errors.modeTermsOfPayment
                        ? "#ef4444"
                        : colors.input.border,
                    color: colors.text.primary,
                  }}
                >
                  <option value="">Select payment mode</option>
                  <option value="Cash">Cash</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="Cheque">Cheque</option>
                  <option value="Credit">Credit</option>
                  <option value="UPI">UPI</option>
                </select>
                {formik.touched.modeTermsOfPayment &&
                  formik.errors.modeTermsOfPayment && (
                    <p className="text-red-500 text-xs mt-1">
                      {formik.errors.modeTermsOfPayment}
                    </p>
                  )}
              </div>

              <div>
                <label
                  className="block text-sm font-medium mb-2"
                  style={{ color: colors.text.primary }}
                >
                  Reference No
                </label>
                <input
                  type="text"
                  name="referenceNo"
                  value={formik.values.referenceNo}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className="w-full px-4 py-2 text-sm rounded-lg border transition-colors duration-200"
                  style={{
                    backgroundColor: colors.input.background,
                    borderColor: colors.input.border,
                    color: colors.text.primary,
                  }}
                  placeholder="Enter reference number"
                />
              </div>

              <div>
                <label
                  className="block text-sm font-medium mb-2"
                  style={{ color: colors.text.primary }}
                >
                  Other References
                </label>
                <input
                  type="text"
                  name="otherReferences"
                  value={formik.values.otherReferences}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className="w-full px-4 py-2 text-sm rounded-lg border transition-colors duration-200"
                  style={{
                    backgroundColor: colors.input.background,
                    borderColor: colors.input.border,
                    color: colors.text.primary,
                  }}
                  placeholder="Enter other references"
                />
              </div>

              <div>
                <label
                  className="block text-sm font-medium mb-2"
                  style={{ color: colors.text.primary }}
                >
                  Buyer's Order No *
                </label>
                <input
                  type="text"
                  name="buyersOrderNo"
                  value={formik.values.buyersOrderNo}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className="w-full px-4 py-2 text-sm rounded-lg border transition-colors duration-200"
                  style={{
                    backgroundColor: colors.input.background,
                    borderColor:
                      formik.touched.buyersOrderNo &&
                      formik.errors.buyersOrderNo
                        ? "#ef4444"
                        : colors.input.border,
                    color: colors.text.primary,
                  }}
                  placeholder="Enter buyer's order number"
                />
                {formik.touched.buyersOrderNo &&
                  formik.errors.buyersOrderNo && (
                    <p className="text-red-500 text-xs mt-1">
                      {formik.errors.buyersOrderNo}
                    </p>
                  )}
              </div>

              <div>
                <label
                  className="block text-sm font-medium mb-2"
                  style={{ color: colors.text.primary }}
                >
                  Date *
                </label>
                <input
                  type="date"
                  name="date"
                  value={formik.values.date}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className="w-full px-4 py-2 text-sm rounded-lg border transition-colors duration-200"
                  style={{
                    backgroundColor: colors.input.background,
                    borderColor:
                      formik.touched.date && formik.errors.date
                        ? "#ef4444"
                        : colors.input.border,
                    color: colors.text.primary,
                  }}
                />
                {formik.touched.date && formik.errors.date && (
                  <p className="text-red-500 text-xs mt-1">
                    {formik.errors.date}
                  </p>
                )}
              </div>

              <div>
                <label
                  className="block text-sm font-medium mb-2"
                  style={{ color: colors.text.primary }}
                >
                  Dispatch Doc No
                </label>
                <input
                  type="text"
                  name="dispatchDocNo"
                  value={formik.values.dispatchDocNo}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className="w-full px-4 py-2 text-sm rounded-lg border transition-colors duration-200"
                  style={{
                    backgroundColor: colors.input.background,
                    borderColor: colors.input.border,
                    color: colors.text.primary,
                  }}
                  placeholder="Enter dispatch document number"
                />
              </div>

              <div>
                <label
                  className="block text-sm font-medium mb-2"
                  style={{ color: colors.text.primary }}
                >
                  Delivery Note Date
                </label>
                <input
                  type="date"
                  name="deliveryNoteDate"
                  value={formik.values.deliveryNoteDate}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className="w-full px-4 py-2 text-sm rounded-lg border transition-colors duration-200"
                  style={{
                    backgroundColor: colors.input.background,
                    borderColor: colors.input.border,
                    color: colors.text.primary,
                  }}
                />
              </div>

              <div>
                <label
                  className="block text-sm font-medium mb-2"
                  style={{ color: colors.text.primary }}
                >
                  Dispatched Through
                </label>
                <input
                  type="text"
                  name="dispatchedThrough"
                  value={formik.values.dispatchedThrough}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className="w-full px-4 py-2 text-sm rounded-lg border transition-colors duration-200"
                  style={{
                    backgroundColor: colors.input.background,
                    borderColor: colors.input.border,
                    color: colors.text.primary,
                  }}
                  placeholder="Enter dispatch method"
                />
              </div>

              <div>
                <label
                  className="block text-sm font-medium mb-2"
                  style={{ color: colors.text.primary }}
                >
                  Destination
                </label>
                <input
                  type="text"
                  name="destination"
                  value={formik.values.destination}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className="w-full px-4 py-2 text-sm rounded-lg border transition-colors duration-200"
                  style={{
                    backgroundColor: colors.input.background,
                    borderColor: colors.input.border,
                    color: colors.text.primary,
                  }}
                  placeholder="Enter destination"
                />
              </div>
            </div>
          </div>

          {/* Terms and Remarks Section */}
          <div
            className="p-6 rounded-xl border"
            style={{
              backgroundColor: colors.background.card,
              borderColor: colors.border.light,
            }}
          >
            <div className="flex items-center gap-3 mb-6">
              <div
                className="p-2 rounded-lg"
                style={{ backgroundColor: colors.primary[50] }}
              >
                <BiEdit size={20} style={{ color: colors.primary[500] }} />
              </div>
              <h3
                className="text-lg font-semibold"
                style={{ color: colors.text.primary }}
              >
                Terms & Remarks
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label
                  className="block text-sm font-medium mb-2"
                  style={{ color: colors.text.primary }}
                >
                  Terms of Delivery
                </label>
                <textarea
                  name="termsOfDelivery"
                  value={formik.values.termsOfDelivery}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  rows={3}
                  className="w-full px-4 py-2 text-sm rounded-lg border transition-colors duration-200 resize-none"
                  style={{
                    backgroundColor: colors.input.background,
                    borderColor: colors.input.border,
                    color: colors.text.primary,
                  }}
                  placeholder="Enter terms of delivery"
                />
              </div>

              <div>
                <label
                  className="block text-sm font-medium mb-2"
                  style={{ color: colors.text.primary }}
                >
                  Remarks
                </label>
                <textarea
                  name="remarks"
                  value={formik.values.remarks}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  rows={3}
                  className="w-full px-4 py-2 text-sm rounded-lg border transition-colors duration-200 resize-none"
                  style={{
                    backgroundColor: colors.input.background,
                    borderColor: colors.input.border,
                    color: colors.text.primary,
                  }}
                  placeholder="Enter any remarks"
                />
              </div>
            </div>
          </div>

          {/* Items Section */}
          <div
            className="p-6 rounded-xl border"
            style={{
              backgroundColor: colors.background.card,
              borderColor: colors.border.light,
            }}
          >
            <div className="flex items-center gap-3 mb-6">
              <div
                className="p-2 rounded-lg"
                style={{ backgroundColor: colors.primary[50] }}
              >
                <BiPackage size={20} style={{ color: colors.primary[500] }} />
              </div>
              <h3
                className="text-lg font-semibold"
                style={{ color: colors.text.primary }}
              >
                Invoice Items
              </h3>
            </div>

            <AddItems inputs={items} setInputs={setItems} />
          </div>

          {/* Tax and Financial Summary */}
          <div
            className="p-6 rounded-xl border"
            style={{
              backgroundColor: colors.background.card,
              borderColor: colors.border.light,
            }}
          >
            <div className="flex items-center gap-3 mb-6">
              <div
                className="p-2 rounded-lg"
                style={{ backgroundColor: colors.primary[50] }}
              >
                <BiCreditCard
                  size={20}
                  style={{ color: colors.primary[500] }}
                />
              </div>
              <h3
                className="text-lg font-semibold"
                style={{ color: colors.text.primary }}
              >
                Tax & Financial Summary
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label
                  className="block text-sm font-medium mb-2"
                  style={{ color: colors.text.primary }}
                >
                  Tax
                </label>
                <select
                  value={tax?.value || 0}
                  onChange={(e) => {
                    const selectedTax = taxOptions.find(
                      (opt) => opt.value === parseFloat(e.target.value)
                    );
                    setTax(selectedTax);
                  }}
                  className="w-full px-4 py-2 text-sm rounded-lg border transition-colors duration-200"
                  style={{
                    backgroundColor: colors.input.background,
                    borderColor: colors.input.border,
                    color: colors.text.primary,
                  }}
                >
                  {taxOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  className="block text-sm font-medium mb-2"
                  style={{ color: colors.text.primary }}
                >
                  Subtotal
                </label>
                <input
                  type="text"
                  value={`₹${subtotal.toLocaleString("en-IN", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}`}
                  readOnly
                  className="w-full px-4 py-2 text-sm rounded-lg border bg-gray-50"
                  style={{
                    backgroundColor: colors.gray[100],
                    borderColor: colors.input.border,
                    color: colors.text.secondary,
                  }}
                />
              </div>

              <div>
                <label
                  className="block text-sm font-medium mb-2"
                  style={{ color: colors.text.primary }}
                >
                  Total Amount
                </label>
                <input
                  type="text"
                  value={`₹${total.toLocaleString("en-IN", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}`}
                  readOnly
                  className="w-full px-4 py-2 text-sm rounded-lg border bg-green-50 font-semibold text-green-700"
                  style={{
                    borderColor: colors.input.border,
                  }}
                />
              </div>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-4 pt-6">
            <button
              type="button"
              onClick={closeDrawerHandler}
              className="flex-1 px-6 py-3 text-sm font-medium rounded-lg border transition-colors duration-200"
              style={{
                backgroundColor: colors.gray[100],
                borderColor: colors.border.light,
                color: colors.text.secondary,
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-6 py-3 text-sm font-medium text-white rounded-lg transition-colors duration-200 disabled:opacity-50"
              style={{
                backgroundColor: isSubmitting
                  ? colors.primary[500]
                  : colors.primary[500],
              }}
            >
              {isSubmitting ? "Creating Invoice..." : "Create Invoice"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddInvoice;
