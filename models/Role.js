const {Schema, model} = require('mongoose');

const role = new Schema({
  value: {type: String, unique: true, default: 'student'}
})

module.exports = model('Role', role);
