"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.controll = void 0;
const express_1 = require("express");
const middleware_1 = require("./middleware");
const api_1 = require("./api");
const OAuth_1 = __importDefault(require("./OAuth"));
exports.controll = (0, express_1.Router)();
exports.controll.get("/tasks", api_1.gettask);
exports.controll.post("/insert", middleware_1.taskval, api_1.inserttasks);
exports.controll.put("/update:id", api_1.updatetask);
exports.controll.post("/userlogin", api_1.userlogin);
exports.controll.get("/google", OAuth_1.default.authenticate('google', { scope: ['email', 'profile', 'https://www.googleapis.com/auth/calendar', 'https://www.googleapis.com/auth/gmail.readonly'], prompt: 'consent', accessType: 'offline' }));
exports.controll.get("/auth/google/callback", OAuth_1.default.authenticate('google', { failureRedirect: "/dashboard?failure" }), api_1.googleSaveSession);
exports.controll.get("/twitter", api_1.twitterauth);
exports.controll.get("/auth/twitter", api_1.callbackTwitter);
exports.controll.get("/facebook", middleware_1.stateMiddleware, api_1.facebookhandler);
exports.controll.get("/auth/facebook/callback", OAuth_1.default.authenticate('facebook', { failureRedirect: "/dashboard?failure", session: false }), api_1.fbSaveSession);
exports.controll.get("/refreshNotif", api_1.renotify);
exports.controll.get("/dashboard", api_1.dashboard);
exports.controll.get("/user", api_1.UserName);
exports.controll.post("/logout", api_1.logout);
exports.controll.get("/facebookEvents", api_1.fbEvents);
exports.controll.get("/TwitterEvents", api_1.twitEvents);
exports.controll.get("/sortedEvents", api_1.SortedEvents);
exports.controll.post("/deleteAccount", api_1.DeleteAccount);
exports.controll.get("/emailEvents", api_1.EmailEvents);
exports.controll.post("/subscribe", api_1.Subscribe);
exports.controll.get("/getSession", api_1.getSession);
exports.controll.get("/test-cookie", api_1.tempcookie);
//# sourceMappingURL=routes.js.map
