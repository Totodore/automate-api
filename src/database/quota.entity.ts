import { Guild } from './guild.entity';
import { AfterLoad, Column, ManyToOne } from 'typeorm';
import { PrimaryGeneratedColumn } from 'typeorm';
import { BaseEntity, Entity } from 'typeorm';

@Entity()
export class Quota extends BaseEntity {
  
  @PrimaryGeneratedColumn()
  public id: number;

  @Column("date")
  public date: Date;

  @Column({ default: 0 })
  public monthlyQuota: number;

  @ManyToOne(() => Guild)
  public guild: Guild;

  @AfterLoad()
  public patchDateFormat() {
    if (typeof this.date == "string") {
      this.date = new Date(this.date);
    }
  }
}