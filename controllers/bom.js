//bom controller
const mongoose = require('mongoose')
const BOM = require("../models/bom");
const BOMFinishedMaterial = require("../models/bom-finished-material");
const BOMRawMaterial = require("../models/bom-raw-material");
const BOMScrapMaterial = require("../models/bom-scrap-material");
const ProductionProcess = require("../models/productionProcess");
const Product = require("../models/product");
const Item = require("../models/product");
const { TryCatch, ErrorHandler } = require("../utils/error");
const { generateBomId } = require("../utils/generateBomId");
const path = require("path");
const fs = require("fs");
const csv = require("csvtojson");
const { parseExcelFile } = require("../utils/parseExcelFile");

exports.create = TryCatch(async (req, res) => {
  const {
    raw_materials,
    processes,
    finished_good,
    approved_by,
    approval_date,
    bom_name,
    parts_count,
    total_cost,
    scrap_materials,
    other_charges,
    remarks,
    sales,
    resources,
    manpower,
  } = req.body;

  let insuffientStockMsg = "";

  if (
    !raw_materials ||
    raw_materials.length === 0 ||
    !finished_good ||
    !bom_name ||
    bom_name.trim().length === 0 ||
    total_cost === undefined
  ) {
    throw new ErrorHandler("Please provide all the fields", 400);
  }
  if (isNaN(parts_count) || isNaN(total_cost)) {
    throw new ErrorHandler("Part's count and Total cost must be a number", 400);
  }

  const isBomFinishedGoodExists = await Product.findById(finished_good.item);
  if (!isBomFinishedGoodExists) {
    throw new ErrorHandler("Finished good doesn't exist", 400);
  }
  if (finished_good.quantity < 0) {
    throw new ErrorHandler(`Negative quantities are not allowed`, 400);
  }

  await Promise.all(
    raw_materials.map(async (material) => {
      const isProdExists = await Product.findById(material.item);
      if (!isProdExists) {
        throw new ErrorHandler(`Raw material doesn't exist`, 400);
      }
      if (material.quantity < 0) {
        throw new ErrorHandler(`Negative quantities are not allowed`, 400);
      }
      if (isProdExists.current_stock < material.quantity) {
        insuffientStockMsg += ` Insufficient stock of ${isProdExists.name}`;
      }
    })
  );

  const { item, description, quantity, image, supporting_doc, comments, cost } =
    finished_good;
  const createdFinishedGood = await BOMFinishedMaterial.create({
    item,
    description,
    quantity,
    image,
    supporting_doc,
    comments,
    cost,
  });

  // Generate auto BOM ID
  const bomId = await generateBomId();

  const bom = await BOM.create({
    bom_id: bomId,
    processes,
    finished_good: createdFinishedGood._id,
    approved_by,
    approval_date,
    bom_name,
    parts_count,
    total_cost,
    approved: req.user.isSuper,
    creator: req.user._id,
    other_charges,
    remarks,
    resources,
    manpower,
  });

  if (raw_materials) {
    const bom_raw_materials = await Promise.all(
      raw_materials.map(async (material) => {
        const isExistingMaterial = await Product.findById(material.item);
        const createdMaterial = await BOMRawMaterial.create({
          ...material,
          bom: bom._id,
        });
        return createdMaterial._id;
      })
    );

    bom.raw_materials = bom_raw_materials;
    await bom.save();
  }

  let bom_scrap_materials;
  if (scrap_materials) {
    bom_scrap_materials = await Promise.all(
      scrap_materials.map(async (material) => {
        const isExistingMaterial = await Product.findById(material.item);
        const createdMaterial = await BOMScrapMaterial.create({
          ...material,
          bom: bom._id,
        });
        return createdMaterial._id;
      })
    );

    bom.scrap_materials = bom_scrap_materials;
    await bom.save();
  }

  if (insuffientStockMsg) {
    return res.status(400).json({
      status: 400,
      success: false,
      message: "BOM has been created successfully." + insuffientStockMsg,
      bom,
    });
  }
  // await Promise.all(
  //   raw_materials.map(async (material) => {
  //     const product = await Product.findById(material.item);
  //     if (product) {
  //       product.current_stock =
  //         (product.current_stock || 0) - material.quantity;
  //       product.change_type = "decrease";
  //       product.quantity_changed = material.quantity;
  //       await product.save();
  //     }

  //   })
  // );
  // const finishedProduct = await Product.findById(finished_good.item);
  // if (finishedProduct) {
  //   finishedProduct.current_stock =
  //     (finishedProduct.current_stock || 0) + finished_good.quantity;
  //   finishedProduct.change_type = "increase";
  //   finishedProduct.quantity_changed = finished_good.quantity;
  //   await finishedProduct.save();
  // }

  res.status(200).json({
    status: 200,
    success: true,
    message: "BOM has been created successfully.",
    bom,
  });
});
exports.update = TryCatch(async (req, res) => {
  const { id } = req.params;
  const {
    approved,
    raw_materials,
    finished_good,
    bom_name,
    parts_count,
    total_cost,
    processes,
    scrap_materials,
    other_charges,
    remarks,
    resources,
    manpower,
  } = req.body;
  if (!id) {
    throw new ErrorHandler("id not provided", 400);
  }
  const bom = await BOM.findById(id)
    .populate("approved_by")
    .populate({
      path: "finished_good",
      populate: [
        {
          path: "item",
        },
      ],
    })
    .populate({
      path: "raw_materials",
      populate: [
        {
          path: "item",
        },
      ],
    })
    .populate({
      path: "scrap_materials",
      populate: [
        {
          path: "item",
        },
      ],
    });
  if (!bom) {
    throw new ErrorHandler("BOM not found", 400);
  }

  let insuffientStockMsg = "";

  if (finished_good) {
    const isBomFinishedGoodExists = await Product.findById(finished_good.item);
    if (isBomFinishedGoodExists) {
      if (finished_good.quantity < 0) {
        throw new ErrorHandler(`Negative quantities are not allowed`, 400);
      }
    }
  }

  if (raw_materials) {
    await Promise.all(
      raw_materials.map(async (material) => {
        const isRawMaterialExists = await BOMRawMaterial.findById(material._id);
        if (isRawMaterialExists) {
          const isProdExists = await Product.findById(material.item);
          if (!isProdExists) {
            throw new ErrorHandler(`Product doesn't exist`, 400);
          }
          if (material.quantity < 0) {
            throw new ErrorHandler(`Negative quantities are not allowed`, 400);
          }
          if (isProdExists.current_stock < material.quantity) {
            insuffientStockMsg += ` Insufficient stock of ${isProdExists.name}`;
          }
        }
      })
    );
  }

  if (scrap_materials) {
    await Promise.all(
      scrap_materials.map(async (material) => {
        const isScrapMaterialExists = await BOMScrapMaterial.findById(
          material._id
        );
        if (isScrapMaterialExists) {
          const isProdExists = await Product.findById(material.item);
          if (!isProdExists) {
            throw new ErrorHandler(`Product doesn't exist`, 400);
          }
        }
      })
    );
  }

  if (finished_good) {
    const isProdExists = await Product.findById(finished_good.item);
    if (finished_good.item !== bom.finished_good.item._id.toString()) {
      bom.finished_good.item = finished_good.item;
    }

    const quantityDifference =
      finished_good.quantity - bom.finished_good.quantity;

    if (bom.finished_good.quantity > finished_good.quantity) {
      bom.finished_good.quantity = finished_good.quantity;
    } else if (bom.finished_good.quantity < finished_good.quantity) {
      bom.finished_good.quantity = finished_good.quantity;
    }

    await isProdExists.save();

    bom.finished_good.cost = finished_good.cost;
    bom.finished_good.comments = finished_good?.comments;
    bom.finished_good.description = finished_good?.description;
    bom.finished_good.supporting_doc = finished_good?.supporting_doc;
  }

  if (raw_materials) {
    await Promise.all(
      raw_materials.map(async (material) => {
        try {
          const isExistingRawMaterial = await BOMRawMaterial.findById(
            material._id
          );
          const isProdExists = await Product.findById(material.item);

          if (!isProdExists) {
            throw new Error(`Product with ID ${material.item} does not exist.`);
          }

          if (isExistingRawMaterial) {
            if (isExistingRawMaterial.item.toString() !== material.item) {
              isExistingRawMaterial.item = material.item;
            }

            isExistingRawMaterial.description = material?.description;

            if (
              isExistingRawMaterial.quantity.toString() !==
              material?.quantity?.toString()
            ) {
              const quantityDifference =
                material.quantity - isExistingRawMaterial.quantity;
              if (quantityDifference > 0) {
                isExistingRawMaterial.quantity = material.quantity;
              } else {
                isExistingRawMaterial.quantity = material.quantity;
              }
            }

            isExistingRawMaterial.assembly_phase = material?.assembly_phase;
            isExistingRawMaterial.supporting_doc = material?.supporting_doc;
            isExistingRawMaterial.comments = material?.comments;
            isExistingRawMaterial.total_part_cost = material?.total_part_cost;

            await isExistingRawMaterial.save();
          } else {
            const newRawMaterial = await BOMRawMaterial.create({
              ...material,
              bom: bom._id,
            });
            bom.raw_materials.push(newRawMaterial._id);
          }
        } catch (error) {
          console.error(
            `Error processing raw material ${material._id}:`,
            error
          );
        }
      })
    );
  }

  if (scrap_materials) {
    await Promise.all(
      scrap_materials.map(async (material) => {
        try {
          const isExistingScrapMaterial = await BOMScrapMaterial.findById(
            material._id
          );
          const isProdExists = await Product.findById(material.item);

          if (!isProdExists) {
            throw new Error(`Product with ID ${material.item} does not exist.`);
          }

          if (isExistingScrapMaterial) {
            if (isExistingScrapMaterial.item.toString() !== material.item) {
              isExistingScrapMaterial.item = material.item;
            }

            isExistingScrapMaterial.description = material?.description;

            if (
              isExistingScrapMaterial.quantity.toString() !==
              material?.quantity?.toString()
            ) {
              const quantityDifference =
                material.quantity - isExistingScrapMaterial.quantity;
              if (quantityDifference > 0) {
                isExistingScrapMaterial.quantity = material.quantity;
              } else {
                isExistingScrapMaterial.quantity = material.quantity;
              }
            }
            if (
              isExistingScrapMaterial.quantity.toString() !==
              material?.quantity?.toString()
            ) {
              const quantityDifference =
                material.quantity - isExistingScrapMaterial.quantity;
              if (quantityDifference > 0) {
                isExistingScrapMaterial.quantity = material.quantity;
              } else {
                isExistingScrapMaterial.quantity = material.quantity;
              }
            }

            isExistingScrapMaterial.total_part_cost = material?.total_part_cost;

            await isExistingScrapMaterial.save();
          } else {
            const newScrapMaterial = await BOMScrapMaterial.create({
              ...material,
              bom: bom._id,
            });
            bom.scrap_materials.push(newScrapMaterial._id);
          }
        } catch (error) {
          console.error(
            `Error processing scrap material ${material._id}:`,
            error
          );
        }
      })
    );
  }

  if (processes && processes.length > 0) {
    bom.processes = processes;
  }
  if (typeof remarks === "string") {
    bom.remarks = remarks.trim();
  }
  if (Array.isArray(manpower)) {
    // Validate each manpower entry has a user
    const validManpower = manpower.filter((mp) => mp.user);
    bom.manpower = validManpower;
  }
  if (Array.isArray(resources)) {
    const validResources = resources.filter((res) => res.resource_id);
    bom.resources = validResources;
  }

  bom_name && bom_name.trim().length > 0 && (bom.bom_name = bom_name);
  parts_count && parts_count > 0 && (bom.parts_count = parts_count);
  total_cost && (bom.total_cost = total_cost);
  if (approved && req.user.isSuper) {
    bom.approved_by = req.user._id;
    bom.approved = true;
  }

  await bom.finished_good.save();
  await bom.save();

  // Update the quantity of the finished good, raw materials and scrap materials in the production process, if the production process exists
  if (bom.production_process) {
    const productionProcess = await ProductionProcess.findById(
      bom.production_process
    )
      .populate({
        path: "finished_good",
        populate: { path: "item" },
      })
      .populate({
        path: "raw_materials",
        populate: [
          {
            path: "item",
          },
        ],
      })
      .populate({
        path: "scrap_materials",
        populate: [
          {
            path: "item",
          },
        ],
      });

    productionProcess.raw_materials.forEach((rm) => {
      rm.estimated_quantity = bom.raw_materials.find(
        (m) => m.item._id.toString() === rm.item._id.toString()
      ).quantity;
    });
    productionProcess.scrap_materials.forEach((sc) => {
      sc.estimated_quantity = bom.scrap_materials.find(
        (m) => m.item._id.toString() === sc.item._id.toString()
      ).quantity;
    });

    productionProcess.finished_good.estimated_quantity =
      bom.finished_good.quantity;

    await productionProcess.save();
  }

  if (insuffientStockMsg) {
    return res.status(400).json({
      status: 400,
      success: false,
      message: "BOM has been updated successfully" + insuffientStockMsg,
    });
  }

  res.status(200).json({
    status: 200,
    success: true,
    message: "BOM has been updated successfully",
  });
});
exports.remove = TryCatch(async (req, res) => {
  const { id } = req.params;
  if (!id) {
    throw new ErrorHandler("id not provided", 400);
  }
  const bom = await BOM.findById(id);
  if (!bom) {
    throw new ErrorHandler("BOM not found", 400);
  }

  const rawMaterials = bom.raw_materials.map((material) => material._id);
  const finishedGood = bom.finished_good._id;

  await BOMRawMaterial.deleteMany({ _id: { $in: rawMaterials } });
  await BOMFinishedMaterial.deleteOne({ _id: finishedGood });

  await bom.deleteOne();
  res.status(200).json({
    status: 200,
    success: true,
    message: "BOM has been deleted successfully",
    bom,
  });
});
exports.details = TryCatch(async (req, res) => {
  const { id } = req.params;
  if (!id) {
    throw new ErrorHandler("id not provided", 400);
  }
  const bom = await BOM.findById(id)
    .populate("approved_by")
    .populate({
      path: "finished_good",
      populate: { path: "item" },
    })
    .populate({
      path: "raw_materials",
      populate: [
        {
          path: "item",
        },
      ],
    })
    .populate({
      path: "scrap_materials",
      populate: [
        {
          path: "item",
        },
      ],
    });

  if (!bom) {
    throw new ErrorHandler("BOM not found", 400);
  }
  res.status(200).json({
    status: 200,
    success: true,
    bom,
  });
});
exports.all = TryCatch(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 100;
  const skip = (page - 1) * limit;

  const boms = await BOM.find({ approved: true })
    .populate({
      path: "manpower.user",
      select: "first_name last_name email phone employeeId role",
    })

    .populate({
      path: "finished_good",
      select: "item quantity",
      populate: {
        path: "item",
        select: "name",
      },
    })
    .populate({
      path: "raw_materials",
      select: "item quantity",
      populate: {
        path: "item",
        select: "name",
      },
    })
    .populate({
      path: "scrap_materials",
      select: "item quantity",
      populate: {
        path: "item",
        select: "name",
      },
    })
    .populate({
      path: "resources.resource_id",
      select: "name type specification",
    })
    .sort({ updatedAt: -1 })
    .skip(skip)
    .limit(limit);

  const transformedBoms = boms.map((bom) => {
    const bomObj = bom.toObject();
    bomObj.resources = bomObj.resources.map((res) => ({
      name: res.resource_id?.name || "",
      type: res.resource_id?.type || res.type,
      specification: res.resource_id?.specification || res.specification,
    }));

    return bomObj;
  });

  res.status(200).json({
    status: 200,
    success: true,
    message: "Approved BOMs fetched successfully",
    count: transformedBoms.length,
    page,
    limit,
    boms: transformedBoms,
  });
});

