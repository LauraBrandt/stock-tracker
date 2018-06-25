const mongoose = require('mongoose');

const symbolSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true
  }
});

const Symbol = mongoose.model('Symbol', symbolSchema);

module.exports = Symbol;
