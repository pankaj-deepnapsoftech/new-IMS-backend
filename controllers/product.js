const Product = require("../models/product");
const csv = require("csvtojson");
const fs = require("fs");
const { TryCatch, ErrorHandler } = require("../utils/error");
const { checkProductCsvValidity } = require("../utils/checkProductCsvValidity");
const BOMRawMaterial = require("../models/bom-raw-material");
const ProductionProcess = require("../models/productionProcess");
const BOM = require("../models/bom");
const { generateProductId } = require("../utils/generateProductId");
const path = require("path");
const XLSX = require("xlsx");
const Store = require("../models/store");


exports.create = TryCatch(async (req, res) => {
  const productDetails = req.body;
  console.log("Product details",productDetails);
  if (!productDetails) {
    throw new ErrorHandler("Please provide product details", 400);
  }
  const generatedId = await generateProductId(productDetails.category);

  const product = await Product.create({
    ...productDetails,
    product_id: generatedId,
    approved: req.user.isSuper,
  });
  console.log(product);
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

  // Generate a new product_id based on updated category (or existing one if not passed)
  const categoryForId = productDetails.category || product.category;
  const newProductId = await generateProductId(categoryForId);

  product = await Product.findOneAndUpdate(
    { _id },
    {
      ...productDetails,
      product_id: newProductId, // regenerate product ID
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
  try {
    const fileExtension = path.extname(req.file.originalname).toLowerCase();
    let jsonData;

    if (fileExtension === ".csv") {
      // Handle CSV files
      jsonData = await csv().fromFile(req.file.path);
    } else if (fileExtension === ".xlsx" || fileExtension === ".xls") {
      // Handle Excel files
      const workbook = XLSX.readFile(req.file.path);
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      jsonData = XLSX.utils.sheet_to_json(worksheet);
    } else {
      fs.unlink(req.file.path, () => {});
      return res.status(400).json({
        status: 400,
        success: false,
        message: "Invalid file format. Please upload CSV or Excel file.",
      });
    }

    // Clean up uploaded file
    fs.unlink(req.file.path, () => {});

    // Validate that all products are direct category
    const invalidProducts = jsonData.filter(
      (product) =>
        !product.inventory_category ||
        product.inventory_category.toLowerCase() !== "direct"
    );

    if (invalidProducts.length > 0) {
      return res.status(400).json({
        status: 400,
        success: false,
        message:
          "All products must have inventory_category as 'direct' for this upload.",
      });
    }

    // Validate the data
    await checkProductCsvValidity(jsonData);

    // Process products and generate IDs for all products (ignoring any provided IDs)
    const processedProducts = [];
    for (const productData of jsonData) {
      let processedProduct = { ...productData };

      // Always generate product_id automatically (ignore any provided product_id)
      processedProduct.product_id = await generateProductId(
        processedProduct.category
      );

      // Ensure inventory_category is 'direct'
      processedProduct.inventory_category = "direct";

      // Set default approval status based on user role
      processedProduct.approved = req.user.isSuper ? true : false;

      // Convert string numbers to actual numbers
      if (processedProduct.current_stock) {
        processedProduct.current_stock = Number(processedProduct.current_stock);
      }
      if (
        processedProduct.min_stock &&
        processedProduct.min_stock.toString().trim() !== ""
      ) {
        processedProduct.min_stock = Number(processedProduct.min_stock);
      }
      if (
        processedProduct.max_stock &&
        processedProduct.max_stock.toString().trim() !== ""
      ) {
        processedProduct.max_stock = Number(processedProduct.max_stock);
      }
      if (processedProduct.price) {
        processedProduct.price = Number(processedProduct.price);
      }

      if (
        processedProduct.regular_buying_price &&
        processedProduct.regular_buying_price.toString().trim() !== ""
      ) {
        processedProduct.regular_buying_price = Number(
          processedProduct.regular_buying_price
        );
      }
      if (
        processedProduct.wholesale_buying_price &&
        processedProduct.wholesale_buying_price.toString().trim() !== ""
      ) {
        processedProduct.wholesale_buying_price = Number(
          processedProduct.wholesale_buying_price
        );
      }
      if (
        processedProduct.mrp &&
        processedProduct.mrp.toString().trim() !== ""
      ) {
        processedProduct.mrp = Number(processedProduct.mrp);
      }
      if (
        processedProduct.dealer_price &&
        processedProduct.dealer_price.toString().trim() !== ""
      ) {
        processedProduct.dealer_price = Number(processedProduct.dealer_price);
      }
      if (
        processedProduct.distributor_price &&
        processedProduct.distributor_price.toString().trim() !== ""
      ) {
        processedProduct.distributor_price = Number(
          processedProduct.distributor_price
        );
      }
      if (processedProduct.hsn_code) {
        processedProduct.hsn_code = processedProduct.hsn_code.toString().trim();
      }

      if (
        processedProduct.store &&
        typeof processedProduct.store === "string"
      ) {
        const storeName = processedProduct.store.trim();

        // Lookup store by name (assuming store names are unique)
        const storeDoc = await Store.findOne({ name: storeName });

        if (!storeDoc) {
          throw new Error(
            `Invalid store name '${storeName}' in product: ${processedProduct.name}`
          );
        }

        // Replace store name with its ObjectId
        processedProduct.store = storeDoc._id;
      }

      processedProducts.push(processedProduct);
    }

    // Insert products
    await Product.insertMany(processedProducts);

    res.status(200).json({
      status: 200,
      success: true,
      message: `${processedProducts.length} direct products have been added successfully`,
    });
  } catch (error) {
    // Clean up file in case of error
    if (req.file && req.file.path) {
      fs.unlink(req.file.path, () => {});
    }

    return res.status(400).json({
      status: 400,
      success: false,
      message: error?.message || "Error processing file",
    });
  }
};
exports.workInProgressProducts = TryCatch(async (req, res) => {
  const products = [];
  const processes = await ProductionProcess.find({
    status: "work in progress",
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
      path: "bom",
      populate: [
        {
          path: "finished_good",
          populate: {
            path: "item",
          },
        },
      ],
    });

  processes.forEach((p) => {
    p.raw_materials.forEach((material) =>
      products.push({
        ...material._doc,
        bom: p.bom,
        createdAt: p.createdAt,
        updatedAt: p.updatedAt,
      })
    );
  });

  res.status(200).json({
    status: 200,
    success: true,
    products,
  });
});
// Add this to your existing product.js controller file

exports.exportToExcel = TryCatch(async (req, res) => {
  const { category } = req.query;

  // Fetch products based on category filter (direct products only)
  let products;
  if (category && category !== "all") {
    products = await Product.find({
      approved: true,
      inventory_category: "direct", // Only direct products
      category: category, // Filter by specific category if provided
    })
      .sort({ updatedAt: -1 })
      .populate("store", "name");
  } else {
    products = await Product.find({
      approved: true,
      inventory_category: "direct", // Only direct products
    })
      .sort({ updatedAt: -1 })
      .populate("store", "name");
  }

  // Transform data for Excel export (matching your form structure)
  const excelData = products.map((product) => ({
    "Inventory Category": product.inventory_category || "N/A",
    "Product Name": product.name || "N/A",
    "Product ID": product.product_id || "N/A", // Auto-generated, shown in export
    Store: product.store?.name || product.store || "N/A",
    UOM: product.uom || "N/A",
    Category: product.category || "N/A",
    "Current Stock": product.current_stock || 0,
    "Min Stock": product.min_stock || "N/A",
    "Max Stock": product.max_stock || "N/A",
    Price: product.price || 0,
    "HSN Code": product.hsn_code || "N/A",
    "Item Type": product.item_type || "N/A",
    "Product/Service": product.product_or_service || "N/A",
    "Sub Category": product.sub_category || "N/A",
    "Regular Buying Price": product.regular_buying_price || "N/A",
    "Wholesale Buying Price": product.wholesale_buying_price || "N/A",
    MRP: product.mrp || "N/A",
    "Dealer Price": product.dealer_price || "N/A",
    "Distributor Price": product.distributor_price || "N/A",

    "Created Date": product.createdAt
      ? new Date(product.createdAt).toLocaleDateString()
      : "N/A",
    "Updated Date": product.updatedAt
      ? new Date(product.updatedAt).toLocaleDateString()
      : "N/A",
  }));

  // Create workbook and worksheet
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(excelData);

  // Auto-size columns
  const colWidths = [];
  const headers = Object.keys(excelData[0] || {});
  headers.forEach((header, i) => {
    const maxLength = Math.max(
      header.length,
      ...excelData.map((row) => String(row[header] || "").length)
    );
    colWidths[i] = { wch: Math.min(maxLength + 2, 50) };
  });
  ws["!cols"] = colWidths;

  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(wb, ws, "Direct Products");

  // Generate filename with timestamp
  const timestamp = new Date().toISOString().slice(0, 10);
  const filename = `direct_products_${category || "all"}_${timestamp}.xlsx`;

  // Set response headers
  res.setHeader(
    "Content-Type",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  );
  res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);

  // Write and send file
  const buffer = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });
  res.send(buffer);
});

