import { connectToDatabase } from '../func/db.js';
import MessageQueue from "./messageClass.js";


export const getMessage = async (id, method) => {

	const connection = await connectToDatabase();
	try {
		const [res] = await connection.execute(`SELECT * FROM tg_r WHERE id = ${id}`);
		if (!res[0].id) {
				return {error: 'Не найдено рассылки'};
		}
		const text = res[0].text;

		const [resUser] = await connection.execute(
			`SELECT tg_m.id, tg_m.tm_id, users.chat FROM tg_m 
    	INNER JOIN users ON users.id = tg_m.user
                        WHERE tg_m.r = ${id}`);


		const tasks = resUser.map(entry => {
			return {
				id: entry.id,
				tm_id: entry.tm_id,
				chat: entry.chat,
				type: method,
				text: text
			};
		});

		// Создаем очередь и добавляем задачи
		const messageQueue = new MessageQueue();
		tasks.forEach(task => messageQueue.addTask(task));

		// Запускаем обработку очереди
		//await messageQueue.processQueue();

		return {success: 'Отправлено в очередь '};
	} catch (error) {
		throw new Error('Ошибка при запросе к базе данных: ' + error.message);
	} finally {
		await connection.end();
	}

}