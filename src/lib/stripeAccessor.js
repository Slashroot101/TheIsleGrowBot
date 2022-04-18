const { stripeSecret } = require('../config');
const stripe = require('stripe')(stripeSecret);
const { StripeWebhook } = require('../model');
const logger = require('./logger');

exports.stripe = stripe;

exports.createOrUpdateCustomer = async (stripeId, email, metadata) => {
	let customer;

	if (!stripeId) {
		customer = await stripe.customers.create({
			email, metadata,
		});
	}
	else {
		customer = await stripe.customers.update(stripeId, { email });
	}

	return customer;
};

exports.createPaymentLink = async (quantity, userId, discordId) => {
	const fossilProductId = await this.getFossilPrice();
	const link = await stripe.paymentLinks.create({
		line_items: [{
			price: fossilProductId.id,
			quantity,
		}],
		metadata: {
			userId,
			discordId,
		},
	});

	return link;
};

exports.createWebhooks = async (webhook) => {
	const webhooks = await stripe.webhookEndpoints.list();
	logger.info(`Creating stripe webhooks`);

	for (const endpoint of webhooks.data) {
			logger.info(`Deleting existing webhook: ${endpoint.url}`);
			await stripe.webhookEndpoints.del(endpoint.id);
			await StripeWebhook.destroy({ where: { stripeWebhookId: endpoint.id } });
	}

	logger.info(`Webhook not found registered, creating webhooks: ${webhook}`);
	const returnedWebhook = await stripe.webhookEndpoints.create({ url: webhook, enabled_events: ['checkout.session.completed'] });
	await new StripeWebhook({ secret: returnedWebhook.secret, url: returnedWebhook.url, status: returnedWebhook.status, stripeWebhookId: returnedWebhook.id }).save();
};

exports.getFossilPrice = async () => {
	const prices = await stripe.prices.list({});
	return prices.data.filter(x => x.metadata.type === 'FossilDonation')[0];
};

exports.getFossilProduct = async () => {
	const products = await stripe.products.list();
	return products.data.filter(x => x.name === 'Fossil Donation')[0];
};

