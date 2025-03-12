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
export const updateMail = async (id, data) => {
	const connection = await connectToDatabase();
	try {
		// Исключаем поля id и name
		const keys = Object.keys(data.selectedEmail).filter(key => key !== 'id' && key !== 'name');
		// Формируем строку запроса вида "поле1 = ?, поле2 = ? ..."
		const setClause = keys.map(key => `${key} = ?`).join(', ');
		const values = keys.map(key => data.selectedEmail[key]);

		console.log(setClause, values)

		const sql = `UPDATE email SET ${setClause} WHERE id = ?`;
		await connection.query(sql, [...values, id]);



		return { success: true, message: 'Письмо обновлено' };
	} catch (error) {
		throw new Error('Ошибка при обновлении письма: ' + error.message);
	} finally {
		await connection.end();
	}
};








export const addColumnFunc = async (lang) => {
	const connection = await connectToDatabase();
	let resultMessage = '';
	try {
		// Проверяем наличие колонки subject_{lang}
		let [rows] = await connection.query(
			"SHOW COLUMNS FROM email LIKE ?",
			[`subject_${lang}`]
		);
		if (rows.length === 0) {
			await connection.query(
				`ALTER TABLE email ADD COLUMN subject_${lang} VARCHAR(255)`
			);
			// Проверяем, что колонка была успешно добавлена
			[rows] = await connection.query(
				"SHOW COLUMNS FROM email LIKE ?",
				[`subject_${lang}`]
			);
			if (rows.length === 0) {
				resultMessage += `Не удалось добавить колонку subject_${lang}. `;
			} else {
				resultMessage += `Колонка subject_${lang} успешно добавлена. `;
			}
		} else {
			resultMessage += `Колонка subject_${lang} уже существует. `;
		}

		// Проверяем наличие колонки text_{lang}
		[rows] = await connection.query(
			"SHOW COLUMNS FROM email LIKE ?",
			[`text_${lang}`]
		);
		if (rows.length === 0) {
			await connection.query(
				`ALTER TABLE email ADD COLUMN text_${lang} TEXT`
			);
			// Проверяем, что колонка была успешно добавлена
			[rows] = await connection.query(
				"SHOW COLUMNS FROM email LIKE ?",
				[`text_${lang}`]
			);
			if (rows.length === 0) {
				resultMessage += `Не удалось добавить колонку text_${lang}. `;
			} else {
				resultMessage += `Колонка text_${lang} успешно добавлена. `;
			}
		} else {
			resultMessage += `Колонка text_${lang} уже существует. `;
		}

		return { success: true, message: resultMessage };
	} catch (error) {
		throw new Error("Ошибка при запросе к базе данных: " + error.message);
	} finally {
		await connection.end();
	}
};


export const removeColumnFunc = async (lang) => {
	const connection = await connectToDatabase();
	let resultMessage = '';
	try {
		// Проверяем наличие колонки subject_{lang}
		let [rows] = await connection.query(
			"SHOW COLUMNS FROM email LIKE ?",
			[`subject_${lang}`]
		);
		if (rows.length > 0) {
			await connection.query(
				`ALTER TABLE email DROP COLUMN subject_${lang}`
			);
			resultMessage += `Колонка subject_${lang} успешно удалена. `;
		} else {
			resultMessage += `Колонка subject_${lang} не существует. `;
		}

		// Проверяем наличие колонки text_{lang}
		[rows] = await connection.query(
			"SHOW COLUMNS FROM email LIKE ?",
			[`text_${lang}`]
		);
		if (rows.length > 0) {
			await connection.query(
				`ALTER TABLE email DROP COLUMN text_${lang}`
			);
			resultMessage += `Колонка text_${lang} успешно удалена. `;
		} else {
			resultMessage += `Колонка text_${lang} не существует. `;
		}

		return { success: true, message: resultMessage };
	} catch (error) {
		throw new Error("Ошибка при запросе к базе данных: " + error.message);
	} finally {
		await connection.end();
	}
};

export const getLanguagesList = async () => {
	const connection = await connectToDatabase();
	try {
		// Получаем все колонки, которые начинаются с "subject_" или "text_"
		const [rows] = await connection.query(
			"SHOW COLUMNS FROM email WHERE Field LIKE 'subject_%' "
		);

		console.log(rows)

		// Извлекаем языковые коды, предполагаем, что они идут после "subject_" или "text_"
		const languages = rows.map(row => {
			const match = row.Field.match(/_(\w+)$/);
			return match ? match[1] : null;
		}).filter(lang => lang !== null);

		return languages;
	} catch (error) {
		throw new Error("Ошибка при запросе к базе данных: " + error.message);
	} finally {
		await connection.end();
	}
};


