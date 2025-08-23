const { DispatchModel } = require("../models/Dispatcher");
const { TryCatch, ErrorHandler } = require("../utils/error");
const ProductionProcess = require("../models/productionProcess");
const mongoose = require("mongoose");
const Product = require("../models/product");

exports.CreateDispatch = TryCatch(async (req, res) => {
  const data = req.body;

  const find = await DispatchModel.findOne({
    sales_order_id: data.sales_order_id,
  });

  if (find) {
    throw new ErrorHandler(
      "Dispatch already created for this sales order",
      400
    );
  }

  if (!data.sales_order_id) {
    throw new ErrorHandler("Sales order ID is required", 400);
  }

  if (!data.dispatch_qty || data.dispatch_qty <= 0) {
    throw new ErrorHandler("Valid dispatch quantity is required", 400);
  }

  const product = await Product.findById(data.product_id);
  if (!product) {
    throw new ErrorHandler("Product not found", 404);
  }

  if (product.current_stock < data.dispatch_qty) {
    throw new ErrorHandler("Insufficient stock for dispatch", 400);
  }

  product.current_stock = product.current_stock - data.dispatch_qty;
  product.change_type = "decrease";
  product.quantity_changed = data.dispatch_qty;
  await product.save();

  const result = await DispatchModel.create({
    ...data,
    creator: req.user._id,
    dispatch_date: data.dispatch_date || new Date(),
  });

  return res.status(201).json({
    message: "Dispatch created successfully, stock updated",
    data: result,
    updated_stock: product.current_stock,
  });
});

exports.GetAllDispatches = TryCatch(async (req, res) => {
  const { page, limit } = req.query;
  const pages = parseInt(page) || 1;
  const limits = parseInt(limit) || 10;
  const skip = (pages - 1) * limits;

  const totalData = await DispatchModel.countDocuments();

  const data = await DispatchModel.find()
    .populate("creator", "first_name last_name email")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limits);

  return res.status(200).json({
    message: "Dispatches retrieved successfully",
    data,
    totalData,
    currentPage: pages,
    totalPages: Math.ceil(totalData / limits),
  });
});

