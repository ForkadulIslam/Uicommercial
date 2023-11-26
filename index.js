"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = __importDefault(require("express"));
const dotenv = require('dotenv');
const Authcontroller = require("./controllers/AuthController");
const cors = require('cors');

var app = (0, express_1.default)();
dotenv.config();
app.use(cors());
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use(Authcontroller);
app.listen(3001, function () { console.log('Example app listening on port 3001!'); });
