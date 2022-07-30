# TheIsleGrowBot

So, you are looking for a discord bot for your Isle Dedicated server that will handle injections, slays, and more? This bot will also verify steam users, not allowing you to run any commands on an account you cannot prove access to. Look no further:

TheIsleGrowBot is a bot that handles all of the above, and more. It will even integrate with Stripe to handle donations automatically.

The following requirements are needed to run this bot:

* nats
* the bot added to the server, give it administrator permissions
* node.js
* postgres

Once you have these dependencies setup, you will need to create a .prod.env file at the root level with the following values:

```
POSTGRES_DB=fossil
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
DB_HOST=db
SALT= 10
SECRET= stripe secret
CLIENTSECRET= discord client secret
TOKEN= discord bot token
CLIENTID= discord client id
GUILDID= guild id the bot will run in
PLAYERDATABASE= file location of the player database within the isle server
REFERRAL_AWARD= amount of points awarded for a referral
PORT= port the webhook server will listen on
OAUTHURL= oauthurl to verify steam. example: https://discord.com/api/oauth2/authorize?client_id=966077858617376809&response_type=code&scope=identify%20connections
NATSURL= url of nats + port
REPLY_CHANNEL= channel id of channel bot will reply in
HOST= host webhook server will listen on
SYNC_DB= make true the first time, then false every time after
STRIPE_SECRET= stripe api secret
STRIPE_WEBHOOK= stripe api webhook host to listen on
SCRAPE_INTERVAL= how often the scraper will scrape
MAX_APEX= maximum apex on the server
BOT_NAME= the name of the bot
CURRENCY_NAME= the name of the currency
```

# Installation

To get started, run:

```
npm install
```

Once you have run install, now you can run the services. You will need to run three things.

```
npm run api
```

```
npm run scraper
```

```
npm run start
```

With all of these things running, the bot should be up and running! You will notice the bot creating some roles and such needed for the business logic.


If you have any questions, please feel free to submit an issue!