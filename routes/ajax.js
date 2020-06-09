const express = require('express');
const fs = require("fs");
const uniqid = require("uniqid");
const router = express.Router();

const MAX_MESSAGE = 10;

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
	res.send("This message has successfully been deleted");
});

router.post("/add_schedule", (req, res) => {
	const msg_id = uniqid();
	const query = req.fields; 
	if (!query.content || query.content.length < 1 || !query.frequency || !query.cron || !query.channel_id || !query.guild_id || !query.sys_content) {
		res.status(520);
		res.send("Error params not given");
		return;
	}
	try {
		const guildData = JSON.parse(fs.readFileSync(`${__dirname}/../data/guilds/${query.guild_id}/data.json`));
		if (guildData.freq.length >= MAX_MESSAGE) {
			res.status(403);
			res.send("Message not allowed");
			return;
		}
		guildData.freq.push({
			id: msg_id,
			channel_id: query.channel_id,
			cron: query.cron,
			message: query.content,
			description: query.frequency,
			sys_content: query.sys_content,
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
	const msg_id = uniqid();
	const query = req.fields; 
	if (!query.content || query.content.length < 1 || !query.timestamp || !query.description || !query.channel_id || !query.guild_id || !query.sys_content) {
		res.status(520);
		res.send("Error params not given");
		return;
	}
	try {
		const guildData = JSON.parse(fs.readFileSync(`${__dirname}/../data/guilds/${query.guild_id}/data.json`));
		guildData.ponctual.push({
			id: msg_id,
			channel_id: query.channel_id,
			timestamp: query.timestamp,
			message: query.content,
			description: query.description,
			sys_content: query.sys_content
		});
		fs.writeFileSync(`${__dirname}/../data/guilds/${query.guild_id}/data.json`, JSON.stringify(guildData));
	} catch (error) {
		console.log(`Error ajax add ponctual : ${error}`);
		res.status(500);
		res.send("Error operating on db");
		return;
	}
	res.send(msg_id);
});

router.get("/set_timezone", (req, res) => {
	const query = req.query;
	console.log(query);
	if (!query.guild_id || !query.utc_offset || !query.timezone) {
		res.status(400).send("Bad request : Params not given");
		return;
	}
	try {
		const guildData = JSON.parse(fs.readFileSync(`${__dirname}/../data/guilds/${query.guild_id}/data.json`));
		guildData.utc_offset = parseInt(query.utc_offset)*60;
		guildData.timezone = query.timezone;
		fs.writeFileSync(`${__dirname}/../data/guilds/${query.guild_id}/data.json`, JSON.stringify(guildData));
		res.send("This timezone has been successfully set !");
	} catch (error) {
		console.log(`Error ajax set timezone : ${error}`);
		res.send("Internal server error");
		res.status(500);
		return;
	}
});
module.exports = router;
