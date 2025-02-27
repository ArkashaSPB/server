import bot from "../bot.js";
import axios from 'axios';
import {connectToDatabase} from "../../func/db.js";

import path from "path";
import {fileURLToPath} from "url";
import fs from "fs";
// Получаем __filename и __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Убедитесь, что папка "photo" существует
const photoDir = path.join(__dirname, '../../photo');

export const avatarHandler = async (ctx) => {
	try {
		// Получаем фотографии профиля пользователя
		const profilePhotos = await bot.telegram.getUserProfilePhotos(ctx.from.id);

		if (profilePhotos.total_count > 0) {
			// Получаем ID самого большого фото
			const largestPhoto = profilePhotos.photos[0][profilePhotos.photos[0].length - 1];
			const fileId = largestPhoto.file_id;

			// Получаем данные о файле
			const fileInfo = await bot.telegram.getFile(fileId);
			const fileUrl = `https://api.telegram.org/file/bot${bot.token}/${fileInfo.file_path}`;

			// Определяем имя файла (например, avatar_<chatId>.<расширение>)
			const fileExtension = path.extname(fileInfo.file_path); // Получаем расширение файла
			const fileName = `avatar_${ctx.from.id}${fileExtension}`;
			const filePath = path.join(__dirname, '../../photo', fileName);

			// Скачиваем файл и сохраняем
			const response = await axios.get(fileUrl, { responseType: 'stream' });
			const writer = fs.createWriteStream(filePath);

			response.data.pipe(writer);
			writer.on('finish', async () => {
				// Обновляем информацию в базе данных
				const connection = await connectToDatabase();
				await connection.execute('UPDATE users SET photo = ? WHERE chat = ?', [fileName, ctx.chat.id]);
				await connection.end();

				// Отправляем сообщение пользователю о сохранении аватарки
				await ctx.reply(`Ваш аватар был сохранен как ${fileName}`);
			});

			writer.on('error', (error) => {
				console.error('Ошибка сохранения файла:', error);
				ctx.reply('Ошибка при сохранении файла.');
			});
		} else {
			await ctx.reply('У вас нет аватарки.');
		}
	} catch (error) {
		console.error('Ошибка при получении аватарки:', error);
		await ctx.reply('Произошла ошибка при получении аватарки.');
	}
}
export const avatarHandlerNode = async (ctx) => {
	const connection = await connectToDatabase();
	const userId = ctx.from.id;
	try {
		await connection.execute(`UPDATE users SET photo = ? WHERE chat = ?`,['no-image.png', userId]);
	} catch (error) {
		console.error('Ошибка при сброса аватарки', error);
	} finally {
		await connection.end();
	}
}