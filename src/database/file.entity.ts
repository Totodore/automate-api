import { Message } from 'src/database/message.entity';
import { BaseEntity, Entity, JoinColumn, ManyToOne, PrimaryColumn } from "typeorm";

@Entity()
export class File extends BaseEntity {

  @PrimaryColumn("uuid")
  public id: string;

  @ManyToOne(() => Message)
  @JoinColumn()
  public message: Message;
}