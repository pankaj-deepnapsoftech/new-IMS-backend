const mongoose = require("mongoose");

const PurchaseOrderSchema = new mongoose.Schema(
  {
    companyName: { type: String, required: true },
    companyAddress: { type: String, required: true },
    companyGST: { type: String, required: true },
    poOrder: { type: String, required: true },
    supplierName: { type: String, required: true },
    supplierGST: { type: String, required: true },
    supplierAddress: { type: String, required: true },
    panDetails: { type: String, required: true },
    email: { type: String, required: true },
    freightCharges: { type: String },
    packagingAndForwarding: { type: String, required: true },
    modeOfPayment: { type: String, required: true },
    deliveryAddress: { type: String, required: true },
    deliveryPeriod: { type: String, required: true },
    billingAddress: { type: String, required: true },
    paymentTerms: { type: String, required: true },
    remarks: { type: String, required: true },
    GSTApply: { type: String, required: true },
  },
  {
    timestamps: true,
  }
);

const PurchaseOrder = mongoose.model("Purchase-Order", PurchaseOrderSchema);
module.exports = PurchaseOrder;
