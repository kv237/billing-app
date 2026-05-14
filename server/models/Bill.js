const mongoose = require("mongoose");

const billSchema = new mongoose.Schema({
  customerName: String,
  mobile: String,
  email: String,
  billDate: String,
  items: Array,
  grandTotal: Number,
}, {
  timestamps: true
});

module.exports = mongoose.model("Bill", billSchema);