exports.GetDispatch = TryCatch(async (req, res) => {
  const { page, limit } = req.query;
  const pages = parseInt(page) || 1;
  const limits = parseInt(limit) || 10;
  const skip = (pages - 1) * limits;

  const totalData = await DispatchModel.countDocuments();

  const data = await DispatchModel.aggregate([
    {
      $lookup: {
        from: "production-processes",
        localField: "production_process_id",
        foreignField: "_id",
        as: "production_process",
        pipeline: [
          {
            $lookup: {
              from: "products",
              localField: "finished_good.item",
              foreignField: "_id",
              as: "finished_good_item",
            },
          },
          {
            $lookup: {
              from: "boms",
              localField: "bom",
              foreignField: "_id",
              as: "bom",
            },
          },
        ],
      },
    },
    {
      $unwind: {
        path: "$production_process",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $unwind: {
        path: "$production_process.finished_good_item",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $unwind: {
        path: "$production_process.bom",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $addFields: {
        Bom_name: { $ifNull: ["$production_process.bom.bom_name", "N/A"] },
        Product: {
          $ifNull: ["$production_process.finished_good_item.name", "N/A"],
        },
        ProductId: {
          $ifNull: ["$production_process.finished_good_item.product_id", "N/A"],
        },
        Quantity: { $ifNull: ["$production_process.quantity", 0] },
        Total: { $ifNull: ["$production_process.bom.total_cost", 0] },
        Status: "$delivery_status",
        PaymentStatus: "Unpaid",
      },
    },
    {
      $project: {
        production_process: 0,
      },
    },
    { $sort: { _id: -1 } },
    { $skip: skip },
    { $limit: limits },
  ]);

  return res.status(200).json({
    message: "Data",
    data,
    totalData,
  });
});

exports.DeleteDispatch = TryCatch(async (req, res) => {
  const { id } = req.params;
  const find = await DispatchModel.findById(id);
  if (!find) {
    throw new ErrorHandler("Data already Deleted", 400);
  }
  await DispatchModel.findByIdAndDelete(id);
  return res.status(200).json({
    message: "Data deleted Successful",
  });
});

exports.UpdateDispatch = TryCatch(async (req, res) => {
  const { id } = req.params;
  const data = req.body;

  const existingDispatch = await DispatchModel.findById(id);
  if (!existingDispatch) {
    throw new ErrorHandler("Dispatch not found", 404);
  }

  if (data.dispatch_qty !== undefined && data.product_id) {
    const newDispatchQty = parseInt(data.dispatch_qty);

    const product = await Product.findById(data.product_id);
    if (!product) {
      throw new ErrorHandler("Product not found", 404);
    }

    if (product.current_stock < newDispatchQty) {
      throw new ErrorHandler(
        `Insufficient stock. Available: ${product.current_stock}, Required: ${newDispatchQty}`,
        400
      );
    }

    // 🚨 Always subtract the NEW dispatch qty (cumulative behavior)
    product.current_stock = product.current_stock - newDispatchQty;
    product.change_type = "decrease";
    product.quantity_changed = newDispatchQty;

    await product.save();
  }

  // Update the dispatch record
  const updatedDispatch = await DispatchModel.findByIdAndUpdate(id, data, {
    new: true,
  });

  return res.status(200).json({
    message: "Dispatch updated successfully, inventory decreased",
    data: updatedDispatch,
    updated_stock:
      data.dispatch_qty !== undefined && data.product_id
        ? (await Product.findById(data.product_id)).current_stock
        : null,
  });
});


// exports.UpdateDispatch = TryCatch(async (req, res) => {
//   const { id } = req.params;
//   const data = req.body;

//   const find = await DispatchModel.findById(id);
//   if (!find) {
//     throw new ErrorHandler("Data not Found", 400);
//   }
//   await DispatchModel.findByIdAndUpdate(id, data);
//   return res.status(200).json({
//     message: "Data Updated Successful",
//   });
// });

exports.SendFromProduction = async (req, res) => {
  try {
    const { production_process_id } = req.body;

    if (!production_process_id) {
      return res.status(400).json({
        success: false,
        message: "production_process_id is required",
      });
    }

    const ProductionProcess = require("../models/productionProcess");
    const proc = await ProductionProcess.findById(production_process_id);

    if (!proc) {
      return res.status(404).json({
        success: false,
        message: "Production process not found",
      });
    }

    // ✅ Update production process status
    proc.status = "dispatched";
    await proc.save();

    // Create dispatch entry
    const { DispatchModel } = require("../models/Dispatcher");
    const doc = await DispatchModel.create({
      creator: req.user?._id, // if you have auth
      production_process_id, // Save production process reference
      delivery_status: "Dispatch",
      Sale_id: [], // Optional, keep for sales link
    });

    return res.status(200).json({
      success: true,
      message: "Sent to dispatch successfully",
      data: doc,
    });
  } catch (e) {
    console.error("Error in SendFromProduction:", e);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: e.message,
    });
  }
};

// exports.GetDispatch = TryCatch(async (req, res) => {
//     const data = await ProductionProcess.aggregate([
//       {
//         $match: {
//           status: "completed"
//         }
//       },
//       {
//         $lookup: {
//           from: "users",
//           localField: "creator",
//           foreignField: "_id",
//           as: "creator",
//           pipeline: [
//             {
//               $lookup: {
//                 from: "user-roles",
//                 localField: "role",
//                 foreignField: "_id",
//                 as: "role",
//                 pipeline: [
//                   {
//                     $project: {
//                       role: 1
//                     }
//                   }
//                 ]
//               }
//             },
//             {
//               $project: {
//                 role: 1,
//                 first_name: 1
//               }
//             }
//           ]
//         }
//       },
//       {
//         $lookup: {
//           from: "products",
//           localField: "item",
//           foreignField: "_id",
//           as: "item",
//           pipeline: [
//             {
//               $project: {
//                 name: 1
//               }
//             }
//           ]
//         }
//       },
//       {
//         $lookup: {
//           from: "boms",
//           localField: "bom",
//           foreignField: "_id",
//           as: "bom",
//           pipeline: [
//             {
//               $lookup: {
//                 from: "purchases",
//                 localField: "sale_id",
//                 foreignField: "_id",
//                 as: "sale_id",
//                 pipeline: [
//                   {
//                     $lookup: {
//                       from: "users",
//                       foreignField: "_id",
//                       localField: "user_id",
//                       as: "user_id",
//                       pipeline: [
//                         {
//                           $lookup: {
//                             from: "user-roles",
//                             localField: "role",
//                             foreignField: "_id",
//                             as: "role",
//                             pipeline: [
//                               {
//                                 $project: {
//                                   role: 1
//                                 }
//                               }
//                             ]
//                           }
//                         },
//                         {
//                           $project: {
//                             role: 1,
//                             first_name: 1
//                           }
//                         }
//                       ]
//                     }
//                   },
//                   {
//                     $lookup: {
//                       from: "parties",
//                   localField: "party",
//                   foreignField: "_id",
//                       as: "customer_id",
//                       pipeline: [
//                         {
//                           $project: {
//                             full_name: 1
//                           }
//                         }
//                       ]
//                     }
//                   },
//                   {
//                     $lookup: {
//                       from: "products",
//                       localField: "product_id",
//                       foreignField: "_id",
//                       as: "product_id",
//                       pipeline: [
//                         {
//                           $project: {
//                             name: 1
//                           }
//                         }
//                       ]
//                     }
//                   },
//                 ]
//               }
//             },
//             {
//               $project: {
//                 sale_id: 1
//               }
//             }
//           ]
//         }
//       },
//       {
//         $project: {
//           creator: 1,
//           item: 1,
//           bom: 1,
//           status: 1
//         }
//       },
//       {
//         $unwind: "$bom"
//       },
//       {
//         $group: {
//           _id: "$bom.sale_id",
//           bom: { $first: "$bom" },
//           creator: { $first: "$creator" },
//           item: { $first: "$item" },
//           status: { $first: "$status" }
//         }
//       },
//       {
//         $sort: {
//           "bom.sale_id.updatedAt": -1
//         }
//       },
//       {
//         $project: {
//           creator: 1,
//           item: 1,
//           bom: 1,
//           status: 1
//         }
//       }
//     ]);

//     return res.status(200).json({
//       message: "data",
//       data
//     });
// });
