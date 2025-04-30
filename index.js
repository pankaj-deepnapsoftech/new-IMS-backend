const express = require("express");
const cors = require("cors");
const { globalErrorHandler } = require("./middlewares/error");
const { connectDB } = require("./utils/connectDB");

const authRoutes = require("./routes/user");
const productRoutes = require("./routes/product");
const storeRoutes = require("./routes/store");
const agentRoutes = require("./routes/agent");
const userRoleRoutes = require("./routes/userRole");
const bomRoutes = require("./routes/bom");
const dashboardRoutes = require("./routes/dashboard");
const proformaInvoiceRoutes = require("./routes/proformaInvoice");
const invoiceRoutes = require("./routes/invoice");
const productionProcessRoutes = require("./routes/productionProcess");
const paymentRoutes = require("./routes/payment");
const scrapRoutes = require("./routes/scrap");

const app = express();

// require('dotenv').config({ path: `.env.${process.env.NODE_ENV}` })

// DEVELOPMENT ENVIRONMENT
// require("dotenv").config({ path: `.env.development` });

// PRODUCTION ENVIRONMENT
require('dotenv').config({ path: `.env.production` });

const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:3001",
  "http://localhost:5173",
  "https://inventory.deepmart.shop",
];

const corsOptions = {
  origin: function (origin, callback) {
    if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  allowedHeaders: "Authorization,Content-Type",
  preflightContinue: false,
  optionsSuccessStatus: 204,
  exposedHeaders: ["Content-Disposition"],
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/product", productRoutes);
app.use("/api/store", storeRoutes);
app.use("/api/agent", agentRoutes);
app.use("/api/role", userRoleRoutes);
app.use("/api/bom", bomRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/proforma-invoice", proformaInvoiceRoutes);
app.use("/api/invoice", invoiceRoutes);
app.use("/api/production-process", productionProcessRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/scrap", scrapRoutes);

app.use(globalErrorHandler);

app.listen(process.env.PORT, () => {
  console.log(`Server is listening on Port: ${process.env.PORT}`);
  connectDB();
});