exports.downloadSampleTemplate = TryCatch(async (req, res) => {
  // Updated sample data structure matching your current form (without product_id)
  const sampleData = [
    {
      inventory_category: "direct",
      name: "Sample Product 1",
      uom: "kg",
      category: "raw materials",
      current_stock: 100,
      min_stock: 10,
      max_stock: 500,
      price: 1000,
      hsn_code: "HSN001",
      item_type: "buy",
      product_or_service: "product",
      sub_category: "Metal Parts",
      regular_buying_price: 900,
      wholesale_buying_price: 850,
      mrp: 1200,
      dealer_price: 1100,
      distributor_price: 1050,
      store: "Faridabad",
    },
    {
      inventory_category: "direct",
      name: "Sample Service 1",
      uom: "hours",
      category: "service",
      current_stock: 0,
      price: 500,
      hsn_code: "HSN002",
      item_type: "sell",
      product_or_service: "service",
      sub_category: "Consultation",
      mrp: 600,
      dealer_price: 550,
      distributor_price: 525,
      store: "Faridabad",
    },
    {
      inventory_category: "direct",
      name: "Trading Item 1",
      uom: "pcs",
      category: "trading goods",
      current_stock: 250,
      min_stock: 25,
      max_stock: 1000,
      price: 750,
      hsn_code: "HSN003",
      item_type: "both",
      product_or_service: "product",
      sub_category: "Electronics",
      regular_buying_price: 700,
      wholesale_buying_price: 650,
      mrp: 900,
      dealer_price: 850,
      distributor_price: 800,
      store: "Faridabad",
    },
  ];

  // Create workbook and worksheet
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(sampleData);

  // Auto-size columns
  const colWidths = [];
  const headers = Object.keys(sampleData[0]);
  headers.forEach((header, i) => {
    const maxLength = Math.max(
      header.length,
      ...sampleData.map((row) => String(row[header] || "").length)
    );
    colWidths[i] = { wch: Math.min(maxLength + 2, 30) };
  });
  ws["!cols"] = colWidths;

  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(wb, ws, "Sample Direct Products");

  // Set response headers
  res.setHeader(
    "Content-Type",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  );
  res.setHeader(
    "Content-Disposition",
    'attachment; filename="direct_products_sample_template.xlsx"'
  );

  // Write and send file
  const buffer = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });
  res.send(buffer);
});
