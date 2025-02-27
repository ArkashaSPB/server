import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

// Загружаем переменные окружения из .env
dotenv.config();

// Получаем значения переменных из .env
const host = process.env.MYSQL_HOST;
const user = process.env.MYSQL_USER;
const password = process.env.MYSQL_PASSWORD;
const database = process.env.MYSQL_DATABASE;

// Проверяем наличие переменных окружения
if (!host || !user || !password || !database) {
	console.error('Проверьте .env файл: отсутствуют необходимые переменные окружения!');
	process.exit(1);
}

// Функция для подключения к MySQL
export async function connectToDatabase() {
	return mysql.createConnection({
		host: host,
		user: user,
		password: password,
		database: database,
	});
}