exports.unapproved = TryCatch(async (req, res) => {
  const boms = await BOM.find({ approved: false })
    .populate("approved_by")
    .populate({
      path: "finished_good",
      populate: [
        {
          path: "item",
        },
      ],
    })
    .populate({
      path: "raw_materials",
      populate: [
        {
          path: "item",
        },
      ],
    })
    .sort({ updatedAt: -1 });

  res.status(200).json({
    status: 200,
    success: true,
    boms,
  });
});



exports.autoBom = TryCatch(async (req, res) => {
  const ObjectId = mongoose.Types.ObjectId;

  const { product_id, quantity, price } = req.query;
  const QUANTITY = Number(quantity);

  if (!product_id) {
    throw new ErrorHandler("product id is required", 400);
  }

  // Mongo Query to find full BOM detail against product_name
  // const boms = await BOM.aggregate([

  //   // Finished Good lookup (unchanged)
  //   {
  //     $lookup: {
  //       from: "bom-finished-materials",
  //       localField: "finished_good",
  //       foreignField: "_id",
  //       as: "finished_good"
  //     }
  //   },
  //   { $unwind: "$finished_good" },
  //   {
  //     $lookup: {
  //       from: "products",
  //       localField: "finished_good.item",
  //       foreignField: "_id",
  //       as: "finished_good.item"
  //     }
  //   },
  //   { $unwind: "$finished_good.item" },

  //   // Raw Materials lookup (unchanged)
  //   { $unwind: { path: "$raw_materials", preserveNullAndEmptyArrays: true } },
  //   {
  //     $lookup: {
  //       from: "bom-raw-materials",
  //       localField: "raw_materials",
  //       foreignField: "_id",
  //       as: "raw_materials.item"
  //     }
  //   },
  //   { $unwind: { path: "$raw_materials.item", preserveNullAndEmptyArrays: true } },

  //   // NEW: Populate raw_materials.item.item (product document)
  //   {
  //     $lookup: {
  //       from: "products",
  //       localField: "raw_materials.item.item",
  //       foreignField: "_id",
  //       as: "raw_materials.item.item"
  //     }
  //   },
  //   { $unwind: { path: "$raw_materials.item.item", preserveNullAndEmptyArrays: true } },

  //   {
  //     $group: {
  //       _id: "$_id",
  //       doc: { $first: "$$ROOT" },
  //       raw_materials: { $push: "$raw_materials" }
  //     }
  //   },
  //   {
  //     $addFields: {
  //       "doc.raw_materials": {
  //         $cond: [
  //           { $eq: [{ $arrayElemAt: ["$raw_materials", 0] }, null] },
  //           [],
  //           "$raw_materials"
  //         ]
  //       }
  //     }
  //   },
  //   { $replaceRoot: { newRoot: "$doc" } },

  //   // Scrap Materials lookup (unchanged)
  //   { $unwind: { path: "$scrap_materials", preserveNullAndEmptyArrays: true } },
  //   {
  //     $lookup: {
  //       from: "bom-scrap-materials",
  //       localField: "scrap_materials",
  //       foreignField: "_id",
  //       as: "scrap_materials.item"
  //     }
  //   },
  //   { $unwind: { path: "$scrap_materials.item", preserveNullAndEmptyArrays: true } },

  //   // NEW: Populate scrap_materials.item.item (product document)
  //   {
  //     $lookup: {
  //       from: "products",
  //       localField: "scrap_materials.item.item",
  //       foreignField: "_id",
  //       as: "scrap_materials.item.item"
  //     }
  //   },
  //   { $unwind: { path: "$scrap_materials.item.item", preserveNullAndEmptyArrays: true } },

  //   {
  //     $group: {
  //       _id: "$_id",
  //       doc: { $first: "$$ROOT" },
  //       scrap_materials: { $push: "$scrap_materials" }
  //     }
  //   },
  //   {
  //     $addFields: {
  //       "doc.scrap_materials": {
  //         $cond: [
  //           { $eq: [{ $arrayElemAt: ["$scrap_materials", 0] }, null] },
  //           [],
  //           "$scrap_materials"
  //         ]
  //       }
  //     }
  //   },
  //   { $replaceRoot: { newRoot: "$doc" } }

  // ]);

  // Mongo Query to find full BOM detail against product_name
  // const boms = await BOM.aggregate([

  //   // Finished Good lookup (unchanged)
  //   {
  //     $lookup: {
  //       from: "bom-finished-materials",
  //       localField: "finished_good",
  //       foreignField: "_id",
  //       as: "finished_good"
  //     }
  //   },
  //   { $unwind: "$finished_good" },
  //   {
  //     $lookup: {
  //       from: "products",
  //       localField: "finished_good.item",
  //       foreignField: "_id",
  //       as: "finished_good.item"
  //     }
  //   },
  //   { $unwind: "$finished_good.item" },
  //   {
  //     $match: {
  //       "finished_good.item.name": product_name
  //     }
  //   },

  //   // // Raw Materials lookup (unchanged)
  //   { $unwind: { path: "$raw_materials", preserveNullAndEmptyArrays: true } },
  //   {
  //     $lookup: {
  //       from: "bom-raw-materials",
  //       localField: "raw_materials",
  //       foreignField: "_id",
  //       as: "raw_materials.item"
  //     }
  //   },
  //   { $unwind: { path: "$raw_materials.item", preserveNullAndEmptyArrays: true } },

  //   // // NEW: Populate raw_materials.item.item (product document)
  //   {
  //     $lookup: {
  //       from: "products",
  //       localField: "raw_materials.item.item",
  //       foreignField: "_id",
  //       as: "raw_materials.item.item"
  //     }
  //   },
  //   { $unwind: { path: "$raw_materials.item.item", preserveNullAndEmptyArrays: true } },

  //   {
  //     $group: {
  //       _id: "$_id",
  //       doc: { $first: "$$ROOT" },
  //       raw_materials: { $push: "$raw_materials" }
  //     }
  //   },
  //   {
  //     $addFields: {
  //       "doc.raw_materials": {
  //         $cond: [
  //           { $eq: [{ $arrayElemAt: ["$raw_materials", 0] }, null] },
  //           [],
  //           "$raw_materials"
  //         ]
  //       }
  //     }
  //   },
  //   { $replaceRoot: { newRoot: "$doc" } },

  //   // Scrap Materials lookup (unchanged)
  //   { $unwind: { path: "$scrap_materials", preserveNullAndEmptyArrays: true } },
  //   {
  //     $lookup: {
  //       from: "bom-scrap-materials",
  //       localField: "scrap_materials",
  //       foreignField: "_id",
  //       as: "scrap_materials.item"
  //     }
  //   },
  //   { $unwind: { path: "$scrap_materials.item", preserveNullAndEmptyArrays: true } },

  //   // NEW: Populate scrap_materials.item.item (product document)
  //   {
  //     $lookup: {
  //       from: "products",
  //       localField: "scrap_materials.item.item",
  //       foreignField: "_id",
  //       as: "scrap_materials.item.item"
  //     }
  //   },
  //   { $unwind: { path: "$scrap_materials.item.item", preserveNullAndEmptyArrays: true } },

  //   {
  //     $group: {
  //       _id: "$_id",
  //       doc: { $first: "$$ROOT" },
  //       scrap_materials: { $push: "$scrap_materials" }
  //     }
  //   },
  //   {
  //     $addFields: {
  //       "doc.scrap_materials": {
  //         $cond: [
  //           { $eq: [{ $arrayElemAt: ["$scrap_materials", 0] }, null] },
  //           [],
  //           "$scrap_materials"
  //         ]
  //       }
  //     }
  //   },
  //   { $replaceRoot: { newRoot: "$doc" } }

  // ]);

  // Mongo query to find BOM _id against product name
  // const result = await BOM.aggregate([
  //   // Step 1: Lookup finished_good doc
  //   {
  //     $lookup: {
  //       from: "bom-finished-materials",
  //       localField: "finished_good",
  //       foreignField: "_id",
  //       as: "finished_good"
  //     }
  //   },
  //   { $unwind: "$finished_good" },
  //   // Step 2: Lookup product from finished_good.item
  //   {
  //     $lookup: {
  //       from: "products",
  //       localField: "finished_good.item",
  //       foreignField: "_id",
  //       as: "finished_good.item"
  //     }
  //   },
  //   { $unwind: "$finished_good.item" },
  //   // Step 3: Match product name
  //   {
  //     $match: {
  //       "finished_good.item.name": product_name
  //     }
  //   },
  //   // Step 4: Project only BOM _id
  //   { $unwind: "$finished_good.item.name" },
  //   {
  //     $project: {
  //       _id: 1
  //     }
  //   },

  // ]);

  const result = await BOM.aggregate([
    {
      $lookup: {
        from: "bom-finished-materials",
        localField: "finished_good",
        foreignField: "_id",
        as: "finished_good",
      },
    },
    { $unwind: "$finished_good" },
    {
      $lookup: {
        from: "products",
        localField: "finished_good.item",
        foreignField: "_id",
        as: "finished_good.item",
      },
    },
    { $unwind: "$finished_good.item" },
    {
      $match: {
        "finished_good.item._id": new ObjectId(product_id),
      },
    },
    {
      $project: {
        _id: 1,
      },
    },
  ]);

  if (result.length === 0) {
    return res.status(400).json({
      status: 400,
      success: false,
      boms: "BOM does not exists",
    });
  }
  // const bomDoc = await BOM.findById(result[0]).populate('finished_good');
  // const bomDoc = await BOM.findById(result[0]._id).populate('finished_good');

  // bomDoc.finished_good.quantity = Number(quantity);
  // bomDoc.finished_good = bomDoc.finished_good._id;
  // const finalBom = await BOM.create(bomDoc);
  // await finalBom.save();
  // Fetch original BOM document with populate


  if (result.length === 0) {
    return res.status(400).json({
      status: 400,
      success: false,
      boms: "BOM does not exists"

    })
  }

  const originalBomDoc = await BOM.findById(result[0]._id)
    .populate({ path: 'finished_good', populate: { path: 'item' } })
    .populate({ path: 'raw_materials', populate: { path: 'item' } })
    .populate({ path: 'scrap_materials', populate: { path: 'item' } });
  console.log("quantity", QUANTITY)
  console.log("original wala", originalBomDoc);
  console.log("+++++++++++");



  // Prepare new BOM object in memory (not saved to DB)
  const newFinishedGood = {
    ...originalBomDoc.finished_good.toObject(),
    _id: new mongoose.Types.ObjectId(),
    quantity: QUANTITY,
    cost: Math.round(((price || originalBomDoc?.finished_good?.item?.price) * QUANTITY) * 100) / 100 // Round to 2 decimal places
  };
  const prod = await Product.findById(newFinishedGood.item);
  newFinishedGood.item = prod;

  // // Create a plain object copy without _id (so that new document can be created)
  // const newBomData = bomDoc.toObject();
  // delete newBomData._id;
  const newBomDoc = {
    ...originalBomDoc.toObject(),
    finished_good: newFinishedGood,
    raw_materials: undefined, // will be replaced with newRawMaterials
    scrap_materials: undefined // will be replaced with newScrapMaterials
  };
  // Calculation reference
  const oldFinishedGoodQty = originalBomDoc.finished_good.quantity;
  const newFinishedGoodQty = QUANTITY;

  // Prepare new raw materials with recalculated quantity and price
  const newRawMaterials = originalBomDoc.raw_materials.map((rm) => {
    const unitQty = rm.quantity / oldFinishedGoodQty;
    const unitPrice = rm.quantity > 0 ? (rm.total_part_cost || 0) / rm.quantity : 0;
    const newQty = unitQty * newFinishedGoodQty;
    return {
      ...rm.toObject(),
      _id: new mongoose.Types.ObjectId(), // always generate new ID
      quantity: Math.round(newQty * 100) / 100, // Round to 2 decimal places
      total_part_cost: Math.round((unitPrice * newQty) * 100) / 100, // Round to 2 decimal places
      bom: undefined // will be set after BOM is created
    };
  });

  const bomDoc = await BOM.findById(result[0]._id).populate("finished_good");
  // Prepare new scrap materials with recalculated quantity and price
  const newScrapMaterials = originalBomDoc.scrap_materials.map((sc) => {
    const unitQty = sc.quantity / oldFinishedGoodQty;
    const unitPrice = sc.quantity > 0 ? (sc.total_part_cost || 0) / sc.quantity : 0;
    const newQty = unitQty * newFinishedGoodQty;
    return {
      ...sc.toObject(),
      _id: new mongoose.Types.ObjectId(), // always generate new ID
      quantity: Math.round(newQty * 100) / 100, // Round to 2 decimal places
      total_part_cost: Math.round((unitPrice * newQty) * 100) / 100, // Round to 2 decimal places
      bom: undefined // will be set after BOM is created
    };
  });



  // Keep original product _id for item references in newRawMaterials
  for (let i = 0; i < newRawMaterials.length; i++) {
    // Keep the original product _id, don't create a new one
    // newRawMaterials[i].item already contains the original ObjectId
  }

  // Now prepare BOM
  const newBomData = bomDoc.toObject();
  delete newBomData._id; // Remove old BOM _id
  delete newBomData.bom_id;
  // Keep original product _id for item references in newScrapMaterials
  for (let i = 0; i < newScrapMaterials.length; i++) {
    // Keep the original product _id, don't create a new one
    // newScrapMaterials[i].item already contains the original ObjectId
  }

  console.log("raw---", newRawMaterials);
  console.log("scrap", newScrapMaterials)

  const bomId = await generateBomId();
  newBomData.bom_id = bomId;

  // Create new BOM
  const finalBom = await BOM.create(newBomData);
  // Keep original product _id for finished_good item
  if (newBomDoc.finished_good && newBomDoc.finished_good.item) {
    // Keep the original product _id, don't create a new one
    // newBomDoc.finished_good.item already contains the original ObjectId
  }

  // First create the BOM without materials to get its _id
  const bomWithoutMaterials = {
    ...newBomDoc,
    raw_materials: [],
    scrap_materials: []

  };
  console.log("------->>", bomWithoutMaterials)
  delete bomWithoutMaterials._id;
  console.log("**********>>", bomWithoutMaterials);

  const savedBom = await BOM.create(bomWithoutMaterials);
  console.log("savedDom--->>>", savedBom);
  // Create BOMFinishedMaterial document (no bom field needed)
  const createdFinishedGood = await BOMFinishedMaterial.create({
    ...newBomDoc.finished_good
  });

  // Create BOMRawMaterial documents with the BOM's _id
  const createdRawMaterials = await Promise.all(
    newRawMaterials.map(async (rm) => {
      const rawMaterial = await BOMRawMaterial.create({
        ...rm,
        bom: savedBom._id
      });
      return rawMaterial._id; // Return the ObjectId reference
    })
  );

  // Create BOMScrapMaterial documents with the BOM's _id
  const createdScrapMaterials = await Promise.all(
    newScrapMaterials.map(async (sm) => {
      const scrapMaterial = await BOMScrapMaterial.create({
        ...sm,
        bom: savedBom._id
      });
      return scrapMaterial._id; // Return the ObjectId reference
    })
  );
  console.log("!!!!-____", createdRawMaterials);
  console.log("!!!!-____", createdScrapMaterials);


  // Update the saved BOM with the created material references
  savedBom.finished_good = createdFinishedGood._id;
  savedBom.raw_materials = createdRawMaterials;
  savedBom.scrap_materials = createdScrapMaterials;
  await savedBom.save();

  console.log('newBomDoc:', newBomDoc);

  console.log("here");
  res.status(200).json({
    status: 200,
    success: true,
    // boms: finalBom,
    boms: "orignia",
    originalBomDoc: originalBomDoc,
    newBomDoc: newBomDoc
  });
});


