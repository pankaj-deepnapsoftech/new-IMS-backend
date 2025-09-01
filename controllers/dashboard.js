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
const { Purchase } = require("../models/purchase");
const {DispatchModel}  = require('../models/Dispatcher')
const { PartiesModels } = require("../models/Parties");
exports.summary = TryCatch(async (req, res) => {
  // Here we have to send the view also
  let { from, to } = req.body;
  console.log("from", from);
  console.log("view ", to);
  if (from && to) {
    from = moment(from)
      .set({ hour: 0, minute: 0, second: 0, millisecond: 0 })
      .format();
    to = moment(to)
      .set({ hour: 23, minute: 59, second: 59, millisecond: 999 })
      .format();
  }
  const oneMonthAgoForBom = moment()
    .subtract(1, "months")
    .startOf("day")
    .toDate();
  const todayForBom = moment().endOf("day").toDate();

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
        inventory_category: 1,
      },
    },
    {
      $group: {
        _id: "$inventory_category",
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
        is_production_started: 1,
      },
    },
    {
      $group: {
        _id: null,
        total_product_count: {
          $sum: 1,
        },
        total_stock_price: {
          $sum: "$total_part_cost",
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
        },
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
        createdAt: 1,
      },
    },
    {
      $group: {
        _id: null,
        total_product_count: {
          $sum: 1,
        },
        total_stock_price: {
          $sum: "$total_part_cost",
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
        in_production: true,
      },
    });
  } else {
    scrapPipeline.unshift({
      $match: {
        approvedByAdmin: true,
        approvedByInventoryPersonnel: true,
        in_production: true,
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
        status: 1,
      },
    },
    {
      $group: {
        _id: "$status",
        total_process_count: {
          $sum: 1,
        },
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
  let processCountStatusWiseArr = process.map((p) => ({
    [p._id]: p.total_process_count,
  }));
  const processCountStatusWiseObj = {};
  processCountStatusWiseArr.forEach((obj) => {
    const key = Object.keys(obj)[0];
    processCountStatusWiseObj[key] = obj[key];
  });

  // Proforma Invoices, Invoices and Payments Insights
  let condition = {};
  if (from && to) {
    condition = {
      $gte: from,
      $lte: to,
    };
  }
  const totalProformaInvoices = await ProformaInvoice.find(
    condition
  ).countDocuments();
  const totalInvoices = await Invoice.find(condition).countDocuments();
  const totalPayments = await Payment.find(condition).countDocuments();

  // Invoices Total for Last 1 Month
  const oneMonthAgo = moment().subtract(1, "months").startOf("day").toDate();
  const today = moment().endOf("day").toDate();

  const invoiceTotalAgg = await Invoice.aggregate([
    {
      $match: {
        createdAt: {
          $gte: oneMonthAgo,
          $lte: today,
        },
      },
    },
    {
      $group: {
        _id: null,
        totalAmount: { $sum: "$total" },
      },
    },
  ]);

  const invoiceTotalLastMonth =
    invoiceTotalAgg.length > 0 ? invoiceTotalAgg[0].totalAmount : 0;
  // Total Verified Employees Count
  const totalVerifiedEmployees = await User.countDocuments({
    isVerified: true,
  });

  const bomTotalAgg = await BOM.aggregate([
    {
      $match: {
        approved: true,
        createdAt: {
          $gte: oneMonthAgoForBom,
          $lte: todayForBom,
        },
      },
    },
    {
      $group: {
        _id: null,
        totalProductionAmount: { $sum: "$total_cost" },
      },
    },
  ]);

  const totalProductionAmount =
    bomTotalAgg.length > 0 ? bomTotalAgg[0].totalProductionAmount : 0;

  const totalSalesAgg = await Purchase.aggregate([
    {
      $match: {
        createdAt: {
          $gte: oneMonthAgo,
          $lte: today,
        },
      },
    },
    {
      $addFields: {
        total_price: {
          $add: [
            { $multiply: ["$price", "$product_qty"] },
            {
              $divide: [
                {
                  $multiply: [
                    { $multiply: ["$price", "$product_qty"] },
                    "$GST",
                  ],
                },
                100,
              ],
            },
          ],
        },
      },
    },
    {
      $group: {
        _id: null,
        totalSalesAmount: { $sum: "$total_price" },
      },
    },
  ]);

  const totalSalesAmount =
    totalSalesAgg.length > 0 ? totalSalesAgg[0].totalSalesAmount : 0;

  const oneMonthAgoProduct = moment()
    .subtract(1, "months")
    .startOf("day")
    .toDate();
  const todayProduct = moment().endOf("day").toDate();





   // ================= Production Chart Summary =================

   let { filter } = req.query; // frontend can send ?filter=weekly|monthly|yearly

   let startDate;
   if (filter === "weekly") {
     startDate = moment().subtract(7, "days").startOf("day").toDate();
   } else if (filter === "monthly") {
     startDate = moment().subtract(30, "days").startOf("day").toDate();
   } else if (filter === "yearly") {
     startDate = moment().subtract(1, "year").startOf("day").toDate();
   }
 
   const matchCondition = {};
   if (startDate) {
     matchCondition.createdAt = { $gte: startDate, $lte: new Date() };
   }
 
   // Pre-production statuses
   const preProductionStatuses = [
     "raw material approval pending",
     "Inventory Allocated",
     "request for allow inventory",
     "inventory in transit",
   ];
 
   const productionChart = await ProductionProcess.aggregate([
     { $match: matchCondition },
     {
       $group: {
         _id: null,
         completed: {
           $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] },
         },
         progress: {
           $sum: {
             $cond: [{ $eq: ["$status", "production in progress"] }, 1, 0],
           },
         },
         pre_production: {
           $sum: {
             $cond: [{ $in: ["$status", preProductionStatuses] }, 1, 0],
           },
         },
       },
     },
   ]);
 
   const chartData =
     productionChart.length > 0
       ? productionChart[0]
       : { completed: 0, progress: 0, pre_production: 0 };
 
   // ================= Merchant Chart Summary =================
   const merchantMatch = {};
   if (startDate) {
     merchantMatch.createdAt = { $gte: startDate, $lte: new Date() };
   }
 
   const [indBuyer, indSeller, compBuyer, compSeller, totalInd, totalComp] =
     await Promise.all([
       PartiesModels.countDocuments({
         ...merchantMatch,
         type: "Individual",
         parties_type: "Buyer",
       }),
       PartiesModels.countDocuments({
         ...merchantMatch,
         type: "Individual",
         parties_type: "Seller",
       }),
       PartiesModels.countDocuments({
         ...merchantMatch,
         type: "Company",
         parties_type: "Buyer",
       }),
       PartiesModels.countDocuments({
         ...merchantMatch,
         type: "Company",
         parties_type: "Seller",
       }),
       PartiesModels.countDocuments({ ...merchantMatch, type: "Individual" }),
       PartiesModels.countDocuments({ ...merchantMatch, type: "Company" }),
     ]);
 
   const merchantChart = {
     individual: {
       buyer: indBuyer,
       seller: indSeller,
     },
     company: {
       buyer: compBuyer,
       seller: compSeller,
     },
     totals: {
       total_individual: totalInd,
       total_company: totalComp,
       total_merchant: totalInd+totalComp,
     },
   };
 
   // ================= Inventory Chart Summary =================
   const productMatch = {};
   if (startDate) {
     productMatch.createdAt = { $gte: startDate, $lte: new Date() };
   }
 
   // Raw Materials
   const rawMaterialsCount = await Product.countDocuments({
     ...productMatch,
     category: "raw materials",
   });
 
   // Finished Goods
   const finishedGoodsCount = await Product.countDocuments({
     ...productMatch,
     category: "finished goods",
   });
 
   // Indirect Inventory
   const indirectInventoryCount = await Product.countDocuments({
     ...productMatch,
     inventory_category: "indirect",
   });
 
   // Work in Progress (from ProductionProcess)
   const workInProgressCount = await ProductionProcess.countDocuments({
     ...matchCondition,
     status: "production started",
   });
 
   const inventoryChart = {
     raw_materials: rawMaterialsCount,
     finished_goods: finishedGoodsCount,
     indirect_inventory: indirectInventoryCount,
     work_in_progress: workInProgressCount,
   };








  const productBuyTotalAgg = await Product.aggregate([
    {
      $match: {
        item_type: "buy",
        inventory_category: { $in: ["direct", "indirect"] },
        createdAt: { $gte: oneMonthAgoProduct, $lte: todayProduct },
      },
    },
    {
      $group: {
        _id: null,
        totalProductBuyPrice: { $sum: "$price" },
      },
    },
  ]);

  const totalProductBuyPriceLastMonth =
    productBuyTotalAgg.length > 0
      ? productBuyTotalAgg[0].totalProductBuyPrice
      : 0;

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
    verified_employees_count: totalVerifiedEmployees,
    total_production_amount: totalProductionAmount,
    total_sales_amount: totalSalesAmount,
    total_product_buy_price: totalProductBuyPriceLastMonth,

    processes: processCountStatusWiseObj,
    proforma_invoices: totalProformaInvoices,
    invoice_summary: {
      total_invoice_amount_last_month: invoiceTotalLastMonth,
    },


    production_chart: chartData, //for production data
    inventory_chart: inventoryChart, //for inventory data
    merchant_chart: merchantChart,  // for merchant data 





    invoices: totalInvoices,
    payments: totalPayments,
    scrap:
      scrap.length === 0
        ? [{ total_product_count: 0, total_stock_price: 0 }]
        : scrap,
    wip_inventory:
      wipInventory.length === 0
        ? [{ total_product_count: 0, total_stock_price: 0 }]
        : wipInventory,
  });
});

