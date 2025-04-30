const BOM = require("../models/bom");
const BOMFinishedMaterial = require("../models/bom-finished-material");
const BOMRawMaterial = require("../models/bom-raw-material");
const BOMScrapMaterial = require("../models/bom-scrap-material");
const ProductionProcess = require("../models/productionProcess");
const Product = require("../models/product");
const { TryCatch, ErrorHandler } = require("../utils/error");

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
  const boms = await BOM.find({ approved: true })
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

// Inventory Personnel
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
  let areAllApproved = true;
  allRawMaterials.forEach((rm) => areAllApproved && rm.approved);
  if (areAllApproved) {
    await ProductionProcess.findByIdAndUpdate(
      { _id: requiredBom.production_process },
      { status: "raw materials approved" }
    );
  }

  res.status(200).json({
    status: 200,
    success: true,
    message: "Raw material has been approved successfully",
  });
});
