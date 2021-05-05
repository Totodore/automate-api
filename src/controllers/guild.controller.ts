import { Profile } from 'passport-discord';
import { OauthService } from './../services/oauth.service';
import { File } from './../database/file.entity';
import { FileService } from './../services/file.service';
import { Message, MessageType } from './../database/message.entity';
import { PostFreqMessageInModel, PostPonctMessageInModel, DataMessageModel, PatchPonctMessageInModel, PatchFreqMessageInModel } from './../models/in/guild.in.model';
import { GuildOutModel, MemberOutModel } from './../models/out/guild.out.model';
import { BotService } from './../services/bot.service';
import { AppLogger } from './../utils/app-logger.util';
import { Body, CacheInterceptor, Controller, Delete, Get, Param, Patch, Post, Query, UploadedFiles, UseGuards, UseInterceptors } from '@nestjs/common';
import { Guild } from 'src/database/guild.entity';
import { FilesInterceptor } from '@nestjs/platform-express';
import { v4 as uuid } from "uuid";
import { UserGuard } from 'src/guards/user.guard';
import { createQueryBuilder } from 'typeorm';

@Controller('guild')
@UseGuards(UserGuard)
export class GuildController {

  constructor(
    private readonly logger: AppLogger,
    private readonly bot: BotService,
    private readonly fileService: FileService,
    private readonly oauth: OauthService
  ) { }
  
  
  @Post("last")
  public async getLastMessages(@Body() profile: Profile): Promise<Message[]> {
    const guilds = profile.guilds.filter(guild =>
      (guild.permissions & 0x8) === 8
      || (guild.permissions & 0x10) === 10
      || (guild.permissions & 0x20) === 20
    ).map(guild => guild.id);
    return Promise.all((await createQueryBuilder(Message, "msg")
      .where("msg.guildId IN (:guilds)", { guilds })
      .orderBy("msg.updatedDate", "DESC").take(10)
      .leftJoinAndSelect("msg.guild", "guild")
      .leftJoinAndSelect("msg.creator", "creator")
      .leftJoinAndSelect("msg.files", "files")
      .getMany())
      .map(async (msg: Message) => {
        msg.channelName = (await this.bot.getChannel(msg.channelId)).name;
        const creator = await this.bot.getUser(msg.creator.id);
        const guild = await this.bot.getGuild(msg.guild.id);
        msg.creator.name = creator.username;
        msg.creator.profile = creator.avatar;
        msg.guild.name = guild.name;
        msg.guild.profile = guild.icon;
        return msg;
      })
    );
  }

  @Get(":id")
  public async getOne(@Param('id') id: string): Promise<GuildOutModel> {
    const guild = await Guild.findOne(id, { relations: ["messages"] });
    const guildInfo = await this.bot.getGuild(id);

    return new GuildOutModel(guild, guildInfo);
  }
    
  @Get(":id/members")
  public async getMembers(@Query("q") query: string, @Param("id") id: string): Promise<MemberOutModel[]> {
    const members = (await (await this.bot.getGuild(id)).members.fetch({ query, limit: 50 })).array();
    return members.map(el => new MemberOutModel(el.nickname, el.displayName, el.id));
  }

  @Post(":id/freq")
  @UseInterceptors(FilesInterceptor('files', 5, { limits: { fieldSize: 8 } }))
  public async postFreqMessage(@Body() body: PostFreqMessageInModel, @UploadedFiles() files: Express.Multer.File[]) {
    const filesData: File[] = [];
    for (const file of files) {
      const id = uuid();
      this.fileService.writeFile(file.buffer, id);
      filesData.push(File.create({ id }));
    }
    await Message.create({
      ...body,
      type: MessageType.FREQUENTIAL,
      files: filesData
    }).save();
  }

  @Post(":id/ponctual")
  @UseInterceptors(FilesInterceptor('files', 5, { limits: { fieldSize: 8 } }))
  public async postPonctualMessage(@Body() body: PostPonctMessageInModel, @UploadedFiles() files: Express.Multer.File[]) {
    const filesData: File[] = [];
    for (const file of files) {
      const id = uuid();
      this.fileService.writeFile(file.buffer, id);
      filesData.push(File.create({ id }));
    }
    await Message.create({
      ...body,
      type: MessageType.PONCTUAL,
      files: filesData
    }).save();
  }

  @Delete(":id")
  public async deleteMessage(@Param("id") id: string) {
    await Message.delete(id);
  }

  @Patch(":id/content")
  public async patchContent(@Param("id") id: string, @Body() body: DataMessageModel) {
    await Message.update(id, body);
  }

  @Patch(":id/ponctual")
  public async patchCron(@Param("id") id: string, @Body() body: PatchPonctMessageInModel) {
    await Message.update(id, body);
  }

  @Patch(":id/freq")
  public async patchFreq(@Param("id") id: string, @Body() body: PatchFreqMessageInModel) {
    await Message.update(id, body);
  }
}
