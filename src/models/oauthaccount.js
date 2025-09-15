'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class OAuthAccount extends Model {
    static associate(models) {
    }
  }
  OAuthAccount.init({
    userId: DataTypes.INTEGER,
    provider: DataTypes.STRING,
    providerId: DataTypes.STRING,
    email: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'OAuthAccount',
  });
  return OAuthAccount;
};