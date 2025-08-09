const { object, string, number, mixed } = require("yup");

exports.SalesValidation = object({
  party: mixed().required("Party is a required field"),
  product_id: mixed().required("Product ID is a required field"),
  product_type: string().required("Product type is a required field"),
  price: number()
    .required("Price is a required field")
    .positive("Price must be positive"),
  product_qty: number()
    .required("Product quantity is a required field")
    .positive("Quantity must be positive"),
  GST: number().min(0, "GST cannot be negative"),
  uom: string().required("Unit of measurement is a required field"),
 mode_of_payment:string()
  .oneOf(
    ["cash", "cheque", "NEFT/RTGS", "UPI", "Credit Card", "Debit Card"],
    "Select a valid mode of payment"
  )
  .required("Mode of payment is required"),
  comment: string(),
});
 