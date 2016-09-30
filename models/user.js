'use strict';

let bcrypt   = require('bcrypt-nodejs');

module.exports = function(sequelize, DataTypes) {
  let User = sequelize.define('User', {
    email: DataTypes.STRING,
    password: DataTypes.STRING
  }, {
    classMethods: {
      associate: function(models) {
        User.hasMany(models.Product);
        // associations can be defined here
      }
    },
    instanceMethods: {
      generateHash: function(password) {
        return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
      },
      validPassword: function(password) {
        return bcrypt.compareSync(password, this.password);
      }
    }
  });
  return User;
};