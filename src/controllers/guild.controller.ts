import { AuthGuard } from '@nestjs/passport';
import { User } from './../database/user.entity';
import { Profile } from 'passport-discord';
import { OauthService } from './../services/oauth.service';
import { File } from './../database/file.entity';
import { FileService } from './../services/file.service';
import { Message, MessageType } from './../database/message.entity';
import { PostFreqMessageInModel, PostPonctMessageInModel, DataMessageModel, PatchPonctMessageInModel, PatchFreqMessageInModel } from './../models/in/guild.in.model';
import { GuildOutModel, MemberOutModel } from './../models/out/guild.out.model';
import { BotService } from './../services/bot.service';
import { AppLogger } from './../utils/app-logger.util';
import { BadRequestException, Body, CacheInterceptor, Controller, Delete, Get, MessageEvent, Param, Patch, Post, Query, Req, Sse, UploadedFiles, UseGuards, UseInterceptors } from '@nestjs/common';
import { Guild } from 'src/database/guild.entity';
import { FilesInterceptor } from '@nestjs/platform-express';
import { v4 as uuid } from "uuid";
import { UserGuard } from 'src/guards/user.guard';
import { createQueryBuilder } from 'typeorm';
import { TIMEZONES } from 'src/utils/timezones.util';
import { CurrentUser } from 'src/decorators/current-user.decorator';
import { Observable, Observer, Subscriber } from 'rxjs';

@Controller('guild')
@UseGuards(UserGuard)
export class GuildController {

  constructor(
    private readonly bot: BotService,
    private readonly fileService: FileService,
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
    const guild = await Guild.findOne(id, { relations: ["messages", "messages.creator", "messages.files"] });
    for (const msg of guild.messages) {
      const creator = await this.bot.getUser(msg.creator.id);
      msg.creator.name = creator.username;
      msg.creator.profile = creator.avatar;
    }
    const guildInfo = await this.bot.getGuild(id);
    return new GuildOutModel(guild, guildInfo);
  }

  @Sse(":id/add")
  public onAddOne(@Param("id") id: string): Observable<MessageEvent> {
    const listener = (observer: Subscriber<MessageEvent>) => {
      observer.next({ id, data: id });
      this.bot.newGuildEmitter.removeListener(id, listener);
      observer.complete();
    };
    return new Observable(observer => {
      this.bot.newGuildEmitter.addListener(id, () => listener(observer));
    });
  }
  
  @Post(":id/message/freq")
  @UseInterceptors(FilesInterceptor('files', 5, { limits: { fieldSize: 8 } }))
  public async postFreqMessage(
    @Body() body: PostFreqMessageInModel,
    @UploadedFiles() files: Express.Multer.File[],
    @Param("id") id: string,
    @CurrentUser() creator: User
  ): Promise<Message> {
    const filesData: File[] = [];
    for (const file of (files || [])) {
      const id = uuid();
      this.fileService.writeFile(file.buffer, id);
      filesData.push(File.create({ id }));
    }
    return await Message.create({
      ...body,
      guild: Guild.create({ id }),
      creator,
      type: MessageType.FREQUENTIAL,
      files: filesData
    }).save();
  }
  
  @Post(":id/message/ponctual")
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
  
  @Get(":id/members")
  public async getSuggestions(@Query("q") query: string, @Param("id") id: string): Promise<MemberOutModel[]> {
    const guild = await this.bot.getGuild(id);
    if (query.startsWith("@")) {
      query = query.substr(1);
      const members = guild.members.cache.array()
        .filter(el => el.nickname?.toLowerCase().includes(query.toLowerCase()) || el.displayName?.toLowerCase().includes(query.toLowerCase()))
        .slice(0, 20);
      return members.map(el => new MemberOutModel(el.displayName, el.nickname, el.id));
    }
      
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

  @Patch(":id/scope")
  public async patchScope(@Query("scope") scope: 'true' | 'false', @Param("id") id: string) {
    await Guild.update(id, { scope: scope === 'true' });
  }

  @Patch(":id/timezone")
  public async patchTimezone(@Query("timezone") timezone: string, @Param("id") id: string) {
    if (!TIMEZONES.includes(timezone))
      throw new BadRequestException();
    await Guild.update(id, { timezone });
  }

  @Patch(":id/message/:msgId/state")
  public async patchMessageState(@Query("state") state: "true" | "false", @Param("msgId") id: string) {
    await Message.update(id, { activated: state === "true" });
  }

}