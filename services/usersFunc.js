import { connectToDatabase } from '../func/db.js';

export const getUsersAll = async () => {
	const connection = await connectToDatabase();
	try{
		const [users] = await connection.query('SELECT * FROM users ORDER BY id');
		return users;
	}catch(error){
		throw new Error('Ошибка получении всех пользователей: ' + error.message);
	}finally{
		await connection.close();
	}
}

export const getOrdersForUser = async (userId) => {
	const connection = await connectToDatabase();
	try {
		// Получаем заказы для конкретного пользователя
		const [orders] = await connection.query(`
            SELECT orders.*, users.mail, users.name 
            FROM orders 
            LEFT JOIN users ON users.id = orders.user 
            WHERE orders.user = ? 
            ORDER BY orders.status, orders.id DESC`, [userId]);

		// Получаем все товары, связанные с заказами
		const [orderItems] = await connection.query(`
            SELECT orders_goods.*, country.img as img2, category.img as img1  
            FROM orders_goods 
            LEFT JOIN goods ON goods.id = orders_goods.good
            LEFT JOIN category ON goods.category = category.kod 
            LEFT JOIN country ON goods.country = country.kod`);

		// Группируем товары по id заказа
		const ordersWithItems = orders.map((order) => {
			return {
				...order,
				items: orderItems.filter((item) => item.order === order.id),
			};
		});

		return ordersWithItems;
	} catch (error) {
		throw new Error('Ошибка при запросе к базе данных: ' + error.message);
	} finally {
		await connection.end();
	}
};

export const getUserOneFunc = async (id) => {
	const connection = await connectToDatabase();
	try {
		// Получаем информацию о пользователе
		const [users] = await connection.execute('SELECT * FROM users WHERE id = ?', [id]);

		// Получаем все заказы для пользователя
		const orders = users[0] ?  await getOrdersForUser(id) : []

		return { user: users[0], orders }; // Возвращаем информацию о пользователе и его заказы
	} catch (error) {
		throw new Error('Ошибка при получении данных пользователя: ' + error.message);
	} finally {
		await connection.close();
	}
};

export const getWho = async (name) => {
	const connection = await connectToDatabase();
	try{
		const [who] = await connection.query(`SELECT * FROM who WHERE name LIKE '%${name}%' LIMIT 10`);
		return who;
	}catch(error){
		throw new Error('Ошибка получении всех пользователей: ' + error.message);
	}finally{
		await connection.close();
	}
}

export const getOrdersUserFunc = async (id) => {
	const connection = await connectToDatabase();
	try {



		} catch (error) {
			throw new Error('Ошибка при запросе к базе данных: ' + error.message);
		} finally {
			await connection.end();
		}
}