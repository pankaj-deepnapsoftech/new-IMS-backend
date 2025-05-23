const { Purchase } = require("../models/purchase");
const { TryCatch, ErrorHandler } = require("../utils/error");


exports.create = TryCatch(async (req, res) => {
    try {
        const data = req.body;
        const newData = {
            ...data,
            user_id: req?.user._id,
        };
        await Purchase.create(newData);
        return res.status(201).json({ message: "Purchase Order Generated" });
    } catch (error) {
        console.error("Error creating purchase:", error);
        throw new ErrorHandler("Internal Server Error", 500);
    }
});
exports.update = TryCatch(async (req, res) => {
    const data = req.body;
    const { id } = req.params;
    const find = await Purchase.findById(id);
    if (!find) {
        throw new ErrorHandler("data not found", 400);
    }
    await Purchase.findByIdAndUpdate(id, data);
    return res.status(201).json({ message: "Purchase Order updated" });
});

exports.getAll = TryCatch(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const skip = (page - 1) * limit;
    const data = await Purchase.aggregate([
        {
            $lookup: {
                from: "boms",
                localField: "_id",
                foreignField: "sale_id",
                as: "boms",
                pipeline: [
                    {
                        $lookup: {
                            from: "production-processes",
                            foreignField: "bom",
                            localField: "_id",
                            as: "production_processes",
                            pipeline: [
                                {
                                    $project: {
                                        processes: 1,
                                    },
                                },
                            ],
                        },
                    },
                    {
                        $project: {
                            is_production_started: 1,
                            production_processes: 1,
                            bom_name: 1,
                        },
                    },
                ],
            },
        },
        {
            $lookup: {
                from: "users",
                localField: "user_id",
                foreignField: "_id",
                as: "user_id",
                pipeline: [
                    {
                        $lookup: {
                            from: "user-roles",
                            foreignField: "_id",
                            localField: "role",
                            as: "role",
                        },
                    },
                    {
                        $project: {
                            first_name: 1,
                            role: 1,
                        },
                    },
                ],
            },
        },
        {
            $lookup: {
                from: "customers",
                localField: "customer_id",
                foreignField: "_id",
                as: "customer_id",
                pipeline: [
                    {
                        $project: {
                            full_name: 1,
                        },
                    },
                ],
            },
        },
        {
            $lookup: {
                from: "products",
                localField: "product_id",
                foreignField: "_id",
                as: "product_id",
                pipeline: [
                    {
                        $project: {
                            name: 1,
                            price: 1,
                        },
                    },
                ],
            },
        },
        {
            $lookup: {
                from: "assineds",
                localField: "_id",
                foreignField: "sale_id",
                as: "assinedto",
                pipeline: [
                    {
                        $lookup: {
                            from: "users",
                            localField: "assined_to",
                            foreignField: "_id",
                            as: "assinedto",
                            pipeline: [
                                {
                                    $lookup: {
                                        from: "user-roles",
                                        localField: "role",
                                        foreignField: "_id",
                                        as: "role",
                                    },
                                },
                            ],
                        },
                    },
                ],
            },
        },
    ])
        .sort({ _id: -1 })
        .skip(skip)
        .limit(limit)
        .exec();

    return res.status(200).json({ message: "all purchases order found", data });
});

exports.AddToken = TryCatch(async (req, res) => {
    const { id } = req.params;
    const { token_amt } = req.body;

    if (!token_amt) {
        return res.status(404).json({
            message: "token amount is required!",
        });
    }

    if (!id) {
        return res.status(404).json({
            message: "couldn't access the sale!",
        });
    }

    await Purchase.findByIdAndUpdate(id, {
        token_amt,
        token_status: false,
    });

    return res.status(200).json({
        message: "Token Amount added for sample :)",
    });
});

