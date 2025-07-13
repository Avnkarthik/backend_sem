"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
exports.mergedModel = exports.TaskModel = exports.Usermodel = exports.UnifiedEvent = exports.normDataSchema = exports.dbconnection = void 0;
const mongoose_1 = __importStar(require("mongoose"));
require("express-session");
const dotenv_1 = __importDefault(require("dotenv"));
const dbconnection = () => __awaiter(void 0, void 0, void 0, function* () {
    dotenv_1.default.config();
    try {
        yield mongoose_1.default.connect(process.env.dburl).then(() => {
            console.log("Database connected Succesfully");
            return;
        });
    }
    catch (error) {
        console.log("some error:", error);
    }
});
exports.dbconnection = dbconnection;
let user = new mongoose_1.default.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    }
});
let events = new mongoose_1.default.Schema({
    Eventname: {
        type: String,
        required: true
    },
    Eventdate: {
        type: String,
        required: true
    },
    Eventtime: {
        type: String,
        required: true
    }
});
exports.normDataSchema = new mongoose_1.default.Schema({
    platform: { type: String,
        enum: ["Google", "Facebook", "Twitter"],
        required: true
    },
    title: String,
    description: String,
    startTime: Date,
    endTime: Date,
    link: String,
    sourceId: String,
    raw: Object,
    userId: { type: String,
        required: true
    }
});
exports.UnifiedEvent = mongoose_1.default.model("UnifiedEvent", exports.normDataSchema);
exports.Usermodel = (0, mongoose_1.model)("user", user);
exports.TaskModel = (0, mongoose_1.model)("Task", events);
const Mergedschema = new mongoose_1.default.Schema({
    id: String,
    token: String,
    name: String,
    email: String,
    googleAccessToken: String,
    googleRefreshToken: String,
    facebookAccessToken: String,
    facebookRefreshToken: String,
    twitterAccessToken: String,
    twitterRefreshToken: String,
    codeVerifier: String
});
exports.mergedModel = (0, mongoose_1.model)("MergedSession", Mergedschema);
//# sourceMappingURL=database.js.map