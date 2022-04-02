const { Sequelize, Model, DataTypes } = require('sequelize');
const { dbConnection } = require('../database');

class DinoVault extends Model {
	static associate(models) {
		models.DinoVault.belongsTo(models.User, { as: 'vaultedBy' });
		models.Referral.belongsTo(models.DinoVault, { as: 'vaultedBy' });
	}
}

DinoVault.init(
	{
		dinoDisplayName: {
			type: DataTypes.STRING,
		},
		savedName: {
			type: DataTypes.STRING,
		},
		dinoJson: {
			type: DataTypes.JSON,
		},
	},
	{
		paranoid: true,
		sequelize: dbConnection,
		modelName: 'DinoVault',
	},
);

module.exports = DinoVault;