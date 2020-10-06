"use strict";
exports.__esModule = true;
var express_1 = require("express");
var fs = require("fs");
var uniqid = require("uniqid");
var momentTz = require("moment-timezone");
var MAX_MESSAGE = 10;
var router = express_1.Router();
router.get('/', function (req, res) {
    res.redirect("../");
});
router.get('/deconnectUser', function (req, res) {
    delete req.session;
    res.clearCookie("userId");
    res.sendStatus(200);
});
router.get("/remove_message", function (req, res) {
    if (!req.query.id || !req.query.guild_id) {
        console.log("Error args not given");
        res.status(520).send("Error args not given bad request");
    }
    try {
        var guildData_1 = JSON.parse(fs.readFileSync(__dirname + "/../data/guilds/" + req.query.guild_id + "/data.json").toString());
        guildData_1.freq.forEach(function (element, index) {
            if (element.id == req.query.id)
                guildData_1.freq.splice(index, 1);
        });
        guildData_1.ponctual.forEach(function (element, index) {
            if (element.id == req.query.id)
                guildData_1.ponctual.splice(index, 1);
        });
        fs.writeFileSync(__dirname + "/../data/guilds/" + req.query.guild_id + "/data.json", JSON.stringify(guildData_1));
    }
    catch (error) {
        console.log("Error ajax remove schedule : " + error);
        res.status(500).send("Error operating on db");
        return;
    }
    res.send("This message has successfully been deleted");
});
router.post("/add_schedule", function (req, res) {
    var msg_id = uniqid();
    var query = req.body;
    console.log(query);
    if (!query.content || query.content.length < 1 || !query.frequency || !query.cron || !query.channel_id || !query.guild_id || !query.sys_content) {
        res.status(520);
        res.send("Error params not given");
        return;
    }
    try {
        var guildData = JSON.parse(fs.readFileSync(__dirname + "/../data/guilds/" + query.guild_id + "/data.json").toString());
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
            sys_content: query.sys_content
        });
        fs.writeFileSync(__dirname + "/../data/guilds/" + query.guild_id + "/data.json", JSON.stringify(guildData));
    }
    catch (error) {
        console.log("Error ajax add schedule : " + error);
        res.status(500);
        return;
    }
    res.send(msg_id);
});
router.post("/add_timer", function (req, res) {
    var msg_id = uniqid();
    var query = req.body;
    console.log(query);
    if (!query.content || query.content.length < 1 || !query.timestamp || !query.description || !query.channel_id || !query.guild_id || !query.sys_content) {
        res.status(400).send("Bad request : Params not given");
        return;
    }
    try {
        var guildData = JSON.parse(fs.readFileSync(__dirname + "/../data/guilds/" + query.guild_id + "/data.json").toString());
        guildData.ponctual.push({
            id: msg_id,
            channel_id: query.channel_id,
            timestamp: query.timestamp,
            message: query.content,
            description: query.description,
            sys_content: query.sys_content
        });
        fs.writeFileSync(__dirname + "/../data/guilds/" + query.guild_id + "/data.json", JSON.stringify(guildData));
    }
    catch (error) {
        console.log("Error ajax add ponctual : " + error);
        res.status(500);
        return;
    }
    res.send(msg_id);
});
router.get("/set_timezone", function (req, res) {
    var query = req.query;
    if (!query.guild_id || !query.utc_offset || !query.timezone) {
        res.status(400).send("Bad request : Params not given");
        return;
    }
    try {
        var guildData = JSON.parse(fs.readFileSync(__dirname + "/../data/guilds/" + query.guild_id + "/data.json").toString());
        var utc_offset_1 = parseInt(query.utc_offset.toString()) * 60;
        guildData.timezone_code = momentTz.tz.names().filter(function (el) {
            return momentTz.tz.zone(el).utcOffset(new Date().getTime()) == utc_offset_1;
        })[0];
        guildData.timezone = query.timezone;
        fs.writeFileSync(__dirname + "/../data/guilds/" + query.guild_id + "/data.json", JSON.stringify(guildData));
        res.send("This timezone has been successfully set !");
    }
    catch (error) {
        console.log("Error ajax set timezone : " + error);
        res.status(500);
        return;
    }
});
router.post("/set_message", function (req, res) {
    var query = req.body;
    console.log(query);
    if (!query.content || query.content.length < 1 || !query.msg_id || !query.guild_id || !query.sys_content) {
        res.status(400).send("Error bad request : params not given");
        return;
    }
    try {
        var guildData = JSON.parse(fs.readFileSync(__dirname + "/../data/guilds/" + query.guild_id + "/data.json").toString());
        guildData.freq.forEach(function (el, index) {
            if (el.id == query.msg_id) {
                el.message = query.content;
                el.sys_content = query.sys_content;
            }
        });
        guildData.ponctual.forEach(function (el, index) {
            if (el.id == query.msg_id) {
                el.message = query.content;
                el.sys_content = query.sys_content;
            }
        });
        fs.writeFileSync(__dirname + "/../data/guilds/" + query.guild_id + "/data.json", JSON.stringify(guildData));
        res.send();
    }
    catch (error) {
        console.log("Error ajax set message : " + error);
        res.status(500);
        return;
    }
});
exports["default"] = router;
