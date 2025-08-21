import * as Yup from "yup";

export const SalesFormValidation = Yup.object({
  party: Yup.string().required("Party selection is required"),
  product_id: Yup.string().required("Product selection is required"),
  price: Yup.number()
    .typeError("Price must be a number")
    .positive("Price must be greater than zero")
    .required("Price is required"),

  product_qty: Yup.number()
    .typeError("Product quantity must be a number")
    .integer("Product quantity must be an integer")
    .positive("Product quantity must be greater than zero")
    .required("Product quantity is required"),

  // product_type: Yup.string()
  //     .required('Product type is required'),

  // phone: Yup.string()
  //     .matches(/^[0-9]{10}$/, 'Phone must be exactly 10 digits')
  //     .required('Phone number is required'),

  GST: Yup.string()
    .oneOf(["5", "12", "18"], "Select a valid GST rate")
    .required("GST rate is required"),

  mode_of_payment: Yup.string()
    .oneOf(
      ["Cash", "Cheque", "NEFT/RTGS", "UPI", "Credit Card", "Debit Card"],
      "Select a valid mode of payment"
    )
    .required("Mode of payment is required"),

  terms_of_delivery: Yup.string(),
  comment: Yup.string(),
  uom: Yup.string(),
});

export const AssignFormValidation = Yup.object({
  assined_to: Yup.string().required("Assign selection is required"),
  assined_process: Yup.string().required("Assined process field is required"),
});

export const AddtokenamtFormValidation = Yup.object({
  token_amt: Yup.number()
    .typeError("Token amount must be a number")
    .required("Token amount is required"),
});

export const AddhalftokenFormValidation = Yup.object({
  half_payment: Yup.number()
    .typeError("Half token amount must be a number")
    .required("Half token amount is required"),
});

export const InvoiceFormValidation = Yup.object({
  invoice: Yup.mixed()
    .required("Image is required")
    .test("fileType", "Only image files are allowed", (value) => {
      const file = value as File;
      return (
        file && ["image/jpeg", "image/png", "image/gif"].includes(file.type)
      );
    }),
});
