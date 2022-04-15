const { Model, DataTypes } = require('sequelize');
const { dbConnection } = require('../database');

class DinoStats extends Model {
  static associate(models) {

  }
}

DinoStats.init(
  {
    dinoName: {
      type: DataTypes.STRING,
      unique: true,
    },
    count: {
      type: DataTypes.INTEGER,
    },
  }, 
  {
    paranoid: true,
    sequelize: dbConnection,
    modelName: 'DinoStats',
  }
);

module.exports = DinoStats;