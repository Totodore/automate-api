import { BaseEntity, Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from "typeorm";
import { Guild } from "./guild.entity";

@Entity()
export class Webhook extends BaseEntity {
  
  @PrimaryColumn({ length: 18 })
  public id: string;

  @Column({ length: 18, unique: true },)
  public channelId: string;

  @ManyToOne(() => Guild)
  @JoinColumn()
  public guild: Guild;

  @Column("varchar", { unique: true })
  public url: string;
}