const BOM = require("../models/bom");

const generateBomId = async () => {
  try {
    const prefix = "BOM";

    // Find the last BOM with BOM prefix
    const lastBom = await BOM.findOne({
      bom_id: { $regex: `^${prefix}` },
    }).sort({ createdAt: -1 });

    let nextId = 1;

    if (lastBom) {
      const lastId = lastBom.bom_id.replace(prefix, "");
      const numericPart = parseInt(lastId);
      if (!isNaN(numericPart)) {
        nextId = numericPart + 1;
      }
    }

    // Generate BOM ID with format: BOM001, BOM002, etc.
    return `${prefix}${nextId.toString().padStart(3, "0")}`;
  } catch (error) {
    console.error("Error generating BOM ID:", error);
    throw new Error("Failed to generate BOM ID");
  }
};

module.exports = { generateBomId };
