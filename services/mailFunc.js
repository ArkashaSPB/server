import { connectToDatabase } from '../func/db.js';

// 📩 Получение всех писем
export const getAllMails = async () => {
	const connection = await connectToDatabase();
	try {
		const [rows] = await connection.execute('SELECT * FROM email');
		return rows;
	} catch (error) {
		throw new Error('Ошибка при запросе всех писем: ' + error.message);
	} finally {
		await connection.end();
	}
};

// 📩 Получение письма по ID
export const getMailById = async (id) => {
	const connection = await connectToDatabase();
	try {
		const [rows] = await connection.execute('SELECT * FROM email WHERE id = ?', [id]);
		if (rows.length === 0) {
			throw new Error('Письмо не найдено');
		}
		return rows[0];
	} catch (error) {
		throw new Error('Ошибка при запросе письма: ' + error.message);
	} finally {
		await connection.end();
	}
};

// ✏️ Редактирование письма
export const updateMail = async (id, { name, text, subject }) => {
	const connection = await connectToDatabase();
	try {
		const [result] = await connection.execute(
			'UPDATE email SET name = ?, text = ?, subject = ? WHERE id = ?',
			[name, text, subject, id]
		);
		if (result.affectedRows === 0) {
			throw new Error('Письмо не найдено');
		}
		return { success: true, message: 'Письмо обновлено' };
	} catch (error) {
		throw new Error('Ошибка при обновлении письма: ' + error.message);
	} finally {
		await connection.end();
	}
};
