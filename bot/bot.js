import { Telegraf } from 'telegraf';
import dotenv from 'dotenv';
import { startHandler } from './handlers/startHandler.js';
import { contactHandler } from './handlers/contactHandler.js';
import { messageHandler } from './handlers/messageHandler.js';
import axios from "axios";
import { fileURLToPath } from 'url';
import path from 'path';
import {savePhoto} from "./services/photo.js";
import {photoHandler} from "./handlers/photoHandler.js";
import {avatarHandler, avatarHandlerNode} from "./handlers/avatarHandler.js";
dotenv.config();
// Создание экземпляра бота
const bot = new Telegraf(process.env.BOT);

bot.command('start', (ctx) => startHandler(ctx));

bot.on('contact', (ctx) => contactHandler(ctx));

bot.on('text', (ctx) => messageHandler(ctx));

bot.on('photo', async (ctx) => photoHandler(ctx));


bot.action('update_avatar', async (ctx) => avatarHandler(ctx));

bot.action('update_avatar2', async (ctx) => avatarHandlerNode(ctx));

bot.launch();
export default bot;
