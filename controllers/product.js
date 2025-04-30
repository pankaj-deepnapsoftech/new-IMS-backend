const Product = require("../models/product");
const csv = require("csvtojson");
const fs = require("fs");
const { TryCatch, ErrorHandler } = require("../utils/error");
const { checkProductCsvValidity } = require("../utils/checkProductCsvValidity");
const BOMRawMaterial = require("../models/bom-raw-material");
const ProductionProcess = require("../models/productionProcess");
const BOM = require("../models/bom");

exports.create = TryCatch(async (req, res) => {
  const productDetails = req.body;
  if (!productDetails) {
    throw new ErrorHandler("Please provide product details", 400);
  }

  const product = await Product.create({
    ...productDetails,
    approved: req.user.isSuper,
  });

  res.status(200).json({
    status: 200,
    success: true,
    message: "Product has been added successfully",
    product,
  });
});
exports.update = TryCatch(async (req, res) => {
  const productDetails = req.body;
  if (!productDetails) {
    throw new ErrorHandler("Please provide product details", 400);
  }

  const { _id } = productDetails;

  let product = await Product.findById(_id);
  if (!product) {
    throw new ErrorHandler("Product doesn't exist", 400);
  }

  product = await Product.findOneAndUpdate(
    { _id },
    {
      ...productDetails,
      approved: req.user.isSuper ? productDetails?.approved : false,
    },
    { new: true }
  );

  res.status(200).json({
    status: 200,
    success: true,
    message: "Product has been updated successfully",
    product,
  });
});
exports.remove = TryCatch(async (req, res) => {
  const { _id } = req.body;
  const product = await Product.findByIdAndDelete(_id);
  if (!product) {
    throw new ErrorHandler("Product doesn't exist", 400);
  }
  res.status(200).json({
    status: 200,
    success: true,
    message: "Product has been deleted successfully",
    product,
  });
});
exports.details = TryCatch(async (req, res) => {
  const { id } = req.params;
  const product = await Product.findById(id).populate("store");
  if (!product) {
    throw new ErrorHandler("Product doesn't exist", 400);
  }
  res.status(200).json({
    status: 200,
    success: true,
    product,
  });
});
exports.all = TryCatch(async (req, res) => {
  const { category } = req.query;
  let products;
  if (category) {
    products = await Product.find({
      approved: true,
      inventory_category: category,
    })
      .sort({ updatedAt: -1 })
      .populate("store");
  } else {
    products = await Product.find({ approved: true })
      .sort({ updatedAt: -1 })
      .populate("store");
  }

  res.status(200).json({
    status: 200,
    success: true,
    products,
  });
});
exports.unapproved = TryCatch(async (req, res) => {
  const unapprovedProducts = await Product.find({ approved: false }).sort({
    updatedAt: -1,
  });
  res.status(200).json({
    status: 200,
    success: true,
    unapproved: unapprovedProducts,
  });
});
exports.bulkUploadHandler = async (req, res) => {
  csv()
    .fromFile(req.file.path)
    .then(async (response) => {
      try {
        fs.unlink(req.file.path, () => { });

        await checkProductCsvValidity(response);

        const products = response;

        await Product.insertMany(products);

        res.status(200).json({
          status: 200,
          success: true,
          message: "Products has been added successfully",
        });
      } catch (error) {
        return res.status(400).json({
          status: 400,
          success: false,
          message: error?.message,
        });
      }
    });
};
exports.workInProgressProducts = TryCatch(async (req, res) => {
  const products = [];
  const processes = await ProductionProcess.find({
    status: "work in progress",
  }).populate({
    path: "raw_materials",
    populate: [
      {
        path: "item",
      },
    ],
  }).populate({
    path: "bom",
    populate: [
      {
        path: "finished_good",
        populate: {
          path: "item"
        }
      }
    ],
  });

  processes.forEach(p => {
    p.raw_materials.forEach(material => products.push({ ...material._doc, bom: p.bom, createdAt: p.createdAt, updatedAt: p.updatedAt }));
  });

  res.status(200).json({
    status: 200,
    success: true,
    products,
  });
});
