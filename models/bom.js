const { Schema, model } = require("mongoose");

const bomSchema = new Schema(
  {
    creator: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Creator is a required field"],
    },
    production_process: {
      type: Schema.Types.ObjectId,
      ref: "Production-Process"
    },
    is_production_started: {
      type: Boolean,
      default: false
    },
    raw_materials: {
      type: [Schema.Types.ObjectId],
      ref: "BOM-Raw-Material",
    },
    scrap_materials: {
      type: [Schema.Types.ObjectId],
      ref: "BOM-Scrap-Material",
    },
    processes: {
      type: [String],
    },
    finished_good: {
      type: Schema.Types.ObjectId,
      ref: "BOM-Finished-Material",
      required: [true, "Finished good is a required field"],
    },
    approved: {
      type: Boolean,
      default: false,
    },
    approved_by: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    approval_date: {
      type: Date,
    },
    bom_name: {
      type: String,
      required: [true, "BOM name is a required field"],
    },
    parts_count: {
      type: Number,
      required: [true, "Part's count is a required field"],
    },
    other_charges: {
      labour_charges: {
        type: Number,
        default: 0,
      },
      machinery_charges: {
        type: Number,
        default: 0,
      },
      electricity_charges: {
        type: Number,
        default: 0,
      },
      other_charges: {
        type: Number,
        default: 0,
      },
    },
    total_cost: {
      type: Number,
      required: [true, "Total cost is a required field"],
    },
  },
  {
    timestamps: true,
  }
);

const BOM = model("BOM", bomSchema);
module.exports = BOM;