exports.salesData = TryCatch(async (req, res) => {
  const view = req.query.view || "yearly"; // Default yearly
  const currentYear = new Date().getFullYear();
  const prevYear = currentYear - 1;
  const currentDate = new Date(); // current system date
  let labels = [];
  let datasets = [];
  let totalSales = 0; // Total sales variable add kiya

  function getISOWeek(date) {
    const tmp = new Date(date.getTime());
    tmp.setHours(0, 0, 0, 0);
    tmp.setDate(tmp.getDate() + 3 - ((tmp.getDay() + 6) % 7));
    const week1 = new Date(tmp.getFullYear(), 0, 4);
    return (
      1 +
      Math.round(
        ((tmp.getTime() - week1.getTime()) / 86400000 -
          3 +
          ((week1.getDay() + 6) % 7)) /
          7
      )
    );
  }

  switch (view) {
    //GET /api/salesData?view=yearly&year=2025
    case "yearly": {
      labels = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ];

      const currentYear = Number(req.query.year) || new Date().getFullYear();
      const prevYear = currentYear - 1;

      // Prev Year Sales count (group by month)
      const prevSales = await Purchase.aggregate([
        {
          $match: {
            createdAt: {
              $gte: new Date(`${prevYear}-01-01`),
              $lt: new Date(`${prevYear + 1}-01-01`),
            },
          },
        },
        {
          $group: {
            _id: { $month: "$createdAt" },
            total: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]);

      // Current Year Sales count
      const currSales = await Purchase.aggregate([
        {
          $match: {
            createdAt: {
              $gte: new Date(`${currentYear}-01-01`),
              $lt: new Date(`${currentYear + 1}-01-01`),
            },
          },
        },
        {
          $group: {
            _id: { $month: "$createdAt" },
            total: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]);

      // Total sales for current year calculate karo
      totalSales = currSales.reduce((sum, item) => sum + item.total, 0);

      const prevData = Array(12).fill(0);
      const currData = Array(12).fill(0);

      prevSales.forEach((item) => {
        prevData[item._id - 1] = item.total;
      });
      currSales.forEach((item) => {
        currData[item._id - 1] = item.total;
      });

      datasets = [
        { label: String(prevYear), data: prevData },
        { label: String(currentYear), data: currData },
      ];

      break;
    }

    // GET /api/salesData?view=monthly&month=7&year=2025
    case "monthly": {
      const monthMap = {
        jan: 1,
        feb: 2,
        mar: 3,
        apr: 4,
        may: 5,
        jun: 6,
        jul: 7,
        aug: 8,
        sep: 9,
        oct: 10,
        nov: 11,
        dec: 12,
      };

      const monthNames = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
      ];

      const monthStr = (req.query.month || "").toLowerCase();
      const currentMonth = monthMap[monthStr] || currentDate.getMonth() + 1;

      let currMonthYear = Number(req.query.year) || currentDate.getFullYear();
      let prevMonth = currentMonth - 1;
      let prevMonthYear = currMonthYear;

      if (prevMonth === 0) {
        prevMonth = 12;
        prevMonthYear -= 1;
      }

      const daysInMonth = new Date(currMonthYear, currentMonth, 0).getDate();
      labels = Array.from({ length: daysInMonth }, (_, i) => `${i + 1}`);

      const prevStart = new Date(prevMonthYear, prevMonth - 1, 1);
      const prevEnd = new Date(prevMonthYear, prevMonth, 1);

      const currStart = new Date(currMonthYear, currentMonth - 1, 1);
      const currEnd = new Date(currMonthYear, currentMonth, 1);

      const prevSales = await Purchase.aggregate([
        {
          $match: {
            createdAt: { $gte: prevStart, $lt: prevEnd },
          },
        },
        {
          $group: {
            _id: { $dayOfMonth: "$createdAt" },
            total: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]);

      const currSales = await Purchase.aggregate([
        {
          $match: {
            createdAt: { $gte: currStart, $lt: currEnd },
          },
        },
        {
          $group: {
            _id: { $dayOfMonth: "$createdAt" },
            total: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]);

      // Total sales for current month calculate karo
      totalSales = currSales.reduce((sum, item) => sum + item.total, 0);

      const prevData = Array(daysInMonth).fill(0);
      const currData = Array(daysInMonth).fill(0);

      prevSales.forEach((item) => {
        if (item._id <= daysInMonth) {
          prevData[item._id - 1] = item.total;
        }
      });

      currSales.forEach((item) => {
        currData[item._id - 1] = item.total;
      });

      datasets = [
        { label: monthNames[prevMonth - 1], data: prevData },
        { label: monthNames[currentMonth - 1], data: currData },
      ];

      break;
    }
 


    //  http://localhost:8085/api/dashboard/sales?view=weekly&month=aug
    case "weekly": {
      const monthMap = {
        jan: 1,
        feb: 2,
        mar: 3,
        apr: 4,
        may: 5,
        jun: 6,
        jul: 7,
        aug: 8,
        sep: 9,
        oct: 10,
        nov: 11,
        dec: 12,
      };

      // Determine month from query parameter, default to current month if not provided or invalid
      const monthStr = (req.query.month || "").toLowerCase();
      const month =
        monthMap[monthStr] ||
        Number(req.query.month) ||
        currentDate.getMonth() + 1;
      const year = Number(req.query.year) || currentDate.getFullYear();

      // Calculate date ranges
      const startOfCurrentMonth = new Date(year, month - 1, 1);
      const endOfCurrentMonth = new Date(year, month, 0, 23, 59, 59, 999);

      // Handle previous month with year adjustment
      let prevMonth = month - 1;
      let prevYear = year;
      if (prevMonth === 0) {
        prevMonth = 12;
        prevYear = year - 1;
      }

      const startOfPrevMonth = new Date(prevYear, prevMonth - 1, 1);
      const endOfPrevMonth = new Date(prevYear, prevMonth, 0, 23, 59, 59, 999);

      // Function to get week numbers in a month (W1, W2, W3, W4)
      const getWeekNumbersForMonth = (start, end) => {
        const weeks = [];
        let current = new Date(start);

        // Always start with W1 for the first week of the month
        let weekCount = 1;

        while (current <= end) {
          weeks.push(`W${weekCount}`);
          weekCount++;
          // Move to next week
          current.setDate(current.getDate() + 7);
        }

        return weeks;
      };

      // Get week labels for both months
      const prevMonthWeeks = getWeekNumbersForMonth(
        startOfPrevMonth,
        endOfPrevMonth
      );
      const currMonthWeeks = getWeekNumbersForMonth(
        startOfCurrentMonth,
        endOfCurrentMonth
      );

      // Create combined labels (W1, W2, W3, W4 for both months)
      labels = [...prevMonthWeeks, ...currMonthWeeks];

      // Previous month sales by week
      const prevSales = await Purchase.aggregate([
        {
          $match: {
            createdAt: { $gte: startOfPrevMonth, $lte: endOfPrevMonth },
          },
        },
        {
          $addFields: {
            weekOfMonth: {
              $ceil: {
                $divide: [{ $dayOfMonth: "$createdAt" }, 7],
              },
            },
          },
        },
        {
          $group: {
            _id: "$weekOfMonth",
            total: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]);

      // Current month sales by week
      const currSales = await Purchase.aggregate([
        {
          $match: {
            createdAt: { $gte: startOfCurrentMonth, $lte: endOfCurrentMonth },
          },
        },
        {
          $addFields: {
            weekOfMonth: {
              $ceil: {
                $divide: [{ $dayOfMonth: "$createdAt" }, 7],
              },
            },
          },
        },
        {
          $group: {
            _id: "$weekOfMonth",
            total: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]);

      // Total sales for current month
      const totalSales = currSales.reduce(
        (sum, item) => sum + (item.total || 0),
        0
      );

      // Prepare data arrays
      const prevData = Array(prevMonthWeeks.length).fill(0);
      const currData = Array(currMonthWeeks.length).fill(0);

      // Fill data arrays
      prevSales.forEach((item) => {
        if (item._id <= prevData.length) {
          prevData[item._id - 1] = item.total || 0;
        }
      });

      currSales.forEach((item) => {
        if (item._id <= currData.length) {
          currData[item._id - 1] = item.total || 0;
        }
      });

      datasets = [
        {
          label: `${startOfPrevMonth.toLocaleString("default", {
            month: "short",
          })} ${prevYear}`,
          data: prevData,
        },
        {
          label: `${startOfCurrentMonth.toLocaleString("default", {
            month: "short",
          })} ${year}`,
          data: currData,
        },
      ];

      break;
    }
    default: {
      return res.status(400).json({
        success: false,
        message:
          "Invalid view type. Use 'yearly', 'monthly', 'weekly' or 'daily'.",
      });
    }
  }

  // Response mein totalSales add karo
  res.status(200).json({
    success: true,
    data: "mil rha hai----",
    labels,
    datasets,
    totalSales, // Total sales response mein add kiya
  });
});

// ***************************************************** DISPATCH API*****************
// Yearly data
// GET /api/dispatch-data?view=yearly&year=2024

// Monthly data with number
// GET /api/dispatch-data?view=monthly&year=2024&month=8
// GET /api/dispatch-data?view=monthly&year=2024&month=august
// GET /api/dispatch-data?view=monthly&year=2024&month=aug

// Current week in current month
// GET /api/dispatch-data?view=weekly

exports.dispatchData = TryCatch(async (req, res) => {
  const { view, year, month } = req.query;

  // Input validation
  if (!view || !["yearly", "monthly", "weekly"].includes(view)) {
    return res.status(400).json({
      success: false,
      message: "Invalid view. Use yearly, monthly, or weekly.",
    });
  }

  // For weekly view, we don't need year/month parameters - always use current rolling week
  if (view === "weekly") {
    // Skip year/month validation for weekly - it's always current
  } else {
    // Year validation for monthly and yearly
    if (!year || isNaN(year)) {
      return res.status(400).json({
        success: false,
        message: "Valid year is required.",
      });
    }
  }

  const yearNum = year ? parseInt(year) : new Date().getFullYear();
  const currentYear = new Date().getFullYear();

  if (view !== "weekly" && (yearNum < 2000 || yearNum > currentYear + 1)) {
    return res.status(400).json({
      success: false,
      message: "Year should be between 2000 and " + (currentYear + 1),
    });
  }

  let startDate, endDate;

  try {
    // Set date range based on view
    switch (view) {
      case "yearly":
        startDate = new Date(yearNum, 0, 1, 0, 0, 0, 0);
        endDate = new Date(yearNum, 11, 31, 23, 59, 59, 999);
        break;

      case "monthly":
        if (!month) {
          return res.status(400).json({
            success: false,
            message: "Month is required for monthly view.",
          });
        }

        // Improved month parsing
        let monthIndex;
        if (isNaN(month)) {
          const monthNames = [
            "jan",
            "feb",
            "mar",
            "apr",
            "may",
            "jun",
            "jul",
            "aug",
            "sep",
            "oct",
            "nov",
            "dec",
          ];
          const monthStr = month.toLowerCase().substring(0, 3);
          monthIndex = monthNames.indexOf(monthStr);

          if (monthIndex === -1) {
            return res.status(400).json({
              success: false,
              message: "Invalid month format. Use month name or number (1-12).",
            });
          }
        } else {
          monthIndex = parseInt(month) - 1;
          if (monthIndex < 0 || monthIndex > 11) {
            return res.status(400).json({
              success: false,
              message: "Month should be between 1-12.",
            });
          }
        }

        startDate = new Date(yearNum, monthIndex, 1, 0, 0, 0, 0);
        endDate = new Date(yearNum, monthIndex + 1, 0, 23, 59, 59, 999);
        break;

      case "weekly":
        // Rolling 7-day window: 3 days back + today + 3 days forward
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Start: 3 days before today
        const weekStartDate = new Date(today);
        weekStartDate.setDate(today.getDate() - 3);
        weekStartDate.setHours(0, 0, 0, 0);

        // End: 3 days after today
        const weekEndDate = new Date(today);
        weekEndDate.setDate(today.getDate() + 3);
        weekEndDate.setHours(23, 59, 59, 999);

        startDate = weekStartDate;
        endDate = weekEndDate;
        break;
    }

    // Validate dates
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      throw new Error("Invalid date created");
    }
  } catch (error) {
    console.error("Date creation error:", error);
    return res.status(400).json({
      success: false,
      message: "Invalid date parameters.",
    });
  }

  try {
    // Fetch and aggregate data
    const totalData = await DispatchModel.find({
      createdAt: { $gte: startDate, $lte: endDate },
    });

    console.log("Total Data Count:", totalData.length); // Debug: Check data count
    console.log("Date Range:", { startDate, endDate }); // Debug: Check date range

    let categories,
      data = {};

    switch (view) {
      case "yearly":
        categories = [
          "Jan",
          "Feb",
          "Mar",
          "Apr",
          "May",
          "Jun",
          "Jul",
          "Aug",
          "Sep",
          "Oct",
          "Nov",
          "Dec",
        ];

        totalData.forEach((item) => {
          if (!item.createdAt || isNaN(new Date(item.createdAt).getTime())) {
            console.warn("Invalid createdAt date:", item.createdAt);
            return;
          }

          const month = new Date(item.createdAt).toLocaleDateString("en-US", {
            month: "short",
          });
          const status = item.dispatch_status?.toLowerCase()?.trim();

          console.log("Processing - Month:", month, "Status:", status); // Debug

          if (!data[month]) {
            data[month] = { dispatch: 0, deliver: 0 };
          }

          if (status === "dispatch") {
            data[month].dispatch++;
          } else if (status === "delivered") {
            data[month].deliver++;
          }
        });
        break;

      case "monthly":
        const numDays = endDate.getDate();
        categories = Array.from({ length: numDays }, (_, i) => String(i + 1));

        totalData.forEach((item) => {
          if (!item.createdAt || isNaN(new Date(item.createdAt).getTime())) {
            console.warn("Invalid createdAt date:", item.createdAt);
            return;
          }

          const day = new Date(item.createdAt).getDate().toString();
          const status = item.dispatch_status?.toLowerCase()?.trim();

          console.log("Processing - Day:", day, "Status:", status); // Debug

          if (!data[day]) {
            data[day] = { dispatch: 0, deliver: 0 };
          }

          if (status === "dispatch") {
            data[day].dispatch++;
          } else if (status === "delivered") {
            data[day].deliver++;
          }
        });
        break;

      case "weekly":
        // Rolling 7-day window: 3 days back + today + 3 days forward
        const today = new Date();
        const todayDateString = today.toDateString();

        // Create 7-day labels with actual dates and day names
        categories = [];
        const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

        // Generate labels for 7 days (-3 to +3)
        for (let i = -3; i <= 3; i++) {
          const currentDay = new Date(today);
          currentDay.setDate(today.getDate() + i);

          const dayName = dayNames[currentDay.getDay()];
          const dateNum = currentDay.getDate();
          const monthName = currentDay.toLocaleDateString("en-US", {
            month: "short",
          });

          let label;
          if (i === 0) {
            // Today's label - make it special
            label = `Today ${dateNum}`;
          } else {
            label = `${dayName} ${dateNum}`;
          }

          categories.push(label);
        }

        totalData.forEach((item) => {
          if (!item.createdAt || isNaN(new Date(item.createdAt).getTime())) {
            console.warn("Invalid createdAt date:", item.createdAt);
            return;
          }

          const itemDate = new Date(item.createdAt);
          const status = item.dispatch_status?.toLowerCase()?.trim();

          // Find which day index this item belongs to (-3 to +3)
          const daysDiff = Math.floor(
            (itemDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
          );

          if (daysDiff >= -3 && daysDiff <= 3) {
            const dayIndex = daysDiff + 3; // Convert to 0-6 index
            const dayKey = categories[dayIndex];

            console.log(
              "Processing - Day:",
              dayKey,
              "Status:",
              status,
              "Diff:",
              daysDiff
            ); // Debug

            if (!data[dayKey]) {
              data[dayKey] = { dispatch: 0, deliver: 0 };
            }

            if (status === "dispatch") {
              data[dayKey].dispatch++;
            } else if (status === "delivered") {
              data[dayKey].deliver++;
            }
          }
        });
        break;
    }

    // Fill missing categories with zero
    categories.forEach((cat) => {
      if (!data[cat]) {
        data[cat] = { dispatch: 0, deliver: 0 };
      }
    });

    // Build response arrays
    const dispatchData = categories.map((cat) => data[cat].dispatch);
    const deliverData = categories.map((cat) => data[cat].deliver);

    // Calculate totals for additional info
    const totalDispatched = dispatchData.reduce((sum, val) => sum + val, 0);
    const totalDelivered = deliverData.reduce((sum, val) => sum + val, 0);

    const response = {
      success: true,
      title: view.charAt(0).toUpperCase() + view.slice(1),
      labels: categories,
      datasets: [
        {
          label: "Dispatch",
          data: dispatchData,
          backgroundColor: "#ADD8E6",
          borderColor: "#87CEEB",
          borderWidth: 1,
        },
        {
          label: "Deliver",
          data: deliverData,
          backgroundColor: "#FFC0CB",
          borderColor: "#FFB6C1",
          borderWidth: 1,
        },
      ],
      summary: {
        totalDispatched,
        totalDelivered,
        totalOrders: totalDispatched + totalDelivered,
        period:
          view === "yearly"
            ? `Year ${year}`
            : view === "monthly"
            ? `${month}/${year}`
            : `Rolling 7 Days (${startDate.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })} - ${endDate.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })})`,
        weekInfo:
          view === "weekly"
            ? {
                weekStart: startDate.toISOString().split("T")[0],
                weekEnd: endDate.toISOString().split("T")[0],
                centerDate: new Date().toISOString().split("T")[0], // Today's date
                type: "rolling_week",
              }
            : undefined,
      },
    };

    console.log("Response Summary:", response.summary); // Debug
    res.status(200).json(response);
  } catch (error) {
    console.error("Database or processing error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error while fetching data.",
    });
  }
});



// ************************** NEW SEPARATE FUNCTION FOR FINANCIAL SUMMARY ****************

// For year
// http://localhost:8085/api/dashboard/finance?view=yearly&year=2025

// For month
// http://localhost:8085/api/dashboard/finance?view=monthly&year=2025&mon=7

// For week
// http://localhost:8085/api/dashboard/finance?view=weekly

exports.financialSummary = TryCatch(async (req, res) => {
  const { view, year, mon } = req.query;

  console.log("Financial Summary Request:", { view, year, mon });

  let dateCondition = {};
  let startDate, endDate;

  // ========== DATE FILTERING LOGIC BASED ON VIEW ==========
  if (view === "yearly" && year) {
    // FIXED: Yearly view - entire year data (create fresh date object for specific year)
    startDate = moment(`${year}-01-01`).startOf("day").toDate();
    endDate = moment(`${year}-12-31`).endOf("day").toDate();

    dateCondition = {
      createdAt: {
        $gte: startDate,
        $lte: endDate,
      },
    };
    console.log(`Yearly filter applied for year: ${year}`, {
      startDate: moment(startDate).format("YYYY-MM-DD HH:mm:ss"),
      endDate: moment(endDate).format("YYYY-MM-DD HH:mm:ss"),
    });
  } else if (view === "monthly" && year) {
    // If month is not provided, default to current month
    const currentMonth = mon || (new Date().getMonth() + 1);
    let monthIndex;

    if (!isNaN(currentMonth)) {
      // ✅ Agar month number aaya (1–12)
      monthIndex = parseInt(currentMonth) - 1; // moment index 0–11 hota hai
    } else {
      // ✅ Agar month string aaya (Jan / January / Aug / August)
      monthIndex = moment(currentMonth, ["MMM", "MMMM"]).month();
    }

    startDate = moment({ year: parseInt(year), month: monthIndex })
      .startOf("month")
      .toDate();

    endDate = moment({ year: parseInt(year), month: monthIndex })
      .endOf("month")
      .toDate();

    dateCondition = {
      createdAt: {
        $gte: startDate,
        $lte: endDate,
      },
    };

    console.log(`Monthly filter applied for: ${currentMonth} ${year}${!mon ? ' (defaulted to current month)' : ''}`, {
      monthIndex,
      startDate: moment(startDate).format("YYYY-MM-DD HH:mm:ss"),
      endDate: moment(endDate).format("YYYY-MM-DD HH:mm:ss"),
    });
  } else if (view === "weekly") {
    // Weekly view - current day ke piche 6 days (total 7 days including today)
    endDate = moment().endOf("day").toDate();
    startDate = moment().subtract(6, "days").startOf("day").toDate();

    dateCondition = {
      createdAt: {
        $gte: startDate,
        $lte: endDate,
      },
    };
    console.log(
      `Weekly filter applied from: ${moment(startDate).format(
        "YYYY-MM-DD"
      )} to: ${moment(endDate).format("YYYY-MM-DD")}`
    );
  } else {
    // Default - no date filtering, return all data
    console.log("No specific date filter applied - returning all data");
  }

  // ========== PROFORMA INVOICE SUMMARY ==========
  const totalProformaInvoices = await ProformaInvoice.countDocuments(
    dateCondition
  );

  const proformaAmountAgg = await ProformaInvoice.aggregate([
    { $match: dateCondition },
    {
      $group: {
        _id: null,
        totalAmount: { $sum: "$total_amount" },
      },
    },
  ]);
  const totalProformaAmount =
    proformaAmountAgg.length > 0 ? proformaAmountAgg[0].totalAmount : 0;

  // Get status-wise breakdown for ProformaInvoices
  const proformaStatusAgg = await ProformaInvoice.aggregate([
    { $match: dateCondition },
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 },
        totalAmount: { $sum: "$total_amount" },
      },
    },
  ]);

  // ========== INVOICE SUMMARY ==========
  const totalInvoices = await Invoice.countDocuments(dateCondition);

  const invoiceAmountAgg = await Invoice.aggregate([
    { $match: dateCondition },
    {
      $group: {
        _id: null,
        totalAmount: { $sum: "$total" },
      },
    },
  ]);
  const totalInvoiceAmount =
    invoiceAmountAgg.length > 0 ? invoiceAmountAgg[0].totalAmount : 0;

  // Get status-wise breakdown for Invoices
  const invoiceStatusAgg = await Invoice.aggregate([
    { $match: dateCondition },
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 },
        totalAmount: { $sum: "$total" },
      },
    },
  ]);

  // ========== PAYMENT SUMMARY ==========
  const totalPayments = await Payment.countDocuments(dateCondition);

  const paymentAmountAgg = await Payment.aggregate([
    { $match: dateCondition },
    {
      $group: {
        _id: null,
        totalAmount: { $sum: "$amount" },
      },
    },
  ]);
  const totalPaymentAmount =
    paymentAmountAgg.length > 0 ? paymentAmountAgg[0].totalAmount : 0;

  // Get status-wise breakdown for Payments
  const paymentStatusAgg = await Payment.aggregate([
    { $match: dateCondition },
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 },
        totalAmount: { $sum: "$amount" },
      },
    },
  ]);

  // ========== MONTHLY BREAKDOWN FOR YEARLY VIEW ==========
  let monthlyBreakdown = [];
  if (view === "yearly" && year) {
    monthlyBreakdown = await Invoice.aggregate([
      { $match: dateCondition },
      {
        $group: {
          _id: {
            month: { $month: "$createdAt" },
            year: { $year: "$createdAt" },
          },
          invoiceCount: { $sum: 1 },
          totalAmount: { $sum: "$total" },
        },
      },
      {
        $project: {
          month: "$_id.month",
          year: "$_id.year",
          monthName: {
            $switch: {
              branches: [
                { case: { $eq: ["$_id.month", 1] }, then: "January" },
                { case: { $eq: ["$_id.month", 2] }, then: "February" },
                { case: { $eq: ["$_id.month", 3] }, then: "March" },
                { case: { $eq: ["$_id.month", 4] }, then: "April" },
                { case: { $eq: ["$_id.month", 5] }, then: "May" },
                { case: { $eq: ["$_id.month", 6] }, then: "June" },
                { case: { $eq: ["$_id.month", 7] }, then: "July" },
                { case: { $eq: ["$_id.month", 8] }, then: "August" },
                { case: { $eq: ["$_id.month", 9] }, then: "September" },
                { case: { $eq: ["$_id.month", 10] }, then: "October" },
                { case: { $eq: ["$_id.month", 11] }, then: "November" },
                { case: { $eq: ["$_id.month", 12] }, then: "December" },
              ],
              default: "Unknown",
            },
          },
          invoiceCount: 1,
          totalAmount: 1,
          _id: 0,
        },
      },
      { $sort: { month: 1 } },
    ]);
  }

  // ========== DAILY BREAKDOWN FOR WEEKLY VIEW ==========
  let dailyBreakdown = [];
  if (view === "weekly") {
    dailyBreakdown = await Invoice.aggregate([
      { $match: dateCondition },
      {
        $group: {
          _id: {
            day: { $dayOfMonth: "$createdAt" },
            month: { $month: "$createdAt" },
            year: { $year: "$createdAt" },
            date: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          },
          invoiceCount: { $sum: 1 },
          totalAmount: { $sum: "$total" },
        },
      },
      {
        $project: {
          date: "$_id.date",
          day: "$_id.day",
          month: "$_id.month",
          year: "$_id.year",
          invoiceCount: 1,
          totalAmount: 1,
          _id: 0,
        },
      },
      { $sort: { date: 1 } },
    ]);
  }

  // ========== RESPONSE ==========
  res.status(200).json({
    status: 200,
    success: true,
    message: `Financial summary for ${view} view`,
    filter_applied: {
      view: view || "all",
      year: year || null,
      month: mon || null,
      date_range: dateCondition.createdAt
        ? {
            from: moment(dateCondition.createdAt.$gte).format(
              "YYYY-MM-DD HH:mm:ss"
            ),
            to: moment(dateCondition.createdAt.$lte).format(
              "YYYY-MM-DD HH:mm:ss"
            ),
          }
        : "No date filter",
    },

    // ProformaInvoice Summary
    proforma_invoices: {
      total_count: totalProformaInvoices,
      total_amount: totalProformaAmount,
      status_wise: proformaStatusAgg.reduce((acc, item) => {
        acc[item._id || "unknown"] = {
          count: item.count,
          amount: item.totalAmount,
        };
        return acc;
      }, {}),
    },

    // Invoice Summary
    invoices: {
      total_count: totalInvoices,
      total_amount: totalInvoiceAmount,
      status_wise: invoiceStatusAgg.reduce((acc, item) => {
        acc[item._id || "unknown"] = {
          count: item.count,
          amount: item.totalAmount,
        };
        return acc;
      }, {}),
    },

    // Payment Summary
    payments: {
      total_count: totalPayments,
      total_amount: totalPaymentAmount,
      status_wise: paymentStatusAgg.reduce((acc, item) => {
        acc[item._id || "unknown"] = {
          count: item.count,
          amount: item.totalAmount,
        };
        return acc;
      }, {}),
    },

    // Additional breakdowns based on view
    ...(view === "yearly" &&
      monthlyBreakdown.length > 0 && {
        monthly_breakdown: monthlyBreakdown,
      }),

    ...(view === "weekly" &&
      dailyBreakdown.length > 0 && {
        daily_breakdown: dailyBreakdown,
      }),
  });
});

