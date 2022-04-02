const { Sequelize, Model, DataTypes } = require('sequelize');
const { default: Stripe } = require('stripe');
const { dbConnection } = require('../database');

class StripeWebhook extends Model {
	static associate(models) {

	}
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