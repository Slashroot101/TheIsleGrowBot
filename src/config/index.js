const dotenv = require('dotenv');

dotenv.config({ path: `${process.cwd()}/.${process.env.NODE_ENV.replace(' ', '')}.env` });

module.exports = {
	forceDbReset: process.env.FORCE_DB_RESET,
	dbName: process.env.POSTGRES_DB,
	dbUsername: process.env.POSTGRES_USER,
	dbPassword: process.env.POSTGRES_PASSWORD,
	dbHost: process.env.DB_HOST,
	token: process.env.TOKEN,
	clientId: process.env.CLIENTID,
	guildId: process.env.GUILDID,
	playerDatabase: process.env.PLAYERDATABASE,
	referralAward: process.env.REFERRAL_AWARD,
	port: process.env.PORT,
	oauthUrl: process.env.OAUTHURL,
	clientSecret: process.env.CLIENTSECRET,
	natsUrl: process.env.NATSURL,
	replyChannel: process.env.REPLY_CHANNEL,
	host: process.env.HOST,
	stripeSecret: process.env.STRIPE_SECRET,
	stripeWebhook: process.env.STRIPE_WEBHOOK,
	scrapeInterval: process.env.SCRAPE_INTERVAL,
	maxApex: process.env.MAX_APEX,
	currencyName: process.env.CURRENCY_NAME,
	botName: process.env.BOT_NAME,
};