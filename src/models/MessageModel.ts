import { DataTypes, Model, ModelCtor, Sequelize } from "sequelize";
import { SequelizeAttributes } from "../types";
import {v4 as uuid4} from "uuid";
interface MessageDataModel {
    id?: string;
    channel_id: string;
    guild_id: string;
    cron?: string;
    timestamp?: number;
    message: string;
    description: string;
    sys_content: string;
    type: MessageType.Frequential|MessageType.Ponctual;
    timezone_code: string;
}
interface MessageResponseModel extends Partial<MessageDataModel> {
    channel_name?: string;
}

enum MessageType {
    Frequential,
    Ponctual
}

class MessageModel extends Model<MessageDataModel> implements MessageDataModel {
    public id: string;
    public channel_id: string;
    public guild_id: string;
    public cron?: string;
    public timestamp?: number;
    public message: string;
    public description: string;
    public sys_content: string;
    public type: MessageType.Frequential|MessageType.Ponctual;
    public timezone_code: string;

    
    static factory(sequelize: Sequelize): ModelCtor<MessageModel> {
        const attributes: SequelizeAttributes<MessageDataModel> = {
            id: {
                type: DataTypes.UUIDV4,
                allowNull: false,
                unique: true,
                primaryKey: true,
            },
            channel_id: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            cron: {
                type: DataTypes.STRING
            },
            timestamp: {
                type: DataTypes.INTEGER
            },
            message: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            description: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            sys_content: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            timezone_code: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            guild_id: {
                type: DataTypes.STRING,
                allowNull: false
            },
            type: {
                type: DataTypes.ENUM,
                allowNull: false,
                values: Object.keys(DataTypes)
            }
        };
      
        const Message = sequelize.define<MessageModel, MessageDataModel>('Message', attributes);

        Message.beforeCreate(message => {message.id = uuid4()});

        return Message;
    }
}

export {MessageModel, MessageType, MessageResponseModel};