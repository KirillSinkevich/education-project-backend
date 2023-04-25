const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { SECRET_KEY } = process.env;

// handler errors
const handleErrors = (err) => {
  console.log(err.message, err.code);
  let error = { email: '', password: '' };

  // incorrect email
  if (err.message === 'incorrect email') {
    errors.email = 'that email is not registered';
  }

  // incorrect email
  if (err.message === 'incorrect password') {
    errors.password = 'that password is incorrect';
  }

  // duplicate error code
  if (err.code === 11000) {
    error.email = 'that email is already registered';
    return error;
  }

  // validation errors
  if (err.message.includes('user validation failed')) {
    Object.values(err.errors).forEach(({properties}) => {
      error[properties.path] = properties.message;
    });
  }

  return error;
}

const maxAge = 3 * 24 * 60 * 60;
const  createToken = (id) => {
  return jwt.sign({ id }, SECRET_KEY, {
    expiresIn: maxAge
  });
}

module.exports.signup_post = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.create({ email, password, role: "student" });
    const token = createToken(user._id);
    res.cookie('jwt', token, { httpOnly: true, maxAge: maxAge * 3});
    res.status(201).json({ user: user._id });
  }
  catch (err) {
    const errors = handleErrors(err);
    res.status(400).json({ errors });
  }
}

module.exports.login_post = async (req, res) => {
  const { email, password } = req.body

  try {
    const user = await User.login(email, password);
    const token = createToken(user._id);
    res.cookie('jwt', token, { httpOnly: true, maxAge: maxAge * 1000});
    res.status(200).json({ user: user.id });
  }
  catch (err) {
    const errors = handleErrors(err);
    res.status(400).json({ errors });
  }
}

module.exports.logout_get = (req, res) => {
  res.cookie('jwt', '', { maxAge: 1 });
}
