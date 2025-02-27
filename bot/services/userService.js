import { connectToDatabase } from '../../func/db.js';


const options = {
	reply_markup: {
		keyboard: [
			[
				{
					text: 'Сохранить номер телефона',
					request_contact: true, // Эта опция позволяет пользователю отправить свой контакт
				},
			],
		],
		resize_keyboard: true, // Сделаем клавиатуру компактной
		one_time_keyboard: true, // Клавиатура скрывается после использования
	},
};
const optionsAvatar = {
	reply_markup: {
		inline_keyboard: [
			[{text: 'Обновить фото аватарки', callback_data: 'update_avatar'}, {text: 'Нету фото', callback_data: 'update_avatar2'},],
		],
		resize_keyboard: true, // Сделаем клавиатуру компактной
		one_time_keyboard: true, // Клавиатура скрывается после использования
	},
};


// Функция для проверки наличия пользователя в базе данных
export const checkAndAddUser = async (ctx) => {

	const chatId = ctx.chat.id;

	const connection = await connectToDatabase();
	try {
		const [rows] = await connection.execute(
			'SELECT * FROM users WHERE chat = ?',
			[chatId]
		);
		if (rows.length === 0) {
			// Если пользователя нет, добавляем его
			await connection.execute(
				'INSERT INTO users (chat) VALUES (?)',
				[chatId]
			);
			ctx.reply('Здравствуйте')
			ctx.reply('Вы можете сохранить ваш аватар у нас, так будем вас узнавать в нашей базе', optionsAvatar);
			ctx.reply('также необходимо оставить номер телефона, нажав на кнопку ниже (в меню)', options);
			return false; // Пользователь был добавлен
		} else {
			const user = rows[0];
			if (!user.phone) {
				ctx.reply('Пожалуйста, отправьте свой номер телефона, нажав на кнопку ниже.', options);
				return false;
			}
			if(!user.photo){
				ctx.reply('Вы можете сохранить ваш аватар у нас', optionsAvatar);

			}
			return true; // Пользователь уже есть и номер телефона сохранен
		}
	} catch (error) {
		console.error('Ошибка при работе с базой данных:', error);
		throw error;
	} finally {
		await connection.end();
	}
};

export const updatePhoneNumber = async (chatId, phoneNumber) => {
	const connection = await connectToDatabase();
	try {
		await connection.execute(
			'UPDATE users SET phone = ? WHERE chat = ?',
			[phoneNumber, chatId]
		);
	} catch (error) {
		console.error('Ошибка при добавлении номера телефона в базу:', error);
		throw error;
	}finally{
		await connection.end();
	}
};


export const replyWithHTML = (ctx, text, keyboard = null, delay = null) => {
	const options = { parse_mode: 'HTML' };
	if (keyboard) {
		options.reply_markup = keyboard;
	}
	ctx.reply(text).then((sentMessage) => {

		if(delay) {
			setTimeout(() => {
				ctx.deleteMessage(sentMessage.message_id);
			}, delay);
		}
	});
};



export const messageNew = async (ctx) => {
	const chatId = ctx.message.chat.id;
	const text = ctx.message.text;
	const connection = await connectToDatabase();
	try {
		if(chatId && text){
			const [rows] = await connection.execute(`SELECT * FROM users WHERE chat = ?`, [chatId]);
			const user = rows[0].id;
			const [result] = await connection.execute(`INSERT INTO tg_m (text, user) VALUES (?, ?)`, [text, user]);
			if (result && result.insertId) {
				const t = 'Сообщение успешно доставлено';
				replyWithHTML(ctx, t, null, 5000);
			} else {
				const t = 'Произошла ошибка при доставке сообщения';
				replyWithHTML(ctx, t, null, 5000);
			}
		}else{
			console.error('Сообщение пустое');
		}
	} catch (error) {
		console.error('Ошибка при добавлении сообщения в базу', error);
		throw error;
	}finally{
		await connection.end();
	}
}