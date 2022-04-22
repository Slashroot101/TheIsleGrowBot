const { Model, DataTypes } = require('sequelize');
const { dbConnection } = require('../database');

class InjectSpawnLocations extends Model {
  static associate(models) {

  }
}

InjectSpawnLocations.init(
  {
    spawnPoint: {
      type: DataTypes.STRING,
      unique: true,
    },
    name: {
      type: DataTypes.STRING,
      unique: true,
    },
  }, 
  {
    paranoid: true,
    sequelize: dbConnection,
    modelName: 'InjectSpawnLocations',
  }
);

module.exports = InjectSpawnLocations;