'use strict';
module.exports = function(sequelize, DataTypes) {
  let Product = sequelize.define('Product', {
    title: DataTypes.STRING,
    price: DataTypes.INTEGER,
    category: DataTypes.STRING,
    UserId: DataTypes.INTEGER
  }, {
    classMethods: {
      associate: function(models) {
        // associations can be defined here
      }
    }
  });
  return Product;
};