exports.findFinishedGoodBom = TryCatch(async (req, res) => {
  const { _id } = req.params;
  if (!_id) {
    throw new ErrorHandler("Id not provided", 400);
  }

  const allBoms = await BOM.find().populate("finished_good");
  const boms = allBoms.filter((bom) => {
    return bom.finished_good.item.toString() === _id;
  });

  res.status(200).json({
    status: 200,
    success: true,
    boms: boms,
  });
});

// Super Admin
exports.unapprovedRawMaterialsForAdmin = TryCatch(async (req, res) => {
  const unapprovedProducts = await BOMRawMaterial.find({
    approvedByAdmin: false,
  })
    .sort({
      updatedAt: -1,
    })
    .populate({
      path: "bom",
      populate: {
        path: "raw_materials",
        populate: {
          path: "item",
        },
      },
    });

  const unapprovedRawMaterials = unapprovedProducts.flatMap((prod) => {
    const rm = prod.bom.raw_materials.filter(
      (i) => i.item._id.toString() === prod.item.toString()
    )[0];

    return {
      bom_name: prod.bom._doc.bom_name,
      ...rm.item._doc,
      _id: prod._id,
    };
  });

  res.status(200).json({
    status: 200,
    success: true,
    unapproved: unapprovedRawMaterials,
  });
});

