import { Message } from "discord.js";

export default interface MessageModel {
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