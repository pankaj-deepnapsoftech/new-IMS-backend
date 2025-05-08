const { PartiesModels } = require("../models/Parties");
const { TryCatch, ErrorHandler } = require("../utils/error");

exports.CreateParties = TryCatch(async (req,res)=>{
    const data = req.body;
    const find = await PartiesModels.findOne({email:data.email});
    if(find){
        throw new ErrorHandler('Party already register', 400);
    }
    const result = await PartiesModels.create(data)
    return res.status(201).json({
        message:"Party added successfully",
        result
    })
});


exports.GetParties = TryCatch(async (req,res) => {
    const {page,limit} = req.query;
    const pages = parseInt(page) || 1;
    const limits = parseInt(limit) || 10;
    const skip = (pages - 1 ) * limits;
    const  data = await PartiesModels.find({}).sort({_id:-1}).skip(skip).limit(limits);
    return res.status(200).json({
        message:"Data",
        data
    })
});

exports.DeleteParties = TryCatch(async (req,res) => {
    const {id} = req.params;
    const find = await PartiesModels.findById(id);
    if(find){
        throw new ErrorHandler('Party already register', 400);
    }

    await PartiesModels.findByIdAndDelete(id);
    return res.status(200).json({
        message:"Parie Deleted"
    })
})

exports.UpdateParties = TryCatch(async (req,res)=>{
    const data = req.body;
    const {id} = req.params;
    const find = await PartiesModels.findById(id);
    if(find){
        throw new ErrorHandler('Party already register', 400);
    }
    await PartiesModels.findByIdAndUpdate(id,data)
    return res.status(200).json({
        message:"data updated successful"
    })
})




