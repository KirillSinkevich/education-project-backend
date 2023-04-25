const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { SECRET_KEY } = process.env;

// check current user
const checkUser = (req, rex, next) => {
  const token = req.cookies.jwt;

  if (token) {
    jwt.verify(token, SECRET_KEY, async (err, decodeToken) => {
      if (err) {
        console.log(err.message);
        next();
      } else {
        console.log(decodeToken);
        let user = await User.findById(decodeToken.id);
        res.locals.user = user;
        next();
      }
    })
  }
}

module.exports = { checkUser };
