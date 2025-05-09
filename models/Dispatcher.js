const { Schema, model } = require("mongoose");

const DispatchSchema = new Schema({
    Sale_id: { type: Schema.Types.ObjectId, ref: "purchase" },
    tracking_id: { type: String,  trim: true },
    tracking_web: { type: String, trim: true },
    creator:{type:Schema.Types.ObjectId,ref:"User"},
    delivery_status: { type: String, enum: ["Dispatch", "Delivered"] },
    Task_status: { type: String, enum: ["Pending", "Processing", "Completed"],default:"Pending" }
});


exports.DispatchModel = model("Dispatch", DispatchSchema)




