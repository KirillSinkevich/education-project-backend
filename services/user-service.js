const bcrypt = require('bcrypt');
const uuid = require('uuid');
const UserModel = require('../models/User.js');
const Role = require('../models/Role.js');
const mailService = require('../services/mail-service.js');
const tokenService = require('../services/token-service.js');
const UserDto = require('../dtos/user-dto.js');
const ApiError = require('./../exceptions/api-error');

class UserService {
  async registration(email, password, name, surname) {
      const newUser = await UserModel.findOne({email});
      if (newUser) {
        throw ApiError.BedRequest(`User with email address ${email} already exists`);
      }
      const salt = await bcrypt.genSalt();
      const hashPassword = await bcrypt.hash(password, salt);
      const activationLink = uuid.v4();

      // const userRole = await Role.findOne({value: 'admin'});
      const userRole = await Role.findOne();
      const user= await UserModel.create({ email, name, surname, password: hashPassword, roles: userRole.value, activationLink });
      await mailService.sendActivationMail(email, `${process.env.API_URL}/api/activate/${activationLink}`);

      const userDto = new UserDto(user);
      const tokens = tokenService.generateTokens({...userDto});
      await tokenService.saveToken(userDto.id, tokens.refreshToken);

      return {...tokens, user: userDto};

  }

  async activate(activationLink) {
    const user = await UserModel.findOne(activationLink);
    if (!user) {
      throw ApiError.BedRequest('Incorrect activation link');
    }
    user.isActivated = true;
    await user.save();
  }

  async login(email, password){
    const user = await UserModel.findOne({email});
    if (!user) {
      throw ApiError.BedRequest('User with this email was not found');
    }
    const isPassEquals = await bcrypt.compare(password, user.password);
    if (!isPassEquals) {
      throw ApiError.BedRequest('Incorrect password');
    }
    const userDto = new UserDto(user);
    const tokens = tokenService.generateTokens({...userDto});

    await tokenService.saveToken(userDto.id, tokens.refreshToken);
    return { ...tokens, user: userDto};
  }

  async logout(refreshToken) {
    return await tokenService.removeToken(refreshToken);
  }

  async refresh(refreshToken) {
    if (!refreshToken) {
      throw ApiError.UnauthorizedError();
    }
    const userData = tokenService.validateRefreshToken(refreshToken);
    const tokenFromDB = await tokenService.findToken(refreshToken);
    // console.log(userData)
    // console.log(tokenFromDB)
    if (!userData || !tokenFromDB) {
      console.log('error')
      throw ApiError.UnauthorizedError()
    }

    const user = await UserModel.findById(userData.id)
    const userDto = new UserDto(user);
    const tokens = tokenService.generateTokens({...userDto});

    await tokenService.saveToken(userDto.id, tokens.refreshToken);
    return {... tokens, user: userDto};
  }

  async getAllUsers() {
    return UserModel.find();
  }
}

module.exports = new UserService();