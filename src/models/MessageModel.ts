import { DataTypes, Model, Sequelize } from "sequelize";
import { SequelizeAttributes } from "src/types";

interface MessageDataModel {
    id: string;
    channel_id: string;
    cron?: string;
    timestamp?: number;
    message: string;
    description: string;
    sys_content: string;
    type: MessageType.Frequential|MessageType.Ponctual;
}

enum MessageType {
    Frequential,
    Ponctual
}

class MessageModel extends Model<MessageDataModel> implements MessageDataModel {
    public id: string;
    public channel_id: string;
    public cron?: string;
    public timestamp?: number;
    public message: string;
    public description: string;
    public sys_content: string;
    public type: MessageType.Frequential|MessageType.Ponctual;

    
    static async factory(sequelize: Sequelize): Promise<MessageModel> {
        const attributes: SequelizeAttributes<MessageDataModel> = {
            id: {
                type: DataTypes.UUIDV4,
                allowNull: false,
                unique: true
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
            type: {
                type: DataTypes.ENUM,
                allowNull: false,
                values: [
                    MessageType.Frequential.toString(),
                    MessageType.Ponctual.toString(),
                ]
            }
        };
      
        const Message = sequelize.define<MessageModel, MessageDataModel>('Message', attributes);

        return await Message.sync();
    }
}

export default MessageModel;