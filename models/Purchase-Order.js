const mongoose = require('mongoose');

const PurchaseOrderSchema = new mongoose.Schema(
  {
    companyName: { type: String },
    companyAddress: { type: String },
    companyPhoneNumber: { type: String, required: false },
    companyEmail: { type: String, required: false },
    companyWebsite: { type: String, required: false },
    companyGST: { type: String },
    companyPan: { type: String, required: false },

    poOrder: { type: String },
    date: { type: String },

   
    supplierName: { type: String },
    supplierCode: { type: String },
    supplierPan: { type: String, required: false },
    supplierEmail: { type: String, required: false },
    supplierShippedTo: { type: String, required: false },
    supplierBillTo: { type: String, required: false },
    supplierShippedGSTIN: { type: String, required: false },
    supplierBillGSTIN: { type: String, required: false },

    GSTApply: { type: String },
    packagingAndForwarding: { type: String },
    freightCharges: { type: String, required: false },
    modeOfPayment: { type: String },
    deliveryAddress: { type: String },
    deliveryPeriod: { type: String },
    billingAddress: { type: String },
    paymentTerms: { type: String },

    additionalRemarks: { type: String, required: false },
    additionalImportant: { type: String, required: false },
  },
  {
    timestamps: true,
  }
);


const PurchaseOrder = mongoose.model("Purchase-Order", PurchaseOrderSchema);
module.exports = PurchaseOrder;
