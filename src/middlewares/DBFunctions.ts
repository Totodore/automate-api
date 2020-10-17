import { MessageModel, MessageType } from "../models/MessageModel";
import { GuildDataModel, GuildModel } from "../models/GuildModel";
import { Response } from "express";
import { SessionRequest } from "../requests/RequestsMiddleware";
import { ModelCtor } from "sequelize";
import { UserModel, UserDataModel } from "../models/UserModel";

export default function (req: SessionRequest, res: Response, next: Function) {

	const Message: ModelCtor<MessageModel> = req.dbManager.Message;
	const Guild: ModelCtor<GuildModel> = req.dbManager.Guild;
	const User: ModelCtor<UserModel> = req.dbManager.User;
	/**
	 * Add Message to the message DB by passing query arguments and type of the message
	 * @param query data to add to the message
	 * @param type message type to add
	 */
	req.addMessage = async (query: any, type: MessageType): Promise<string> => {
		return (await Message.create({
			...query,
			type: type,
			timezone_code: (await Guild.findOne({ where: { id: query.guild_id }, attributes: { include: ["timezone_code"] } })).timezone_code,
		})).getDataValue("id");
	};

	req.updateMessage = async (query: any): Promise<void> => {
		await Message.update({ ...query }, { where: { id: query.msg_id } });
	}

	req.addUser = async (data: UserDataModel): Promise<void> => {
		await User.create(data);
	}

	req.addGuild = async (data: GuildDataModel): Promise<void> => {
		await Guild.create(data);
	}
	/**
	 * Check if the user can still ad messages or not depending on the current limit
	 * @param guildId 
	 */
	req.isOverMessageLimit = async (guildId: string): Promise<boolean> => {
		return await Message.count({ where: { guild_id: guildId } }) > parseInt(process.env.MAX_MESSAGE);
	}

	/**
	 * Update the timezone of a guild, also update all the messages timezonese concerned by this guild
	 * @param guildId the guild in which to change the timezone
	 * @param timezone_code the timezone code to change
	 * @param timezone the timezone text to change
	 */
	req.updateTimezone = async (guildId: string, timezone_code: string, timezone: string) => {
		await Guild.update({
			timezone: timezone,
			timezone_code: timezone_code
		}, { where: { id: guildId } });
		await Message.update({
			timezone_code: timezone_code
		}, { where: { guild_id: guildId } });
	}

	/**
	 * Get all the user data in function of his id
	 * @param userId the desired user id
	 */
	req.getUser = async (userId: string): Promise<UserDataModel> => {
		return await User.findOne({ where: { id: userId } });
	}

	/**
	 * Check if the guild exists in the database
	 * @param guildId the guild id to check
	 */
	req.hasGuild = async (guildId: string): Promise<boolean> => {
		return await Guild.count({ where: { id: guildId } }) != 0;
	}
	/**
	 * Check if the user exists in the database
	 * @param userId  the user id to check
	 */
	req.hasUser = async (userId: string): Promise<boolean> => {
		return await User.count({where: {id: userId}}) != 0;
	}

	next();
}