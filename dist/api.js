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
exports.Subscribe = exports.EmailEvents = exports.DeleteAccount = exports.SortedEvents = exports.twitEvents = exports.fbEvents = exports.logout = exports.UserName = exports.dashboard = exports.callbackTwitter = exports.twitterauth = exports.renotify = exports.fbSaveSession = exports.facebookhandler = exports.googleSaveSession = exports.userlogin = exports.updatetask = exports.inserttasks = exports.gettask = void 0;
const express_validator_1 = require("express-validator");
const database_1 = require("./database");
const dotenv_1 = __importDefault(require("dotenv"));
const axios_1 = __importDefault(require("axios"));
const passport_1 = __importDefault(require("passport"));
const datanot_1 = require("./datanot");
const OAuth_1 = require("./OAuth");
const middleware_1 = require("./middleware");
const web_push_1 = __importDefault(require("web-push"));
const node_schedule_1 = __importDefault(require("node-schedule"));
dotenv_1.default.config();
const gettask = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, database_1.dbconnection)();
    res.status(200).json(yield database_1.TaskModel.find());
});
exports.gettask = gettask;
const inserttasks = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, database_1.dbconnection)();
    let errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        res.status(400).json(errors);
    }
    let newobj = new database_1.TaskModel(req.body);
    yield newobj.save();
    res.status(201).json({ "mssg": "inserted sucessfully", obj: newobj });
});
exports.inserttasks = inserttasks;
const updatetask = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, database_1.dbconnection)();
    let id = req.params.id;
    let updatedobj = req.body;
    let obj = database_1.TaskModel.find({ id });
    let newobj = new database_1.TaskModel(Object.assign(Object.assign({}, obj), updatedobj));
    let dbres = yield newobj.save();
    res.json(204).json(dbres);
});
exports.updatetask = updatetask;
const userlogin = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, database_1.dbconnection)();
    let result;
    if (req.query.newuser) {
        let newobj = new database_1.Usermodel(req.body);
        result = yield newobj.save();
    }
    else {
        result = database_1.Usermodel.find(req.body);
        if (!result || result == undefined)
            res.status(404).json({ mssg: "user not found" });
    }
    res.status(201).json({ mssg: "inserted", obj: result });
});
exports.userlogin = userlogin;
const googleSaveSession = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("in google save session");
    const user = req.user;
    if (!user)
        return res.redirect("/login?error=google_failed");
    const token = (0, middleware_1.createToken)({
        id: user.id,
        name: user.name,
        email: user.email,
        googleAccessToken: user.googleAccessToken,
        googleRefreshToken: user.googleRefreshToken,
        provider: "google",
    });
    res.redirect(`https://backend-sem.onrender.com/dashboard?token=${token}`);
});
exports.googleSaveSession = googleSaveSession;
const facebookhandler = (req, res, next) => {
    passport_1.default.authenticate("facebook", {
        scope: ["public_profile"],
        state: res.locals.state,
        session: false
    })(req, res, next);
};
exports.facebookhandler = facebookhandler;
const fbSaveSession = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.user;
    const stateToken = decodeURIComponent(req.query.state);
    if (!user || !stateToken)
        return res.redirect("/login?error=facebook_failed");
    const combinedUser = {
        email: stateToken,
        facebookAccessToken: user.facebookAccessToken,
        facebookRefreshToken: user.facebookRefreshToken,
    };
    const token = (0, middleware_1.createToken)(Object.assign(Object.assign({}, combinedUser), { provider: "facebook" }));
    res.redirect(`/dashboard?token=${encodeURIComponent(token)}`);
});
exports.fbSaveSession = fbSaveSession;
const renotify = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    console.log("in renotify");
    console.log("in set intervel");
    const email = (_a = req.session.user) === null || _a === void 0 ? void 0 : _a.email;
    console.log("Eamil:", email);
    if (!email) {
        console.log("No session found, redirecting...");
        res.status(401).json({ message: 'Not authenticated' });
        return;
    }
    yield (0, database_1.dbconnection)();
    const UserData = yield database_1.mergedModel.findOne({ email: email });
    if (!UserData) {
        res.json({ error: "no user" });
        return;
    }
    let twitterEvents, googleEvents, facebookEvents, gmailEvents;
    if ((UserData === null || UserData === void 0 ? void 0 : UserData.googleAccessToken) !== undefined && UserData.googleAccessToken != null) {
        console.log("in gg api");
        googleEvents = yield (0, datanot_1.fetchGoogleEvents)(UserData.googleAccessToken);
        gmailEvents = yield (0, datanot_1.fetchGmailEvents)(UserData.googleAccessToken);
    }
    let userId = UserData._id.toString();
    if (userId !== undefined) {
        const events = [];
        if (googleEvents) {
            events.push(...googleEvents.map((e) => (0, datanot_1.normalizeGoogle)(e, userId)));
            if (gmailEvents)
                events.push(...gmailEvents.map((e) => (0, datanot_1.normalizeGmail)(e, userId)));
        }
        try {
            yield database_1.UnifiedEvent.insertMany(events);
            res.json({ message: "Events stored", events: events });
        }
        catch (err) {
            console.error("Ingest error:", err);
            res.status(500).json({ error: "Failed to ingest events" });
        }
        console.log("Events: ", events);
    }
    else {
        console.log("nouser");
        res.status(401).json("unregistered user");
    }
});
exports.renotify = renotify;
dotenv_1.default.config();
const twitterauth = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const stateToken = decodeURIComponent(req.query.state);
    let token = encodeURIComponent(stateToken);
    if (!stateToken) {
        res.status(400).json({ error: "Missing state token" });
        return;
    }
    const TWITTER_REDIRECT_URI = "http://localhost:8020/auth/twitter";
    const codeVerifier = yield (0, OAuth_1.generateCodeVerifier)();
    const codeChallenge = (0, OAuth_1.generateCodeChallenge)(codeVerifier);
    res.cookie("twitter_code_verifier", codeVerifier, {
        httpOnly: true,
        secure: false,
        sameSite: "lax"
    });
    const authUrl = `https://twitter.com/i/oauth2/authorize?response_type=code&client_id=${process.env.TWITTER_CLIENT_ID}&redirect_uri=${TWITTER_REDIRECT_URI}&scope=tweet.read users.read offline.access&state=${token}&code_challenge=${codeChallenge}&code_challenge_method=S256`;
    res.redirect(authUrl);
});
exports.twitterauth = twitterauth;
const callbackTwitter = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    console.log("in call back");
    const clientIdSecret = `${process.env.TWITTER_CLIENT_ID}:${process.env.TWITTER_CLIENT_SECRET}`;
    const encodedCredentials = Buffer.from(clientIdSecret).toString('base64');
    const authCode = req.query.code;
    const stateToken = decodeURIComponent(req.query.state || "");
    const codeVerifier = req.cookies.twitter_code_verifier;
    try {
        const TWITTER_REDIRECT_URI = "http://localhost:8020/auth/twitter";
        const response = yield axios_1.default.post('https://api.twitter.com/2/oauth2/token', {
            client_id: process.env.TWITTER_CLIENT_ID,
            client_secret: process.env.TWITTER_CLIENT_SECRET,
            redirect_uri: TWITTER_REDIRECT_URI,
            grant_type: 'authorization_code',
            code: authCode,
            code_verifier: codeVerifier
        }, {
            headers: {
                'Authorization': `Basic ${encodedCredentials}`,
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });
        const { access_token, refresh_token } = response.data;
        const email = decodeURIComponent(req.query.state || "");
        const mergedUser = {
            email: email,
            twitterAccessToken: access_token,
            twitterRefreshToken: refresh_token,
            provider: "twitter"
        };
        const finalToken = (0, middleware_1.createToken)(mergedUser);
        res.redirect(`/dashboard?token=${encodeURIComponent(finalToken)}`);
    }
    catch (error) {
        console.error("OAuth Error Response:", ((_a = error.response) === null || _a === void 0 ? void 0 : _a.data) || error.message);
        res.status(500).json({ error: ((_b = error.response) === null || _b === void 0 ? void 0 : _b.data) || "Authentication failed" });
    }
});
exports.callbackTwitter = callbackTwitter;
const dashboard = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    dotenv_1.default.config();
    try {
        const token = req.query.token;
        if (!token) {
            res.status(401).json({ mssg: "No token provided" });
            return;
        }
        const userData = (0, middleware_1.verifyToken)(token);
        if (!(userData === null || userData === void 0 ? void 0 : userData.email) || !(userData === null || userData === void 0 ? void 0 : userData.provider)) {
            res.status(401).json({ mssg: "Invalid token" });
            return;
        }
        if (userData.name) {
            console.log("family name:", userData.name.familyName);
            console.log("givenName:", userData.name.givenName);
        }
        if (!req.session.user)
            req.session.user = {};
        if (!((_a = req.session.user) === null || _a === void 0 ? void 0 : _a.email) && userData.email)
            req.session.user.email = userData.email;
        if (!req.session.user.name && userData.name) {
            const { familyName, givenName } = userData.name;
            if (familyName || givenName) {
                req.session.user.name = [familyName, givenName].filter(Boolean).join(" ");
            }
        }
        console.log("before save");
        req.session.save((err) => {
  if (err) console.error("Session save error:", err);
  console.log("Session saved successfully.");
            console.log("name:", req.session.user.name);
}); 
        yield (0, database_1.dbconnection)();
        const filter = { email: userData.email };
        const update = Object.assign(Object.assign(Object.assign({ name: userData.familyName + userData.givenName, email: userData.email }, (userData.googleAccessToken && {
            googleAccessToken: userData.googleAccessToken,
            googleRefreshToken: userData.googleRefreshToken,
        })), (userData.facebookAccessToken && {
            facebookAccessToken: userData.facebookAccessToken,
            facebookRefreshToken: userData.facebookRefreshToken,
        })), (userData.twitterAccessToken && {
            twitterAccessToken: userData.twitterAccessToken,
            twitterRefreshToken: userData.twitterRefreshToken,
        }));
        yield database_1.mergedModel.findOneAndUpdate(filter, { $set: update }, { upsert: true, new: true });
        console.log("Redirecting to:", process.env.front_end);
// After successful login
  res.redirect("https://smarteventmanager.netlify.app/connections?email=${userData.email}&provider=${userData.provider}");


     
    }
    catch (error) {
        console.error("Dashboard error:", error);
        res.status(500).send("Invalid or expired token.");
    }
});
exports.dashboard = dashboard;
const UserName = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    let googleAT = false, facebookAT = false, twitterAT = false;
    const email = req.query.email;
    if (email) {
        yield (0, database_1.dbconnection)();
        
        const UserData = yield database_1.mergedModel.findOne({ email: email });
        if (UserData) {
            if (UserData.googleAccessToken !== undefined && UserData.googleAccessToken !== null)
                googleAT = true;
            if (UserData.facebookAccessToken !== undefined && UserData.facebookAccessToken !== null)
                facebookAT = true;
            if (UserData.twitterAccessToken !== undefined && UserData.twitterAccessToken !== null)
                twitterAT = true;
        }
         res.json({ name: UserData.name, email: UserData.email, googleAT, facebookAT, twitterAT });
    } else
        res.status(401).json({ error: "User not logged in" });
});
exports.UserName = UserName;
const logout = (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Session destruction error:', err);
            return res.status(500).send('Logout failed');
        }
        res.clearCookie('connect.sid');
        res.sendStatus(200);
    });
};
exports.logout = logout;
const fbEvents = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    console.log("in fb events");
    const email = (_a = req.session.user) === null || _a === void 0 ? void 0 : _a.email;
    console.log("Eamil:", email);
    if (!email) {
        console.log("No session found, redirecting...");
        res.status(401).json({ message: 'Not authenticated' });
        return;
    }
    yield (0, database_1.dbconnection)();
    const UserData = yield database_1.mergedModel.findOne({ email: email });
    if (!UserData) {
        console.log("no user in fb");
        res.json({ error: "no user" });
        return;
    }
    let facebookEvents = "";
    if (UserData.facebookAccessToken !== undefined && UserData.facebookAccessToken != null) {
        console.log("in fb api");
        facebookEvents = yield (0, datanot_1.fetchFacebookEvents)(UserData.facebookAccessToken);
        console.log(facebookEvents);
        res.json({ message: "Data sent successfully", events: facebookEvents });
    }
    else {
        console.log("no user au  in fb");
        res.json({ error: "no user is authenticated" });
    }
});
exports.fbEvents = fbEvents;
const twitEvents = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    console.log("in twit events");
    const email = (_a = req.session.user) === null || _a === void 0 ? void 0 : _a.email;
    console.log("Eamil:", email);
    if (!email) {
        console.log("No session found, redirecting...");
        res.status(401).json({ message: 'Not authenticated' });
        return;
    }
    yield (0, database_1.dbconnection)();
    const UserData = yield database_1.mergedModel.findOne({ email: email });
    if (!UserData) {
        console.log("no user in twit");
        res.json({ error: "no user" });
        return;
    }
    let twitterEvents;
    if (UserData.twitterAccessToken !== undefined && UserData.twitterAccessToken != null) {
        console.log("in twit api");
        twitterEvents = yield database_1.UnifiedEvent.find({ platform: "Twitter" });
        console.log(exports.twitEvents);
        res.json({ message: "Data sent successfully", events: twitterEvents });
    }
    else {
        console.log("no user au  in twit");
        res.json({ error: "no user is authenticated" });
    }
});
exports.twitEvents = twitEvents;
const SortedEvents = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const rawDate = req.query.date;
        if (typeof rawDate !== 'string') {
            res.status(400).json({ error: 'Invalid or missing date parameter' });
            return;
        }
        const targetDate = new Date(rawDate);
        const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0));
        const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999));
        const email = (_a = req.session.user) === null || _a === void 0 ? void 0 : _a.email;
        if (!email) {
            res.status(401).json({ message: 'Not authenticated' });
            return;
        }
        yield (0, database_1.dbconnection)();
        const UserData = yield database_1.mergedModel.findOne({ email });
        if (!UserData) {
            res.status(404).json({ error: "No user found" });
            return;
        }
        let googleEvents = [];
        let facebookEvents = [];
        let twitterEvents = [];
        if (UserData.googleAccessToken) {
            googleEvents = (yield (0, datanot_1.fetchGoogleEvents)(UserData.googleAccessToken));
            googleEvents = googleEvents.map(evnt => (Object.assign(Object.assign({}, evnt), { platform: 'Google' })));
        }
        if (UserData.facebookAccessToken) {
            facebookEvents = (yield (0, datanot_1.fetchFacebookEvents)(UserData.facebookAccessToken));
            facebookEvents = facebookEvents.map(e => (Object.assign(Object.assign({}, e), { platform: 'Facebook' })));
        }
        if (UserData.twitterAccessToken) {
            console.log("in twitter sorted");
            twitterEvents = (yield database_1.UnifiedEvent.find({ platform: "Twitter" }));
            console.log("teiiter Evnts:", twitterEvents);
        }
        const allEvents = [...googleEvents, ...facebookEvents, ...twitterEvents];
        const rawNormalizedEvents = allEvents.map((event) => {
            var _a, _b, _c, _d, _e, _f;
            if (event.platform === 'Google' || event.kind === 'calendar#event') {
                const title = (_a = event.summary) === null || _a === void 0 ? void 0 : _a.trim();
                const description = ((_b = event.description) === null || _b === void 0 ? void 0 : _b.trim()) || '';
                const startTime = (_c = event.start) === null || _c === void 0 ? void 0 : _c.dateTime;
                const endTime = (_d = event.end) === null || _d === void 0 ? void 0 : _d.dateTime;
                const link = event.htmlLink;
                const sourceId = event.id;
                const userId = UserData._id.toString();
                if (!title && !description)
                    return null;
                if (!startTime)
                    return null;
                return {
                    platform: 'Google',
                    title,
                    description,
                    startTime,
                    endTime,
                    link,
                    sourceId,
                    userId,
                    raw: event,
                };
            }
            if (event.platform === 'Facebook') {
                const message = (_e = event.message) === null || _e === void 0 ? void 0 : _e.trim();
                const startTime = event.created_time;
                const link = event.permalink_url;
                const sourceId = event.id;
                const userId = UserData._id.toString();
                if (!message || !startTime)
                    return null;
                return {
                    platform: 'Facebook',
                    title: 'Facebook Post',
                    description: message,
                    startTime,
                    link,
                    sourceId,
                    userId,
                    raw: event,
                };
            }
            if (event.platform === 'Twitter') {
                const title = event.title;
                const description = event.description || '';
                const startTime = event.startTime.toISOString();
                const link = event.link;
                const sourceId = event.sourceId || ((_f = event.raw) === null || _f === void 0 ? void 0 : _f.id);
                const userId = event.userId;
                if (!title || !startTime || !sourceId)
                    return null;
                return {
                    platform: "Twitter",
                    title,
                    description,
                    startTime,
                    link,
                    sourceId,
                    userId,
                    raw: event,
                };
            }
            return null;
        });
        const normalizedEvents = rawNormalizedEvents.filter((e) => e !== null && typeof e.startTime === 'string');
        const filteredEvents = normalizedEvents.filter(event => {
            const eventDate = new Date(event.startTime);
            return eventDate >= startOfDay && eventDate <= endOfDay;
        });
        res.json({ message: "Filtered events", events: filteredEvents });
    }
    catch (error) {
        console.error("Error in SortedEvents:", error);
        res.status(500).json({ error: "Internal server error", details: error.message });
    }
});
exports.SortedEvents = SortedEvents;
const DeleteAccount = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const prov = req.query.prov;
    const email = (_a = req.session.user) === null || _a === void 0 ? void 0 : _a.email;
    if (!email) {
        res.status(401).json("User not authenticated");
        return;
    }
    (0, database_1.dbconnection)();
    if (prov == 'google') {
        yield database_1.mergedModel.updateOne({ email: email }, { $set: {
                googleAccessToken: null,
                googleRefreshToken: null,
            } });
    }
    else if (prov == 'facebook') {
        yield database_1.mergedModel.updateOne({ email: email }, { $set: {
                facebookAccessToken: null,
                facebookRefreshToken: null,
            } });
    }
    else if (prov == 'twitter') {
        yield database_1.mergedModel.updateOne({ email: email }, { $set: {
                twitterAccessToken: null,
                twitterRefreshToken: null,
            } });
    }
    res.status(200).json({ mssg: "Account deleted sucessfully" });
});
exports.DeleteAccount = DeleteAccount;
const EmailEvents = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    console.log("in twit events");
    const email = (_a = req.session.user) === null || _a === void 0 ? void 0 : _a.email;
    console.log("Eamil:", email);
    if (!email) {
        console.log("No session found, redirecting...");
        res.status(401).json({ message: 'Not authenticated' });
        return;
    }
    yield (0, database_1.dbconnection)();
    const UserData = yield database_1.mergedModel.findOne({ email: email });
    if (!UserData) {
        console.log("no user in twit");
        res.json({ error: "no user" });
        return;
    }
    let emailEvents;
    if (UserData.googleAccessToken !== undefined) {
        console.log("in twit api");
        emailEvents = yield (0, datanot_1.fetchGmailEvents)(UserData.googleAccessToken);
        console.log(emailEvents);
        res.json({ message: "Data sent successfully", events: emailEvents });
        return;
    }
    else {
        console.log("no user au  in google");
        res.json({ error: "no user is authenticated" });
    }
});
exports.EmailEvents = EmailEvents;
const Subscribe = (req, res) => {
    const { subscription, task } = req.body;
    dotenv_1.default.config();
    if (!subscription || !task || !task.time || !task.title) {
        res.status(400).json({ error: 'Missing subscription or task data' });
        return;
    }
    let scheduledDate = new Date(task.time);
    console.log(scheduledDate);
    const now = new Date();
    if (scheduledDate.getTime() <= now.getTime()) {
        return;
    }
    const jobId = `${task.id}-${scheduledDate.getTime()}`;
    const payload = JSON.stringify({
        title: `🔔 ${task.title}`,
        body: `🕒 ${task.time || '10:00 PM'} on ${task.platform || 'Custom'}\n📝 ${task.description || 'No details provided.'}`,
        icon: '/icon-192.png',
        data: {
            url: task.link || `${process.env.front_end}/deadlines`,
        },
    });
    node_schedule_1.default.scheduleJob(jobId, scheduledDate, () => {
        console.log(`📬 Sending push for "${task.title}" at ${scheduledDate}`);
        web_push_1.default.sendNotification(subscription, payload).catch(console.error);
    });
    console.log(`📅 Scheduled push for "${task.title}" at ${scheduledDate.toISOString()} with job ID: ${jobId}`);
    res.status(201).json({ message: 'Notification scheduled' });
};
exports.Subscribe = Subscribe;
//# sourceMappingURL=api.js.map
