import { connectToDatabase } from '../func/db.js';

// Функция для получения списка городов
export async function getLangAll() {
	const connection = await connectToDatabase();
	try {
		const query = `SELECT *  FROM lan `;
		const [rows] = await connection.execute(query);
		return rows;
	} catch (error) {
		throw new Error('Ошибка при запросе к базе данных: ' + error.message);
	} finally {
		await connection.end();
	}
}

export async function addLanguage(lang) {
	const connection = await connectToDatabase();
	try {
		// 1️⃣ Проверяем, что название языка корректное
		if (!lang || !/^[a-zA-Z_]+$/.test(lang)) {
			return { success: false, message: "Недопустимое имя языка. Разрешены только буквы и _" };
		}

		// 2️⃣ Проверяем, существует ли уже такой язык
		const [existing] = await connection.query(
			`SELECT COUNT(*) AS count FROM lan WHERE lang = ?`,
			[lang]
		);

		if (existing[0].count > 0) {
			return { success: false, message: `Язык "${lang}" уже существует.` };
		}

		// 3️⃣ Добавляем новый язык в таблицу `lan`
		const query = `INSERT INTO lan (lang) VALUES (?)`;
		await connection.execute(query, [lang]);

		return { success: true, message: `Язык "${lang}" успешно добавлен.` };

	} catch (error) {
		console.error("Ошибка при добавлении языка:", error);
		return { success: false, message: "Ошибка сервера" };
	} finally {
		await connection.end();
	}
}

export async function delLanguage(id) {
	const connection = await connectToDatabase();
	try {
		// Проверяем, передан ли ID
		if (!id || isNaN(id)) {
			return { success: false, message: "Некорректный ID языка." };
		}

		// Удаляем язык по `id`
		const query = `DELETE FROM lan WHERE id = ?`;
		const [result] = await connection.execute(query, [id]);

		// Проверяем, был ли удалён язык
		if (result.affectedRows > 0) {
			return { success: true, message: `Язык с ID ${id} успешно удалён.` };
		} else {
			return { success: false, message: `Язык с ID ${id} не найден.` };
		}
	} catch (error) {
		console.error("Ошибка при удалении языка:", error);
		return { success: false, message: "Ошибка сервера" };
	} finally {
		await connection.end();
	}
}


export async function addColumnToLan(columnName) {
	const connection = await connectToDatabase();
	try {
		// Проверяем, существует ли уже такой столбец
		const [columns] = await connection.query(
			`SHOW COLUMNS FROM lan LIKE ?`,
			[columnName]
		);

		if (columns.length > 0) {
			return `Столбец "${columnName}" уже существует.`;
		}

		// Безопасно проверяем и экранируем название столбца
		if (!/^[a-zA-Z0-9_]+$/.test(columnName)) {
			return `Недопустимое имя столбца. Разрешены только буквы, цифры и _`;
		}

		// Динамически формируем SQL-запрос (но не через `?`, а строкой)
		const query = `ALTER TABLE lan ADD COLUMN \`${columnName}\` TEXT`;
		await connection.query(query);

		return `Столбец "${columnName}" успешно добавлен в таблицу lan.`;
	} catch (error) {
		throw new Error('Ошибка при добавлении столбца: ' + error.message);
	} finally {
		await connection.end();
	}
}

export async function dropColumnFromLan(columnName) {
	const connection = await connectToDatabase();
	try {
		// Проверяем, существует ли столбец
		const [columns] = await connection.query(
			`SHOW COLUMNS FROM lan LIKE ?`,
			[columnName]
		);

		if (columns.length === 0) {
			return `Столбец "${columnName}" не найден.`;
		}

		// Безопасная проверка названия столбца (разрешены только буквы, цифры и _)
		if (!/^[a-zA-Z0-9_]+$/.test(columnName)) {
			return `Недопустимое имя столбца. Разрешены только буквы, цифры и _`;
		}

		// Удаляем столбец (используем бэктики `\`` для защиты названия)
		const query = `ALTER TABLE lan DROP COLUMN \`${columnName}\``;
		await connection.query(query);
		return `Столбец "${columnName}" успешно удалён из таблицы lan.`;
	} catch (error) {
		throw new Error('Ошибка при удалении столбца: ' + error.message);
	} finally {
		await connection.end();
	}
}


export async function updateLanguageData(id, data) {
	const connection = await connectToDatabase();
	try {
		// 1️⃣ Проверяем, передан ли ID
		if (!id || isNaN(id)) {
			return { success: false, message: "Некорректный ID языка." };
		}

		// 2️⃣ Фильтруем объект, исключаем `id` и `lang`
		const fields = Object.keys(data).filter(key => key !== "id" && key !== "lang");
		if (fields.length === 0) {
			return { success: false, message: "Нет данных для обновления." };
		}

		// 3️⃣ Формируем SQL-запрос динамически
		const updates = fields.map(field => `\`${field}\` = ?`).join(", ");
		const values = fields.map(field => data[field]);
		values.push(id); // Добавляем `id` в конец для `WHERE`

		const query = `UPDATE lan SET ${updates} WHERE id = ?`;

		// 4️⃣ Выполняем запрос
		const [result] = await connection.execute(query, values);
		// 5️⃣ Проверяем, были ли обновления
		if (result.affectedRows > 0) {
			return { success: true, message: `Язык с ID ${id} успешно обновлён.` };
		} else {
			return { success: false, message: `Язык с ID ${id} не найден.` };
		}
	} catch (error) {
		console.error("Ошибка при обновлении данных языка:", error);
		return { success: false, message: "Ошибка сервера" };
	} finally {
		await connection.end
	}
}
