import express from 'express';
import dotenv from 'dotenv';

import upload from './upload.js'; // Импортируем multer

//import './cronJobs.js';

import cors from 'cors';
import {
	cityRouter,
	goodsRouter,
	langRouter,
	mailRouter,
	messageRouter,
	settingRouter,
	usersRouter
} from "./routes/index.js"; // Импортируем бота

dotenv.config();
const PORT = process.env.PORT || 3000;


const app = express();
app.use(express.json());
app.use(cors());
// Роуты
app.use('/api/users', usersRouter);
app.use('/api/goods', goodsRouter);
app.use('/api/message', messageRouter);
app.use('/api/city', cityRouter);
app.use('/api/setting', settingRouter);
app.use('/api/mail', mailRouter);
app.use('/api/lang', langRouter);


app.post('/api/upload', upload.single('image'), (req, res) => {
	if (!req.file) {
		return res.status(400).send('No file uploaded.');
	}
	res.status(200).send({ message: 'File uploaded successfully', filename: req.file.filename });
});

// Роут для отдачи изображения по запросу
app.use('/api/img', express.static('photo'));

app.listen(PORT, '0.0.0.0', () => {
	console.log(`Сервер запущен на порту ${PORT}`);
});

