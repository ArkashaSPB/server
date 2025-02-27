import express from "express";
//import {MessageQueue} from "../services/messageClass.js";
import {getMessage} from "../services/messageFunc.js";

const router = express.Router();

router.post("/", async  (req, res) => {
	console.log('сообщение')
})

router.post("/r", async  (req, res) => {
	const { rId, method } = req.body;  // Получаем параметры из запроса
	try {
		getMessage(rId, method);
		 res.status(200).json({});
	} catch (error) {
		console.error('Ошибка в процессе рассылки:', error);
		res.status(500).json({ message: 'Произошла ошибка при обработке запроса' });
	}
})


export default router;