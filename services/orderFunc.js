import { connectToDatabase } from '../func/db.js';
import {getSahblonFunc, sendMail} from "../func/smtp.js";
import {addHistoryFunc} from "../func/history.js";


const checkOrder = async (connection, id) => {
	try {
		// Получаем текущую цену заказа
		const [order] = await connection.query('SELECT price FROM orders WHERE id = ?', [id]);
		if (order.length === 0) {
			throw new Error('Заказ не найден');
		}

		let newPrice = parseFloat(order[0].price); // Текущая цена заказа

		while (true) {
			// Проверяем, есть ли заказы с такой же ценой за последний час, исключая текущий заказ
			const [existingOrders] = await connection.query(
				'SELECT COUNT(*) as count FROM orders WHERE price = ? AND id != ? AND date >= NOW() - INTERVAL 1 HOUR',
				[newPrice, id]
			);

			if (existingOrders[0].count === 0) {
				// Если совпадений нет, обновляем цену и выходим из цикла
				await connection.query('UPDATE orders SET price = ? WHERE id = ?', [newPrice, id]);
				break;
			} else {
				// Если цена повторяется, уменьшаем на 0.01 и повторяем проверку
				newPrice = parseFloat((newPrice - 0.01).toFixed(2));
			}
		}

		return newPrice;
	} catch (error) {
		throw new Error('Ошибка при запросе к базе данных: ' + error.message);
	}
};


export const addOrder = async (orderData) => {
	const connection = await connectToDatabase();

	try {
		const { user, price, count, items } = orderData;

		// Проверяем, существует ли пользователь
		const [existingUser] = await connection.query('SELECT * FROM users WHERE id = ?', [user]);
		if (existingUser.length === 0) {
			return { success: false, message: 'Пользователь не найден' };
		}

		// Вставляем заказ в таблицу orders
		const [orderResult] = await connection.query(
			'INSERT INTO orders (user, price, count) VALUES (?, ?, ?)',
			[user, price, count]
		);

		const orderId = orderResult.insertId; // Получаем ID созданного заказа

		const newPrice =  await checkOrder(connection, orderId);

		// Подготовка данных для вставки в orders_goods
		const itemsData = items.map((item) => [
			item.title,
			item.price,
			item.quantity,
			item.id,
			orderId,
		]);

		// Получаем email пользователя
		const [email] = await connection.query(`SELECT mail FROM users WHERE id = ?`, [user]);

		if (email[0]?.mail) {
			const shablon = await getSahblonFunc(3);
			if (shablon) {
				// Создаем HTML-таблицу с товарами
				const tableRows = items
					.map(
						(item) => `
						<tr>
							<td style="border: 1px solid #ddd; padding: 8px;">${item.title}</td>
							<td style="border: 1px solid #ddd; padding: 8px;">${item.price}$</td>
							<td style="border: 1px solid #ddd; padding: 8px;">${item.quantity}</td>
							<td style="border: 1px solid #ddd; padding: 8px;">${item.price * item.quantity}$</td>
						</tr>`
					)
					.join("");

				const t = `
					<h3 style="text-align: center;">Ваш заказ №${orderId} оформлен</h3>
					<table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
						<thead>
							<tr>
								<th style="border: 1px solid #ddd; padding: 8px; background: #f4f4f4;">Название</th>
								<th style="border: 1px solid #ddd; padding: 8px; background: #f4f4f4;">Цена</th>
								<th style="border: 1px solid #ddd; padding: 8px; background: #f4f4f4;">Кол-во</th>
								<th style="border: 1px solid #ddd; padding: 8px; background: #f4f4f4;">Сумма</th>
							</tr>
						</thead>
						<tbody>
							${tableRows}
						</tbody>
						<tfoot>
							<tr>
								<td colspan="2" style="border: 1px solid #ddd; padding: 8px; text-align: right; font-weight: bold;">Итого:</td>
								<td style="border: 1px solid #ddd; padding: 8px; font-weight: bold;">${count}</td>
								<td style="border: 1px solid #ddd; padding: 8px; font-weight: bold;">${newPrice}</td>
							</tr>
						</tfoot>
					</table>
				`;
				const tu = `<p>Ваш заказ ${orderId} создан.</p> 
				${t}`
				const newText = shablon.text.replace('<body>', tu);
				sendMail(email[0].mail, shablon.subject, newText);


				const shablon2 = await getSahblonFunc(5);
				const [adminRow] = await connection.execute(`SELECT admin FROM setting`);
				const admin = adminRow.length > 0 ? adminRow[0].admin : null; // Проверка на наличие admin
				const t2 = `<p>Заказ ${orderId} от пользователя ${email[0].mail} создан</p>
				 ${t}`
				const newText2  = shablon2.text.replace('<body>', t2);
				sendMail(admin, shablon2.subject, newText2);

				const name = `${email[0].mail} создал заказ ${orderId}`;
				addHistoryFunc('Создание заказа', name)

			}
		}

		// Вставляем товары в orders_goods
		await connection.query(
			'INSERT INTO orders_goods (title, price, count, `good`, `order`) VALUES ?',
			[itemsData]
		);

		return { success: true, orderId };
	} catch (error) {
		throw new Error('Ошибка при добавлении заказа: ' + error.message);
	} finally {
		await connection.end();
	}
};


