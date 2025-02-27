import express from "express";
import { getAllMails, getMailById, updateMail } from "../services/mailFunc.js";

const router = express.Router();

// 📩 Получить все письма
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
		const { name, text, subject } = req.body;

		if (!name || !text || !subject) {
			return res.status(400).json({ message: "Все поля (name, text, subject) обязательны" });
		}

		const result = await updateMail(id, { name, text, subject });
		res.status(200).json(result);
	} catch (error) {
		console.error("Ошибка при обновлении письма:", error);
		res.status(500).json({ message: "Ошибка сервера" });
	}
});

export default router;
