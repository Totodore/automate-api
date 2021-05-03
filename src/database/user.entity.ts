import { Message } from './message.entity';
import { BaseEntity, Column, Entity, OneToMany, PrimaryColumn } from "typeorm";

@Entity()
export class User extends BaseEntity {
  
  @PrimaryColumn({ length: 18 })
  public id: string;

  @Column({ length: 30 })
  public token: string;

  @Column({ length: 30 })
  public refreshToken: string;

  @Column("timestamp")
  public tokenExpires: Date;

  @OneToMany(() => Message, message => message.creator, { cascade: true })
  public messages: Message[];
}