const { object, string, array } = require("yup");

exports.PartiesValidation = object({
  consignee_name: array()
    .of(string().required())
    .required("Consignee Name required"),
  // gst_add: string().required("GST ADD is required"),
  // gst_in: array().of(string().required("GST IN is required")).min(1),
  contact_number: array()
    .of(string().required())
    .required("Contact numbers required"),
  // delivery_address: array()
  //   .of(string().required())
  //   .required("Delivery address required"),
  email_id: array()
    .of(string().email("Invalid email"))
    .required("At least one email is required"),
  shipped_to: string().required("Shipped To address is required"),
  bill_to: string().required("Bill To address is required"),
  shipped_gst_to: string().required("Shipped To GST is required"),
  bill_gst_to: string().required("Bill To GST is required"),
  type: string().required("Type is a required field"),
  parties_type: string().required("Parties Type is a required field"),
});
