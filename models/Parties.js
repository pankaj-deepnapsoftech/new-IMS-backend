const {Schema,model} = require("mongoose");

const PartiesSchema = new Schema({
    full_name:{type:String,require:true,trim:true},
    email:{type:String,require:true,trim:true,unique:true,lowerCase:true},
    phone:{type:String,require:true,trim:true},
    type:{type:String,required:true,trim:true},
    company_name:{type:String,trim:true},
<<<<<<< HEAD
    GST_NO: { type: String, trim: true },
    party_type: { type: String, require: true, trim: true }
=======
    GST_NO:{type:String,trim:true},
    parties_type:{type:String,trim:true}
>>>>>>> a27523ef84b4869f5aa983523fd08153a0f3dbe9
},{timestamps:true});

exports.PartiesModels = model("Parties",PartiesSchema);