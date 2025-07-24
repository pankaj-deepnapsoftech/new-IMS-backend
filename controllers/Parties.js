const { PartiesModels } = require("../models/Parties");
const { TryCatch, ErrorHandler } = require("../utils/error");

const generateCustomerId = async (partyType, companyName, consigneeName) => {
  let prefix = "";

  // Use company name only if type is 'Company' and it's a valid string
  if (partyType === "Company" && typeof companyName === "string" && companyName.trim()) {
    prefix = companyName.trim().substring(0, 2).toUpperCase();
  }
  // Otherwise use consignee name if it's a valid string
  else if (Array.isArray(consigneeName) && typeof consigneeName[0] === "string") {
    prefix = consigneeName[0].trim().substring(0, 2).toUpperCase();
  }
  else if (typeof consigneeName === "string" && consigneeName.trim()) {
    prefix = consigneeName.trim().substring(0, 2).toUpperCase();
  }

  // Fallback
  else {
    prefix = "CU";
  }

  // Find last party with same prefix
  const lastParty = await PartiesModels.findOne({
    cust_id: { $regex: `^${prefix}` }
  }).sort({ createdAt: -1 });

  let nextId = 1;

  if (lastParty) {
    const lastId = lastParty.cust_id.replace(prefix, "");
    nextId = Number(lastId) + 1;
  }

  return `${prefix}${nextId.toString().padStart(3, "0")}`;
};




exports.CreateParties = TryCatch(async (req, res) => {
  const data = req.body;
  const { type, company_name, consignee_name } = data;


  const cust_id = await generateCustomerId(type, company_name, consignee_name);


  const result = await PartiesModels.create({ ...data, cust_id });
     console.log(result)
  return res.status(201).json({
    message: "Party added successfully",
    result,
  });
});



exports.GetParties = TryCatch(async (req, res) => {
  const { page, limit } = req.query;
  const pages = parseInt(page) || 1;
  const limits = parseInt(limit) || 10;
  const skip = (pages - 1) * limits;
  const totalData = await PartiesModels.find().countDocuments();
  const data = await PartiesModels.find({})
    .sort({ _id: -1 })
    .skip(skip)
    .limit(limits);
  return res.status(200).json({
    message: "Data",
    data,
    totalData,
  });
});


exports.DeleteParties = TryCatch(async (req, res) => {
  const { id } = req.params;
  const find = await PartiesModels.findById(id);
  if (!find) {
    throw new ErrorHandler(" Party not found ", 400);
  }

  await PartiesModels.findByIdAndDelete(id);
  return res.status(200).json({
    message: "Party Deleted",
  });
});

exports.UpdateParties = TryCatch(async (req, res) => {
  const data = req.body;
  const { id } = req.params;

  const find = await PartiesModels.findById(id);
  if (!find) {
    throw new ErrorHandler("Party not registered", 400);
  }

  // Destructure type/company/consignee from incoming update data
  const { type, company_name, consignee_name } = data;

  // Generate new cust_id based on updated data
  const cust_id = await generateCustomerId(type, company_name, consignee_name);

  // Update the party with new data + generated cust_id
  const updated = await PartiesModels.findByIdAndUpdate(
    id,
    { ...data, cust_id },
    { new: true }
  );

  return res.status(200).json({
    message: "Data updated successfully",
    updated,
  });
});

