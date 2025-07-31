const Product = require("../models/product");

// const CATEGORY_PREFIX_MAP = {
//   "finished goods": "FG",
//   "raw materials": "RM",
//   "semi finished goods": "SFG",
//   "consumables": "CON",
//   "bought out parts": "BOP",
//   "trading goods": "TG",
//   "service": "SRV",
// };

// Generate fallback prefix from custom category
function generateDynamicPrefix(category) {
  return category
    .split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .substring(0, 3); // Limit to 3 characters max
}

async function generateProductId(category) {
  if (!category) throw new Error("Category is required for ID generation");

  const normalized = category.toLowerCase();
  const prefix =  generateDynamicPrefix(normalized);


  const regex = new RegExp(`^${prefix}(\\d{3})$`, "i");

  const lastProduct = await Product.findOne({
    product_id: { $regex: regex },
  }).sort({ createdAt: -1 });

  let nextSeq = 1;
  if (lastProduct) {
    const match = lastProduct.product_id.match(regex);
    if (match && match[1]) {
      nextSeq = parseInt(match[1]) + 1;
    }
  }

  const padded = String(nextSeq).padStart(3, "0");
  return `${prefix}${padded}`;
}

module.exports = { generateProductId };
