const PurchaseOrder = require("../models/Purchase-Order");
const { TryCatch, ErrorHandler } = require("../utils/error");

exports.create = TryCatch(async (req, res) => {
  const purchaseOrder = req.body;
  if (!purchaseOrder) {
    throw new ErrorHandler("Please provide all the fields", 400);
  }

  const createdPurchaseOrder = await PurchaseOrder.create({
    ...purchaseOrder,
    creator: req.user._id,
  });

  res.status(200).json({
    status: 200,
    success: true,
    purchase_order: createdPurchaseOrder._doc,
    message: "Purchase Order created successfully",
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
