const { Sequelize, Model, DataTypes } = require('sequelize');
const { dbConnection } = require('../database');

class Command extends Model {
  static associate(models){
  }
}

Command.init(
  {
    fileName: {
      type: DataTypes.STRING,
      unique: true,
    },
    name: {
      type: DataTypes.STRING,
      unique: true,
    },
    cost: {
      type: DataTypes.INTEGER
    },
    requiresAdmin: {
      type: DataTypes.BOOLEAN,
    },
    hasCooldown: {
      type: DataTypes.BOOLEAN,
    },
    cooldownExecutions: {
      type: DataTypes.INTEGER,
    },
    cooldownInMinutes: {
      type: DataTypes.INTEGER,
    },
    requiresSteamLink: {
      type: DataTypes.BOOLEAN,
    },
    isMaintenanceModeEnabled: {
      type: DataTypes.BOOLEAN,
    }
  },
  {
    paranoid: true,
    sequelize: dbConnection,
    modelName: 'Command',
  }
);

module.exports = Command;