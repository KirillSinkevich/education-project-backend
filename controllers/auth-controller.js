const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { SECRET_KEY } = process.env;
const maxAge = 3 * 24 * 60 * 60;

// handler errors
const handleErrors = (err) => {
  // console.log(err.message, err.code);
  console.log(err.message);
  let error = { email: '', password: '' };

  // incorrect email
  if (err.message === 'incorrect email') {
    error.email = 'that email is not registered';
  }

  // incorrect email
  if (err.message === 'incorrect password') {
    error.password = 'that password is incorrect';
  }

  // duplicate error code
  if (err.code === 11000) {
    error.email = 'that email is already registered';
    return error;
  }

  // validation errors
  if (err.message.includes('User validation failed')) {
    Object.values(err.errors).forEach(({properties}) => {
      error[properties.path] = properties.message;
    });
  }

  return error;
}
const createToken = (id, roles) => {
  const payload = {
    id,
    roles,
  }

  return jwt.sign( payload, SECRET_KEY, {
    expiresIn: maxAge
  });
}

class AuthController {
  async signup(req, res) {

    try {
      const { email, password } = req.body;
      const userRole = await Role.findOne({value: 'admin'});
      const user= await User.create({ email, password, roles: userRole.value });
      const token = createToken(user._id);
      res.cookie('jwt', token, { httpOnly: true, maxAge: maxAge * 3});
      // res.status(201).json({ user: user._id });
      res.status(201).json({ user });
    }
    catch (err) {
      // console.log(err)
      const errors = handleErrors(err);
      res.status(400).json({errors});
    }
  }

  async login(req, res){
    const { email, password } = req.body

    try {
      const user = await User.login(email, password);
      const token = createToken(user._id, user.roles);
      res.cookie('jwt', token, { httpOnly: true, maxAge: maxAge * 1000});
      res.status(200).json({ user });
    }
    catch (err) {
      const errors = handleErrors(err);
      res.status(400).json({ errors });
    }
  }

  async logout(req, res) {
    res.cookie('jwt', '', { maxAge: 1 });
  }

  async getUsers(req, res) {
    try {
      const users = await User.find();
      res.json(users);
    } catch (e) {
      console.log(e);
    }
  }
}

module.exports = new AuthController();
