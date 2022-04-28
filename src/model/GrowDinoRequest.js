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
		step: {
			type: DataTypes.INTEGER,
		},
		isComplete: {
			type: DataTypes.BOOLEAN,
		},
		value: {
			type: DataTypes.STRING,
		},
		messageId: {
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