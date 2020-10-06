"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
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
exports.__esModule = true;
var Discord = require("discord.js");
var Cron = require("cron-converter");
var fs = require("fs");
var logger_1 = require("./utils/logger");
var messageSent = 0;
var STAT_CHANNEL = "702970284034097192";
var Bot = /** @class */ (function (_super) {
    __extends(Bot, _super);
    function Bot() {
        var _this = _super.call(this, "Bot") || this;
        _this.bot = new Discord.Client();
        _this.bot.login(process.env.TOKEN_BOT);
        _this.bot.on("ready", function () { return _this.ready(); });
        _this.bot.on("guildCreate", function (guild) { return _this.guildDelete(guild); });
        _this.bot.on("guildDelete", function (guild) { return _this.guildDelete(guild); });
        _this.bot.setInterval(function () { return _this.sendStats(); }, 1000 * 60 * 60 * 24); //Stats toutes les jours
        return _this;
    }
    /**
     * Handler triggered when the this.bot is ready and connected
     */
    Bot.prototype.ready = function () {
        var _this = this;
        this.log("Logged in as " + this.bot.user.tag + " !\n");
        //On attend le passage à la prochaine minute pour être le plus syncro possible
        var oldMinute = Math.floor((new Date().getTime() / 1000) / 60) * 60;
        this.log("Actual minute : " + new Date().getMinutes());
        this.log("Waiting for new minute to start cron watcher");
        var intervalId = setInterval(function () {
            //Si on est passé à une nouvelle minute on lance le cronWatcher
            if (Math.floor((new Date().getTime() / 1000) / 60) * 60 > oldMinute) {
                _this.log("\n\nNew minute detected, Starting cron Watcher at minute " + new Date().getMinutes());
                _this.cronWatcher();
                _this.bot.setInterval(function () { return _this.cronWatcher(); }, 1000 * 60);
                clearInterval(intervalId);
            }
        }, 10);
    };
    /**
     * Handler for event when the this.bot is removed from a guild
     */
    Bot.prototype.guildDelete = function (guild) {
        fs.rmdirSync(__dirname + "/.." + process.env.DB_GUILDS + "/" + guild.id + "/", { recursive: true });
    };
    /**
     * Handler for event when the this.bot is added to a guild
     */
    Bot.prototype.guildCreate = function (guild) {
        try {
            guild.systemChannel.send("Hey ! I'm Automate, to give orders you need to go on this website : https://automatebot.app.\nI can send your messages at anytime of the day event when you're not here to supervise me ;)");
        }
        catch (e) {
            this.log("Added this.bot but no systemChannel has been specified...");
        }
    };
    /**
     * Send all messages supposed to be sended, every minutes
     */
    Bot.prototype.cronWatcher = function () {
        var _this = this;
        var date = new Date();
        fs.readdir(__dirname + "/.." + process.env.DB_GUILDS + "/", {}, function (err, files) {
            var i = 0;
            files.forEach(function (guildId) { return fs.readFile(__dirname + "/.." + process.env.DB_GUILDS + "/" + guildId + "/data.json", function (err, file) {
                //Pour chaque guild on regarde si on doit envoyer un message
                var guildData = JSON.parse(file.toString());
                var indexToDeletePonctual = [];
                var timestamp = Math.floor(Date.now() / 1000 / 60);
                guildData.ponctual.forEach(function (ponctualEvent, index) {
                    if (ponctualEvent.timestamp == timestamp) {
                        try {
                            var channel = _this.bot.channels.cache.get(ponctualEvent.channel_id);
                            channel.send(ponctualEvent.sys_content || ponctualEvent.message).then(function (message) {
                                _this.log("New punctual message sent at " + date.getUTCDate() + "/" + date.getUTCMonth() + "/" + date.getUTCFullYear() + " " + date.getUTCHours() + ":" + date.getUTCMinutes());
                                i++;
                            })["catch"](function (e) {
                                _this.log("Error sending message (probably admin rights) to channel : " + ponctualEvent.channel_id);
                            });
                        }
                        catch (e) {
                            _this.removeDeletedChannels(guildId, ponctualEvent.channel_id);
                        }
                        indexToDeletePonctual.push(index);
                    }
                });
                guildData.freq.forEach(function (freqEvent) {
                    if (freqEvent.cron.split(" ")[0] == "60")
                        return;
                    var cronInstance = new Cron({ timezone: guildData.timezone_code });
                    cronInstance.fromString(freqEvent.cron);
                    var scheduler = cronInstance.schedule();
                    var timestampToExec = Math.floor(scheduler.next().unix() / 60);
                    if (timestampToExec == timestamp) {
                        try {
                            var channel_1 = _this.bot.channels.cache.get(freqEvent.channel_id);
                            channel_1.send(freqEvent.sys_content || freqEvent.message).then(function (message) {
                                console.info("New frequential message sent to " + channel_1.name + " in " + channel_1.guild.name);
                                i++;
                            })["catch"](function (e) {
                                _this.log("Error sending message (probably admin rights) to channel : " + freqEvent.channel_id);
                            });
                        }
                        catch (e) {
                            _this.removeDeletedChannels(guildId, freqEvent.channel_id);
                        }
                    }
                });
                indexToDeletePonctual.forEach(function (index) {
                    var ponctualEvent = guildData.ponctual[index];
                    delete guildData.ponctual[index];
                    guildData.deleted.push(ponctualEvent);
                });
                if (indexToDeletePonctual.length > 0) {
                    guildData.ponctual = guildData.ponctual.filter(function (element) { return element != null; });
                    fs.writeFileSync(__dirname + "/.." + process.env.DB_GUILDS + "/" + guildId + "/data.json", JSON.stringify(guildData));
                }
            }); });
            setTimeout(function () {
                _this.log("<----------- Sent " + i + " messages ----------->");
                messageSent += i; //Calcul de moyenne de messages envoyé chaque minute
            }, 1000 * 30); //30 secondes après (le temps que tout s'envoie on affiche le nombre de message envoyé et on calcul la moyenne) 
        });
    };
    /**
     * Send stats to logs channel function
     */
    Bot.prototype.sendStats = function () {
        return __awaiter(this, void 0, void 0, function () {
            var channel, lengthServer, lengthUsers;
            return __generator(this, function (_a) {
                channel = this.bot.channels.cache.get(STAT_CHANNEL);
                lengthServer = fs.readdirSync(__dirname + "/.." + process.env.DB_GUILDS).length;
                lengthUsers = Object.keys(JSON.parse(fs.readFileSync(__dirname + "/../data/users.json").toString())).length;
                channel.send("Nombre de serveurs : **" + lengthServer + "**");
                channel.send("Nombre d'utilisateurs : **" + lengthUsers + "**");
                channel.send("Messages envoy\u00E9 en une heure : **" + messageSent + "**");
                messageSent = 0;
                return [2 /*return*/];
            });
        });
    };
    Bot.prototype.removeDeletedChannels = function (guildId, channelId) {
        this.log("Removing channel : " + channelId + " in guild : " + guildId);
        var data = JSON.parse(fs.readFileSync(__dirname + "/.." + process.env.DB_GUILDS + "/" + guildId + "/data.json").toString());
        //On supprime le channel correspondant au channelid dans freq et ponctual
        data.freq = data.freq.map(function (el) { return el.channel_id != channelId ? el : null; });
        data.freq = data.freq.filter(function (element) { return element != null; }); //On supprime les index null
        data.ponctual = data.ponctual.map(function (el) { return el.channel_id != channelId ? el : null; });
        data.ponctual = data.ponctual.filter(function (element) { return element != null; });
        fs.writeFileSync(__dirname + "/.." + process.env.DB_GUILDS + "/" + guildId + "/data.json", JSON.stringify(data));
    };
    /**
     * Get channels from a guild id
     */
    Bot.prototype.getChannels = function (id) {
        if (!id)
            return;
        try {
            var dataToSend = this.bot.guilds.cache.get(id).channels.cache;
            return dataToSend;
        }
        catch (e) {
            this.log(e);
            return false;
        }
    };
    /**
     * Get the information of a guild
     */
    Bot.prototype.getGuild = function (id) {
        if (!id)
            return;
        try {
            var dataToSend = this.bot.guilds.cache.get(id);
            return dataToSend;
        }
        catch (e) {
            this.log(e);
            return false;
        }
    };
    /**
     * Get people from a guild id
     */
    Bot.prototype.getPeople = function (id) {
        if (!id)
            return;
        try {
            var dataToSend = this.bot.guilds.cache.get(id).members.cache;
            return dataToSend;
        }
        catch (e) {
            this.log(e);
            return false;
        }
    };
    /**
     * Get roles from a guild id
     */
    Bot.prototype.getRoles = function (id) {
        if (!id)
            return;
        try {
            var dataToSend = this.bot.guilds.cache.get(id).roles.cache;
            return dataToSend;
        }
        catch (e) {
            this.log(e);
            return false;
        }
    };
    return Bot;
}(logger_1["default"]));
exports["default"] = Bot;
