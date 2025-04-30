const moment = require("moment");
const User = require("../models/user");
const Agent = require("../models/agent");
const BOM = require("../models/bom");
const BOMFinishedMaterial = require("../models/bom-finished-material");
const Product = require("../models/product");
const Store = require("../models/store");
const ProductionProcess = require("../models/productionProcess");
const ProformaInvoice = require("../models/proforma-invoice");
const Invoice = require("../models/invoice");
const Payment = require("../models/payment");
const { TryCatch } = require("../utils/error");
const BOMScrapMaterial = require("../models/bom-scrap-material");
const BOMRawMaterial = require("../models/bom-raw-material");

exports.summary = TryCatch(async (req, res) => {
  let { from, to } = req.body;

  if (from && to) {
    from = moment(from)
      .set({ hour: 0, minute: 0, second: 0, millisecond: 0 })
      .format();
    to = moment(to)
      .set({ hour: 23, minute: 59, second: 59, millisecond: 999 })
      .format();
  }

  // Products Summary
  const productsPipeline = [
    {
      $project: {
        product_id: 1,
        name: 1,
        current_stock: 1,
        min_stock: 1,
        max_stock: 1,
        price: 1,
        approved: 1,
        inventory_category: 1
      },
    },
    {
      $group: {
        _id: '$inventory_category',
        total_low_stock: {
          $sum: {
            $cond: [{ $lt: ["$current_stock", "$min_stock"] }, 1, 0],
          },
        },
        total_excess_stock: {
          $sum: {
            $cond: [{ $gt: ["$current_stock", "$max_stock"] }, 1, 0],
          },
        },
        total_product_count: {
          $sum: 1,
        },
        total_stock_price: {
          $sum: {
            $multiply: ["$price", "$current_stock"],
          },
        },
      },
    },
  ];

  if (from && to) {
    productsPipeline.unshift({
      $match: {
        createdAt: {
          $gte: new Date(from),
          $lte: new Date(to),
        },
        approved: true,
      },
    });
  } else {
    productsPipeline.unshift({
      $match: {
        approved: true,
      },
    });
  }
  const products = await Product.aggregate(productsPipeline);
  
  // Scrap Materials Summary
  const scrapPipeline = [
    {
      $project: {
        quantity: 1,
        total_part_cost: 1,
        createdAt: 1,
        is_production_started: 1
      },
    },
    {
      $group: {
        _id: null,
        total_product_count: {
          $sum: 1,
        },
        total_stock_price: {
          $sum: '$total_part_cost',
        },
      },
    },
  ];

  if (from && to) {
    scrapPipeline.unshift({
      $match: {
        createdAt: {
          $gte: new Date(from),
          $lte: new Date(to),
        }
      },
    });
  } else {
    scrapPipeline.unshift({
      $match: {
        is_production_started: true,
      },
    });
  }
  const scrap = await BOMScrapMaterial.aggregate(scrapPipeline);
  
  // WIP Materials Summary
  const wipInventoryPipeline = [
    {
      $project: {
        approvedByAdmin: 1,
        approvedByInventoryPersonnel: 1,
        in_production: 1,
        total_part_cost: 1,
        createdAt: 1
      },
    },
    {
      $group: {
        _id: null,
        total_product_count: {
          $sum: 1,
        },
        total_stock_price: {
          $sum: '$total_part_cost',
        },
      },
    },
  ];

  if (from && to) {
    wipInventoryPipeline.unshift({
      $match: {
        createdAt: {
          $gte: new Date(from),
          $lte: new Date(to),
        },
        approvedByAdmin: true,
        approvedByInventoryPersonnel: true,
        in_production: true
      },
    });
  } else {
    scrapPipeline.unshift({
      $match: {
        approvedByAdmin: true,
        approvedByInventoryPersonnel: true,
        in_production: true
      },
    });
  }
  const wipInventory = await BOMRawMaterial.aggregate(wipInventoryPipeline);

  // Stores Summary
  const storeCount = await Store.find({ approved: true }).countDocuments();

  // BOM Summary
  const bomCount = await BOM.find({ approved: true }).countDocuments();

  // Merchant Summary
  const merchantsPipeline = [
    {
      $project: {
        agent_type: 1,
      },
    },
    {
      $group: {
        _id: null,
        total_supplier_count: {
          $sum: {
            $cond: [{ $eq: ["$agent_type", "supplier"] }, 1, 0],
          },
        },
        total_buyer_count: {
          $sum: {
            $cond: [{ $eq: ["$agent_type", "buyer"] }, 1, 0],
          },
        },
      },
    },
  ];

  if (from && to) {
    merchantsPipeline.unshift({
      $match: {
        createdAt: {
          $gte: new Date(from),
          $lte: new Date(to),
        },
        approved: true,
      },
    });
  } else {
    merchantsPipeline.unshift({
      $match: {
        approved: true,
      },
    });
  }
  const merchants = await Agent.aggregate(merchantsPipeline);

  // Approval Summary
  const unapprovedProducts = await Product.find({
    approved: false,
  }).countDocuments();
  const unapprovedStores = await Store.find({
    approved: false,
  }).countDocuments();
  const unapprovedMerchants = await Agent.find({
    approved: false,
  }).countDocuments();
  const unapprovedBoms = await BOM.find({ approved: false }).countDocuments();

  // Employee Summary
  const employeesPipeline = [
    {
      $lookup: {
        from: "user-roles",
        localField: "role",
        foreignField: "_id",
        as: "role_details",
      },
    },
    {
      $unwind: "$role_details",
    },
    {
      $project: {
        role_details: 1,
        isVerified: 1,
      },
    },
    {
      $match: {
        isVerified: true,
      },
    },
    {
      $group: {
        _id: "$role_details.role",
        total_employee_count: {
          $sum: 1,
        },
      },
    },
  ];

  if (from && to) {
    employeesPipeline.unshift({
      $match: {
        createdAt: {
          $gte: new Date(from),
          $lte: new Date(to),
        },
      },
    });
  }

  const employees = await User.aggregate(employeesPipeline);

  // Production Process Summary
  const processPipeline = [
    {
      $project: {
        status: 1
      },
    },
    {
      $group: {
        _id: '$status',
        total_process_count: {
          $sum: 1,
        }
      },
    },
  ];

  if (from && to) {
    processPipeline.unshift({
      $match: {
        createdAt: {
          $gte: new Date(from),
          $lte: new Date(to),
        },
        approved: true,
      },
    });
  } else {
    processPipeline.unshift({
      $match: {
        approved: true,
      },
    });
  }
  const process = await ProductionProcess.aggregate(processPipeline);
  let processCountStatusWiseArr = process.map(p=>({[p._id]: p.total_process_count}));
  const processCountStatusWiseObj = {};
  processCountStatusWiseArr.forEach(obj => {
    const key = Object.keys(obj)[0];
    processCountStatusWiseObj[key] = obj[key];
  });

  // Proforma Invoices, Invoices and Payments Insights
  let condition = {};
  if(from && to){
    condition = {
      $gte: from,
      $lte: to
    }
  }
  const totalProformaInvoices = await ProformaInvoice.find(condition).countDocuments();
  const totalInvoices = await Invoice.find(condition).countDocuments();
  const totalPayments = await Payment.find(condition).countDocuments();

  res.status(200).json({
    status: 200,
    success: true,
    products: products,
    stores: {
      total_store_count: storeCount,
    },
    boms: {
      total_bom_count: bomCount,
    },
    merchants: merchants[0] || {
      total_supplier_count: 0,
      total_buyer_count: 0,
    },
    approvals_pending: {
      unapproved_product_count: unapprovedProducts,
      unapproved_store_count: unapprovedStores,
      unapproved_merchant_count: unapprovedMerchants,
      unapproved_bom_count: unapprovedBoms,
    },
    employees,
    processes: processCountStatusWiseObj,
    proforma_invoices: totalProformaInvoices,
    invoices: totalInvoices,
    payments: totalPayments,
    scrap: scrap.length === 0 ? [{total_product_count: 0, total_stock_price: 0}] : scrap,
    wip_inventory: wipInventory.length === 0 ? [{total_product_count: 0, total_stock_price: 0}] : wipInventory
  });
});
