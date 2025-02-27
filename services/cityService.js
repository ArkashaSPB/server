import { connectToDatabase } from '../func/db.js';

// Функция для получения списка городов
export async function getCities(name = '', limit = 5) {
	const connection = await connectToDatabase();
	try {
		const query = `
            SELECT * 
            FROM city 
            WHERE name LIKE '%${name}%'
            LIMIT ${limit}
        `;
		const [rows] = await connection.query(query);
		return rows;
	} catch (error) {
		throw new Error('Ошибка при запросе к базе данных: ' + error.message);
	} finally {
		await connection.end();
	}
}