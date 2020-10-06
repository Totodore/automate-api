import { Model } from "sequelize/types";

interface UserDataModel {
    access_token: string;
    token_timestamp: number;
    refresh_token: string;
    id: string;
}


class UserModel extends Model<UserDataModel> implements UserDataModel {
    public id: string;
    public access_token: string;
    public token_timestamp: number;
    public refresh_token: string;
}

export default UserModel;