const { Schema, model } = require("mongoose");

const resourcesSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Resource name is required"],
      unique: true,
      minlength: [2, "Resource name must be at least 2 characters long"],
      maxlength: [50, "Resource name cannot exceed 50 characters"],
    },
    type: {
      type: String,
      required: [true, "Resource type is required"],
    },
    specification: {
      type: String,
      maxlength: [200, "Specification cannot exceed 200 characters"],
    },
    customId: {
      type: String,
      required: true,
      unique: true, // Important to prevent duplicates like "customer-feedback-001"
    },
  },
  {
    timestamps: true,
  }
);

const Resource = model("Resource", resourcesSchema);
module.exports = Resource;
