var mongoose = require('mongoose');
const bcrypt = require("bcryptjs");
var Schema = mongoose.Schema;

const userSchema = new Schema({
    name: { type: String, required: true},
    email: {type: String, required: true},
    password: {type: String, required: true},
    timestamps: {type: String, required: true}
});

//Functions to hide the password of the users in the MongoDB. 
userSchema.methods.encryptPassword = function(password){
    return bcrypt.hashSync(password, bcrypt.genSaltSync(5), null);
};
//Function to check the password in the DB using bcrypt
userSchema.methods.validPassword = function(password){
    return bcrypt.compareSync(password, this.password);
};


module.exports = mongoose.model("User", userSchema);
