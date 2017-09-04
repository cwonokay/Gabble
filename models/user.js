'use strict';
module.exports = function(sequelize, DataTypes) {
  var User = sequelize.define('User', {
    username: DataTypes.STRING,
    password: DataTypes.STRING,
    salt: DataTypes.STRING,
    name: DataTypes.STRING
  }, {});
  User.associate = function(models){
    User.hasMany(models.message,{as:'messages', foreignKey: 'userId'});
    User.hasMany(models.like,{as:'likes', foreignKey: 'userId'});

  };
  return User;
};
