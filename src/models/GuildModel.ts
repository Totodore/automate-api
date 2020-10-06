export default interface GuildModel {
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