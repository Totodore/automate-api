import { Message } from 'src/database/message.entity';
import { BaseEntity, Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from "typeorm";

@Entity()
export class File extends BaseEntity {

  @PrimaryColumn("uuid")
  public id: string;

  @Column("varchar")
  public name: string;

  @ManyToOne(() => Message, { cascade: true, onDelete: "CASCADE" })
  @JoinColumn()
  public message: Message;
}