import { connectToDatabase } from './db.js';

export const addHistoryFunc = async (name, text) => {
	const connection = await connectToDatabase();
	try {
		await connection.execute(
			`INSERT INTO history (name, text) VALUES (?, ?)`,
			[name, text]
		);
		} catch (error) {
			throw new Error('Ошибка при запросе к базе данных: ' + error.message);
		} finally {
			await connection.end();
		}
}

export const getHistoryFunc = async () => {
	const connection = await connectToDatabase(); // Подключение к базе
	try {
		// Должно быть `await` перед `connection.execute`
		const [rows] = await connection.execute(`SELECT * FROM history ORDER BY id DESC LIMIT 2000`);
		return rows; // `rows` уже содержит массив данных
	} catch (error) {
		throw new Error('Ошибка при запросе к базе данных: ' + error.message);
	} finally {
		if (connection) {
			await connection.end(); // Закрытие соединения
		}
	}
};