// Super Admin
exports.approveRawMaterialForAdmin = TryCatch(async (req, res) => {
  if (!req.user.isSuper) {
    throw new ErrorHandler(
      "You are not allowed to perform this operation",
      401
    );
  }
  const { _id } = req.body;
  if (!_id) {
    throw new ErrorHandler("Raw material id not provided", 400);
  }

  const updatedRawMaterial = await BOMRawMaterial.findByIdAndUpdate(
    { _id },
    { approvedByAdmin: true },
    { new: true }
  );

  res.status(200).json({
    status: 200,
    success: true,
    message: "Raw material's approval sent to inventory personnel successfully",
  });
});

// Inventory Personnel
exports.unapprovedRawMaterials = TryCatch(async (req, res) => {
  const unapprovedProducts = await BOMRawMaterial.find({
    approvedByInventoryPersonnel: false,
  })
    .sort({
      updatedAt: -1,
    })
    .populate({
      path: "bom",
      // match: { production_process: { $exists: true } }, //new condition to filter BOMs with production_process
      populate: {
        path: "raw_materials",
        populate: {
          path: "item",
        },
      },
    });

  const unapprovedRawMaterials = unapprovedProducts.flatMap((prod) => {
    const rm = prod.bom.raw_materials.find(
      (i) => i.item._id.toString() === prod.item.toString()
    );

    return {
      bom_id: prod.bom._id, // required to update status
      bom_name: prod.bom.bom_name,
      bom_status: prod.bom.production_process_status || "raw material approval pending", // optional fallback
      ...rm.item._doc,
      _id: prod._id, // raw material ID
    };
  });


  res.status(200).json({
    status: 200,
    success: true,
    unapproved: unapprovedRawMaterials,
  });
});

