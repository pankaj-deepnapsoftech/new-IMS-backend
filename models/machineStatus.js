const { Schema, model } = require("mongoose");

const machineStatusSchema = new Schema({
  machine: { type: String, required: true },
  status: { type: String, required: true },
  timestamp: { type: String, required: true },
  value1: { type: Number, required: true },
  value2: { type: Number, required: true }
}, {
  timestamps: true // createdAt aur updatedAt auto add ho jayega
});

const MachineStatus =  model('MachineStatus', machineStatusSchema);
module.exports = MachineStatus;
