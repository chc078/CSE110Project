var mongoose = require('mongoose');

var userSchema = new mongoose.Schema({
   username: { type: String, unique: true},
   password: {type: String},
   email: {type: String, unique: true},
   resetPasswordToken: {type:String},
   resetPasswordExpire: {type : Date}
});

module.exports = mongoose.model('User', userSchema);