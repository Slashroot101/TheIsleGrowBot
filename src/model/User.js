const { Sequelize, Model, DataTypes } = require('sequelize');
const { dbConnection } = require('../database');

class User extends Model {
	static associate(models) {
	}
}

User.init(
	{
		discordId: {
			type: DataTypes.STRING,
			unique: true,
		},
		steamId: {
			type: DataTypes.STRING,
			unique: true,
		},
		isBlacklisted: {
			type: DataTypes.ENUM('Y', 'N'),
			defaultValue: 'N',
		},
		isAdmin: {
			type: DataTypes.ENUM('Y', 'N'),
			defaultValue: 'N',
		},
		isApexApproved: {
			type: DataTypes.ENUM('Y', 'N'),
			defaultValue: 'N',
		}
	},
	{
		paranoid: true,
		sequelize: dbConnection,
		modelName: 'User',
	},
);


module.exports = User;