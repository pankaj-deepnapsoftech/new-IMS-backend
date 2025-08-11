const { Schema, model } = require("mongoose");

const inventoryShortageSchema = new Schema(
  {
    bom: {
      type: Schema.Types.ObjectId,
      ref: "BOM",
      required: true,
    },
    raw_material: {
      type: Schema.Types.ObjectId,
      ref: "BOM-Raw-Material",
      required: true,
    },
    item: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    shortage_quantity: {
      type: Number,
      required: true,
    },
    created_at: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

const InventoryShortage = model("InventoryShortage", inventoryShortageSchema);
module.exports = InventoryShortage;