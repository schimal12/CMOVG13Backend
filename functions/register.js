const user = require('../models/users');
const bcrypt = require('bcryptjs');

exports.registerUser = (name, email, password) => 
	new Promise((resolve,reject) => {
	        const newUser = new user();
	        newUser.email = email;
	        newUser.name = name;
	        newUser.password = newUser.encryptPassword(password);
		newUser.save()
		.then(() => resolve({ status: 201, message: 'User Registered Sucessfully !' }))
		.catch(err => {
			if (err.code == 11000) {
				reject({ status: 409, message: 'User Already Registered !' });
			} else {
				reject({ status: 500, message: 'Internal Server Error !' });
			}
		});
	});