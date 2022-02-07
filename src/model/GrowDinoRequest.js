const { Sequelize, Model, DataTypes } = require('sequelize');
const { dbConnection } = require('../database');

class GrowDinoRequest extends Model {
	static associate(models) {
		models.GrowDinoRequest.belongsTo(models.User);
	}
}

exports.growStatusEnum = {
	initialize: 'Initialize',
	waitingOnUser: 'WaitingOnUser',
	processing: 'Processing',
	processed: 'Processed',
};

GrowDinoRequest.init(
	{
		growStatus: {
			type: DataTypes.ENUM(this.growStatusEnum.initialize, this.growStatusEnum.waitingOnUser, this.growStatusEnum.processing, this.growStatusEnum.processed),
			defaultValue: this.growStatusEnum.initialize,
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