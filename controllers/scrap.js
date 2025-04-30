const { TryCatch } = require("../utils/error");
const ProductionProcess = require("../models/productionProcess");

exports.all = TryCatch(async (req, res) => {
  const scraps = [];

  const processes = await ProductionProcess.find({
    $or: [
      { status: 'work in progress' },
      { status: 'completed' }
    ]
  }).populate({
    path: "bom",
    populate: [
      {
        path: "scrap_materials",
        populate: {
          path: "item"
        }
      },
      {
        path: "finished_good",
        populate: {
          path: "item"
        }
      }
    ],
  });

  processes.forEach((material) => {
    material.scrap_materials.forEach((sc) => {
      const bomItem = material.bom.scrap_materials.find(
        (m) => m.item._id.toString() === sc.item._id.toString()
      );

      scraps.push({
        ...sc._doc,
        total_part_cost: bomItem.total_part_cost,
        item: bomItem.item,
        bom: material.bom._doc,
        createdAt: material.createdAt,
        updatedAt: material.updatedAt,
      });
    });
  });

  res.status(200).json({
    status: 200,
    success: true,
    scraps,
  });
});
