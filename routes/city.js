import express from 'express';
import { getCities } from '../services/cityService.js';

const router = express.Router();

// Эндпоинт для получения списка городов
router.get('/', async (req, res) => {
	const { name } = req.query; // Получаем параметр name из запроса
	const limit = parseInt(req.query.limit) || 5; // Лимит (по умолчанию 5)
	try {
		const cities = await getCities(name, limit);
		res.json(cities);
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: 'Ошибка на сервере' });
	}
});

export default router;
