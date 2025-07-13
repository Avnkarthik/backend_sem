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
exports.stateMiddleware = exports.createToken = exports.twitterRefresh = exports.facebookRefresh = exports.googleRefresh = exports.taskval = exports.userval = exports.userSchema = void 0;
exports.verifyToken = verifyToken;
const zod_1 = require("zod");
const express_validator_1 = require("express-validator");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const axios_1 = __importDefault(require("axios"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
exports.userSchema = zod_1.z.object({
    name: zod_1.z.string(),
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(8)
});
const userval = (schema) => (req, res, nxt) => {
    try {
        schema.parse(req.body);
        nxt();
    }
    catch (error) {
        res.status(400).json({ "mssg": "insert failed due to  error", errors: error });
    }
};
exports.userval = userval;
exports.taskval = [
    (0, express_validator_1.body)("Eventdate").matches(/^\d{4}-\d{2}-\d{2}$/).withMessage("time and date not  in required format"),
    (0, express_validator_1.body)('Eventname').isString().withMessage("Not a string"),
    (0, express_validator_1.body)('Eventtime')
        .matches(/^([01]\d|2[0-3]):[0-5]\d:[0-5]\d$/)
        .withMessage('Eventtime must be in HH:MM:SS format')
];
const googleRefresh = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    if (((_a = req.session.user) === null || _a === void 0 ? void 0 : _a.google) !== undefined) {
        try {
            const ggAccessToken = yield axios_1.default.post("https://oauth2.googleapis.com/token", {
                client_id: process.env.GOOGLE_CLIENT_ID,
                client_secret: process.env.GOOGLE_CLIENT_SECRET,
                refresh_token: req.session.user.google.googleRefreshToken,
                grant_type: "refresh_token",
            });
            req.session.user.google.googleAccessToken = ggAccessToken.data.access_token;
            next();
        }
        catch (err) {
            res.json(err);
        }
    }
    else
        res.status(400).json("invalid user");
});
exports.googleRefresh = googleRefresh;
const facebookRefresh = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    if (((_a = req.session.user) === null || _a === void 0 ? void 0 : _a.facebook) !== undefined) {
        try {
            let refreshToken = req.session.user.facebook.facebookRefreshToken;
            const response = yield axios_1.default.get(`https://graph.facebook.com/oauth/access_token?grant_type=fb_exchange_token&client_id=${process.env.FACEBOOK_CLIENT_ID}&client_secret=${process.env.FACEBOOK_CLIENT_SECRET}&fb_exchange_token=${refreshToken}`);
            req.session.user.facebook.facebookAccessToken = response.data.access_token;
            console.log({ message: "Facebook token refreshed", accessToken: response.data.access_token });
            next();
        }
        catch (error) {
            res.status(500).json({ error: ((_b = error.response) === null || _b === void 0 ? void 0 : _b.data) || "Failed to refresh Facebook token" });
        }
    }
});
exports.facebookRefresh = facebookRefresh;
const twitterRefresh = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    if (((_a = req.session.user) === null || _a === void 0 ? void 0 : _a.twitter) !== undefined) {
        let refreshToken = req.session.user.twitter.twitterRefreshToken;
        try {
            const params = new URLSearchParams({
                grant_type: "refresh_token",
                refresh_token: refreshToken,
            });
            const response = yield axios_1.default.post("https://api.twitter.com/2/oauth2/token", params.toString(), {
                headers: {
                    Authorization: `Basic ${Buffer.from(`${process.env.TWITTER_CLIENT_ID}:${process.env.TWITTER_CLIENT_SECRET}`).toString("base64")}`,
                    "Content-Type": "application/x-www-form-urlencoded",
                },
            });
            req.session.user.twitter.twitterAccessToken = response.data.access_token;
            req.session.user.twitter.twitterRefreshToken = response.data.refresh_token;
            res.json({ message: "Twitter token refreshed", accessToken: response.data.access_token });
        }
        catch (error) {
            res.status(500).json({ error: ((_b = error.response) === null || _b === void 0 ? void 0 : _b.data) || "Failed to refresh Twitter token" });
        }
    }
});
exports.twitterRefresh = twitterRefresh;
const createToken = (payload) => {
    return jsonwebtoken_1.default.sign(payload, process.env.JWT_SECRET, { expiresIn: "1d" });
};
exports.createToken = createToken;
function verifyToken(token) {
    return jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
}
const stateMiddleware = (req, res, next) => {
    const { state } = req.query;
    if (!state) {
        res.status(400).send("Missing state (Google JWT)");
        return;
    }
    res.locals.state = state;
    next();
};
exports.stateMiddleware = stateMiddleware;
//# sourceMappingURL=middleware.js.map