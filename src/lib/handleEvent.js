module.exports = async (err, msg, client, cb) => {
	if (err) return console.log(err);
	await cb(client, JSON.parse(msg.data.toString()));
};