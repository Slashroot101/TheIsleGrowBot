const eventTypes = require('./eventTypes');
const handleEvent = require('./lib/handleEvent');
const handleSteamlink = require('./eventHandlers/handleSteamLink');
const handleSteamLinkFailure = require('./eventHandlers/handleSteamLinkFailure');
const handleSteamAlreadyLinked = require('./eventHandlers/handleSteamAlreadyLinked');
const handleSteamLinkError = require('./eventHandlers/handleSteamLinkError');
const handleDonationComplete = require('./eventHandlers/handleDonationComplete');
const handleDonationUnverified = require('./eventHandlers/handleDonationUnverified');

module.exports = async (nats, client) => {
	nats.subscribe(eventTypes.steamLinked, {
		callback: (err, msg) => handleEvent(err, msg, client, handleSteamlink.handler),
	});

	nats.subscribe(eventTypes.steamLinkedFailure, {
		callback: (err, msg) => handleEvent(err, msg, handleSteamLinkFailure.handler),
	});

	nats.subscribe(eventTypes.steamAlreadyLinked, {
		callback: (err, msg) => handleEvent(err, msg, client, handleSteamAlreadyLinked.handler),
	});

	nats.subscribe(eventTypes.steamLinkError, {
		callback: (err, msg) => handleEvent(err, msg, client, handleSteamLinkError.handler),
	});

	nats.subscribe(eventTypes.donationComplete, {
		callback: (err, msg) => handleEvent(err, msg, client, handleDonationComplete.handler),
	});

	nats.subscribe(eventTypes.donationUnverified, {
		callback: (err, msg) => handleEvent(err, msg, client, handleDonationUnverified.handler),
	});
};