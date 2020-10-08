import { Model, ModelCtor } from "sequelize";
import { Sequelize, DataTypes } from 'sequelize';
import { SequelizeAttributes } from "../types"
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

	static factory(sequelize: Sequelize): ModelCtor<UserModel> {
		const attributes: SequelizeAttributes<UserDataModel> = {
			access_token: {
				type: DataTypes.STRING(40),
				allowNull: false,
				unique: true,
			},
			id: {
				type: DataTypes.STRING(40),
				allowNull: false,
				unique: true,
				primaryKey: true
			},
			token_timestamp: {
				type: DataTypes.INTEGER,
				allowNull: false,
			},
			refresh_token: {
				type: DataTypes.STRING(40),
				allowNull: false
			}
		};

		const User = sequelize.define<UserModel, UserDataModel>('User', attributes, {timestamps: false});
		return User;
	}

}

export { UserModel, UserDataModel };