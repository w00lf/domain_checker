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
      this.belongsTo(models.Domain, {
        foreignKey: 'domainId'
      });
      // define association here
    }
  };
  DomainCheck.init({
    status: {
      type: DataTypes.STRING,
      defaultValue: "started"
    },
    resultImage: {
      type: DataTypes.STRING,
    },
    domainId: {
      type: DataTypes.INTEGER,

      references: {
        // This is a reference to another model
        model: {
          tableName: 'Domains'
        },

        // This is the column name of the referenced model
        key: 'id',
      }
    }
  }, {
    sequelize,
    modelName: 'DomainCheck',
  });
  return DomainCheck;
};