// Inventory Personnel
exports.approveRawMaterial = TryCatch(async (req, res) => {
  const { _id } = req.body;
  // console.log("Raw material id:", _id);
  if (!_id) {
    throw new ErrorHandler("Raw material id not provided", 400);
  }

  const updatedRawMaterial = await BOMRawMaterial.findByIdAndUpdate(
    { _id },
    { approvedByInventoryPersonnel: true },
    { new: true }
  );
  const requiredBom = await BOM.findById(updatedRawMaterial.bom).populate(
    "raw_materials"
  );
  const allRawMaterials = requiredBom.raw_materials;

  let areAllApproved = allRawMaterials.every(
    (rm) => rm.approvedByInventoryPersonnel
  );

  if (areAllApproved && requiredBom.production_process) {
    await ProductionProcess.findByIdAndUpdate(requiredBom.production_process, {
      status: "Inventory Allocated",
    });
  }

  res.status(200).json({
    status: 200,
    success: true,
    message: "Raw material has been approved successfully",
  });
});

// GET /api/bom/weekly
exports.bomsGroupedByWeekDay = TryCatch(async (req, res) => {
  const allBoms = await BOM.find({ approved: true }).select(
    "bom_name createdAt"
  );

  const result = {};

  allBoms.forEach((bom) => {
    const day = new Date(bom.createdAt).toLocaleDateString("en-IN", {
      timeZone: "Asia/Kolkata",
      weekday: "long",
    });

    if (!result[day]) result[day] = [];

    result[day].push({
      name: bom.bom_name,
      date: new Date(bom.createdAt).toLocaleDateString("en-IN"),
      id: bom._id,
    });
  });

  res.status(200).json({
    success: true,
    weekMap: result,
  });
});

