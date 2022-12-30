import { Injectable, OnModuleInit } from '@nestjs/common';

import * as fs from "fs-extra";
import * as path from "path";
import * as sharp from "sharp";
import { File } from 'src/database/file.entity';
import { AppLogger } from 'src/utils/app-logger.util';
import { v4 as uuid } from "uuid";

@Injectable()
export class FileService implements OnModuleInit {

  private _baseRoute: string;

  constructor(private readonly _logger: AppLogger) { }

  public async onModuleInit() {
    this._baseRoute = path.resolve(process.env.FILE_ROUTE || "./data");
    // Ensure dir /data/tmp
    await fs.ensureDir(path.join(this._baseRoute, "tmp"));
    this._logger.log("Base File Route", this._baseRoute);
  }

  public async getFile(id: string): Promise<Buffer> {
    return fs.readFile(path.join(this._baseRoute, id))
  }

  public async addFiles(files: Express.Multer.File[]): Promise<File[]> {
    return Promise.all((files || []).map(async file => {
      const id = uuid();
      if (file.mimetype.startsWith("image/"))
        await this.moveFileWithCompression(file.path, id);
      else
        await this.moveFile(file.path, id);
      return File.create({ id, name: file.originalname });
    }));
  }

  public async writeFile(file: Buffer, id: string): Promise<number> {
    const imgPath = path.join(this._baseRoute, id);
    try {
      await fs.writeFile(imgPath, file);
      return file.length;
    } catch (e) {
      this._logger.error(e);
      throw new Error("Reading or compressing buffers error");
    }
  }

  public async moveFileWithCompression(filePath: string, id: string): Promise<void> {
    const imgPath = path.join(this._baseRoute, id);
    let image = sharp(filePath);
    await image.webp({ lossless: true }).toFile(imgPath);
  }

  public async moveFile(filePath: string, id: string) {
    const imgPath = path.join(this._baseRoute, id);
    try {
      await fs.rename(filePath, imgPath);
    } catch (e) {
      this._logger.error(e);
      throw new Error("Reading or compressing buffers error");
    }
  }

  public removeFile(id: string) {
    return fs.remove(path.join(this._baseRoute, id));
  }

  public async imageExist(id: string): Promise<boolean> {
    return fs.pathExists(path.join(this._baseRoute, id));
  }
}