const ProductionProcess = require("../models/productionProcess");
const BOM = require("../models/bom");
const BOMRawMaterial = require("../models/bom-raw-material");
const BOMScrapMaterial = require("../models/bom-scrap-material");
const Product = require("../models/product");
const { TryCatch, ErrorHandler } = require("../utils/error");

exports.create = TryCatch(async (req, res) => {
  const processData = req.body;
  if (!processData) {
    throw new ErrorHandler("Please provide all the fields", 400);
  }

  const bom = await BOM.findById(processData.bom)
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
    throw new ErrorHandler("BOM doesn't exist", 400);
  }

  const finished_good = {
    item: bom.finished_good.item._id,
    estimated_quantity: bom.finished_good.quantity,
  };

  const processes = bom.processes.map((process) => ({
    process: process,
  }));

  const raw_materials = bom.raw_materials.map((material) => ({
    item: material.item._id,
    estimated_quantity: material.quantity,
  }));

  const scrap_materials = bom.scrap_materials.map((material) => ({
    item: material.item._id,
    estimated_quantity: material.quantity,
  }));

  const productionProcess = await ProductionProcess.create({
    ...processData,
    finished_good,
    processes,
    raw_materials,
    scrap_materials,
    creator: req.user._id,
    approved: req.user.isSuper || false,
  });

  bom.production_process = productionProcess._id;
  bom.is_production_started = true;
  await bom.save();

  res.status(200).json({
    status: 200,
    success: true,
    message: "Process has been created successfully",
  });
});
exports.update = async (req, res) => {
  const { _id, status, bom } = req.body;

  const productionProcess = await ProductionProcess.findById(_id);
  if (!productionProcess) {
    throw new ErrorHandler("Production Process doesn't exist", 400);
  }

  if (status === "work in progress") {
    // FINISHED GOOD
    const prevFG = productionProcess.finished_good;
    const currFG = bom.finished_good;
    const fgProduct = await Product.findById(prevFG.item);

    if (currFG && fgProduct) {
      const prevQty = prevFG.produced_quantity || 0;
      const newQty = currFG.produced_quantity || 0;

      if (newQty > prevQty) {
        const change = newQty - prevQty;
        fgProduct.current_stock += change;
        fgProduct.change_type = "increase";
        fgProduct.quantity_changed = change;
        prevFG.produced_quantity += change;
      } else if (prevQty > newQty) {
        const change = prevQty - newQty;
        fgProduct.current_stock -= change;
        fgProduct.change_type = "decrease";
        fgProduct.quantity_changed = change;
        prevFG.produced_quantity -= change;
      }

      await fgProduct.save();
    }

    // RAW MATERIALS
    const prevRMs = productionProcess.raw_materials;
    const currRMs = bom.raw_materials;

    await Promise.all(
      prevRMs.map(async (prevRm) => {
        const rawProduct = await Product.findById(prevRm.item);
        const currRm = currRMs.find(
          (item) =>
            (item?.item + "") === (prevRm?.item + "")
        );

        if (!currRm || !rawProduct) return;

        const prevQty = prevRm.used_quantity || 0;
        const newQty = currRm.used_quantity || 0;

        if (newQty > prevQty) {
          const change = newQty - prevQty;
          rawProduct.current_stock -= change;
          rawProduct.change_type = "decrease";
          rawProduct.quantity_changed = change;
          prevRm.used_quantity += change;
        } else if (prevQty > newQty) {
          const change = prevQty - newQty;
          rawProduct.current_stock += change;
          rawProduct.change_type = "increase";
          rawProduct.quantity_changed = change;
          prevRm.used_quantity -= change;
        }

        const bomRm = await BOMRawMaterial.findById(currRm._id);
        if (bomRm) {
          bomRm.in_production = true;
          await bomRm.save();
        }

        await rawProduct.save();
      })
    );

    // SCRAP MATERIALS
    const prevSCs = productionProcess.scrap_materials;
    const currSCs = bom.scrap_materials;

    await Promise.all(
      prevSCs.map(async (prevSc) => {
        const scrapProduct = await Product.findById(prevSc.item);
        const currSc = currSCs.find(
          (item) =>
            (item?.item + "") === (prevSc?.item + "")
        );

        if (!currSc || !scrapProduct) return;

        const prevQty = prevSc.produced_quantity || 0;
        const newQty = currSc.produced_quantity || 0;

        if (newQty > prevQty) {
          const change = newQty - prevQty;
          scrapProduct.current_stock -= change;
          scrapProduct.change_type = "decrease";
          scrapProduct.quantity_changed = change;
          prevSc.produced_quantity += change;
        } else if (prevQty > newQty) {
          const change = prevQty - newQty;
          scrapProduct.current_stock += change;
          scrapProduct.change_type = "increase";
          scrapProduct.quantity_changed = change;
          prevSc.produced_quantity -= change;
        }

        const bomSc = await BOMScrapMaterial.findById(currSc._id);
        if (bomSc) {
          bomSc.is_production_started = true;
          await bomSc.save();
        }

        await scrapProduct.save();
      })
    );
  }

  // Update process steps
  if (Array.isArray(bom?.processes)) {
    productionProcess.processes.forEach((step) => {
      const incoming = bom.processes.find((p) => p.process === step.process);
      if (incoming) {
        step.start = incoming.start ?? step.start;
        step.done = incoming.done ?? step.done;
      }
    });
    // console.log("Incoming process update:", bom.processes);
    // console.log("Existing process state before update:", productionProcess.processes);

    productionProcess.markModified("processes");
  }

  productionProcess.status = status;

  // Mark nested updates
  productionProcess.markModified("finished_good");
  productionProcess.markModified("raw_materials");
  productionProcess.markModified("scrap_materials");

  await productionProcess.save();

  return res.status(200).json({
    success: true,
    status: 200,
    message: "Production process updated successfully",
  });
};



