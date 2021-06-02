import { FileService } from './../services/file.service';
import { GuildGuard } from './../guards/guild.guard';
import { UserGuard } from 'src/guards/user.guard';
import { Body, Controller, Delete, Param, Patch, Post, Query, UploadedFiles, UseGuards, UseInterceptors } from '@nestjs/common';
import { Role } from "../decorators/role.decorator";
import { FilesInterceptor } from '@nestjs/platform-express';
import { DataMessageModel, PatchFreqMessageInModel, PatchPonctMessageInModel, PostFreqMessageInModel } from 'src/models/in/guild.in.model';
import { CurrentUser } from 'src/decorators/current-user.decorator';
import { Message, MessageType } from 'src/database/message.entity';
import { User } from 'src/database/user.entity';
import { v4 as uuid } from "uuid";
import { File } from "src/database/file.entity";
import { Guild } from 'src/database/guild.entity';

@Controller('guild/:id/message')
@UseGuards(UserGuard, GuildGuard)
export class MessageController {

  constructor(
    private readonly fileService: FileService
  ) {}
  
  @Post("freq")
  @Role("admin")
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
      typeEnum: MessageType.FREQUENTIAL,
      files: filesData
    }).save();
  }
  
  @Post("ponctual")
  @Role("admin")
  @UseInterceptors(FilesInterceptor('files', 5, { limits: { fieldSize: 8 } }))
  public async postPonctualMessage(
    @Body() body: PostFreqMessageInModel,
    @UploadedFiles() files: Express.Multer.File[],
    @Param("id") id: string,
    @CurrentUser() creator: User
  ) {
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
      typeEnum: MessageType.PONCTUAL,
      files: filesData
    }).save();
  }

  
  @Delete(":msgId")
  @Role("admin")
  public async deleteMessage(@Param("msgId") id: string) {
    await (await Message.findOne(id)).remove();
  }

  
  @Patch(":msgId/content")
  @Role("admin")
  public async patchContent(@Param("msgId") id: string, @Body() body: DataMessageModel) {
    await Message.update(id, body);
  }

  @Patch(":msgId/ponctual")
  @Role("admin")
  public async patchCron(@Param("msgId") id: string, @Body() body: PatchPonctMessageInModel) {
    await Message.update(id, body);
  }

  @Patch(":msgId/freq")
  @Role("admin")
  public async patchFreq(@Param("msgId") id: string, @Body() body: PatchFreqMessageInModel) {
    await Message.update(id, body);
  }
  
  
  @Patch(":msgId/state")
  @Role("admin")
  public async patchMessageState(@Query("state") state: "true" | "false", @Param("msgId") id: string) {
    await Message.update(id, { activated: state === "true" });
  }
}
