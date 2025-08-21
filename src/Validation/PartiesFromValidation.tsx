//@ts-nocheck
import * as Yup from "yup";

export const PartiesFromValidation = Yup.object({
  type: Yup.string().required("Type is a required field"),
  parties_type: Yup.string().required("Merchant Type is a required field"),

  consignee_name: Yup.array()
    .of(Yup.string().required("Consignee name is required"))
    .min(1, "At least one consignee name is required"),

  contact_number: Yup.array()
    .of(
      Yup.string()
        .matches(/^[0-9]{10}$/, "Contact number must be exactly 10 digits")
        .required("Contact number is required")
    )
    .min(1, "At least one contact number is required"),

  email_id: Yup.array()
    .of(Yup.string().email("Invalid email"))
    .min(1, "At least one email is required"),

  shipped_to: Yup.string().required("Shipped To address is required"),
  bill_to: Yup.string().required("Bill To address is required"),

  shipped_gst_to: Yup.string().when("type", {
    is: (val) => val === "Company",
    then: (schema) =>
      schema
        .required("Shipped To GST is required")
        .matches(/^[A-Z0-9]{15}$/, "Shipped GSTIN must be exactly 15 characters, only uppercase letters and numbers"),
    otherwise: (schema) => schema.strip(),
  }),

  bill_gst_to: Yup.string().when("type", {
    is: (val) => val === "Company",
    then: (schema) =>
      schema
        .required("Bill To GST is required")
        .matches(/^[A-Z0-9]{15}$/, "Bill GSTIN must be exactly 15 characters, only uppercase letters and numbers"),
    otherwise: (schema) => schema.strip(),
  }),
});
