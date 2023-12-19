// const User = require('../models/User');
// const jwt = require('jsonwebtoken');
//
// const {JWT_ACCESS_SECRET} = process.env;
// // check current user
// class AuthMiddleware {
//   async checkUser(req, res, next){
//     try {
//       const token = req.cookies.jwt;
//       if (!token) {
//         res.status(400).json({message: "User not authorized"})
//       }
//
//       jwt.verify(token, JWT_ACCESS_SECRET, async (err, decodeToken) => {
//         res.locals.user = await User.findById(decodeToken.id);
//         next();
//       })
//
//       // res.user = jwt.verify(token, SECRET_KEY);
//       // next();
//     } catch (e) {
//       console.log(e);
//       res.status(400).json({message: "User not authorized"})
//     }
//   }
//
//   async checkRole(roles){
//     return (req, res, next) => {
//       try {
//         const token = req.cookies.jwt;
//         if (!token) {
//           res.status(400).json({message: "User not authorized"})
//         }
//
//         const {roles: userRoles} = jwt.verify(token, JWT_ACCESS_SECRET);
//         // const user = jwt.verify(token, SECRET_KEY);
//         let hasRole = false;
//         // console.log('user: ', user)
//         userRoles.forEach(role => {
//           if (roles.includes(role)) {
//             hasRole = true;
//           }
//         });
//
//         if (!hasRole) {
//           return res.status(400).json({message: 'You don\'t have access'});
//         }
//         next();
//       } catch (e) {
//         console.log(e);
//         res.status(400).json({message: "User not authorized"})
//       }
//     }
//   }
//
// }
//
// module.exports = new AuthMiddleware();

const ApiError = require('./../exceptions/api-error');
const tokenService = require('./../services/token-service');

module.exports = function (req, res, next) {
  try {
    const authorizationHeader = req.headers.authorization;
    if (!authorizationHeader) {
      return next(ApiError.UnauthorizedError());
    }

    const accessToken = authorizationHeader.split(' ')[1];
    if (!accessToken) {
      return next(ApiError.UnauthorizedError());
    }

    const userData = tokenService.validateAccessToken(accessToken);
    if (!userData) {
      return next(ApiError.UnauthorizedError());
    }

    req.user = userData;
    next();
  } catch (e) {
    return next(ApiError.UnauthorizedError());
  }
}
