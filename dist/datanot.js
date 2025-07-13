"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizeGmail = exports.normalizeTwitter = exports.normalizeFacebook = exports.normalizeGoogle = void 0;
exports.fetchGoogleEvents = fetchGoogleEvents;
exports.fetchGmailEvents = fetchGmailEvents;
exports.fetchFacebookEvents = fetchFacebookEvents;
exports.fetchTwitterEvents = fetchTwitterEvents;
exports.notifyUser = notifyUser;
const axios_1 = __importDefault(require("axios"));
require("express-session");
const dotenv_1 = __importDefault(require("dotenv"));
const googleapis_1 = require("googleapis");
dotenv_1.default.config();
function fetchGoogleEvents(accessToken) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log("in google api");
        try {
            const response = yield axios_1.default.get(`https://www.googleapis.com/calendar/v3/calendars/primary/events`, {
                headers: { Authorization: `Bearer ${accessToken}` }
            });
            return response.data.items;
        }
        catch (err) {
            return (err);
        }
    });
}
function fetchGmailEvents(accessToken) {
    return __awaiter(this, void 0, void 0, function* () {
        const auth = new googleapis_1.google.auth.OAuth2();
        auth.setCredentials({ access_token: accessToken });
        const gmail = googleapis_1.google.gmail({ version: 'v1', auth });
        try {
            const response = yield gmail.users.messages.list({
                userId: 'me',
                labelIds: ['INBOX'],
                maxResults: 10,
            });
            const messages = response.data.messages || [];
            const detailedMessages = yield Promise.all(messages.map((msg) => gmail.users.messages.get({ userId: 'me', id: msg.id })));
            const parsed = detailedMessages.map((msg) => {
                var _a, _b, _c, _d, _e, _f, _g, _h, _j;
                return ({
                    id: msg.data.id,
                    snippet: msg.data.snippet,
                    from: (_c = (_b = (_a = msg.data.payload) === null || _a === void 0 ? void 0 : _a.headers) === null || _b === void 0 ? void 0 : _b.find((h) => h.name === 'From')) === null || _c === void 0 ? void 0 : _c.value,
                    subject: (_f = (_e = (_d = msg.data.payload) === null || _d === void 0 ? void 0 : _d.headers) === null || _e === void 0 ? void 0 : _e.find((h) => h.name === 'Subject')) === null || _f === void 0 ? void 0 : _f.value,
                    date: (_j = (_h = (_g = msg.data.payload) === null || _g === void 0 ? void 0 : _g.headers) === null || _h === void 0 ? void 0 : _h.find((h) => h.name === 'Date')) === null || _j === void 0 ? void 0 : _j.value,
                });
            });
            return (parsed);
        }
        catch (err) {
            console.error('Gmail fetch error:', err);
        }
    });
}
function fetchFacebookEvents(accessToken) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log("in fb api");
        console.log(accessToken);
        const response = yield axios_1.default.get(`https://graph.facebook.com/v12.0/me/posts?fields=id,message,created_time,story,permalink_url&access_token=${accessToken}`);
        console.log("sucess on fb");
        return response.data.data;
    });
}
function fetchTwitterEvents(accessToken) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log("in tw api");
        console.log(accessToken);
        const response = yield axios_1.default.get(`https://api.twitter.com/2/tweets/search/recent?query=event&tweet.fields=created_at,author_id`, {
            headers: { Authorization: `Bearer ${accessToken}` }
        });
        console.log("sucess on twit");
        return response.data.data;
    });
}
function notifyUser(title, message) {
    if (Notification.permission === "granted") {
        new Notification(title, { body: message });
    }
}
const normalizeGoogle = (event, userId) => {
    var _a, _b;
    return ({
        platform: "Google",
        title: event.summary,
        description: event.description,
        startTime: (_a = event.start) === null || _a === void 0 ? void 0 : _a.dateTime,
        endTime: (_b = event.end) === null || _b === void 0 ? void 0 : _b.dateTime,
        link: event.htmlLink,
        sourceId: event.id,
        raw: event,
        userId
    });
};
exports.normalizeGoogle = normalizeGoogle;
const normalizeFacebook = (event, userId) => ({
    platform: "Facebook",
    title: event.name,
    description: event.description,
    startTime: event.start_time,
    endTime: event.end_time,
    link: `https://facebook.com/events/${event.id}`,
    sourceId: event.id,
    raw: event,
    userId
});
exports.normalizeFacebook = normalizeFacebook;
const normalizeTwitter = (tweet, userId) => ({
    platform: "Twitter",
    title: tweet.text.slice(0, 50),
    description: tweet.text,
    startTime: tweet.created_at,
    endTime: undefined,
    link: `https://twitter.com/i/web/status/${tweet.id}`,
    sourceId: tweet.id,
    raw: tweet,
    userId
});
exports.normalizeTwitter = normalizeTwitter;
const normalizeGmail = (event, userId) => ({
    platform: "Google",
    title: event.snippet,
    description: event.subject,
    startTime: event.date,
    sourceId: event.id,
    raw: event,
    userId
});
exports.normalizeGmail = normalizeGmail;
//# sourceMappingURL=datanot.js.map