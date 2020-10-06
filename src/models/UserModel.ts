import { Model } from "sequelize/types";
import {Sequelize, DataTypes} from 'sequelize';
import {SequelizeAttributes} from "../types"
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

    static async factory(sequelize: Sequelize): Promise<UserModel> {
        const attributes: SequelizeAttributes<UserDataModel> = {
            access_token: {
                type: DataTypes.STRING,
                allowNull: false,
                unique: true
            },
            id: {
                type: DataTypes.STRING,
                allowNull: false,
                unique: true
            },
            token_timestamp: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            refresh_token: {
                type: DataTypes.STRING,
                allowNull: false
            }
        };
      
        const User = sequelize.define<UserModel, UserDataModel>('User', attributes);

        return await User.sync();
    }

}

export default UserModel;