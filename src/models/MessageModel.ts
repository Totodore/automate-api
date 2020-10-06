import { Model } from "sequelize/types";

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
}

export default MessageModel;