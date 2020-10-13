import Logger from "../utils/Logger";
import {Request, Response} from "express";

export default function(req: Request, res: Response) {
    const logger = new Logger("Request");
    logger.log(req.method, req.route, "requested");
}