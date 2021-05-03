import { Profile } from 'passport-discord';
import { OauthService } from './../services/oauth.service';
import { CurrentUser } from './../decorators/current-user.decorator';
import { File } from './../database/file.entity';
import { FileService } from './../services/file.service';
import { Message, MessageType } from './../database/message.entity';
import { PostFreqMessageInModel, PostPonctMessageInModel, DataMessageModel, PatchPonctMessageInModel, PatchFreqMessageInModel } from './../models/in/guild.in.model';
import { GuildOutModel, MemberOutModel } from './../models/out/guild.out.model';
import { BotService } from './../services/bot.service';
import { AppLogger } from './../utils/app-logger.util';
import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UploadedFiles, UseGuards, UseInterceptors } from '@nestjs/common';
import { Guild } from 'src/database/guild.entity';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { v4 as uuid } from "uuid";
import { UserGuard } from 'src/guards/user.guard';
import { User } from 'src/database/user.entity';
import { CurrentProfile } from 'src/decorators/current-profile.decorator';

@Controller('guild')
@UseGuards(UserGuard)
export class GuildController {

  constructor(
    private readonly logger: AppLogger,
    private readonly bot: BotService,
    private readonly fileService: FileService,
    private readonly oauth: OauthService
  ) { }
  
  @Get(":id")
  public async getOne(@Param('id') id: string): Promise<GuildOutModel> {
    const guild = await Guild.findOne(id, { relations: ["messages"] });
    const guildInfo = await this.bot.getGuild(id);

    return new GuildOutModel(guild, guildInfo);
  }

  @Get("last")
  public async getLastMessages(@CurrentProfile(true) profile: Profile): Promise<Message[]> {
    const guilds = profile.guilds.filter(guild =>
      (guild.permissions & 0x8) === 8
      || (guild.permissions & 0x10) === 10
      || (guild.permissions & 0x20) === 20
    ).map(guild => Guild.create({id: guild.id}));
    return await Message.find({ where: { guild: guilds }, take: 20, order: { updatedDate: "DESC" } });
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
