"use strict";
exports.__esModule = true;
function default_1(req, res, next) {
    if (!req.session.userId && req.cookies.userId) {
        req.session.userId = req.cookies.userId;
        next();
    }
    else if (!req.session.userId && !req.cookies.userId && req.path != "/connect" && req.path != "/oauth" && !req.path.split("/").includes("ajax")) {
        //On exclu les chemins oauth et connect sinon on a des redirections infinies et ajax
        res.redirect("/connect");
    }
    else
        next();
}
exports["default"] = default_1;
