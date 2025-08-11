const { object, string, date, number, array } = require("yup");

exports.InvoiceValidation = object({
  // Seller Information
  sellerAddress: string().required("Seller address is required"),

  // Consignee (Ship To) Information
  consigneeShipTo: string().required("Consignee ship to is required"),
  address: string().required("Address is required"),
  gstin: string()
    .required("GSTIN is required")
    .matches(
      /^[A-Z0-9]{15}$/,
      "GSTIN must be exactly 15 characters, only uppercase letters and numbers"
    ),
  pincode: string()
    .required("Pincode is required")
    .matches(/^[1-9][0-9]{5}$/, "Please enter a valid 6-digit pincode"),
  state: string().required("State is required"),

  // Biller (Bill To) Information
  billerBillTo: string().required("Biller bill to is required"),
  billerAddress: string().required("Biller address is required"),
  billerGSTIN: string()
    .required("Biller GSTIN is required")
    .matches(
      /^[A-Z0-9]{15}$/,
      "Biller GSTIN must be exactly 15 characters, only uppercase letters and numbers"
    ),
  billerPincode: string()
    .required("Biller pincode is required")
    .matches(/^[1-9][0-9]{5}$/, "Please enter a valid 6-digit pincode"),
  billerState: string().required("Biller state is required"),

  // Invoice Details
  deliveryNote: string(),
  modeTermsOfPayment: string().required("Mode/Terms of payment is required"),
  referenceNo: string(),
  otherReferences: string(),
  buyersOrderNo: string().required("Buyer's order no is required"),
  date: date().required("Date is required"),
  dispatchDocNo: string(),
  deliveryNoteDate: date(),
  dispatchedThrough: string(),
  destination: string(),

  // Additional Terms
  termsOfDelivery: string(),
  remarks: string(),

  // Legacy fields (optional for backward compatibility)
  category: string().oneOf(
    ["sale", "purchase"],
    "Category must be either sale or purchase"
  ),
  buyer: string(),
  supplier: string(),
  invoice_no: string(),
  document_date: date(),
  sales_order_date: date(),
  store: string(),
  note: string(),
  items: array().of(
    object({
      item: string(),
      quantity: number().positive("Quantity must be positive"),
      amount: number().positive("Amount must be positive"),
    })
  ),
  subtotal: number().min(0, "Subtotal must be non-negative"),
  tax: object({
    tax_amount: number().min(0, "Tax amount must be non-negative"),
    tax_name: string(),
  }),
  total: number().min(0, "Total must be non-negative"),
});

exports.InvoiceUpdateValidation = object({
  // All fields are optional for updates, but if provided should follow same rules
  sellerAddress: string(),
  consigneeShipTo: string(),
  address: string(),
  gstin: string().matches(
    /^[A-Z0-9]{15}$/,
    "GSTIN must be exactly 15 characters, only uppercase letters and numbers"
  ),
  pincode: string().matches(
    /^[1-9][0-9]{5}$/,
    "Please enter a valid 6-digit pincode"
  ),
  state: string(),
  billerBillTo: string(),
  billerAddress: string(),
  billerGSTIN: string().matches(
    /^[A-Z0-9]{15}$/,
    "Biller GSTIN must be exactly 15 characters, only uppercase letters and numbers"
  ),
  billerPincode: string().matches(
    /^[1-9][0-9]{5}$/,
    "Please enter a valid 6-digit pincode"
  ),
  billerState: string(),
  deliveryNote: string(),
  modeTermsOfPayment: string(),
  referenceNo: string(),
  otherReferences: string(),
  buyersOrderNo: string(),
  date: date(),
  dispatchDocNo: string(),
  deliveryNoteDate: date(),
  dispatchedThrough: string(),
  destination: string(),
  termsOfDelivery: string(),
  remarks: string(),
  category: string().oneOf(
    ["sale", "purchase"],
    "Category must be either sale or purchase"
  ),
  buyer: string(),
  supplier: string(),
  invoice_no: string(),
  document_date: date(),
  sales_order_date: date(),
  store: string(),
  note: string(),
  items: array().of(
    object({
      item: string(),
      quantity: number().positive("Quantity must be positive"),
      amount: number().positive("Amount must be positive"),
    })
  ),
  subtotal: number().min(0, "Subtotal must be non-negative"),
  tax: object({
    tax_amount: number().min(0, "Tax amount must be non-negative"),
    tax_name: string(),
  }),
  total: number().min(0, "Total must be non-negative"),
});
