"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const routes_1 = require("./routes");
const express_session_1 = __importDefault(require("express-session"));
const connect_mongo_1 = __importDefault(require("connect-mongo"));
const dotenv_1 = __importDefault(require("dotenv"));
const passport_1 = __importDefault(require("passport"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const cors_1 = __importDefault(require("cors"));
const body_parser_1 = __importDefault(require("body-parser"));
const web_push_1 = __importDefault(require("web-push"));
const path_1 = __importDefault(require("path"));
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use(body_parser_1.default.json());
app.use(express_1.default.static(path_1.default.join(__dirname, 'client')));
dotenv_1.default.config();
const publicVapidKey = process.env.VAPID_PUBLIC_KEY;
const privateVapidKey = process.env.VAPID_PRIVATE_KEY;
web_push_1.default.setVapidDetails('mailto:annavarapukarthik0@gmail.com', publicVapidKey, privateVapidKey);
app.use((0, cors_1.default)({
    origin: ['http://localhost:5173', "https://smarteventmanager.netlify.app"],
    credentials: true
}));
app.use((0, cookie_parser_1.default)());
app.use((0, express_session_1.default)({
    secret: process.env.SESSION_SECRET,
    resave: true,
    saveUninitialized: false,
    store: connect_mongo_1.default.create({
        mongoUrl: process.env.dburl,
        dbName: "APPUSERS",
        collectionName: 'sessions'
    }),
    cookie: {
        maxAge: 1000 * 60 * 60 * 24,
        httpOnly: true,
        secure: true,
        sameSite: "none",
    }
}));
app.use(passport_1.default.initialize());
app.use(passport_1.default.session());
passport_1.default.serializeUser((user, done) => {
    console.log({ mssg: user });
    done(null, user);
});
passport_1.default.deserializeUser((user, done) => done(null, user));
app.use(routes_1.controll);
app.listen(8020, () => {
    console.log("Listening to port 8020");
});
exports.default = app;
//# sourceMappingURL=server.js.map