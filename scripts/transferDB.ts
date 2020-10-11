import DBManager from "../src/utils/DBManager";
import * as path from "path";
import * as fs from "fs";
import { MessageType } from "../src/models/MessageModel";
import * as dotenv from "dotenv";
console.log(dotenv);
dotenv.config();

const dbManager = new DBManager();

dbManager.init(true).then(dlUsers);
process.chdir(path.join(process.cwd(), "temp/guilds"));



async function dlUsers() {
  const users = JSON.parse(fs.readFileSync("../users.json").toString());
	for (const userId of Object.keys(users)) {
    const user = users[userId];
    try {
      await dbManager.User.create({
        id: userId,
        ...user
      });
    } catch (e) {
      console.log(e);
    }
	}
	loadGuilds();
}

async function loadGuilds() {
	const folders = fs.readdirSync(".");
	
	for (const guildId of folders) {
		const data = JSON.parse(fs.readFileSync(path.join(guildId, "data.json")).toString());
		console.log("data size", data.toString().length);
    try {
      await dbManager.Guild.create({
        id: guildId,
        guild_owner_id: data.guild_owner_id,
        refresh_token: data.refresh_token,
        timezone: data.timezone,
        timezone_code: data.timezone_code,
        token: data.token,
        token_expires: data.token_expires,
      });
      for (const message of data.ponctual) {
        await dbManager.Message.create({
          ...message,
          guild_id: guildId,
          type: MessageType.Ponctual,
          timezone_code: data.timezone_code
        })
      }
      for (const message of data.freq) {
        await dbManager.Message.create({
          ...message,
          guild_id: guildId,
          type: MessageType.Frequential,
          timezone_code: data.timezone_code
        })
      }
    } catch (e) {
      console.log(e);
    }
	}
}
