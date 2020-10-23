import {Response} from "express";
import { SessionRequest } from "../requests/RequestsMiddleware";

//TODO: REGEX FOR ROUTE SELECTION
export default function(req: SessionRequest, res: Response, next: Function) {
    if (!req.cookies.userId && req.path != "/connect" && req.path != "/oauth" && !req.path.split("/").includes("ajax")) {
        //On exclu les chemins oauth et connect sinon on a des redirections infinies et ajax
        res.redirect("/connect");
    } else next();
}