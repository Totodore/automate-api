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
var Logger_1 = require("./utils/Logger");
var DBManager_1 = require("./utils/DBManager");
var MessageModel_1 = require("./models/MessageModel");
var STAT_CHANNEL = "702970284034097192";
var Bot = /** @class */ (function (_super) {
    __extends(Bot, _super);
    function Bot() {
        var _this = _super.call(this, "Bot") || this;
        _this.bot = new Discord.Client();
        _this.messageSent = 0;
        _this.dbManager = new DBManager_1["default"]();
        _this.dbManager.init().then(function () {
            _this.bot.login(process.env.TOKEN_BOT);
            _this.bot.on("ready", function () { return _this.ready(); });
            _this.bot.on("guildCreate", function (guild) { return _this.guildCreate(guild); });
            _this.bot.on("guildDelete", function (guild) { return _this.guildDelete(guild); });
            _this.bot.on("channelDelete", function (channel) { return _this.channelDelete(channel); });
            _this.bot.setInterval(function () { return _this.sendStats(); }, 1000 * 60 * 60 * 24); //Stats toutes les jours
        });
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
            guild.systemChannel.send("Hey ! I'm Automate, to give me orders you need to go on this website : https://automatebot.app.\nI can send your messages at anytime of the day event when you're not here to supervise me ;)");
        }
        catch (e) {
            this.log("Added this.bot but no systemChannel has been specified...");
        }
    };
    /**
     * On channel delete, make sure to remove all message supposed to be send to the channel
     * @param channel deleted channel
     */
    Bot.prototype.channelDelete = function (channel) {
        return __awaiter(this, void 0, void 0, function () {
            var messageLength;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.dbManager.Message.destroy({ where: { channel_id: channel.id } })];
                    case 1:
                        messageLength = _a.sent();
                        this.log("Channel deleted,", messageLength, "messages removed from DB");
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Send all messages supposed to be sended, every minutes
     */
    Bot.prototype.cronWatcher = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            var i, date, messagesData, _loop_1, this_1, _i, messagesData_1, message, state_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        i = 0;
                        date = new Date();
                        return [4 /*yield*/, this.dbManager.Message.findAll()];
                    case 1:
                        messagesData = _a.sent();
                        _loop_1 = function (message) {
                            var timestamp = Math.floor(Date.now() / 1000 / 60);
                            var data = message.get();
                            if (data.type == MessageModel_1.MessageType.Ponctual && data.timestamp == timestamp) {
                                var channel = this_1.bot.channels.cache.get(data.channel_id);
                                channel.send(data.sys_content || data.message).then(function (message) {
                                    _this.log("New punctual message sent at " + date.getUTCDate() + "/" + date.getUTCMonth() + "/" + date.getUTCFullYear() + " " + date.getUTCHours() + ":" + date.getUTCMinutes());
                                    i++;
                                })["catch"](function (e) {
                                    _this.log("Error sending message (probably admin rights) to channel : " + data.channel_id);
                                    _this.error(e);
                                });
                            }
                            else if (data.type == MessageModel_1.MessageType.Frequential) {
                                if (data.cron.split(" ")[0] == "60")
                                    return { value: void 0 };
                                var cronInstance = new Cron({ timezone: data.timezone_code });
                                cronInstance.fromString(data.cron);
                                var scheduler = cronInstance.schedule();
                                var timestampToExec = Math.floor(scheduler.next().unix() / 60);
                                if (timestampToExec == timestamp) {
                                    var channel_1 = this_1.bot.channels.cache.get(data.channel_id);
                                    channel_1.send(data.sys_content || data.message).then(function (message) {
                                        _this.log("New frequential message sent to " + channel_1.name + " in " + channel_1.guild.name);
                                        i++;
                                    })["catch"](function (e) {
                                        _this.log("Error sending message (probably admin rights) to channel : " + data.channel_id);
                                    });
                                }
                            }
                            setTimeout(function () {
                                _this.log("<----------- Sent " + i + " messages ----------->");
                                _this.messageSent += i; //Calcul de moyenne de messages envoyé chaque minute
                            }, 1000 * 50); //30 secondes après (le temps que tout s'envoie on affiche le nombre de message envoyé et on calcul la moyenne) 
                        };
                        this_1 = this;
                        for (_i = 0, messagesData_1 = messagesData; _i < messagesData_1.length; _i++) {
                            message = messagesData_1[_i];
                            state_1 = _loop_1(message);
                            if (typeof state_1 === "object")
                                return [2 /*return*/, state_1.value];
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Send stats to logs channel function
     */
    Bot.prototype.sendStats = function () {
        return __awaiter(this, void 0, void 0, function () {
            var channel, lengthServer, lengthUsers, lengthMessages;
            return __generator(this, function (_a) {
                channel = this.bot.channels.cache.get(STAT_CHANNEL);
                lengthServer = this.dbManager.Guild.count();
                lengthUsers = this.dbManager.User.count();
                lengthMessages = this.dbManager.Message.count();
                channel.send("Nombre de serveurs : **" + lengthServer + "**");
                channel.send("Nombre d'utilisateurs : **" + lengthUsers + "**");
                channel.send("Messages program\u00E9s : **" + lengthMessages + "**");
                channel.send("Messages envoy\u00E9 en une heure : **" + this.messageSent + "**");
                this.messageSent = 0;
                return [2 /*return*/];
            });
        });
    };
    /**
     * Get channels from a guild id
     * Filter channels remove deleted ones and other than text or news channel
     */
    Bot.prototype.getChannels = function (id) {
        if (!id)
            return;
        try {
            var dataToSend = this.bot.guilds.cache.get(id).channels.cache.filter(function (element) {
                if (!element.deleted && (element.type == "text" || element.type == "news"))
                    return true;
                else
                    return false;
            });
            return dataToSend;
        }
        catch (e) {
            this.log(e);
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
        }
    };
    return Bot;
}(Logger_1["default"]));
exports["default"] = Bot;
