// upload.js
import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Настройка хранилища для multer
const storage = multer.diskStorage({
	destination: (req, file, cb) => {
		const dir = './photo';
		// Создаём папку, если она не существует
		if (!fs.existsSync(dir)) {
			fs.mkdirSync(dir);
		}
		cb(null, dir);
	},
	filename: (req, file, cb) => {
		const ext = path.extname(file.originalname);
		cb(null, Date.now() + ext); // Генерируем уникальное имя файла
	},
});

// Экспортируем функцию загрузки одного файла
const upload = multer({ storage: storage });

export default upload;
