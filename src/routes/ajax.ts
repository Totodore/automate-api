import {Router} from 'express';
import * as fs from "fs"
import * as momentTz from "moment-timezone";
import { SessionRequest } from '../requests/RequestsMiddleware';
import { MessageType } from '../models/MessageModel';
import Logger from '../utils/Logger';

const router = Router();

router.get('/', (req, res) => {
	res.redirect("../");
});

router.get('/deconnectUser', (req: SessionRequest, res) => {
	res.clearCookie("userId");
	res.sendStatus(200);
});

router.get("/remove_message", async (req: SessionRequest, res) => {
	const logger = new Logger("RemoveMessage");
	if (!req.query.id) {
		logger.log("Error args not given");
		res.status(520).send("Error args not given bad request");
	}
	try {
		(await req.dbManager.Message.findOne({where: {id: req.query.id}})).destroy();
	}
	catch (error) {
		logger.log(`Error ajax remove schedule : ${error}`);
		res.status(500).send("Error operating on db");
		return;
	}
	res.send("This message has successfully been deleted");
});

router.post("/add_schedule", async (req: SessionRequest, res) => {
	const logger = new Logger("AddSchedule");
	const query = req.body; 
	let addedID: string;
  logger.log(req.body);
	if (!query.message || query.message.length < 1 || !query.description || !query.cron || !query.channel_id || !query.guild_id || !query.sys_content) {
    res.status(520);
		res.send("Error params not given");
		return;
	}
	try {
		if (await req.isOverMessageLimit(query.guild_id) === true) {
			res.status(403);
			res.send("Message not allowed");
		} else {
			addedID = await req.addMessage(query, MessageType.Frequential);
			res.send(addedID);
		}
	
	} catch (error) {
		logger.log(`Error ajax add schedule : ${error}`);
		res.sendStatus(500);
	}
});

router.post("/add_timer", async (req: SessionRequest, res) => {
	const query = req.body;
	const logger = new Logger("AddTimer");
	let addedID: string;
	if (!query.message || query.message.length < 1 || !query.timestamp || !query.description || !query.channel_id || !query.guild_id || !query.sys_content) {
		res.status(400).send("Bad request : Params not given");
		return;
	}
	try {
		if (await req.isOverMessageLimit(query.guild_id)) {
			res.status(403);
			res.send("Message not allowed");
		} else {
			req.addMessage(query, MessageType.Ponctual);
			res.send(addedID);
		}
	} catch (error) {
		logger.log(`Error ajax add ponctual : ${error}`);
		res.sendStatus(500);
	}
});

router.get("/set_timezone", async (req: SessionRequest, res) => {
	const query = req.query;
	const logger = new Logger("SetTimezone");
	if (!query.guild_id || !query.utc_offset || !query.timezone) {
		res.status(400).send("Bad request : Params not given");
		return;
	}
	try {
		const utc_offset = parseInt(query.utc_offset.toString())*60;
		const timezone_code = momentTz.tz.names().filter(el => 
			momentTz.tz.zone(el).utcOffset(new Date().getTime()) == utc_offset)[0];

		await req.updateTimezone(query.guild_id.toString(), timezone_code, query.timezone.toString());
		res.send("This timezone has been successfully set !");
	} catch (error) {
		logger.log(`Error ajax set timezone : ${error}`);
		res.status(500);
		return;
	}
});

router.post("/set_message", async (req: SessionRequest, res) => {
	const query = req.body;
	const logger = new Logger("SetMessage");
	if (!query.message || query.message.length < 1 || !query.msg_id || !query.sys_content) {
		res.status(400).send("Error bad request : params not given");
		return;
	}
	try {
		await req.updateMessage(query);
		res.send();
	} catch (error) {
		logger.log(`Error ajax set message : ${error}`);
		res.status(500);
		return;
	}
});

export default router;