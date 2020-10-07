import {Model, DataTypes, Sequelize} from "sequelize";
import { SequelizeAttributes } from "src/types";

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
    
    static async factory(sequelize: Sequelize): Promise<GuildModel> {
        const attributes: SequelizeAttributes<GuildDataModel> = {
            ponctual: {
                type: DataTypes.ARRAY,
            },
            freq: {
                type: DataTypes.ARRAY,
            },
            guild_owner_id: {
                type: DataTypes.STRING,
            },
            token_expires: {
                type: DataTypes.INTEGER,
            },
            token: {
                type: DataTypes.STRING
            },
            id: {
                type: DataTypes.STRING,
            },
            refresh_token: {
                type: DataTypes.STRING,
            },
            timezone: {
                type: DataTypes.STRING,
            },
            timezone_code: {
                type: DataTypes.STRING
            }
        };
      
        const Guild = sequelize.define<GuildModel, GuildDataModel>('Guild', attributes);

        return await Guild.sync();
    }
}

export default GuildModel;  