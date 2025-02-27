import bot from '../bot/bot.js'; // Подключаем бота
import { connectToDatabase } from '../func/db.js'; // Подключаем функцию для подключения к базе

class MessageQueue {
	constructor() {
		this.queue = [];  // Очередь задач
		this.isProcessing = false; // Флаг, чтобы контролировать процесс
	}

	// Добавляем задачу в очередь
	addTask(task) {
		this.queue.push(task);
		this.processQueue(); // Немедленно запускаем проверку очереди при добавлении задачи
	}

	// Обрабатываем очередь
	async processQueue() {
		// Если очередь уже обрабатывается, выходим
		if (this.isProcessing) return;

		// Устанавливаем флаг обработки
		this.isProcessing = true;

		// Проверяем и обрабатываем задачи из очереди до тех пор, пока она не станет пустой
		while (this.queue.length > 0) {
			const task = this.queue.shift();  // Извлекаем задачу из очереди
			await this.handleTask(task);  // Обрабатываем задачу
			await this.sleep(3000);  // Задержка между задачами
		}

		// После завершения обработки очереди сбрасываем флаг
		this.isProcessing = false;
	}

	// Метод для обработки каждой задачи
	async handleTask(task) {
		const {id, chat, type, text, tm_id} = task;
		const connection = await connectToDatabase(); // Подключаемся к базе данных
		try {
			if (type === 'add') {
				// Отправка нового сообщения
				const sentMessage = await bot.telegram.sendMessage(chat, text);
				await connection.execute(
					`UPDATE tg_m SET tm_id = ${sentMessage.message_id} WHERE id = ${id}`
				);
			} else if (type === 'edit' && tm_id) {
				// Редактирование существующего сообщения
				await bot.telegram.editMessageText(chat, tm_id, undefined, text);

			} else if (type === 'delete' && tm_id) {
				// Удаление сообщения
				await bot.telegram.deleteMessage(chat, tm_id);
			}
		} catch (error) {
			console.error('Ошибка при обработке задачи:', error);
		} finally {
			await connection.end();  // Закрываем соединение с базой данных
		}
	}

	// Задержка для асинхронных операций
	sleep(ms) {
		return new Promise(resolve => setTimeout(resolve, ms));
	}
}

export default MessageQueue;
