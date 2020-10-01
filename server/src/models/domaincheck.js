'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class DomainCheck extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  };
  DomainCheck.init({
    status: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'DomainCheck',
  });
  return DomainCheck;
};