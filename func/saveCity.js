import { connectToDatabase } from './db.js';
import fs from "fs";

// Функция для сохранения городов в базе данных
export async function saveCities(region, cities) {
	try {
		// Подключаемся к базе данных
		const connection = await connectToDatabase();

		// Формируем массив данных для вставки
		const values = cities.map((city) => [
			region,
			city.name,
			city.utc,
		]);

		// SQL-запрос для вставки нескольких записей
		const query = `
			INSERT INTO city (region, name, utc) 
			VALUES ?
		`;

		// Выполняем запрос
		await connection.query(query, [values]);

		console.log(`Данные успешно сохранены для региона: ${region}`);
		await connection.end();
	} catch (error) {
		console.error('Ошибка при сохранении данных:', error);
	}
}

//
// (async () => {
// 	try {
// 		// Чтение JSON-файла
// 		const data = JSON.parse(fs.readFileSync('city.json', 'utf8'));
//
// 		// Обрабатываем регионы
// 		for (const region of data) {
// 			const regionName = region.name;
// 			const cities = region.cities;
// 			// Сохраняем данные в базу
// 			await saveCities(regionName, cities);
// 		}
// 		console.log('Все данные успешно сохранены!');
// 	} catch (error) {
// 		console.error('Ошибка при обработке данных:', error);
// 	}
// })();