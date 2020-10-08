import { Model, DataTypes, Sequelize, ModelCtor, ModelOptions } from "sequelize";
import { SequelizeAttributes } from "src/types";

interface GuildDataModel {
	token: string;
	token_expires: number;
	refresh_token: string;
	guild_owner_id: string;
	timezone_code?: string;
	timezone?: string;
  id: string;
  updated_at?: number;
}

class GuildModel extends Model<GuildDataModel> implements GuildDataModel {

	public token: string;
	public token_expires: number;
	public refresh_token: string;
	public guild_owner_id: string;
	public timezone_code: string;
	public timezone: string;
	public id: string;

	static factory(sequelize: Sequelize, options: ModelOptions<GuildModel>): ModelCtor<GuildModel> {
		const attributes: SequelizeAttributes<GuildDataModel> = {
			guild_owner_id: {
				type: DataTypes.STRING(40),
			},
			token_expires: {
				type: DataTypes.INTEGER,
			},
			token: {
				type: DataTypes.STRING(40)
			},
			id: {
				type: DataTypes.STRING(40),
				primaryKey: true,
				unique: true
			},
			refresh_token: {
				type: DataTypes.STRING(40),
			},
			timezone: {
				type: DataTypes.STRING(100),
				allowNull: true,
			},
			timezone_code: {
				type: DataTypes.STRING(50),
				allowNull: true,
      },
      updated_at: {
        allowNull: true,
        type: DataTypes.DATE,
        defaultValue: new Date(),
      }
		};

		const Guild = sequelize.define<GuildModel, GuildDataModel>('Guild', attributes, options);

		return Guild;
	}
}

export { GuildModel, GuildDataModel };  