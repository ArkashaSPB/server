import { connectToDatabase } from './db.js';
import nodemailer from "nodemailer";

// Функция для получения настроек SMTP из базы данных
const getSMTPSettings = async () => {
	const connection = await connectToDatabase();

	try {
		// Выполняем запрос с использованием промисов
		const [rows] = await connection.execute('SELECT * FROM setting LIMIT 1');

		if (rows.length > 0) {
			return rows[0]; // Предполагаем, что в базе только одна запись
		} else {
			throw new Error('Не удалось найти настройки SMTP в базе данных');
		}
	} catch (error) {
		console.log('Ошибка при получении настроек SMTP: ', error);
		throw error;
	} finally {
		connection.end(); // Закрываем соединение с базой данных
	}
};

// Функция для отправки письма с использованием SMTP настроек из базы данных
export const sendMail = async (toEmail, subject, text) => {
	try {
		// Получаем настройки SMTP из базы данных
		const settings = await getSMTPSettings();

		// Создаем транспорт для Nodemailer с использованием полученных данных
		const transporter = nodemailer.createTransport({
			host: settings.smtpServer, // сервер SMTP
			port: settings.smtpPort,   // порт SMTP
			secure: settings.smtpTyp === 'SSL', // Если тип SMTP SSL, устанавливаем secure в true
			tls: {
				rejectUnauthorized: false, // Для некоторых серверов с самоподписанными сертификатами
			},
			auth: {
				user: settings.smptMail, // почта для аутентификации
				pass: settings.smtpPass, // пароль для аутентификации
			},
		});

		// Параметры письма
		const mailOptions = {
			from: settings.smptMail, // отправитель
			to: toEmail, // получатель
			subject: subject, // тема письма
			html: text, // текст письма
		};

		// Отправляем письмо с использованием await для корректной работы с асинхронностью
		const info = await transporter.sendMail(mailOptions);
		console.log('Письмо отправлено: ', info.response);
	} catch (error) {
		if (error.code === 'ECONNREFUSED') {
			console.log('Ошибка: порт закрыт');
		} else {
			console.log('Ошибка при отправке письма: ', error);
		}
	}
};

export const getSahblonFunc = async (id, lang = 'ru') => {
	const connection = await connectToDatabase();
	try {
		let query;
		if (lang === 'ru') {
			query = 'SELECT text, subject FROM email WHERE id = ?';
		} else {
			// Проверяем, существует ли колонка text_${lang}
			const [columns] = await connection.execute(
				"SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'email' AND COLUMN_NAME = ?",
				[`text_${lang}`]
			);
			query = columns.length > 0
				? `SELECT text_${lang} AS text, subject_${lang} AS subject FROM email WHERE id = ?`
				: 'SELECT text, subject FROM email WHERE id = ?';
		}
		const [res] = await connection.execute(query, [id]);
		return res.length > 0 ? res[0] : null;
	} catch (error) {
		throw new Error('Ошибка при запросе к базе данных: ' + error.message);
	} finally {
		await connection.end();
	}
};

