const Resource = require("../models/resources");
const { TryCatch, ErrorHandler } = require("../utils/error");

exports.create = TryCatch(async (req, res) => {
  const resourceData = req.body;
  if (!resourceData || !resourceData.name || !resourceData.type) {
    throw new ErrorHandler("Please provide all the required fields", 400);
  }

  const createdResource = await Resource.create(resourceData);
  res.status(201).json({
    status: 201,
    success: true,
    message: "Resource has been created successfully",
    resource: createdResource,
  });
});

exports.edit = TryCatch(async (req, res) => {
  const { _id } = req.params;
  const { type, name, specification } = req.body;

  if (!_id) {
    throw new ErrorHandler("_id is a required field", 400);
  }

  const resource = await Resource.findById(_id);
  if (!resource) {
    throw new ErrorHandler("Resource not found", 404);
  }

  const updatedResource = await Resource.findByIdAndUpdate(
    { _id },
    { $set: { type, name, specification } },
    { new: true }
  );

  res.status(200).json({
    status: 200,
    success: true,
    message: "Resource has been updated successfully",
    resource: updatedResource,
  });
});

exports.remove = TryCatch(async (req, res) => {
  const { _id } = req.params;
  if (!_id) {
    throw new ErrorHandler("_id is a required field", 400);
  }
  const resource = await Resource.findById(_id);
  if (!resource) {
    throw new ErrorHandler("Resource not found", 404);
  }
  await resource.deleteOne();
  res.status(200).json({
    status: 200,
    success: true,
    message: "Resource has been deleted successfully",
  });
});


exports.details = TryCatch(async (req, res) => {
  const { _id } = req.params;
  if (!_id) {
    throw new ErrorHandler("_id is a required field", 400);
  }

  const resource = await Resource.findById(_id);
  if (!resource) {
    throw new ErrorHandler("Resource not found", 404);
  }
    res.status(200).json({
        status: 200,
        success: true,
        resource,
    });
});

exports.all = TryCatch(async (req, res) => {
  const resources = await Resource.find();  
  res.status(200).json({
    status: 200,
    success: true,
    resources,
  });
});
