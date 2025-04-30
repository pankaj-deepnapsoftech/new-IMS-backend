const { Schema, model } = require("mongoose");

const productSchema = new Schema({
    inventory_category: {
        type: String,
        enum: ['direct', 'indirect'],
        required: [true, 'Category is a required field']
    },
    name: {
        type: String,
        required: [true, "Product Name is a required field"],
        minlength: [2, "Product Name should be atleast 2 characters long"],
        maxlength: [40, "Product Name cannot exceed 40 characters"]
    },
    product_id: {
        type: String,
        required: [true, "Product Id is a required field"],
        unique: true,
    },
    uom: {
        type: String,
        required: [true, 'Unit of Measurement (UoM) is a required field'],
        minlength: [2, "Unit of Measurement (UoM) should be atleast 2 characters long"],
        maxlength: [40, "Unit of Measurement (UoM) cannot exceed 40 characters"]
    },
    category: {
        type: String,
        required: [true, "Product Category is a required field"],
        enum: {
            values: ['finished goods', 'raw materials', 'semi finished goods', 'consumables', 'bought out parts', 'trading goods', 'service'],
            message: 'Product Category must be one of the following: finished goods, raw materials, semi finished goods, consumables, bought out parts, trading goods, service'
        }
    },
    current_stock: {
        type: Number,
        required: [true, 'Current Stock is a required field']
    },
    change_type: { type: String, enum: ['increase', 'decrease'] },
    quantity_changed: { type: Number },
    price: {
        type: Number,
        required: [true, 'Product Price is a required field']
    },
    min_stock: Number,
    max_stock: Number,
    hsn_code: String,
    approved: {
        type: Boolean,
        default: false
    },
    item_type: {
        type: String,
        enum: ['buy', 'sell', 'both'],
        required: [true, 'Item type is a required field']
    },
    product_or_service: {
        type: String,
        enum: ['product', 'service'],
        required: [true, 'Product/Service is a required field']
    },
    sub_category: {
        type: String
    },
    regular_buying_price: {
        type: Number
    },
    wholesale_buying_price: {
        type: Number
    },
    mrp: {
        type: Number
    },
    dealer_price: {
        type: Number
    },
    distributor_price: {
        type: Number
    },
    store: {
        type: Schema.Types.ObjectId,
        ref: 'Store'
    }
}, {
    timestamps: true
});

const Product = model("Product", productSchema);
module.exports = Product;