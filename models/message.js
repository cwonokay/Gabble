'use strict';
module.exports = function(sequelize, DataTypes) {
  var message = sequelize.define('message', {
    text: DataTypes.STRING(140),
    likey: DataTypes.INTEGER
  }, {});
  message.associate = function(models){
  message.belongsTo(models.User,{as:'Users', foreignKey: 'userId'});
  message.hasMany(models.like,{as:'likes', foreignKey: 'messageId'});
};
  return message;
};
