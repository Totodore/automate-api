import { Message } from './message.entity';
import { BaseEntity, Column, Entity, OneToMany, PrimaryColumn } from "typeorm";
import { Exclude } from 'class-transformer';

@Entity()
export class Guild extends BaseEntity {

  @PrimaryColumn({ length: 18 })
  public id: string;
  
  @Column({ length: 30 })
  @Exclude()
  public token: string;

  @Column("timestamp")
  @Exclude()
  public tokenExpires: number;

  @Column({ length: 30 })
  @Exclude()
  public refreshToken: string;

  @Column()
  public timezone: string;

  @Column()
  public timezoneCode: string;

  @OneToMany(() => Message, message => message.guild, { cascade: true })
  public messages: Message[];
}