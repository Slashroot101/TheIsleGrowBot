const { Model, DataTypes } = require('sequelize');
const { dbConnection } = require('../database');
const growStatusEnum = require('./Enum/GrowStatusEnum');

class GrowDinoRequest extends Model {
	static associate(models) {
		models.GrowDinoRequest.belongsTo(models.User);
	}
}

GrowDinoRequest.init(
	{
		growStatus: {
			type: DataTypes.ENUM(growStatusEnum.initialize, growStatusEnum.waitingOnUser, growStatusEnum.processing, growStatusEnum.processed, growStatusEnum.declined),
			defaultValue: growStatusEnum.initialize,
		},
		cost: {
			type: DataTypes.INTEGER,
		},
		initiatedByDiscordId: {
			type: DataTypes.STRING,
		},
		dinoName: {
			type: DataTypes.STRING,
		},
	},
	{
		paranoid: true,
		sequelize: dbConnection,
		modelName: 'DinoGrowRequest',
	},
);

module.exports = GrowDinoRequest;