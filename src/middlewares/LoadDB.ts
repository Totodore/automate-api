import SessionRequest from "../requests/SessionRequest";
import * as fs from "fs";
import {Response} from "express";
import DBManager from "src/utils/DBManager";

export default async function(req: SessionRequest, res: Response, next: Function) {
    const dbManager = new DBManager();
    
    next();
}