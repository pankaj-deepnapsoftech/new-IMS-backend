const ProformaInvoice = require("../models/proforma-invoice");
const { TryCatch, ErrorHandler } = require("../utils/error");

exports.create = TryCatch(async (req, res)=>{
    const proformaInvoice = req.body;
    if(!proformaInvoice){
        throw new ErrorHandler('Please provide all the fields', 400);
    }

    const createdProformaInvoice = await ProformaInvoice.create({...proformaInvoice, creator: req.user._id});

    res.status(200).json({
        status: 200,
        success: true,
        proforma_invoice: createdProformaInvoice._doc,
        message: "Proforma Invoice created successfully"
    })
})
exports.update = TryCatch(async (req, res)=>{
    const {_id} = req.params;
    if(!_id){
        throw new ErrorHandler("Proforma Invoice doesn't exist", 400);
    }
    const proformaInvoice = req.body;
    if(!proformaInvoice){
        throw new ErrorHandler("Please provide all the fileds", 400);
    }

    const updatedProformaInvoice = await ProformaInvoice.findByIdAndUpdate({_id: _id}, {
        $set: {...proformaInvoice, items: proformaInvoice.items}
    }, {new: true});

    res.status(200).json({
        status: 200,
        success: true,
        message: "Proforma Invoice has been updated successfully",
        proforma_invoice: updatedProformaInvoice._doc
    });
})
exports.remove = TryCatch(async (req, res)=>{
    const {_id} = req.params;
    if(!_id){
        throw new ErrorHandler("Proforma Invoice Id not provided", 400);
    }

    const proformaInvoice = await ProformaInvoice.findOne({_id: _id});
    if(!proformaInvoice){
        throw new ErrorHandler("Proforma Invoice doesn't exist", 400);
    }
    await proformaInvoice.deleteOne();

    res.status(200).json({
        status: 200,
        success: true,
        message: "Proforma Invoice deleted successfully"
    })
})
exports.details = TryCatch(async (req, res)=>{
    const {_id} = req.params;
    if(!_id){
        throw new ErrorHandler("Proforma Invoice Id not provided", 400);
    }

    const proformaInvoice = await ProformaInvoice.findOne({_id: _id}).populate('creator supplier buyer store').populate({
        path: "items.item",
        model: "Product"
    });

    if(!proformaInvoice){
        throw new ErrorHandler("Proforma Invoice doesn't exist", 400);
    }

    res.status(200).json({
        status: 200,
        success: true,
        proforma_invoice: proformaInvoice._doc
    })
})
exports.all = TryCatch(async (req, res)=>{
    const proformaInvoices = await ProformaInvoice.find().populate('creator buyer supplier store');

    res.status(200).json({
        status: 200,
        success: true,
        proforma_invoices: proformaInvoices
    })
})