import { DiscordRequest } from "../requests/RequestsMiddleware";
import { Response } from "express";
import fetch from "node-fetch";
import Logger from "../utils/Logger";
import DiscordGuildResponse from "src/interfaces/DiscordGuildResponse";

export default async function (req: DiscordRequest, res: Response, next: Function): Promise<any> {
	const logger = new Logger("DiscordRequestMiddleware");
	
	req.getUserDiscord = async (token: string): Promise<any> => {
		const reqUser = await fetch(`${process.env.API_ENDPOINT}/users/@me`, {
			headers: {
				'Content-Type': 'application/json',
				'Authorization': `Bearer ${token}`
			}
		});
		if (reqUser.status != 200) {
			logger.log(`Error getUserDiscord: ${reqUser.status} ${reqUser.statusText}`);
			res.redirect("../connect?msg=" + encodeURI("Whoops ! It seems like your connection to Discord is impossible!"));
			return;
		} else
			return await reqUser.json();
	}

  req.getUserGuildsDiscord = async (token: string): Promise<DiscordGuildResponse[]> => {
    console.log(token);
		const guildReq = await fetch("https://discordapp.com/api/users/@me/guilds", {
			headers: {
				'Authorization': `Bearer ${token}`
			}
    });
		if (guildReq.status != 200) {
			logger.log(`Erreur getUserGuildsDiscord: ${guildReq.status} ${guildReq.statusText}`);
		} else return await guildReq.json();
	}


	req.getDiscordToken = async (data: any): Promise<any> => {
		const formData = new URLSearchParams();
		Object.entries(data).forEach(el => formData.append(el[0], el[1].toString()));

		const reqToken = await fetch(process.env.API_ENDPOINT + "/oauth2/token", {
			method: "POST",
			body: formData
		});
		if (reqToken.status != 200) {
			logger.log(`Error : ${reqToken.status} ${reqToken.statusText}`);
			if (reqToken.status == 429 || reqToken.status == 400) {
				logger.error(JSON.parse(await reqToken.text()));
				//TODO: Bot send error on discord when 429
			}
		} else
			return await reqToken.json();
	}

	req.addBotDiscord = async (data: any): Promise<any> => {
		const formData = new URLSearchParams();
		Object.entries(data).forEach(el => formData.append(el[0], el[1].toString()));

		const reqToken = await fetch(`${process.env.API_ENDPOINT}/oauth2/token`, {
			method: "POST",
			body: formData
		});
		if (reqToken.status != 200) {
			logger.log(`Error addBotDiscord: ${reqToken.status} ${reqToken.statusText}`);
		} else return await reqToken.json();
  }
  
  next();
} 