export const getOrders = async () => {
	const connection = await connectToDatabase();
	try {
		// Получаем все заказы
		const [orders] = await connection.query(`
        SELECT orders.*, users.mail, users.name FROM orders
                                                         LEFT JOIN users ON users.id = orders.user
        ORDER BY orders.status, orders.id DESC
		`);

		// Получаем все товары, связанные с заказами
		const [orderItems] = await connection.query(`
        SELECT orders_goods.*, country.img as img2, category.img as img1,
               category.name as catName, country.name as countryName
        FROM orders_goods
                 LEFT JOIN goods ON goods.id = orders_goods.good
                 LEFT JOIN category ON goods.category = category.kod
                 LEFT JOIN country ON goods.country = country.kod
		`);

		// Получаем ВСЕ оплаты, связанные с заказами
		const [payments] = await connection.query(`
        SELECT oplata.* FROM oplata
                                 INNER JOIN orders ON orders.id = oplata.orderId
		`);

		// Группируем оплаты по `orderId` и берем ТОЛЬКО ПОСЛЕДНЮЮ оплату
		const lastPaymentsByOrder = payments.reduce((acc, pay) => {
			acc[pay.orderId] = pay; // Всегда перезаписываем последним значением (последняя оплата)
			return acc;
		}, {});

		// Группируем товары по заказу + добавляем только последнюю оплату
		const ordersWithDetails = orders.map((order) => {
			return {
				...order,
				items: orderItems.filter((item) => item.order === order.id), // Фильтруем товары по заказу
				payment: lastPaymentsByOrder[order.id] || null, // Берем последнюю оплату (объект), если есть
			};
		});

		return ordersWithDetails;
	} catch (error) {
		throw new Error('Ошибка при запросе к базе данных: ' + error.message);
	} finally {
		await connection.end();
	}
};






export const ordersStatus = async (id) => {
	const connection = await connectToDatabase();
	try {
		const [result] = await connection.execute(
			`UPDATE orders
		SET status = CASE WHEN status = 0 THEN 1 ELSE 0 END
		WHERE id = ?`, [id]);

		if (result.affectedRows > 0) {
			console.log(`Статус заказа с ID ${id} успешно изменен`);
			return { success: true, message: "Статус изменен." };
		} else {
			console.log(`Заказ с ID ${id} не найден или статус не изменился.`);
			return { success: false, message: "Ошибка: заказ не найден." };
		}
	} catch (error) {
		console.error('Ошибка при обновлении статуса:', error.message);
		return { success: false, message: "Ошибка при изменении статуса." };
	} finally {
		await connection.end();
	}
}


export const addOplata = async (id) => {
	const connection = await connectToDatabase();
	try {
		const [order] = await connection.execute(
			`SELECT * FROM orders WHERE id = ?`, [id]
		);
		// Проверяем, если заказ найден
		if (order[0] && order[0].id) {

			//удаляем если была оплата если у нее был статус 0

			// Вставляем оплату
			const [res] = await connection.execute(
				`INSERT INTO oplata (summa, orderId) VALUES (?, ?)`,
				[order[0].price, id]
			);
			const createdId = res.insertId;
			// Если запись успешно добавлена, возвращаем сообщение "ок"
			if (res.affectedRows > 0) {
				return { success: true, id: createdId,  message: 'Платеж успешно добавлен.' };
			} else {
				return { success: false, message: 'Ошибка при добавлении платежа.' };
			}
		} else {
			console.log('Не найдено платежки');
			return { success: false, message: 'Заказ не найден.' };
		}
	} catch (error) {
			throw new Error('Ошибка при запросе к базе данных: ' + error.message);
		} finally {
			await connection.end();
		}

}

export const getOneOrders = async (id) => {
	const connection = await connectToDatabase();
	try {
		const [res] = await connection.query(`SELECT * FROM orders WHERE id = ?`, [id]);
		return res.length > 0 ? res[0] : null; // Возвращаем null, если заказа нет
	} catch (error) {
		throw new Error('Ошибка при запросе к базе данных: ' + error.message);
	} finally {
		await connection.end();
	}
};



export const editOplata = async (id) => {
	const connection = await connectToDatabase();
	try {
		const [res] = await connection.execute(
			`UPDATE oplata SET status = 2, dateSubmit =  NOW() WHERE id = ?`,
			[id]
		);
		if (res.affectedRows > 0) {

			const [res] = await connection.execute(`SELECT orders.id, users.mail FROM orders
													INNER JOIN oplata ON oplata.orderId = orders.id
													INNER JOIN users ON users.id = orders.user  WHERE oplata.id = ?`, [id]);
				const t = ` ${res[0].mail} подтвердил оплату ${res[0].id}`;
				addHistoryFunc('Подтверждение оплаты', t)
			return { success: true, message: 'Статус оплаты успешно обновлен.' };
		} else {
			return { success: false, message: 'Ошибка при обновлении статуса оплаты.' };
		}
	} catch (error) {
		throw new Error('Ошибка при запросе к базе данных: ' + error.message);
	} finally {
		await connection.end();
	}
};


