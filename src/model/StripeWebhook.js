const { Model, DataTypes } = require('sequelize');
const { dbConnection } = require('../database');

class StripeWebhook extends Model {
	// eslint-disable-next-line no-empty-function
	static associate() {}
}

StripeWebhook.init(
	{
		secret: {
			type: DataTypes.STRING,
		},
		url: {
			type: DataTypes.STRING,
		},
		status: {
			type: DataTypes.STRING,
		},
		stripeWebhookId: {
			type: DataTypes.STRING,
		},
	},
	{
		paranoid: true,
		sequelize: dbConnection,
		modelName: 'StripeWebhook',
	},
);

module.exports = StripeWebhook;