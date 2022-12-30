import { PatchMessageInModel, PostPonctMessageInModel } from './../models/in/guild.in.model';
import { FileService } from './../services/file.service';
import { GuildGuard } from './../guards/guild.guard';
import { UserGuard } from 'src/guards/user.guard';
import { Body, Controller, Delete, Param, Patch, Post, Query, UploadedFiles, UseGuards, UseInterceptors, BadRequestException } from '@nestjs/common';
import { Role } from "../decorators/role.decorator";
import { FilesInterceptor } from '@nestjs/platform-express';
import { PostFreqMessageInModel } from 'src/models/in/guild.in.model';
import { CurrentUser } from 'src/decorators/current-user.decorator';
import { Message, MessageType } from 'src/database/message.entity';
import { User } from 'src/database/user.entity';
import { File } from "src/database/file.entity";
import { Guild } from 'src/database/guild.entity';
import { diskStorage } from 'multer';
import * as path from 'path';
import { In } from 'typeorm';

@Controller('guild/:id/message')
@UseGuards(UserGuard, GuildGuard)
export class MessageController {

  constructor(
    private readonly fileService: FileService
  ) { }

  @Post("freq")
  @Role("admin")
  @UseInterceptors(FilesInterceptor('files', 10, {
    limits: { fileSize: 8_000_000 },
    storage: diskStorage({
      destination: (req, file, cb) => cb(null, path.resolve(process.env.UPLOAD_ROUTE))
    })
  }))
  public async postFreqMessage(
    @Body() body: PostFreqMessageInModel,
    @UploadedFiles() files: Express.Multer.File[],
    @Param("id") id: string,
    @CurrentUser() creator: User
  ): Promise<Message> {
    const filesData = await this.fileService.addFiles(files);
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
  @UseInterceptors(FilesInterceptor('files', 10, {
    limits: { fileSize: 8_000_000 },
    storage: diskStorage({
      destination: (req, file, cb) => cb(null, path.resolve(process.env.UPLOAD_ROUTE))
    })
  }))
  public async postPonctualMessage(
    @Body() body: PostPonctMessageInModel,
    @UploadedFiles() files: Express.Multer.File[],
    @Param("id") id: string,
    @CurrentUser() creator: User
  ) {
    const filesData = await this.fileService.addFiles(files);

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
    const message = await Message.createQueryBuilder("message").where("message.id = :id", { id })
      .leftJoinAndSelect("message.files", "files")
      .getOne();
    await Promise.all(message.files.map(file => this.fileService.removeFile(file.id)))
    await message.remove();
  }


  @Patch(":msgId")
  @Role("admin")
  @UseInterceptors(FilesInterceptor('files', 10, {
    limits: { fileSize: 8_000_000 },
    storage: diskStorage({
      destination: (req, file, cb) => cb(null, path.resolve(process.env.UPLOAD_ROUTE))
    })
  }))
  public async patchContent(
    @Param("msgId") id: string,
    @Body() body: PostPonctMessageInModel & PostFreqMessageInModel & PatchMessageInModel,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    if ((body.date && body.cron) || !body.cronState)
    throw new BadRequestException();
    
    if (body.removedFiles) {
      await Promise.all(body.removedFiles.map(file => this.fileService.removeFile(file)))
      await File.delete({ id: In(body.removedFiles) });
    }

    const message = await Message.findOne({ where: { id }, relations: ["files"] });
    const filesData = await this.fileService.addFiles(files);

    message.files.push(...filesData);
    message.typeEnum = body.date ? 0 : 1;
    Object.assign(message, body);
    await message.save();

    return filesData;
  }


  @Patch(":msgId/state")
  @Role("admin")
  public async patchMessageState(@Query("state") state: "true" | "false", @Param("msgId") id: string) {
    await Message.update(id, { activated: state === "true" });
  }
}
