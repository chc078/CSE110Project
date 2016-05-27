var mongoose = require('mongoose');

var userSchema = new mongoose.Schema({
   username: { type: String, unique: true},
   password: {type: String},
   email: {type: String, unique: true},
   resetPasswordToken: {type:String},
   resetPasswordExpire: {type : Date},
   slist: [{
      name: {type: String},
      shop: {type: String},
      quantity: {type: Number},
      checked: {type: Boolean}
   }],
   vfridge:[{
      name: {type: String},
      shop: {type: String},
      quantity: {type: Number}
   }]
});

module.exports = mongoose.model('User', userSchema);