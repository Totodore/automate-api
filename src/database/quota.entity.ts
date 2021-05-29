import { Guild } from './guild.entity';
import { Column, ManyToOne } from 'typeorm';
import { PrimaryGeneratedColumn } from 'typeorm';
import { BaseEntity, Entity } from 'typeorm';

@Entity()
export class Quota extends BaseEntity {
  
  @PrimaryGeneratedColumn()
  public id: number;

  @Column("date")
  public date: Date;

  @Column({ default: () => 0 })
  public dailyQuota: number;

  @ManyToOne(() => Guild)
  public guild: Guild;
}