exports.allRawMaterialsForInventory = TryCatch(async (req, res) => {
  const allRawMaterials = await BOMRawMaterial.find()
    .populate("item") // ✅ To get product details like name, product_id, price
    .populate({
      path: "bom",
      select: "bom_name production_process",
      populate: {
        path: "raw_materials.item", // fully populate nested items
      },
    });

  const results = [];

  for (const rm of allRawMaterials) {
    const bom = rm.bom;

    if (!bom || !bom.production_process) continue;

    const productionProcess = await ProductionProcess.findById(bom.production_process);
    if (!productionProcess) continue;

    const item = rm.item;

    results.push({
      _id: rm._id,
      bom_id: bom._id,
      bom_name: bom.bom_name,
      bom_status: productionProcess.status,
      production_process_id: productionProcess._id,
      product_id: item?.product_id,
      name: item?.name,
      inventory_category: item?.inventory_category,
      uom: item?.uom,
      category: item?.category,
      current_stock: item?.current_stock,
      price: item?.price,
      approved: item?.approved,
      item_type: item?.item_type,
      product_or_service: item?.product_or_service,
      store: item?.store,
      createdAt: rm.createdAt,
      updatedAt: rm.updatedAt,
      __v: rm.__v,
      change_type: rm.change_type,
      quantity_changed: rm.quantity_changed,
    });
  }

  res.status(200).json({
    status: 200,
    success: true,
    unapproved: results,
  });
});

