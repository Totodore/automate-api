import {Response} from "express";
import routeList from "../RoutesList";
import { SessionRequest } from "../requests/RequestsMiddleware";

//TODO: REGEX FOR ROUTE SELECTION
export default function (req: SessionRequest, res: Response, next: Function) {
	console.log(req.path);
	// && req.path != routeList.connect && req.path != routeList.oauth && !req.path.split("/").includes("ajax")
    if (!req.cookies.userId) {
        //On exclu les chemins oauth et connect sinon on a des redirections infinies et ajax
        res.redirect("/connect");
    } else next();
}