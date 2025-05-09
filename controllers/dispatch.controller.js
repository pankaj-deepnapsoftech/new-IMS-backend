const { DispatchModel } = require("../models/Dispatcher");
const { TryCatch } = require("../utils/error");


exports.CreateDispatch = TryCatch(async (req, res) => {
    const data = req.body;
    const find = await DispatchModel.findOne({ Sale_id: data.Sale_id });

    if (find) {
        throw new ErrorHandler("Product Already Dispatched", 400);
    }

    const result = await DispatchModel.create(data);

    return res.status(201).json({
        message:"Product Dispatch Successful",
        data:result
    })

});

exports.DeleteDispatch = TryCatch(async (req,res) => {
    const {id} = req.params;
    const find = await DispatchModel.findById(id);
     if (!find) {
        throw new ErrorHandler("Data already Deleted", 400);
    }
    await DispatchModel.findByIdAndDelete(id);
    return res.status(200).json({
        message:"Data deleted Successful"
    })
});

exports.UpdateDispatch = TryCatch(async (req,res) => {
    const {id} = req.params;
    const data = req.body;

    const find = await DispatchModel.findById(id);
    if(!find){
        throw new ErrorHandler("Data not Found", 400);
    };
    await DispatchModel.findByIdAndUpdate(id,data);
    return res.status(200).json({
        message:"Data Updated Successful"
    })
})