import { Message } from './message.entity';
import { BaseEntity, Column, Entity, OneToMany, PrimaryColumn } from "typeorm";
import { Exclude } from 'class-transformer';

@Entity()
export class Guild extends BaseEntity {

  @PrimaryColumn({ length: 18 })
  public id: string;
  

  @Column({ nullable: true })
  public timezone: string;

  @Column("boolean", { default: () => false })
  public scope: boolean;

  @OneToMany(() => Message, message => message.guild, { cascade: true })
  public messages: Message[];

  public name?: string;
  public profile?: string;
}