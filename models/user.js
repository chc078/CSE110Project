var mongoose = require('mongoose');

var userSchema = new mongoose.Schema({
   username: { type: String, unique: true},
   password: {type: String},
   email: {type: String, unique: true},
   resetPasswordToken: {type:String},
   resetPasswordExpire: {type : Date},
   id: String,
   access_token: String,
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
   }],
   always:[{
      name: {type: String},
      quantity: {type: Number}
   }],
   allergy:[
      {name: {type: String}, default:"Dairy",  checked:{type: Boolean},default:false},
      {name: {type: String}, default:"Egg",    checked:{type: Boolean},default:false},
      {name: {type: String}, default:"Gluten", checked:{type: Boolean},default:false},
      {name: {type: String}, default:"Peanut", checked:{type: Boolean},default:false},
      {name: {type: String}, default:"Seafood",checked:{type: Boolean},default:false},
      {name: {type: String}, default:"Sesame", checked:{type: Boolean},default:false},
      {name: {type: String}, default:"Soy",    checked:{type: Boolean},default:false},
      {name: {type: String}, default:"Sulfite",checked:{type: Boolean},default:false},
      {name: {type: String}, default:"TreeNut",checked:{type: Boolean},default:false},
      {name: {type: String}, default:"Wheat",  checked:{type: Boolean},default:false}
   ],
   myCreation:[{
      name: {type: String},
      ingredient: [{name: {type: String}, quantity: {type: Number}}],
      comment: {type: String},
      steps: [{step: {type: String}}]
   }]
});

module.exports = mongoose.model('User', userSchema);