exports.getOne = TryCatch(async (req, res) => {
    const id = req.user._id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const skip = (page - 1) * limit;
    const data = await Purchase.aggregate([
        { $match: { user_id: id } },
        {
            $lookup: {
                from: "boms",
                localField: "_id",
                foreignField: "sale_id",
                as: "boms",
                pipeline: [
                    {
                        $lookup: {
                            from: "production-processes",
                            foreignField: "bom",
                            localField: "_id",
                            as: "production_processes",
                            pipeline: [
                                {
                                    $project: {
                                        processes: 1,
                                    },
                                },
                            ],
                        },
                    },
                    {
                        $project: {
                            is_production_started: 1,
                            production_processes: 1,
                            bom_name: 1,
                        },
                    },
                ],
            },
        },
        {
            $lookup: {
                from: "users",
                localField: "user_id",
                foreignField: "_id",
                as: "user_id",
                pipeline: [
                    {
                        $lookup: {
                            from: "user-roles",
                            foreignField: "_id",
                            localField: "role",
                            as: "role",
                        },
                    },
                    {
                        $project: {
                            first_name: 1,
                            role: 1,
                        },
                    },
                ],
            },
        },
        {
            $lookup: {
                from: "parties",
                localField: "party",
                foreignField: "_id",
                as: "party_id",
                pipeline: [
                    {
                        $project: {
                            full_name: 1,
                        },
                    },
                ],
            },
        },
        {
            $lookup: {
                from: "products",
                localField: "product_id",
                foreignField: "_id",
                as: "product_id",
                pipeline: [
                    {
                        $project: {
                            name: 1,
                            price: 1,
                        },
                    },
                ],
            },
        },
        {
            $lookup: {
                from: "assineds",
                localField: "_id",
                foreignField: "sale_id",
                as: "assinedto",
                pipeline: [
                    {
                        $lookup: {
                            from: "users",
                            localField: "assined_to",
                            foreignField: "_id",
                            as: "assinedto",
                            pipeline: [
                                {
                                    $lookup: {
                                        from: "user-roles",
                                        localField: "role",
                                        foreignField: "_id",
                                        as: "role",
                                    },
                                },
                            ],
                        },
                    },
                ],
            },
        },
    ])
        .sort({ _id: -1 })
        .skip(skip)
        .limit(limit)
        .exec();
    return res.status(200).json({ message: "data found by id", data }); 
});

exports.uploadinvoice = TryCatch(async (req, res) => {
    try {
        const { invoice_remark } = req.body;
        const { id } = req.params;
        const { filename } = req.file;
        const find = await Purchase.findById(id);
        if (!find) {
            return res.status(404).json({
                message: "data not found try again",
            });
        }

        const path = `https://rtpasbackend.deepmart.shop/images/${filename}`;

        await Purchase.findByIdAndUpdate(id, { invoice: path, invoice_remark: invoice_remark });

        // await AssinedModel.findByIdAndUpdate(assined_to, {
        //   isCompleted: "Completed",
        //   assinedto_comment,
        // });

        return res.status(201).json({
            message: "file uploaded successful",
        });
    } catch (err) {
        return res.status(500).json({
            message: err,
        });
    }    
});


exports.Delivered = TryCatch(async (req, res) => {
    const { filename } = req.file;
    const { id } = req.params;

    if (!filename) {
        return res.status(404).json({
            message: "file not found",
        });
    }

    const data = await Purchase.findById(id);
    try {
        if (!data) {
            return res.status(404).json({
                message: "data not found",
            });
        }

        const path = `https://rtpasbackend.deepmart.shop/images/${filename}`;
        console.log('req.body.role=', req.body.role)
        if (req.body.role = 'Dispatcher') {
            await Purchase.findByIdAndUpdate(id, {
                dispatcher_order_ss: path,
                product_status: "Delivered",
            });
        } else {
            await Purchase.findByIdAndUpdate(id, {
                customer_order_ss: path,
                product_status: "Delivered",
            });
        }
        return res.status(200).json({
            message: "file uploaded successful",
        });

    } catch (err) {
        return res.status(500).json({
            message: err,
        });
    }
});



