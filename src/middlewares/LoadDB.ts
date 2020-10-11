import { SessionRequest } from "../requests/RequestsMiddleware";
import { Response } from "express";

export default async function (req: SessionRequest, res: Response, next: Function) {
  req.dbManager = req.app.get("dbManager");
  next();
}