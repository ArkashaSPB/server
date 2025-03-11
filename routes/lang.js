import express from "express";
import {
	addColumnToLan,
	addLanguage,
	delLanguage,
	dropColumnFromLan,
	getLangAll,
	updateLanguageData
} from "../services/langFunc.js";

const router = express.Router();


router.get("/", async (req, res) => {
	try {
		const mails = await getLangAll();
		res.status(200).json(mails);
	} catch (error) {
		console.error("Ошибка при получении языка:", error);
		res.status(500).json({ message: "Ошибка сервера" });
	}
});

router.post("/", async (req, res) => {
	const lang = req.body.lang?.trim(); // Берём язык из тела запроса и убираем пробелы
	try {
		const otvet = await addLanguage(lang)
		res.status(200).json(otvet);
	} catch (error) {
		console.error("Ошибка при добавлении языка:", error);
		res.status(500).json({ message: "Ошибка сервера" });
	}
});

router.delete("/:id", async (req, res) => {
	const id = parseInt(req.params.id, 10); // Преобразуем ID в число
	if (isNaN(id)) {
		return res.status(400).json({ message: "Некорректный ID языка." });
	}
	try {
		const otvet = await delLanguage(id);
		res.status(200).json(otvet);
	} catch (error) {
		console.error("Ошибка при удалении языка:", error);
		res.status(500).json({ message: "Ошибка сервера" });
	}
});

router.post("/column", async (req, res) => {
	const columnName = req.body.name?.trim();

	if (!columnName) {
		return res.status(400).json({ message: "Название столбца не может быть пустым." });
	}

	if (!/^[a-zA-Z0-9_]+$/.test(columnName)) {
		return res.status(400).json({ message: "Недопустимое имя столбца. Разрешены только буквы, цифры и _" });
	}
	try {
		const ot = await addColumnToLan(columnName);
		res.status(200).json({ message: ot });
	} catch (error) {
		console.error("Ошибка при добавлении столбца:", error);
		res.status(500).json({ message: "Ошибка сервера" });
	}
});

router.delete("/column/:name", async (req, res) => {
	const columnName = req.params.name?.trim();
	if (!columnName) {
		return res.status(400).json({ message: "Название столбца не может быть пустым." });
	}
	try {
		const result = await dropColumnFromLan(columnName);
		res.status(200).json({ message: result });
	} catch (error) {
		console.error("Ошибка при удалении столбца:", error);
		res.status(500).json({ message: "Ошибка сервера" });
	}
});

router.put("/data/:id", async (req, res) => {
	try {
		const id = req.params.id; // Берём ID из URL
		const data = req.body; // Берём данные из тела запроса

		const result = await updateLanguageData(id, data);
		res.status(result.success ? 200 : 400).json(result);
	} catch (error) {
		console.error("Ошибка при обновлении данных языка:", error);
		res.status(500).json({ message: "Ошибка сервера" });
	}
});


export default router;
