import { Message } from './message.entity';
import { BaseEntity, Column, Entity, OneToMany, PrimaryColumn } from "typeorm";

@Entity()
export class Guild extends BaseEntity {

  @PrimaryColumn({ length: 18 })
  public id: string;
  
  @Column({ length: 30 })
  public token: string;

  @Column("timestamp")
  public tokenExpires: number;

  @Column({ length: 30 })
  public refreshToken: string;

  @Column()
  public timezone: string;

  @Column()
  public timezoneCode: string;

  @OneToMany(() => Message, message => message.guild, { cascade: true })
  public messages: Message[];
}