// exports.bulkUploadBOMHandler = TryCatch(async (req, res) => {
//   const ext = path.extname(req.file.originalname).toLowerCase();
//   let parsedData = [];

//   if (!req.file) {
//     throw new ErrorHandler("No file uploaded", 400);
//   }

//   try {
//     if (ext === ".csv") {
//       parsedData = await csv().fromFile(req.file.path);
//     } else if (ext === ".xlsx") {
//       parsedData = parseExcelFile(req.file.path);
//     } else {
//       throw new ErrorHandler("Unsupported file type. Please upload .csv or .xlsx", 400);
//     }

//     fs.unlink(req.file.path, () => { }); // Remove uploaded file

//     if (!Array.isArray(parsedData) || parsedData.length === 0) {
//       throw new ErrorHandler("No valid data found in uploaded file", 400);
//     }

//     const createdBOMs = [];

//     for (const bomData of parsedData) {
//       const {
//         bom_name,
//         parts_count,
//         total_cost,
//         raw_materials,
//         finished_good,
//         processes,
//         other_charges,
//         remarks,
//       } = bomData;

//       let parsedRawMaterials = [];
//       let parsedFinishedGood = {};

//       try {
//         parsedRawMaterials = JSON.parse(raw_materials);
//         if (!Array.isArray(parsedRawMaterials)) throw new Error();
//       } catch (err) {
//         throw new ErrorHandler(`Invalid JSON format for raw_materials in BOM: ${bom_name}`, 400);
//       }

