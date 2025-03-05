import { connectToDatabase } from './db.js';


export async function addGoods(massive) {
	const connection = await connectToDatabase();
	try {
		const query = `
            INSERT INTO goods (country,price, priceBefore, available, category, title) 
            VALUES ?
        `;

		// Преобразуем массив объектов в массив массивов для запроса
		const values = massive.map(item => [
			item.country,
			item.price,
			item.priceBefore,
			item.available,
			item.category,
			item.title
		]);

		// Выполняем вставку данных
		const [result] = await connection.query(query, [values]);
		if (result.affectedRows > 0) {
			return "Товар добавился.";
		} else {
			return "Ничего не добавилось.";
		}


		} catch (error) {
			throw new Error('Ошибка при запросе к базе данных: ' + error.message);
		} finally {
			await connection.end();
		}
}

export async function editGoods(id, massive) {
	const connection = await connectToDatabase();
	try {
		const query = `
        UPDATE goods
        SET
            country = ?,
            price = ?,
            priceBefore = ?,
            available = ?,
            category = ?,
            title = ?
        WHERE id = ?
		`;


		// Формируем массив значений для обновления
		const values = [
			massive.country,
			massive.price,
			massive.priceBefore,
			massive.available,
			massive.category,
			massive.title,
			id
		];


		// Выполняем обновление
		const [result] = await connection.execute(query, values);
		// Проверяем, обновлена ли строка
		if (result.affectedRows > 0) {
			return `Товар с id ${id} успешно обновлён.`;
		} else {
			return `Товар с id ${id} не найден.`;
		}


	} catch (error) {
		throw new Error('Ошибка при запросе к базе данных: ' + error.message);
	} finally {
		await connection.end();
	}
}

export async function getGoods() {
	const connection = await connectToDatabase();
	try {
			const [rows]  = await connection.query(`SELECT * FROM goods`);
			return rows;
		} catch (error) {
			throw new Error('Ошибка при запросе к базе данных: ' + error.message);
		} finally {
			await connection.end();
		}
}

export async function getGoodsClient() {
	const connection = await connectToDatabase();
	try {
			const [rows]  = await connection.query(`
SELECT goods.*, category.img as img1, country.img as img2, category.name as catName, country.name as coName FROM goods 
    LEFT JOIN category ON goods.category = category.kod
    LEFT JOIN country ON goods.country = country.kod
`);
			const [category]  = await connection.query(`SELECT DISTINCT c.*
                                                  FROM category c
                                                           INNER JOIN goods g ON c.kod = g.category`);
			const [country]  = await connection.query(`SELECT * FROM country`);
			return {
				goods: rows,
				category: category,
				country: country,
			};
		} catch (error) {
			throw new Error('Ошибка при запросе к базе данных: ' + error.message);
		} finally {
			await connection.end();
		}
}




export async function delGoods(id) {
	const connection = await connectToDatabase();
	try {
		const query = `DELETE FROM goods WHERE id = ?`;
		const [result] = await connection.query(query, [id]);
		if (result.affectedRows > 0) {
			return `Товар с id ${id} успешно удалён.`;
		} else {
			return `Товар с id ${id} не найден.`;
		}
		} catch (error) {
			throw new Error('Ошибка при запросе к базе данных: ' + error.message);
		} finally {
			await connection.end();
		}
}

export async function getCountry() {
	const connection = await connectToDatabase();
	try {
		const [rows]  = await connection.query(`SELECT * FROM country`);
		return rows;
	} catch (error) {
		throw new Error('Ошибка при запросе к базе данных: ' + error.message);
	} finally {
		await connection.end();
	}
}

export async function addCountry(massive) {
	const connection = await connectToDatabase();
	try {
		const query = `
            INSERT INTO country (kod,name, img) 
            VALUES ?
        `;

		// Преобразуем массив объектов в массив массивов для запроса
		const values = massive.map(item => [
			item.kod,
			item.name,
			item.img
		]);

		// Выполняем вставку данных
		const [result] = await connection.query(query, [values]);
		if (result.affectedRows > 0) {
			return "Страна(ы) добавлена.";
		} else {
			return "Ничего не добавилось.";
		}


	} catch (error) {
		throw new Error('Ошибка при запросе к базе данных: ' + error.message);
	} finally {
		await connection.end();
	}
}

