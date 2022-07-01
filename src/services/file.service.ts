import { Injectable, OnModuleInit } from '@nestjs/common';

import * as fs from "fs-extra";
import * as path from "path";
import { AppLogger } from 'src/utils/app-logger.util';
@Injectable()
export class FileService implements OnModuleInit {

  private _baseRoute: string;

  constructor(private readonly _logger: AppLogger) { }

  public async onModuleInit() {
    this._baseRoute = path.resolve(process.env.FILE_ROUTE || "./data");
    await fs.ensureDir(this._baseRoute);
		this._logger.log("Base File Route", this._baseRoute);
  }

	public async getFile(id: string): Promise<Buffer> {
		return fs.readFile(path.join(this._baseRoute, id))
	}

	/**
	 * Ecrit les images depuis un buffer donné
   * retourne une liste avec la taille du buffer, la largeur de l'image et la hauteur de l'image
	 */
  public async writeFile(file: Buffer, id: string): Promise<number> {
    const imgPath = path.join(this._baseRoute, id);
    try {
      await fs.writeFile(imgPath, file);
      return file.length;
    } catch (e) {
      this._logger.error(e);
      throw "Reading or compressing buffers error";
    }
	}

	public removeFile(id: string) {
		return fs.remove(path.join(this._baseRoute, id.toString()));
	}

	public async imageExist(id: string): Promise<boolean> {
		return fs.pathExists(path.join(this._baseRoute, id));
  }
}