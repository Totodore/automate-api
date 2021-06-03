import { StateDataModel, Tab } from './../models/cron.model';
import { FileService } from './../services/file.service';
import { File } from './file.entity';
import { Guild } from './guild.entity';
import { AfterRemove, BaseEntity, Column, DeepPartial, Entity, JoinColumn, ManyToOne, ObjectType, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { User } from './user.entity';

export enum MessageType {
  PONCTUAL = 0,
  FREQUENTIAL = 1
}

@Entity()
export class Message extends BaseEntity {

  constructor(
    private readonly fileService: FileService
  ) { super() }

  @PrimaryGeneratedColumn("uuid")
  public id: string;

  @Column({ length: 18 })
  public channelId: string;

  @Column({ nullable: true })
  public cron: string;

  @Column("datetime", { nullable: true })
  public date: Date;

  @Column("text")
  public parsedMessage: string;

  @Column("text")
  public message: string;

  @Column("text")
  public description: string;

  @Column()
  public typeEnum: number;

  @Column("json")
  public cronState: Partial<StateDataModel>;

  @Column("enum", { enum: Tab })
  public cronTab: Tab;

  @ManyToOne(() => Guild)
  @JoinColumn()
  public guild: Guild;

  @ManyToOne(() => User)
  @JoinColumn()
  public creator: User;

  @OneToMany(() => File, file => file.message, { nullable: true, cascade: true })
  @JoinColumn()
  public files: File[];

  @Column("boolean", { default: true })
  public activated: boolean;

  @UpdateDateColumn()
  public updatedDate: Date;

  public channelName?: string;

  @AfterRemove()
  onRemove() {
    for (const file of this.files || []) {
      this.fileService.removeFile(file.id);
    }
  }

  public get type(): MessageType {
    return MessageType[MessageType[this.typeEnum]];
  }
}