import { SessionRequest } from "../requests/RequestsMiddleware";
import {Response} from "express";
import DBManager from "../utils/DBManager";

export default async function(req: SessionRequest, res: Response, next: Function) {
    req.dbManager = new DBManager();
    req.dbManager.init();
    next();
}