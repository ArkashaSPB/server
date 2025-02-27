import { connectToDatabase } from '../func/db.js';
import {getTronData} from "../cronJobs.js";


export const settingFunc = async (data) => {
	const connection = await connectToDatabase();

	try {
		// Создаем SQL-запрос для обновления данных
		const query = `
        UPDATE setting
        SET smptMail = ?, smtpName = ?, smtpPass = ?, smtpPort = ?, smtpServer = ?, smtpTyp = ?, tron = ?
        WHERE id = ?
		`;

		console.log(data); // Логируем данные, чтобы проверить

		// Обновляем данные в таблице
		const [res] = await connection.execute(query, [
			data.smptMail,
			data.smtpName,
			data.smtpPass,
			data.smtpPort,
			data.smtpServer,
			data.smtpTyp,
			data.tron,
			data.id // id необходимо для обновления конкретной записи
		]);

		// Проверяем, что данные были обновлены (затронуто хотя бы 1 строка)
		if (res.affectedRows > 0) {
			return { success: true, message: 'Данные успешно обновлены.' };
		} else {
			return { success: false, message: 'Не удалось обновить данные.' };
		}
	} catch (error) {
		throw new Error('Ошибка при запросе к базе данных: ' + error.message);
	} finally {
		await connection.end();
	}
};

export const getSettingFunc = async () => {
	const connection = await connectToDatabase();
	try {
		const [rows] = await connection.query(` SELECT * FROM setting LIMIT 1`);
		if (rows.length > 0) {
			return rows[0];
		} else {
			return null;
		}
	} catch (error) {
		throw new Error('Ошибка при запросе к базе данных: ' + error.message);
	} finally {
		await connection.end();
	}
}

export const getAllOplata = async () => {
	const connection = await connectToDatabase();
	try {
		const [rows] = await connection.query(` SELECT * FROM oplata WHERE status IN(1,2) ORDER BY id DESC`);
		return rows
	} catch (error) {
		throw new Error('Ошибка при запросе к базе данных: ' + error.message);
	} finally {
		await connection.end();
	}
}


export const getMyTron = async () => {
	const connection = await connectToDatabase();
	try {
		const [res] = await connection.execute(`SELECT tron FROM setting  LIMIT 1`)
		const tron = res[0].tron
		const transactions = await getTronData(tron);
		return transactions;
	} catch (error) {
		throw new Error('Ошибка при запросе к базе данных: ' + error.message);
	} finally {
		await connection.end();
	}
}
