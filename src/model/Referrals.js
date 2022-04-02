const { Model, DataTypes } = require('sequelize');
const { dbConnection } = require('../database');

class Referral extends Model {
	static associate(models) {
		models.Referral.belongsTo(models.User, { as: 'referredByUser' });
		models.Referral.belongsTo(models.User, { as: 'referredUser' });
	}
}

Referral.init(
	{
		referralPointsEarned: {
			type: DataTypes.INTEGER,
		},
	},
	{
		paranoid: true,
		sequelize: dbConnection,
		modelName: 'Referral',
	},
);

module.exports = Referral;