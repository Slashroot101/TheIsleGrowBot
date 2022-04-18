const express = require('express');
const { port, oauthUrl, clientId, clientSecret, natsUrl, host, stripeWebhook } = require('../config');
const path = require('path');
const app = express();
const fetch = require('node-fetch');
const {User, StripeWebhook, UserBank, Donation} = require('../model');
const bodyParser = require('body-parser');
const eventTypes = require('../eventTypes');
const {connect} = require('nats');
const {stripe, createWebhooks,} = require('../lib/stripeAccessor');
const logger = require('../lib/logger');

app.use(bodyParser.json({
}));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '/static'));

(async () => { 
	try {
		await createWebhooks(`${stripeWebhook}/donate`);
	} catch (err) {
		logger.err(err);
	}

	app.post('/donate', async (request, response ) => {
		const nats = await connect({
			url: natsUrl,
		});
		logger.info(`Received webhook request for donation! Processing!`)
		const webhook = await StripeWebhook.findAll({where: {status: 'enabled'}});
		let event;
		const metadata = request.body.data.object.metadata;
		// try {
		// 	const sig = request.headers['stripe-signature'];
		// 	logger.info(`${sig}  ${webhook[0].dataValues.secret}`)
		// 	console.log(webhook[0].dataValues.id);
		// 	event = stripe.webhooks.constructEvent(request.rawBody, sig, webhook[0].dataValues.secret);
		// } catch (err) {
		// 	console.log(err);
		// 	logger.info(`Received webhook request, but could not validate secret header. Rejecting request.`)
		// 	return response.status(400).send(`Webhook Error: ${err.message}`);
		// }
	
		if(request.body.type === 'checkout.session.completed') {
			logger.info(`Donation complete: adding ${Number(request.body.data.object.amount_total) / 100} to user [userId=${metadata.userId}]`)
			const userBank = await UserBank.findOne({where: {UserId: metadata.userId}});
			await UserBank.update({balance: userBank.balance + Number(request.body.data.object.amount_total) / 100}, {where: {UserId: metadata.userId}});
			await new Donation({fossilsGranted:  Number(request.body.data.object.amount_total) / 100, donationAmount:  Number(request.body.data.object.amount_total) / 100, paymentLinkId: request.body.data.object.id, isVerified: true}).save();
			await nats.publish(eventTypes.donationComplete, Buffer.from(JSON.stringify({
				discordId: metadata.discordId,
				userId: metadata.userId,
			})));
		}
	
		return response.status(201).end();
	});
	
	app.get('/', async (request, response) => {
			const { code } = request.query;
	
		if (code) {
			try {
				logger.info(`Received oAuth request for code ${code}`);
				const nats = await connect({
					url: natsUrl,
				});
				const oauthResult = await fetch('https://discord.com/api/oauth2/token', {
									method: 'POST',
					body: new URLSearchParams({
						client_id: clientId,
						client_secret: clientSecret,
						code,
						grant_type: 'authorization_code',
						redirect_uri: `http://${host}:${port}`,
						scope: 'identify',
					}),
					headers: {
						'Content-Type': 'application/x-www-form-urlencoded',
					},
				});
	
				const oauthData = await oauthResult.json();
							const userResult = await fetch('https://discord.com/api/users/@me', {
									headers: {
											authorization: `${oauthData.token_type} ${oauthData.access_token}`,
									},
							});
							const userConnectionResult = await fetch('https://discord.com/api/users/@me/connections', {
									headers: {
											authorization: `${oauthData.token_type} ${oauthData.access_token}`,
									},
							});
							
							var userConnectionJson = (await userConnectionResult.json());
	
							var userJson = await userResult.json();
				if(userJson.code === 0 || userJson.message?.includes('401') || userConnectionJson.code === 0 || userConnectionJson.message?.includes('401')){
					logger.info(`Publishing steamLinkError`);
					await nats.publish(eventTypes.steamLinkError);
					return response.render('index.ejs', { oauthUrl });
				}
	
							if(!userConnectionJson.length && userJson.id) {
								logger.info(`Event could not be processed for user [userId=${userJson.id}]`);
					await nats.publish(eventTypes.steamLinkedFailure, Buffer.from(JSON.stringify({
						discordId: userJson.id,
					})));
					return response.render('index.ejs', { oauthUrl });
							}
	
				const filteredUsers = userConnectionJson.filter(x => x.type === 'steam');
	
				let user = await User.findOne({where: {discordId: userJson.id}});
				if(user === null){
					 user = await new User({discordId: userJson.id, steamId: filteredUsers[0].id}).save();
				}
	
				let users = await User.findAll({where: {steamId: filteredUsers[0].id}});
				if(user.steamId !== null || users.length > 0){
					await nats.publish(eventTypes.steamAlreadyLinked, Buffer.from(JSON.stringify({discordId: userJson.id})));
					return response.render('index.ejs', { oauthUrl });
				}
	
				await User.update({steamId: filteredUsers[0].id}, {where: {id: user.id}});
				logger.info(`Publishing steam link success for user [userId=${user.id}]`);                                                                                                                                                                                                                                                                                                                                             
				await nats.publish(eventTypes.steamLinked, Buffer.from(JSON.stringify({
					userId: user.id,
					discordId: userJson.id,
					steamId: filteredUsers[0].id,
				})));
			} catch (error) {
				logger.error(error);
			}
		}
	
		return response.render('index.ejs', { oauthUrl });
	});
	
	
	
	app.listen(port, host, () => console.log(`App listening at http://localhost:${port}`));
})();