exports.remove = TryCatch(async (req, res) => {
  const { _id } = req.params;
  if (!_id) {
    throw new ErrorHandler("Id not provided", 400);
  }

  const productionProcess = await ProductionProcess.findById(_id);
  if (!productionProcess) {
    throw new ErrorHandler("Production process doesn't exist", 400);
  }

  await productionProcess.deleteOne();

  res.status(200).json({
    status: 200,
    success: true,
    message: "Production process has been deleted successfully",
  });
});
exports.details = TryCatch(async (req, res) => {
  const { _id } = req.params;
  let productionProcess = await ProductionProcess.findById(_id)
    .populate("rm_store fg_store scrap_store creator item")
    .populate([
      {
        path: "finished_good",
        populate: {
          path: "item",
        },
      },
      {
        path: "raw_materials",
        populate: {
          path: "item",
          populate: {
            path: "store",
          },
        },
      },
    ])
    .populate({
      path: "bom",
      populate: [
        {
          path: "creator",
        },
        {
          path: "finished_good",
          populate: {
            path: "item",
          },
        },
        {
          path: "raw_materials",
          populate: {
            path: "item",
            populate: {
              path: "store",
            },
          },
        },
        {
          path: "scrap_materials",
          populate: {
            path: "item",
            populate: {
              path: "store",
            },
          },
        },
      ],
    });

  if (!_id) {
    throw new ErrorHandler("Production Process doesn't exist", 400);
  }

  res.status(200).json({
    status: 200,
    success: true,
    production_process: productionProcess,
  });
});
exports.all = TryCatch(async (req, res) => {
  const productionProcesses = await ProductionProcess.find().populate(
    "rm_store fg_store scrap_store creator item bom"
  );

  res.status(200).json({
    status: 200,
    success: true,
    production_processes: productionProcesses,
  });
});
exports.markDone = TryCatch(async (req, res) => {
  const { _id } = req.params;
  if (!_id) {
    throw new ErrorHandler("Id not provided", 400);
  }
  const productionProcess = await ProductionProcess.findById(_id);
  if (!productionProcess) {
    throw new ErrorHandler("Production process doesn't exist", 400);
  }

  productionProcess.status = "completed";
  await productionProcess.save();

  res.status(200).json({
    status: 200,
    success: true,
    message: "Production process has been marked done successfully",
  });
});







