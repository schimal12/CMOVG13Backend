const mongoose = require("mongoose");
const express = require("express");
const auth = require('basic-auth');
const login = require("../functions/login");
const register = require('../functions/register');



module.exports = router => {


	router.get('/', (req, res) => {
		console.log(req.params);
		res.send('Si sirvió esta cosa.');
	});
	
	
	router.post('/authenticate', (req, res) => {
		const credentials = auth(req);
			if (!credentials) {
				res.status(400).json({ message: 'Invalid Request !' });
			} else {
				login.loginUser(credentials.name, credentials.pass)
				.then(result => {
					const token = jwt.sign(result, config.secret, { expiresIn: 1440 });
					res.status(result.status).json({ message: result.message, token: token });
				})
				.catch(err => res.status(err.status).json({ message: err.message }));
			}
		});
	
		router.post('/users', (req, res) => {
			const name = req.body.name;
			const email = req.body.email;
			const password = req.body.password;
			if (!name || !email || !password || !name.trim() || !email.trim() || !password.trim()) {
				res.status(400).json({message: 'Invalid Request !'});
			} else {
				register.registerUser(name, email, password)
				.then(result => {
					res.setHeader('Location', '/users/'+email);
					res.status(result.status).json({ message: result.message })
				})
			.catch(err => res.status(err.status).json({ message: err.message }));
			}
		});
	
}
