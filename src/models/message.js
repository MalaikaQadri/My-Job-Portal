'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Message extends Model {

    static associate(models) {
      Message.belongsTo(models.Chat,{
        foreignKey:"chatId",as:"chat"
      });

      Message.belongsTo(models.Chat,{
        foreignKey:"senderId",as:"sender"
      });

      Message.belongsTo(models.Chat,{
        foreignKey:"receiverId",as:"receiver"
      });
    }
  }
  Message.init({
    chatId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    senderId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    receiverId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false
    },
  }, {
    sequelize,
    modelName: 'Message',
  });
  return Message;
};