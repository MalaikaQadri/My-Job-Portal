'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Chat extends Model {
    static associate(models) {
    Chat.belongsTo(models.User,{
      foreignKey:"user1Id", as:"user1"
    });

    Chat.belongsTo(models.User,{
      foreignKey:"user2Id", as:"user2"
    });

    Chat.hasMany(models.Message,{
      foreignKey: "chatId", as:"message"
    });

    }
  }
  Chat.init({
    chatId: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUID4,
      unique: true
    },
    user1Id: {
      type: DataTypes.INTEGER,
      allowNull:false
    },
    user2Id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
  }, {
    sequelize,
    modelName: 'Chat',
  });
  return Chat;
};