import { Quota } from './quota.entity';
import { Message } from './message.entity';
import { BaseEntity, Column, DeleteDateColumn, Entity, OneToMany, PrimaryColumn } from "typeorm";

@Entity()
export class Guild extends BaseEntity {

  @PrimaryColumn({ length: 255 })
  public id: string;

  @Column({ nullable: true })
  public timezone: string;

  @Column("boolean", { default: false })
  public scope: boolean;

  @Column("boolean", { default: true })
  public removeOneTimeMessage: boolean;

  @Column()
  public monthlyQuota: number = parseInt(process.env.DEFAULT_QUOTA);

  @OneToMany(() => Message, message => message.guild, { cascade: true })
  public messages: Message[];

  @OneToMany(() => Quota, quota => quota.guild, { cascade: ["insert", "recover", "update"] })
  public quotas: Quota[];

  @DeleteDateColumn()
  public deletedDate: Date
  
  public name?: string;
  public profile?: string;
}