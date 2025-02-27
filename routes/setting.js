import express from "express";
import {getAllOplata, getMyTron, getSettingFunc, settingFunc} from "../services/settingFunc.js";

const router = express.Router();

import {checkTron} from "../cronJobs.js";

router.get('/', async (req, res) => {
	try {
		const response = await getSettingFunc();
		res.json(response);
	} catch (error) {
		res.status(400).json({ error: error.message });
	}
});


router.get('/m', async (req, res) => {
	try {

		await checkTron()
		res.status(200).json('2');
		// try {
		// 	const otvet = await sendMail('kras-olimp@mail.ru' , 'Регистрация', `<p style="color: red">d</p> `);
		// 	res.json({ success: true, message: 'Письмо отправлено успешно!' });
		// } catch (error) {
		// 	console.error('Ошибка при отправке письма:', error);
		// 	res.status(500).json({ error: 'Ошибка при отправке письма', details: error.message });
		// }
	} catch (error) {
		console.error('Ошибка в процессе работы с nodemailer:', error);
		res.status(400).json({ error: 'Произошла ошибка при настройке почты', details: error.message });
	}
});


router.post('/', async (req, res) => {
	const data = req.body;
	try {
		const response = await settingFunc(data);
		res.json(response);
	} catch (error) {
		res.status(400).json({ error: error.message });
	}
});


router.get('/oplata', async (req, res) => {
	try {
		const response = await getAllOplata();
		res.json(response);
	} catch (error) {
		res.status(400).json({ error: error.message });
	}
});

router.get('/tron', async (req, res) => {
	try {
		const response = await getMyTron();
		res.json(response);
	} catch (error) {
		res.status(400).json({ error: error.message });
	}
});







export default router