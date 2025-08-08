const { PartiesModels } = require("../models/Parties");
const PurchaseOrder = require("../models/Purchase-Order");
const { TryCatch, ErrorHandler } = require("../utils/error");
const { generatePONumber } = require("../utils/generatePONumber");

exports.create = TryCatch(async (req, res) => {
  const purchaseOrder = req.body;
  if (!purchaseOrder) {
    throw new ErrorHandler("Please provide all the fields", 400);
  }

  // Generate automatic PO number
  const poNumber = await generatePONumber();

  const createdPurchaseOrder = await PurchaseOrder.create({
    ...purchaseOrder,
    poOrder: poNumber, // Override with auto-generated number
    creator: req.user._id,
  });

  res.status(200).json({
    status: 200,
    success: true,
    purchase_order: createdPurchaseOrder._doc,
    message: "Purchase Order created successfully",
  });
});

exports.getNextPONumber = TryCatch(async (req, res) => {
  const poNumber = await generatePONumber();
  
  res.status(200).json({
    status: 200,
    success: true,
    poNumber: poNumber,
    message: "Next PO number generated successfully",
  });
});

exports.allSuppliers = TryCatch(async (req, res) => {
  const sellers = await PartiesModels.find(
    { parties_type: "Seller" },
    {
      _id: 1,
      cust_id: 1,
      consignee_name: 1,
      company_name: 1,
      shipped_to: 1,
      bill_to: 1,
      shipped_gst_to: 1,
      bill_gst_to: 1,
      pan_no: 1,
      contact_number: 1,
      email_id: 1,
    }
  );

  const formatted = sellers.map((supplier) => ({
    id: supplier._id,
    supplierCode: supplier.cust_id || "",
    supplierName: Array.isArray(supplier.consignee_name)
      ? supplier.consignee_name[0]
      : supplier.consignee_name || "",
    companyName: supplier.company_name || "",

    supplierShippedTo: supplier.shipped_to || "",
    supplierBillTo: supplier.bill_to || "",
    supplierShippedGSTIN: supplier.shipped_gst_to || "",
    supplierBillGSTIN: supplier.bill_gst_to || "",

    supplierPan: supplier.pan_no || "",
    companyPan: supplier.pan_no || "",

    supplierEmail: Array.isArray(supplier.email_id)
      ? supplier.email_id[0]
      : supplier.email_id || "",
 

    // companyPhoneNumber: Array.isArray(supplier.contact_number)
    //   ? supplier.contact_number[0]
    //   : supplier.contact_number || "",
  }));

  res.status(200).json({
    status: 200,
    success: true,
    suppliers: formatted,
    message: "Suppliers fetched successfully",
  });
});




exports.update = TryCatch(async (req, res) => {
  const { _id } = req.params;
  if (!_id) {
    throw new ErrorHandler("Purchase Order doesn't exist", 400);
  }
  const purchaseOrder = req.body;
  if (!purchaseOrder) {
    throw new ErrorHandler("Please provide all the fields", 400);
  }

  const updatedPurchaseOrder = await PurchaseOrder.findByIdAndUpdate(
    { _id: _id },
    {
      $set: { ...purchaseOrder, items: purchaseOrder.items },
    },
    { new: true }
  );

  res.status(200).json({
    status: 200,
    success: true,
    message: "Purchase Order has been updated successfully",
    purchase_order: updatedPurchaseOrder._doc,
  });
});

exports.remove = TryCatch(async (req, res) => {
  const { _id } = req.params;
  if (!_id) {
    throw new ErrorHandler("Purchase Order Id not provided", 400);
  }

  const purchaseOrder = await PurchaseOrder.findOne({ _id: _id });
  if (!purchaseOrder) {
    throw new ErrorHandler("Purchase Order doesn't exist", 400);
  }
  await purchaseOrder.deleteOne();

  res.status(200).json({
    status: 200,
    success: true,
    message: "Purchase Order deleted successfully",
  });
});

exports.details = TryCatch(async (req, res) => {
  const { _id } = req.params;
  if (!_id) {
    throw new ErrorHandler("Purchase Order Id not provided", 400);
  }

  const purchaseOrder = await PurchaseOrder.findById(_id);
  if (!purchaseOrder) {
    throw new ErrorHandler("Purchase Order doesn't exist", 400);
  }
  res.status(200).json({
    status: 200,
    success: true,
    purchase_order: purchaseOrder._doc,
    message: "Purchase Order details fetched successfully",
  });
});

exports.all = TryCatch(async (req, res) => {
  const purchaseOrders = await PurchaseOrder.find({}).populate(
    "creator",
    "name email"
  );
  res.status(200).json({
    status: 200,
    success: true,
    purchase_orders: purchaseOrders,
    message: "All Purchase Orders fetched successfully",
  });
});