export async function editCountry(id, massive) {
	const connection = await connectToDatabase();
	try {
		const query = `
        UPDATE country
        SET
            name = ?,
            kod = ?, 
            img = ?
        WHERE id = ?
		`;

		// Формируем массив значений для обновления
		const values = [
			massive.name,
			massive.kod,
			massive.img,
			id
		];


		// Выполняем обновление
		const [result] = await connection.execute(query, values);
		// Проверяем, обновлена ли строка
		if (result.affectedRows > 0) {
			return `Страна с id ${id} успешно обновлёна.`;
		} else {
			return `Страна с id ${id} не найдена.`;
		}


	} catch (error) {
		throw new Error('Ошибка при запросе к базе данных: ' + error.message);
	} finally {
		await connection.end();
	}
}

export async function delCountry(id) {
	const connection = await connectToDatabase();
	try {
		const query = `DELETE FROM country WHERE id = ?`;
		const [result] = await connection.query(query, [id]);
		if (result.affectedRows > 0) {
			return `Страна с id ${id} успешно удалёна.`;
		} else {
			return `Страна с id ${id} не найдена.`;
		}
	} catch (error) {
		throw new Error('Ошибка при запросе к базе данных: ' + error.message);
	} finally {
		await connection.end();
	}
}




export async function getCategory() {
	const connection = await connectToDatabase();
	try {
		const [rows]  = await connection.query(`SELECT * FROM category`);
		return rows;
	} catch (error) {
		throw new Error('Ошибка при запросе к базе данных: ' + error.message);
	} finally {
		await connection.end();
	}
}

export async function addCategory(massive) {
	const connection = await connectToDatabase();
	try {
		const query = `
            INSERT INTO category (kod,name, img) 
            VALUES ?
        `;

		// Преобразуем массив объектов в массив массивов для запроса
		const values = massive.map(item => [
			item.kod,
			item.name,
			item.img
		]);

		// Выполняем вставку данных
		const [result] = await connection.query(query, [values]);
		if (result.affectedRows > 0) {
			return "Категория(ы) добавлена.";
		} else {
			return "Ничего не добавилось.";
		}


	} catch (error) {
		throw new Error('Ошибка при запросе к базе данных: ' + error.message);
	} finally {
		await connection.end();
	}
}

export async function editCategory(id, massive) {
	const connection = await connectToDatabase();
	try {
		const query = `
        UPDATE category
        SET
            name = ?,
            kod = ?,
            img = ? 
        WHERE id = ?
		`;

		// Формируем массив значений для обновления
		const values = [
			massive.name,
			massive.kod,
			massive.img,
			id
		];


		// Выполняем обновление
		const [result] = await connection.execute(query, values);
		// Проверяем, обновлена ли строка
		if (result.affectedRows > 0) {
			return `Категория с id ${id} успешно обновлёна.`;
		} else {
			return `Категория с id ${id} не найдена.`;
		}
	} catch (error) {
		throw new Error('Ошибка при запросе к базе данных категории: ' + error.message);
	} finally {
		await connection.end();
	}
}

export async function delCategory(id) {
	const connection = await connectToDatabase();
	try {
		const query = `DELETE FROM category WHERE id = ?`;
		const [result] = await connection.query(query, [id]);
		if (result.affectedRows > 0) {
			return `Категория с id ${id} успешно удалёна.`;
		} else {
			return `Категория с id ${id} не найдена.`;
		}
	} catch (error) {
		throw new Error('Ошибка при запросе к базе данных: ' + error.message);
	} finally {
		await connection.end();
	}
}

