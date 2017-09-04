'use strict';
module.exports = function(sequelize, DataTypes) {
  var like = sequelize.define('like', {
    userId: DataTypes.INTEGER,
    messageId: DataTypes.INTEGER
  }, {});
  like.associate = function(models){
    like.belongsTo(models.message,{as: 'messages', foreignKey: 'messageId'});
      like.belongsTo(models.User,{as: 'Users', foreignKey: 'userId'});
  };
  return like;
};
