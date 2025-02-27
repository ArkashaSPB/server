import bot from "../bot.js";
import path from "path";
import {fileURLToPath} from "url";
// Получаем __filename и __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Убедитесь, что папка "photo" существует
const photoDir = path.join(__dirname, '../../photo');
import fs from 'fs';
import axios from "axios";


if (!fs.existsSync(photoDir)) {
	fs.mkdirSync(photoDir);
}
export const savePhoto = async (fileId, sizeLabel) => {
	try {
		// Получаем данные о файле
		const fileInfo = await bot.telegram.getFile(fileId);
		const fileUrl = `https://api.telegram.org/file/bot${bot.token}/${fileInfo.file_path}`;

		// Определяем имя файла
		const fileName = `${fileId}_${sizeLabel}.jpg`;
		const filePath = path.join(photoDir, fileName);

		// Скачиваем файл
		const response = await axios.get(fileUrl, { responseType: 'stream' });
		const writer = fs.createWriteStream(filePath);
		// Сохраняем файл
		await new Promise((resolve, reject) => {
			response.data.pipe(writer);
			writer.on('finish', resolve);
			writer.on('error', reject);
		});
		console.log(`Фото (${sizeLabel}) сохранено как ${fileName}`);
	} catch (error) {
		console.error(`Ошибка при сохранении фото (${sizeLabel}):`, error);
		throw error;
	}
}