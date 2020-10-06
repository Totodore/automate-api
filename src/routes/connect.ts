import {Router} from "express";
import SessionRequest from "../requests/SessionRequest";

const router = Router();
/* GET home page. */
router.get('/', function(req: SessionRequest, res, next) {
  res.render('connect', {oauth_link: process.env.OAUTH_LINK, header: req.headerData});
});

export default router;
