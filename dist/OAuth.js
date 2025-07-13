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
exports.codeChallenge = exports.codeVerifier = void 0;
exports.generateCodeVerifier = generateCodeVerifier;
exports.generateCodeChallenge = generateCodeChallenge;
const passport_1 = __importDefault(require("passport"));
const passport_google_oauth20_1 = require("passport-google-oauth20");
const passport_oauth2_1 = require("passport-oauth2");
const passport_facebook_1 = require("passport-facebook");
const crypto_1 = __importDefault(require("crypto"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
console.log(process.env.GOOGLE_CLIENT_ID);
const strategy = new passport_google_oauth20_1.Strategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "https://backend-sem.onrender.com/auth/google",
    scope: ['https://www.googleapis.com/auth/calendar',
        'https://www.googleapis.com/auth/calendar.readonly',
        'https://www.googleapis.com/auth/gmail.readonly'
    ]
}, (accessToken, refreshToken, profile, done) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const user = {
        id: profile.id,
        name: profile.name,
        email: (_a = profile.emails) === null || _a === void 0 ? void 0 : _a[0].value,
        googleAccessToken: accessToken,
        googleRefreshToken: refreshToken
    };
    return done(null, user);
}));
strategy.authorizationParams = function () {
    return {
        access_type: 'offline',
        prompt: 'consent'
    };
};
passport_1.default.use(strategy);
passport_1.default.use(new passport_facebook_1.Strategy({
    clientID: process.env.FACEBOOK_CLIENT_ID,
    clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
    callbackURL: "https://backend-sem.onrender.com/auth/facebook/callback",
    profileFields: ["id", "name"],
}, (accessToken, refreshToken, profile, done) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const user = {
        id: profile.id,
        name: profile.name,
        email: (_a = profile.emails) === null || _a === void 0 ? void 0 : _a[0].value,
        facebookAccessToken: accessToken,
        facebookRefreshToken: refreshToken
    };
    return done(null, user);
})));
passport_1.default.use(new passport_oauth2_1.Strategy({
    authorizationURL: 'https://twitter.com/i/oauth2/authorize',
    tokenURL: 'https://api.twitter.com/2/oauth2/token',
    clientID: process.env.TWITTER_CLIENT_ID,
    clientSecret: process.env.TWITTER_CLIENT_SECRET,
    callbackURL: "https://backend-sem.onrender.com/auth/twitter",
    scope: ['tweet.read', 'users.read', 'offline.access'],
    state: true
}, (accessToken, refreshToken, profile, done) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    console.log("in callback");
    const user = { id: profile.id,
        name: profile.name,
        email: (_a = profile.emails) === null || _a === void 0 ? void 0 : _a[0].value,
        twitterAccessToken: accessToken,
        twitterRefreshToken: refreshToken };
    return done(null, user);
})));
function generateCodeVerifier() {
    return crypto_1.default.randomBytes(32).toString('base64url');
}
function generateCodeChallenge(verifier) {
    return crypto_1.default.createHash('sha256')
        .update(verifier)
        .digest('base64')
        .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}
exports.codeVerifier = generateCodeVerifier();
exports.codeChallenge = generateCodeChallenge(exports.codeVerifier);
exports.default = passport_1.default;
//# sourceMappingURL=OAuth.js.map
