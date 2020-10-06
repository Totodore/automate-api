import { Guild } from "discord.js";
import Model from "sequelize/types/lib/model";

interface GuildDataModel {
    ponctual: string[] //List of Id which refer to MessagesModel
    freq: string[] //Same
    token: string;
    token_expires: number;
    refresh_token: string;
    guild_owner_id: string;
    timezone_code: string;
    timezone: string;
    id: string;
}

class GuildModel extends Model<GuildDataModel> implements GuildDataModel {
    
    public ponctual: string[];
    public freq: string[];
    public token: string;
    public token_expires: number;
    public refresh_token: string;
    public guild_owner_id: string;
    public timezone_code: string;
    public timezone: string;
    public id: string;
}

export default GuildModel;  