//       try {
//         parsedFinishedGood = JSON.parse(finished_good);
//       } catch (err) {
//         throw new ErrorHandler(`Invalid JSON format for finished_good in BOM: ${bom_name}`, 400);
//       }

//       const createdFinishedGood = await BOMFinishedMaterial.create({
//         item: parsedFinishedGood.item,
//         description: parsedFinishedGood.description,
//         quantity: parsedFinishedGood.quantity,
//         image: parsedFinishedGood.image,
//         supporting_doc: parsedFinishedGood.supporting_doc,
//         comments: parsedFinishedGood.comments,
//         cost: parsedFinishedGood.cost,
//       });

//       const bom = await BOM.create({
//         bom_name,
//         parts_count,
//         total_cost,
//         processes,
//         other_charges,
//         remarks,
//         approved_by: req.user._id,
//         approval_date: new Date(),
//         approved: req.user.isSuper,
//         creator: req.user._id,
//         finished_good: createdFinishedGood._id,
//       });

//       const bom_raw_materials = await Promise.all(
//         parsedRawMaterials.map(async (material) => {
//           const createdMaterial = await BOMRawMaterial.create({
//             ...material,
//             bom: bom._id,
//           });
//           return createdMaterial._id;
//         })
//       );

//       bom.raw_materials = bom_raw_materials;
//       await bom.save();
//       createdBOMs.push(bom);
//     }

//     res.status(200).json({
//       success: true,
//       message: "Bulk BOM upload successful",
//       boms: createdBOMs,
//     });
//   } catch (error) {
//     res.status(400).json({
//       success: false,
//       message: error.message || "Bulk BOM upload failed",
//     });
//   }
// });