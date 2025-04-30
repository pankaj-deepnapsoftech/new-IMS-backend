const Invoice = require("../models/invoice");
const { TryCatch, ErrorHandler } = require("../utils/error");

exports.create = TryCatch(async (req, res)=>{
    const invoice = req.body;
    if(!invoice){
        throw new ErrorHandler('Please provide all the fields', 400);
    }

    const createdInvoice = await Invoice.create({...invoice, balance: invoice.total, creator: req.user._id});

    res.status(200).json({
        status: 200,
        success: true,
        invoice: createdInvoice._doc,
        message: "Invoice created successfully"
    })
})
exports.update = TryCatch(async (req, res)=>{
    const {_id} = req.params;
    if(!_id){
        throw new ErrorHandler("Proforma Invoice doesn't exist", 400);
    }
    const invoice = req.body;
    if(!invoice){
        throw new ErrorHandler("Please provide all the fileds", 400);
    }

    const updatedInvoice = await Invoice.findByIdAndUpdate({_id: _id}, {
        $set: {...invoice, items: invoice.items}
    }, {new: true});

    res.status(200).json({
        status: 200,
        success: true,
        message: "Proforma Invoice has been updated successfully",
        invoice: updatedInvoice._doc
    });
})
exports.remove = TryCatch(async (req, res)=>{
    const {_id} = req.params;
    if(!_id){
        throw new ErrorHandler("Invoice Id not provided", 400);
    }

    const invoice = await Invoice.findOne({_id: _id});
    if(!invoice){
        throw new ErrorHandler("Invoice doesn't exist", 400);
    }
    await invoice.deleteOne();

    res.status(200).json({
        status: 200,
        success: true,
        message: "Invoice deleted successfully"
    })
})
exports.details = TryCatch(async (req, res)=>{
    const {_id} = req.params;
    if(!_id){
        throw new ErrorHandler("Invoice Id not provided", 400);
    }

    const invoice = await Invoice.findOne({_id: _id}).populate('creator supplier buyer store').populate({
        path: "items.item",
        model: "Product"
    });
;
    if(!invoice){
        throw new ErrorHandler("Invoice doesn't exist", 400);
    }

    res.status(200).json({
        status: 200,
        success: true,
        invoice: invoice._doc
    })
})
exports.all = TryCatch(async (req, res)=>{
    const Invoices = await Invoice.find().populate('creator buyer supplier store');;

    res.status(200).json({
        status: 200,
        success: true,
        invoices: Invoices
    });
})