export async function addPromo(massive){
	const connection = await connectToDatabase();
	try {
		// Проверяем наличие имени и списка товаров
		if (!massive || !massive.name) {
			return { success: false, message: 'Отсутствует имя промокода' };
		}

		if (!Array.isArray(massive.product) || massive.product.length === 0) {
			return { success: false, message: 'Нет товаров для промокода' };
		}

		// Проверяем уникальность промокода
		const [existing] = await connection.execute(
			`SELECT id FROM promo WHERE kod = ? LIMIT 1`,
			[massive.name]
		);

		if (existing.length > 0) {
			return { success: false, message: 'Промокод уже существует' };
		}

		// Вставляем промокод в таблицу promo
		const [res] = await connection.execute(
			`INSERT INTO promo (kod) VALUES (?)`,
			[massive.name]
		);
		const promoId = res.insertId;

		// Подготавливаем данные для вставки товаров
		const values = massive.product.map(item => [promoId, item.id, item.price]);

		// Вставляем товары в promo_goods
		await connection.query(
			`INSERT INTO promo_goods (promo, good, price) VALUES ?`,
			[values]
		);

		return { success: true, message: 'Промокод создан' };
	} catch (error) {
			throw new Error('Ошибка при запросе к базе данных: ' + error.message);
		} finally {
			await connection.end();
		}
}

export const deletePromo = async (id) => {
	const connection = await connectToDatabase();
	try {
		// Удаляем промокод
		const [result] = await connection.execute('DELETE FROM promo WHERE id = ?', [id]);

		// Проверяем, был ли удалён хотя бы один промокод
		if (result.affectedRows === 0) {
			return { success: false, message: `Промокод с ID ${id} не найден` };
		}
		await connection.execute('DELETE FROM promo_goods WHERE promo = ?', [id]);
		return { success: true, message: `Промокод с ID ${id} успешно удалён` };
	} catch (error) {
		throw new Error('Ошибка при удалении промокода: ' + error.message);
	} finally {
		await connection.end();
	}
};

export async function getAllPromo() {
	const connection = await connectToDatabase();
	try {
		const [rows] = await connection.execute(`
            SELECT promo.id, promo.kod AS name, 
                   promo_goods.price, 
                   goods.id AS goodId, 
                   goods.price AS oldPrice, 
                   goods.title 
            FROM promo
            INNER JOIN promo_goods ON promo_goods.promo = promo.id
            LEFT JOIN goods ON goods.id = promo_goods.good
        `);

		// Группировка товаров по промокодам
		const promoMap = new Map();

		rows.forEach(row => {
			if (!promoMap.has(row.id)) {
				promoMap.set(row.id, {
					name: row.name,
					id: row.id,
					product: []
				});
			}
			if (row.goodId) {
				promoMap.get(row.id).product.push({
					id: row.goodId,
					title: row.title,
					oldPrice: row.oldPrice,
					price: row.price
				});
			}
		});

		return Array.from(promoMap.values());

	} catch (error) {
		throw new Error('Ошибка при запросе к базе данных: ' + error.message);
	} finally {
		await connection.end();
	}
}

export async function getPromo(name) {
	const connection = await connectToDatabase();
	try {
		const [rows] = await connection.execute(`
        SELECT promo.id, promo.kod AS name,
               promo_goods.price,
               goods.id AS goodId,
               goods.price AS oldPrice,
               goods.title
        FROM promo
                 INNER JOIN promo_goods ON promo_goods.promo = promo.id
                 LEFT JOIN goods ON goods.id = promo_goods.good
        WHERE promo.kod = ?
		`, [name]);

		if (rows.length === 0) {
			return null; // Если промокода нет
		}

		// Создаём объект промокода
		const promo = {
			id: rows[0].id,
			name: rows[0].name,
			product: rows
				.filter(row => row.goodId) // Убираем пустые товары
				.map(row => ({
					id: row.goodId,
					title: row.title,
					oldPrice: row.oldPrice,
					price: row.price
				}))
		};

		return promo;

	} catch (error) {
		throw new Error('Ошибка при запросе к базе данных: ' + error.message);
	} finally {
		await connection.end();
	}
}




