const { Model, DataTypes } = require('sequelize');
const { dbConnection } = require('../database');

class Command extends Model {
	// eslint-disable-next-line no-empty-function
	static associate() {}
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
			type: DataTypes.INTEGER,
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
		},
	},
	{
		paranoid: true,
		sequelize: dbConnection,
		modelName: 'Command',
	},
);

module.exports = Command;