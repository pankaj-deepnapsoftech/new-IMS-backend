const Product = require("../models/product");

const CATEGORY_PREFIX_MAP = {
  "finished goods": "FG",
  "raw materials": "RM",
  "semi finished goods": "SFG",
  "consumables": "CON",
  "bought out parts": "BOP",
  "trading goods": "TG",
  "service": "SRV",
};

async function generateProductId(category) {
  const prefix = CATEGORY_PREFIX_MAP[category.toLowerCase()];
  if (!prefix) throw new Error(`Invalid category "${category}" for ID generation`);

  // Regex to match existing IDs like RM001, RM002, etc.
  const regex = new RegExp(`^${prefix}(\\d{3})$`);

  const lastProduct = await Product.findOne({
    product_id: { $regex: regex }
  }).sort({ createdAt: -1 });

  let nextSeq = 1;
  if (lastProduct) {
    const match = lastProduct.product_id.match(regex);
    if (match && match[1]) {
      nextSeq = parseInt(match[1]) + 1;
    }
  }

  const padded = String(nextSeq).padStart(3, '0');
  return `${prefix}${padded}`;
}

module.exports = { generateProductId };
