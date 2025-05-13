const { DispatchModel } = require("../models/Dispatcher");
const { TryCatch, ErrorHandler } = require("../utils/error");
const ProductionProcess = require("../models/productionProcess");

exports.CreateDispatch = TryCatch(async (req, res) => {
    const data = req.body;
    const find = await DispatchModel.findOne({ Sale_id: data.Sale_id });

    if (find) {
        throw new ErrorHandler("Product Already Dispatched", 400);
    }

    const result = await DispatchModel.create({ ...data, creator: req.user._id });

    return res.status(201).json({
        message: "Product Dispatch Successful",
        data: result
    });

});

exports.GetDispatch = TryCatch(async (req, res) => {
    const { page, limit } = req.query;
    const pages = parseInt(page) || 1;
    const limits = parseInt(limit) || 10;
    const skip = (pages - 1) * limits;
    const data = await DispatchModel.aggregate([
        {
            $lookup:{
                from:"purchases",
                localField:"Sale_id",
                foreignField:"_id",
                as:"Sale_id",
                pipeline:[
                    {
                        $lookup:{
                            from:"parties",
                            localField:"party",
                            foreignField:"_id",
                            as:"customer_id"
                        }
                    },
                    {
                        $lookup:{
                            from:"products",
                            localField:"product_id",
                            foreignField:"_id",
                            as:"product_id"
                        }
                    }
                ]
            }
        }
    ]).sort({ _id: -1 }).skip(skip).limit(limits);
    return res.status(200).json({
        message: "Data",
        data
    })
});

exports.DeleteDispatch = TryCatch(async (req, res) => {
    const { id } = req.params;
    const find = await DispatchModel.findById(id);
    if (!find) {
        throw new ErrorHandler("Data already Deleted", 400);
    }
    await DispatchModel.findByIdAndDelete(id);
    return res.status(200).json({
        message: "Data deleted Successful"
    })
});

exports.UpdateDispatch = TryCatch(async (req, res) => {
    const { id } = req.params;
    const data = req.body;

    const find = await DispatchModel.findById(id);
    if (!find) {
        throw new ErrorHandler("Data not Found", 400);
    };
    await DispatchModel.findByIdAndUpdate(id, data);
    return res.status(200).json({
        message: "Data Updated Successful"
    })
});


exports.GetDispatch = TryCatch(async (req, res) => {
    const data = await ProductionProcess.aggregate([
      {
        $match: {
          status: "completed"
        }
      },
      {
        $lookup: {
          from: "users",
          localField: "creator",
          foreignField: "_id",
          as: "creator",
          pipeline: [
            {
              $lookup: {
                from: "user-roles",
                localField: "role",
                foreignField: "_id",
                as: "role",
                pipeline: [
                  {
                    $project: {
                      role: 1
                    }
                  }
                ]
              }
            },
            {
              $project: {
                role: 1,
                first_name: 1
              }
            }
          ]
        }
      },
      {
        $lookup: {
          from: "products",
          localField: "item",
          foreignField: "_id",
          as: "item",
          pipeline: [
            {
              $project: {
                name: 1
              }
            }
          ]
        }
      },
      {
        $lookup: {
          from: "boms",
          localField: "bom",
          foreignField: "_id",
          as: "bom",
          pipeline: [
            {
              $lookup: {
                from: "purchases",
                localField: "sale_id",
                foreignField: "_id",
                as: "sale_id",
                pipeline: [
                  {
                    $lookup: {
                      from: "users",
                      foreignField: "_id",
                      localField: "user_id",
                      as: "user_id",
                      pipeline: [
                        {
                          $lookup: {
                            from: "user-roles",
                            localField: "role",
                            foreignField: "_id",
                            as: "role",
                            pipeline: [
                              {
                                $project: {
                                  role: 1
                                }
                              }
                            ]
                          }
                        },
                        {
                          $project: {
                            role: 1,
                            first_name: 1
                          }
                        }
                      ]
                    }
                  },
                  {
                    $lookup: {
                      from: "parties",
                  localField: "party",
                  foreignField: "_id",
                      as: "customer_id",
                      pipeline: [
                        {
                          $project: {
                            full_name: 1
                          }
                        }
                      ]
                    }
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
                            name: 1
                          }
                        }
                      ]
                    }
                  },
                ]
              }
            },
            {
              $project: {
                sale_id: 1
              }
            }
          ]
        }
      },
      {
        $project: {
          creator: 1,
          item: 1,
          bom: 1,
          status: 1
        }
      },
      {
        $unwind: "$bom"
      },
      {
        $group: {
          _id: "$bom.sale_id",
          bom: { $first: "$bom" },
          creator: { $first: "$creator" },
          item: { $first: "$item" },
          status: { $first: "$status" }
        }
      },
      {
        $sort: {
          "bom.sale_id.updatedAt": -1
        }
      },
      {
        $project: {
          creator: 1,
          item: 1,
          bom: 1,
          status: 1
        }
      }
    ]);

    return res.status(200).json({
      message: "data",
      data
    });
});
