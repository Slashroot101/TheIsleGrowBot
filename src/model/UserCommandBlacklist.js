const { Model, DataTypes } = require('sequelize');
const { dbConnection } = require('../database');

class UserCommandBlacklist extends Model {
	static associate(models) {
		models.UserCommandBlacklist.belongsTo(models.Command);
		models.UserCommandBlacklist.belongsTo(models.User);
	}
}

UserCommandBlacklist.init(
	{
		isBlackListed: {
			type: DataTypes.BOOLEAN,
		},
	},
	{
		paranoid: true,
		sequelize: dbConnection,
		modelName: 'UserCommandBlacklist',
	},
);

module.exports = UserCommandBlacklist;