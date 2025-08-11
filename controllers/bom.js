const mongoose = require('mongoose');
const BOM = require("../models/bom");
const BOMFinishedMaterial = require("../models/bom-finished-material");
const BOMRawMaterial = require("../models/bom-raw-material");
const BOMScrapMaterial = require("../models/bom-scrap-material");
const ProductionProcess = require("../models/productionProcess");
const Product = require("../models/product");
const InventoryShortage = require("../models/inventoryShortage");
const { TryCatch, ErrorHandler } = require("../utils/error");
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
    resources,
    manpower
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

  // Check for stock and calculate shortages
  const shortages = [];
  await Promise.all(
    raw_materials.map(async (material) => {
      const isProdExists = await Product.findById(material.item);
      if (!isProdExists) {
        throw new ErrorHandler(`Raw material doesn't exist`, 400);
      }
      const quantityDifference = material.quantity - (isProdExists.current_stock || 0);
      if (quantityDifference > 0) {
        insuffientStockMsg += ` Insufficient stock of ${isProdExists.name}`;
        shortages.push({
          item: material.item,
          shortage_quantity: quantityDifference,
        });
      }
    })
  );

  const { item, description, quantity, image, supporting_doc, comments, cost } =
    finished_good;

  // Calculate the increase in finished good quantity based on negative raw material quantities
  const totalRawMaterialDecrease = raw_materials
    .filter(material => material.quantity < 0)
    .reduce((sum, material) => sum + Math.abs(material.quantity), 0);

  const adjustedFinishedGoodQuantity = quantity + totalRawMaterialDecrease;

  const createdFinishedGood = await BOMFinishedMaterial.create({
    item,
    description,
    quantity: adjustedFinishedGoodQuantity,
    image,
    supporting_doc,
    comments,
    cost,
  });

  const bom = await BOM.create({
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
    manpower
  });

  if (raw_materials) {
    const bom_raw_materials = await Promise.all(
      raw_materials.map(async (material) => {
        const isExistingMaterial = await Product.findById(material.item);
        const createdMaterial = await BOMRawMaterial.create({
          ...material,
          bom: bom._id,
        });

        // Store shortages in InventoryShortage collection
        const shortage = shortages.find(s => s.item.toString() === material.item.toString());
        if (shortage) {
          await InventoryShortage.create({
            bom: bom._id,
            raw_material: createdMaterial._id,
            item: material.item,
            shortage_quantity: shortage.shortage_quantity,
          });
        }

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

  await Promise.all(
    raw_materials.map(async (material) => {
      const product = await Product.findById(material.item);
      if (product) {
        product.current_stock =
          (product.current_stock || 0) - material.quantity;
        product.change_type = material.quantity >= 0 ? "decrease" : "increase";
        product.quantity_changed = Math.abs(material.quantity);
        await product.save();
      }
    })
  );

  const finishedProduct = await Product.findById(finished_good.item);
  if (finishedProduct) {
    finishedProduct.current_stock =
      (finishedProduct.current_stock || 0) + adjustedFinishedGoodQuantity;
    finishedProduct.change_type = adjustedFinishedGoodQuantity >= 0 ? "increase" : "decrease";
    finishedProduct.quantity_changed = Math.abs(adjustedFinishedGoodQuantity);
    await finishedProduct.save();
  }

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
    manpower
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
  const shortages = [];

  if (finished_good) {
    const isBomFinishedGoodExists = await Product.findById(finished_good.item);
    if (!isBomFinishedGoodExists) {
      throw new ErrorHandler("Finished good doesn't exist", 400);
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
          const quantityDifference = material.quantity - (isProdExists.current_stock || 0);
          if (quantityDifference > 0) {
            insuffientStockMsg += ` Insufficient stock of ${isProdExists.name}`;
            shortages.push({
              item: material.item,
              raw_material_id: material._id,
              shortage_quantity: quantityDifference,
            });
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

    // Calculate the increase in finished good quantity based on negative raw material quantities
    const totalRawMaterialDecrease = raw_materials
      ? raw_materials
          .filter(material => material.quantity < 0)
          .reduce((sum, material) => sum + Math.abs(material.quantity), 0)
      : 0;

    const adjustedFinishedGoodQuantity = finished_good.quantity + totalRawMaterialDecrease;

    bom.finished_good.quantity = adjustedFinishedGoodQuantity;

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
            isExistingRawMaterial.quantity = material.quantity;
            isExistingRawMaterial.assembly_phase = material?.assembly_phase;
            isExistingRawMaterial.supporting_doc = material?.supporting_doc;
            isExistingRawMaterial.comments = material?.comments;
            isExistingRawMaterial.total_part_cost = material?.total_part_cost;

            await isExistingRawMaterial.save();

            // Update or create shortage record
            const shortage = shortages.find(s => s.item.toString() === material.item.toString());
            if (shortage) {
              await InventoryShortage.findOneAndUpdate(
                { bom: bom._id, raw_material: material._id },
                { shortage_quantity: shortage.shortage_quantity },
                { upsert: true, new: true }
              );
            } else {
              await InventoryShortage.deleteOne({ bom: bom._id, raw_material: material._id });
            }
          } else {
            const newRawMaterial = await BOMRawMaterial.create({
              ...material,
              bom: bom._id,
            });
            bom.raw_materials.push(newRawMaterial._id);

            // Store new shortage if applicable
            const shortage = shortages.find(s => s.item.toString() === material.item.toString());
            if (shortage) {
              await InventoryShortage.create({
                bom: bom._id,
                raw_material: newRawMaterial._id,
                item: material.item,
                shortage_quantity: shortage.shortage_quantity,
              });
            }
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
            isExistingScrapMaterial.quantity = material.quantity;
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
    const validManpower = manpower.filter(mp => mp.user);
    bom.manpower = validManpower;
  }
  if (Array.isArray(resources)) {
    const validResources = resources.filter(res => res.resource_id);
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
      const matchingMaterial = bom.raw_materials.find(
        (m) => m.item._id.toString() === rm.item._id.toString()
      );
      if (matchingMaterial) {
        rm.estimated_quantity = matchingMaterial.quantity;
      }
    });
    productionProcess.scrap_materials.forEach((sc) => {
      const matchingMaterial = bom.scrap_materials.find(
        (m) => m.item._id.toString() === sc.item._id.toString()
      );
      if (matchingMaterial) {
        sc.estimated_quantity = matchingMaterial.quantity;
      }
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
  await InventoryShortage.deleteMany({ bom: id });

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
      name: res.resource_id?.name || '',
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

  const { product_id, quantity } = req.query;
  
  if (!product_id) {
    throw new ErrorHandler("product id is required", 400);
  }

  const result = await BOM.aggregate([
    {
      $lookup: {
        from: "bom-finished-materials",
        localField: "finished_good",
        foreignField: "_id",
        as: "finished_good"
      }
    },
    { $unwind: "$finished_good" },
    {
      $lookup: {
        from: "products",
        localField: "finished_good.item",
        foreignField: "_id",
        as: "finished_good.item"
      }
    },
    { $unwind: "$finished_good.item" },
    {
      $match: {
        "finished_good.item._id": new ObjectId(product_id)
      }
    },
    {
      $project: {
        _id: 1
      }
    }
  ]);

  if (result.length === 0) {
    return res.status(400).json({
      status: 400,
      success: false,
      boms: "BOM does not exist"
    });
  }

  const bomDoc = await BOM.findById(result[0]._id).populate('finished_good');

  const finishedGoodDoc = bomDoc.finished_good.toObject();
  delete finishedGoodDoc._id;

  finishedGoodDoc.quantity = Number(quantity);

  const newFinishedGood = await BOMFinishedMaterial.create(finishedGoodDoc);

  const newBomData = bomDoc.toObject();
  delete newBomData._id;

  newBomData.finished_good = newFinishedGood._id;

  const finalBom = await BOM.create(newBomData);

  res.status(200).json({
    status: 200,
    success: true,
    boms: finalBom
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

exports.unapprovedRawMaterials = TryCatch(async (req, res) => {
  const unapprovedProducts = await BOMRawMaterial.find({
    approvedByInventoryPersonnel: false,
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

exports.approveRawMaterial = TryCatch(async (req, res) => {
  const { _id } = req.body;
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
      status: "raw materials approved",
    });
  }

  res.status(200).json({
    status: 200,
    success: true,
    message: "Raw material has been approved successfully",
  });
});

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

exports.getInventoryShortages = TryCatch(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 100;
  const skip = (page - 1) * limit;

  const shortages = await InventoryShortage.find()
    .populate({
      path: "item",
      select: "name current_stock price",
    })
    .populate({
      path: "bom",
      select: "bom_name",
    })
    .sort({ updatedAt: -1 })
    .skip(skip)
    .limit(limit);

  const formattedShortages = shortages.map(shortage => ({
    bom_name: shortage.bom?.bom_name || 'Unknown BOM',
    item_name: shortage.item?.name || 'Unknown Item',
    item: shortage.item?._id || null,
    shortage_quantity: shortage.shortage_quantity,
    current_stock: shortage.item?.current_stock || 0,
    current_price: shortage.item?.price || 0,
    updated_at: shortage.updatedAt,
  }));

  res.status(200).json({
    status: 200,
    success: true,
    message: "Inventory shortages fetched successfully",
    count: formattedShortages.length,
    page,
    limit,
    shortages: formattedShortages,
  });
});