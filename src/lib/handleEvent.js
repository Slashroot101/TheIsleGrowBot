module.exports = async (err, msg, client, cb) => {
	if (err) return console.log(err);
	
	await cb(client, msg.data.length ? JSON.parse(msg.data.toString()) : null);
};