// New GET endpoint for dashboard with filter parameter
exports.dashboardWithFilter = TryCatch(async (req, res) => {
  const { filter } = req.query;
  
  console.log("Dashboard filter request:", { filter });

  let dateCondition = {};
  let startDate, endDate;

  // ========== DATE FILTERING LOGIC BASED ON FILTER ==========
  if (filter === "yearly") {
    // Yearly view - current year data
    const currentYear = new Date().getFullYear();
    startDate = moment(`${currentYear}-01-01`).startOf("day").toDate();
    endDate = moment(`${currentYear}-12-31`).endOf("day").toDate();

    dateCondition = {
      createdAt: {
        $gte: startDate,
        $lte: endDate,
      },
    };
    console.log(`Yearly filter applied for year: ${currentYear}`, {
      startDate: moment(startDate).format("YYYY-MM-DD HH:mm:ss"),
      endDate: moment(endDate).format("YYYY-MM-DD HH:mm:ss"),
    });
  } else if (filter === "monthly") {
    // Monthly view - current month data
    startDate = moment().startOf("month").toDate();
    endDate = moment().endOf("month").toDate();

    dateCondition = {
      createdAt: {
        $gte: startDate,
        $lte: endDate,
      },
    };
    console.log("Monthly filter applied for current month", {
      startDate: moment(startDate).format("YYYY-MM-DD HH:mm:ss"),
      endDate: moment(endDate).format("YYYY-MM-DD HH:mm:ss"),
    });
  } else if (filter === "weekly") {
    // Weekly view - last 7 days including today
    endDate = moment().endOf("day").toDate();
    startDate = moment().subtract(6, "days").startOf("day").toDate();

    dateCondition = {
      createdAt: {
        $gte: startDate,
        $lte: endDate,
      },
    };
    console.log(
      `Weekly filter applied from: ${moment(startDate).format(
        "YYYY-MM-DD"
      )} to: ${moment(endDate).format("YYYY-MM-DD")}`
    );
  } else {
    // Default - no date filtering, return all data
    console.log("No specific date filter applied - returning all data");
  }

  // ========== PRODUCTION CHART DATA ==========
  const productionPipeline = [
    {
      $group: {
        _id: null,
        completed: {
          $sum: {
            $cond: [{ $eq: ["$status", "completed"] }, 1, 0],
          },
        },
        progress: {
          $sum: {
            $cond: [{ $eq: ["$status", "production in progress"] }, 1, 0],
          },
        },
        pre_production: {
          $sum: {
            $cond: [
              {
                $in: [
                  "$status",
                  ["raw material approval pending", "Inventory Allocated"],
                ],
              },
              1,
              0,
            ],
          },
        },
      },
    },
  ];

  if (Object.keys(dateCondition).length > 0) {
    productionPipeline.unshift({
      $match: {
        ...dateCondition,
        approved: true,
      },
    });
  } else {
    productionPipeline.unshift({
      $match: {
        approved: true,
      },
    });
  }

  const productionChart = await ProductionProcess.aggregate(productionPipeline);

  // ========== INVENTORY CHART DATA ==========
  const productMatch = { approved: true };
  if (Object.keys(dateCondition).length > 0) {
    productMatch.createdAt = dateCondition.createdAt;
  }

  // Raw Materials
  const rawMaterialsCount = await Product.countDocuments({
    ...productMatch,
    category: "raw materials",
  });

  // Finished Goods
  const finishedGoodsCount = await Product.countDocuments({
    ...productMatch,
    category: "finished goods",
  });

  // Indirect Inventory
  const indirectInventoryCount = await Product.countDocuments({
    ...productMatch,
    inventory_category: "indirect",
  });

  // Work in Progress (from ProductionProcess)
  const processMatch = { approved: true };
  if (Object.keys(dateCondition).length > 0) {
    processMatch.createdAt = dateCondition.createdAt;
  }

  const workInProgressCount = await ProductionProcess.countDocuments({
    ...processMatch,
    status: "production started",
  });

  const inventoryChart = {
    raw_materials: rawMaterialsCount,
    finished_goods: finishedGoodsCount,
    indirect_inventory: indirectInventoryCount,
    work_in_progress: workInProgressCount,
  };

  // ========== MERCHANT CHART DATA ==========
  const merchantPipeline = [
    {
      $group: {
        _id: "$type",
        buyers: {
          $sum: {
            $cond: [{ $eq: ["$parties_type", "Buyer"] }, 1, 0],
          },
        },
        sellers: {
          $sum: {
            $cond: [{ $eq: ["$parties_type", "Seller"] }, 1, 0],
          },
        },
        total: { $sum: 1 },
      },
    },
  ];

  if (Object.keys(dateCondition).length > 0) {
    merchantPipeline.unshift({
      $match: dateCondition,
    });
  }

  const merchantData = await PartiesModels.aggregate(merchantPipeline);

  // Transform merchant data
  const merchantChart = {
    individual: { buyer: 0, seller: 0 },
    company: { buyer: 0, seller: 0 },
    totals: { total_individual: 0, total_company: 0, total_merchant: 0 },
  };

  merchantData.forEach((item) => {
    if (item._id === "Individual") {
      merchantChart.individual.buyer = item.buyers;
      merchantChart.individual.seller = item.sellers;
      merchantChart.totals.total_individual = item.total;
    } else if (item._id === "Company") {
      merchantChart.company.buyer = item.buyers;
      merchantChart.company.seller = item.sellers;
      merchantChart.totals.total_company = item.total;
    }
  });

  merchantChart.totals.total_merchant =
    merchantChart.totals.total_individual + merchantChart.totals.total_company;

  res.status(200).json({
    status: 200,
    success: true,
    message: `Dashboard data for ${filter || "all"} view`,
    filter_applied: {
      filter: filter || "none",
      date_range: Object.keys(dateCondition).length > 0 
        ? `${moment(startDate).format("YYYY-MM-DD")} to ${moment(endDate).format("YYYY-MM-DD")}`
        : "No date filter",
    },
    production_chart: productionChart[0] || {
      completed: 0,
      progress: 0,
      pre_production: 0,
    },
    inventory_chart: inventoryChart,
    merchant_chart: merchantChart,
  });
});
