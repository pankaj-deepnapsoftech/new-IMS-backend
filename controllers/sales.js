const { purchase } = require("../models/purchase");
const { TryCatch, ErrorHandler } = require("../utils/error");


exports.create = TryCatch(async (req, res) => {
    try {
        const data = req.body;
        const newData = {
            ...data,
            user_id: req?.user._id,
        };
        await purchase.create(newData);
        return res.status(201).json({ message: "Purchase Order Generated" });
    } catch (error) {
        console.error("Error creating purchase:", error);
        throw new ErrorHandler("Internal Server Error", 500);
    }
});
exports.update = TryCatch(async (req, res) => {
    const data = req.body;
    const { id } = req.params;
    const find = await purchase.findById(id);
    if (!find) {
        throw new ErrorHandler("data not found", 400);
    }
    await purchase.findByIdAndUpdate(id, data);
    return res.status(201).json({ message: "Purchase Order updated" });
});

exports.getAll = TryCatch(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const skip = (page - 1) * limit;
    const data = await purchase.aggregate([
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



