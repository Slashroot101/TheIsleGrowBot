const express = require('express');
const { port, oauthUrl, clientId, clientSecret, natsUrl, host } = require('../config');
const path = require('path');
const app = express();
const fetch = require('node-fetch');
const {User} = require('../model');
const eventTypes = require('../eventTypes');
const {connect} = require('nats');
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '/static'));

app.get('/', async (request, response) => {
    const { code } = request.query;

	if (code) {
		try {
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
			console.log(userJson, userConnectionJson)
			if(userJson.code === 0 || userJson.message?.includes('401') || userConnectionJson.code === 0 || userConnectionJson.message?.includes('401')){
				await nats.publish(eventTypes.steamLinkError);
				return response.render('index.ejs', { oauthUrl });
			}

            if(!userConnectionJson.length) {
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
			console.log(users)
			if(user.steamId !== null || users.length > 0){
				await nats.publish(eventTypes.steamAlreadyLinked, Buffer.from(JSON.stringify({discordId: userJson.id})));
				return response.render('index.ejs', { oauthUrl });
			}

			await User.update({steamId: filteredUsers[0].id}, {where: {id: user.id}});
			                                                                                                                                                                                                                                                                                                                                                                
			await nats.publish(eventTypes.steamLinked, Buffer.from(JSON.stringify({
				userId: user.id,
				discordId: userJson.id,
				steamId: filteredUsers[0].id,
			})));
		} catch (error) {
			// NOTE: An unauthorized token will not throw an error;
			// it will return a 401 Unauthorized response in the try block above
			console.error(error);
		}
	}

	return response.render('index.ejs', { oauthUrl });
});

app.listen(port, host, () => console.log(`App listening at http://localhost:${port}`));