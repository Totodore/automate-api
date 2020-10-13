import Logger from "../utils/Logger";
import {Request, Response} from "express";

export default function(req: Request, res: Response, next: Function) {
    const logger = new Logger("Request");
    logger.log(req.method, req.path, "requested");
    next();
}