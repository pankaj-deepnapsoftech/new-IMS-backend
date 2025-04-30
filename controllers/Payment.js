const {TryCatch, ErrorHandler} = require('../utils/error');
const Payment = require('../models/payment');
const Invoice = require('../models/invoice');

exports.create = TryCatch(async (req, res)=>{
    const paymentDetails = req.body;
    if(!paymentDetails){
        throw new ErrorHandler("Payment details not provided", 400);
    }
    const invoice = await Invoice.findById(paymentDetails?.invoice);
    if(!invoice){
        throw new ErrorHandler("Invoice doesn't exitst", 400);
    }

    const {amount, mode, description} = paymentDetails;
    if(!amount || !mode){
        throw new ErrorHandler("Amount and Mode are required fields", 400);
    }
    if(invoice.balance < amount){
        throw new Error('Amount must be less than the balance amount', 400);
    }

    invoice.balance -= amount;
    await invoice.save();

    await Payment.create({amount, mode, description,invoice: paymentDetails?.invoice, creator: req.user._id});

    res.status(200).json({
        status: 200,
        success: true,
        message: "Payment has been created successfully"
    })
})
exports.update = TryCatch(async (req, res)=>{
    const {_id} = req.params;
    if(!_id){
        throw new ErrorHandler("Id not provided", 400);
    }
    const paymentDetails = req.body;
    if(!paymentDetails){
        throw new ErrorHandler("Payment details not provided", 400);
    }
    const invoice = await Invoice.findById(paymentDetails?.invoice);
    if(!invoice){
        throw new ErrorHandler("Invoice doesn't exitst", 400);
    }

    const {amount, mode, description} = paymentDetails;
    if(!amount || !mode){
        throw new ErrorHandler("Amount and Mode are required fields", 400);
    }
    if(invoice.balance < amount){
        throw new Error('Amount must be less than the balance amount', 400);
    }

    invoice.balance -= amount;
    await invoice.save();

    const payment = await Payment.findById(_id);
    if(!payment){
        throw new ErrorHandler("Payment doesn't exist", 400);
    }
    payment.mode = mode;
    payment.amount = amount;
    payment.description = description;
    await payment.save();

    res.status(200).json({
        status: 200,
        success: true,
        message: "Payment has been updated successfully"
    })
})
exports.details = TryCatch(async (req, res)=>{
    const {_id} = req.params;
    if(!_id){
        throw new ErrorHandler("Id not provided", 400);
    }

    const payment = await Payment.findById(_id).populate('invoice creator');
    if(!payment){
        throw new ErrorHandler("Payment doesn't exist", 400);
    }

    res.status(200).json({
        status: 200,
        success: true,
        payment
    })
})
exports.all = TryCatch(async (req, res)=>{
    const payments = await Payment.find({}).populate("creator").populate({
        path: 'invoice',
        populate: [
            { path: 'buyer' },
            { path: 'supplier' }
        ]
    });
    res.status(200).json({
        status: 200,
        success: true,
        payments
    })
})