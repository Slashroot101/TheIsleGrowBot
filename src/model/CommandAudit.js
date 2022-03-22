const { Sequelize, Model, DataTypes } = require('sequelize');
const { dbConnection } = require('../database');

class CommandAudit extends Model {
  static associate(models) {
    models.CommandAudit.belongsTo(models.Command);
    models.CommandAudit.belongsTo(models.User);
  }
}

CommandAudit.init(
  {
    executionTime: {
      type: DataTypes.DATE,
    },
    cost: {
      type: DataTypes.INTEGER,
    }
  },
  {
    paranoid: true,
    sequelize: dbConnection,
    modelName: 'CommandAudit',
  }
);

module.exports = CommandAudit;