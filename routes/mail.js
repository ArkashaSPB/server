import express from "express";
import {
	addColumnFunc,
	getAllMails,
	getLanguagesList,
	getMailById,
	removeColumnFunc,
	updateMail
} from "../services/mailFunc.js";

const router = express.Router();

// 📩 Получить все письма



router.post("/column", async (req, res) => {
	try {
		const { lang } = req.body;
		const result = await addColumnFunc(lang);
		res.status(200).json(result);
	} catch (error) {
		console.error("Ошибка при обновлении письма:", error);
		res.status(500).json({ message: "Ошибка сервера" });
	}
});

router.delete("/column/:lang", async (req, res) => {
	try {
		const  lang  = req.params.lang;
		const result = await removeColumnFunc(lang);
		res.status(200).json(result);
	} catch (error) {
		console.error("Ошибка при обновлении письма:", error);
		res.status(500).json({ message: "Ошибка сервера" });
	}
});

router.get("/column/", async (req, res) => {
	try {
		console.log(33)
		const result = await getLanguagesList();
		res.status(200).json(result);
	} catch (error) {
		console.error("Ошибка при обновлении письма:", error);
		res.status(500).json({ message: "Ошибка сервера" });
	}
});


router.get("/", async (req, res) => {
	try {
		const mails = await getAllMails();
		res.status(200).json(mails);
	} catch (error) {
		console.error("Ошибка при получении писем:", error);
		res.status(500).json({ message: "Ошибка сервера" });
	}
});

// 📩 Получить письмо по ID
router.get("/:id", async (req, res) => {
	try {
		const { id } = req.params;
		const mail = await getMailById(id);
		res.status(200).json(mail);
	} catch (error) {
		console.error("Ошибка при получении письма:", error);
		res.status(404).json({ message: "Письмо не найдено" });
	}
});

// ✏️ Обновить письмо
router.put("/:id", async (req, res) => {
	try {
		const { id } = req.params;

		// Выполняем обновление
		const result = await updateMail(id, req.body);

		// Отправляем успешный ответ
		res.status(200).json(result);
	} catch (error) {
		console.error("Ошибка при обновлении письма:", error);
		res.status(500).json({ message: "Ошибка сервера" });
	}
});




export default router;
