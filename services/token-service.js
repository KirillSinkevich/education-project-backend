const jwt = require('jsonwebtoken');
const TokenModel = require('../models/Token.js');

const { JWT_ACCESS_SECRET, JWT_REFRESH_SECRET } = process.env;
class TokenService {
  expiresIn = 4 * 3600 * 1000;
  generateTokens(payload) {
    const accessToken = jwt.sign(payload, JWT_ACCESS_SECRET, {expiresIn: this.expiresIn});
    const refreshToken = jwt.sign(payload, JWT_REFRESH_SECRET, {expiresIn: '14d'});
    // const expiresIn = 4 * 3600 * 1000;

    return {
      accessToken,
      refreshToken,
      expiresIn: this.expiresIn
    }
  }

  validateAccessToken(token) {
    try {
      return jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    } catch (e) {
      return null;
    }
  }

  validateRefreshToken(token) {
    try {
      return jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    } catch (e) {
      return null;
    }
  }

  async saveToken(userId, refreshToken) {
    const tokenData = await TokenModel.findOne({user: userId});
    if (tokenData) {
      tokenData.refreshToken = refreshToken;
      return tokenData.save();
    }

    return await TokenModel.create({user: userId, refreshToken});
  }

  async removeToken(refreshToken) {
    return await TokenModel.deleteOne({refreshToken});
  }

  async findToken(refreshToken) {
    return await TokenModel.findOne({refreshToken});
  }
}

module.exports = new TokenService();