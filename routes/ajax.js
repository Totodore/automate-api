const express = require('express');
const fs = require("fs");
const uniqid = require("uniqid");

const router = express.Router();
router.get('/', (req, res) => {
	res.redirect("../");
});

router.get('/deconnectUser', (req, res) => {
	req.session.destroy();
	res.clearCookie("userId");
	res.sendStatus(200);
});

router.get("/remove_message", (req, res) => {
	if (!req.query.id || !req.query.guild_id) {
		console.log("Error args not given");
		res.status(520).send("Error args not given bad request");
	}
	try {
		const guildData = JSON.parse(fs.readFileSync(`${__dirname}/../data/guilds/${req.query.guild_id}/data.json`));
		guildData.freq.forEach((element, index) => {
			if (element.id == req.query.id)
				guildData.freq.splice(index, 1);
		});
		guildData.ponctual.forEach((element, index) => {
			if (element.id == req.query.id)
				guildData.ponctual.splice(index, 1);
		});
		fs.writeFileSync(`${__dirname}/../data/guilds/${req.query.guild_id}/data.json`, JSON.stringify(guildData));
	}
	catch (error) {
		console.log(`Error ajax remove schedule : ${error}`);
		res.status(500).send("Error operating on db");
		return;
	}
	res.send("Ce message à bien été supprimé");
});

router.post("/add_schedule", (req, res) => {
	const query = req.body;
	console.log(req.body);
	const msg_id = uniqid();
	if (!query.content || query.content.length < 1 || !query.frequency || !query.cron || !query.channel_id || !query.guild_id) {
		res.status(520);
		res.send("Error params not given");
		return;
	}
	try {
		const guildData = fs.readFileSync(`${__dirname}/../data/guilds/${query.guild_id}/data.json`);
		guildData.fred.push({
			id: msg_id,
			channel_id: query.channel_id,
			cron: query.cron,
			message: query.content,
			description: query.frequency
		});
		fs.writeFileSync(`${__dirname}/../data/guilds/${query.guild_id}/data.json`, JSON.stringify(guildData));
	} catch (error) {
		console.log(`Error ajax add schedule : ${error}`);
		res.status(500);
		res.send("Error operating on db");
		return;
	}
	res.send(msg_id);
});
router.post("/add_timer", (req, res) => {
	
});
module.exports = router;
