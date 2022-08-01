import { Message } from './message.entity';
import { BaseEntity, Column, Entity, OneToMany, PrimaryColumn } from "typeorm";
import { Exclude } from 'class-transformer';

@Entity()
export class User extends BaseEntity {
  
  @PrimaryColumn({ length: 255 })
  public id: string;

  @Column({ length: 30 })
  @Exclude()
  public token: string;

  @Column({ length: 30 })
  @Exclude()
  public refreshToken: string;

  @Column("timestamp")
  @Exclude()
  public tokenExpires: Date;
  
  @OneToMany(() => Message, message => message.creator, { cascade: true })
  public messages: Message[];
  
  public name?: string;
  
  public profile?: string;
}