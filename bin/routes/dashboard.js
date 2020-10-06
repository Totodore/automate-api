"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [0, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var _this = this;
exports.__esModule = true;
var express_1 = require("express");
var fs = require("fs");
var Cron = require("cron-converter");
var momentTz = require("moment-timezone");
var router = express_1.Router();
router.get('/', function (req, res, next) { return __awaiter(_this, void 0, void 0, function () {
    var db, table, guild_id, guildRes, peopleRes, channelRes, rolesRes, bot, zones, _i, _a, el, zoneEl, offset, zoneName, name_1;
    return __generator(this, function (_b) {
        guild_id = req.query.id;
        try {
            db = JSON.parse(fs.readFileSync(__dirname + "/../data/guilds/" + req.query.id + "/data.json").toString());
            table = db.freq.concat(db.ponctual);
            bot = req.app.get("bot");
            guildRes = bot.getGuild(guild_id);
            peopleRes = bot.getPeople(guild_id);
            channelRes = bot.getChannels(guild_id).filter(function (element) {
                if (!element.deleted && (element.type == "text" || element.type == "news"))
                    return true;
                else
                    return false;
            });
            rolesRes = bot.getRoles(guild_id);
        }
        catch (e) {
            console.log("Error loading datas : " + e);
            res.redirect("../?msg=" + encodeURI("Whoops ! It seems like an error has occured during the dashboard's loading. Sniffu..."));
            return [2 /*return*/];
        }
        table.forEach(function (element) {
            channelRes.forEach(function (channel, index) {
                if (channel.id == element.channel_id)
                    element.channel_name = channel.name;
            });
        });
        table.sort(function (a, b) {
            var timestamp_a, timestamp_b;
            if (a.timestamp)
                timestamp_a = a.timestamp;
            else {
                var cronInstance = new Cron();
                cronInstance.fromString(a.cron);
                var scheduler = cronInstance.schedule();
                timestamp_a = Math.floor(scheduler.next().unix() / 60);
            }
            if (b.timestamp)
                timestamp_b = b.timestamp;
            else {
                var cronInstance = new Cron();
                cronInstance.fromString(b.cron);
                var scheduler = cronInstance.schedule();
                timestamp_b = Math.floor(scheduler.next().unix() / 60);
            }
            if (timestamp_a < timestamp_b)
                return -1;
            else
                return 1;
        });
        zones = {};
        for (_i = 0, _a = momentTz.tz.names(); _i < _a.length; _i++) {
            el = _a[_i];
            zoneEl = momentTz.tz.zone(el);
            offset = zoneEl.utcOffset(new Date().getTime());
            zoneName = zoneEl.name.split("/");
            name_1 = (zoneName[zoneName.length - 2] || "") + " : " + zoneName[zoneName.length - 1] + " \u2192 UTC" + (Math.floor(offset / 60) > 0 ? "+" : "") + Math.floor(offset / 60);
            zones[name_1] = offset;
        }
        peopleRes = peopleRes.map(function (val, index) {
            return {
                username: val.user.username,
                id: val.user.id,
                nickname: val.nickname
            };
        });
        //We remove the @ if they start by a @ because they are manually added later in the html
        rolesRes = rolesRes.map(function (val, index) {
            if (val.name[0] == "@")
                val.name = val.name.substring(1, val.name.length);
            return {
                username: val.name,
                id: val.id
            };
        }).filter(function (el, index) { return el.username != "everyone"; }); //We remove everyone role because it is already manually added in the html
        channelRes = channelRes.map(function (val, index) {
            return {
                name: val.name,
                id: val.id
            };
        });
        res.render('dashboard', {
            header: req.headerData,
            table: table,
            channel_list: channelRes,
            people_list: peopleRes,
            roles_list: rolesRes,
            guild_data: guildRes,
            cdn: process.env.CDN_ENDPOINT,
            now_hour: String(new Date().getHours()) + ":" + String(new Date().getMinutes() + 2),
            timezone_data: zones,
            guildTimezone: db.timezone
        });
        return [2 /*return*/];
    });
}); });
exports["default"] = router;
