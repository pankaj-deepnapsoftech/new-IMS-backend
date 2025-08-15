const mongoose = require("mongoose");

const DispatchSchema = new mongoose.Schema(
  {
    // optional, already there:
    creator: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

    // existing sale field – leave as-is if you also use sales:
    Sale_id: [{ type: mongoose.Schema.Types.ObjectId, ref: "Purchase", default: [] }],

    // ✅ NEW: link to the production process
    production_process_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ProductionProcess",
      index: true,
      required: false
    },

    // status fields
    delivery_status: { type: String, default: "Dispatch" },
    Task_status: { type: String, default: "Pending" },
  },
  { timestamps: true, strict: true }
);

const DispatchModel = mongoose.model("Dispatch", DispatchSchema);
module.exports = { DispatchModel };
