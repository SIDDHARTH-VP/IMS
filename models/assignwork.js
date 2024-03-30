const mongoose = require('mongoose');

// Define a schema for your data
const WorkSchema = new mongoose.Schema({
  work_id: String,
  intern_id: String,
  assign_date: String,
status :{
  type: String,
  default: 'pending'
},

});





// Create a model from the schema
const AssignWork = mongoose.model('assignworkdata', WorkSchema);

module.exports = AssignWork;