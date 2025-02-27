import { checkAndAddUser, updatePhoneNumber } from '../services/userService.js';

// Обработчик получения номера телефона
export const contactHandler = async (ctx) => {
	const chatId = ctx.chat.id;
	const phoneNumber = ctx.message.contact.phone_number;
		// Если пользователь только что зарегистрировался, добавляем номер телефона в базу
		await updatePhoneNumber(chatId, phoneNumber);
		const keyboard = {
		reply_markup: {
			keyboard: [
				[
					{
						text: 'Мой профиль',
					},
					{
						text: 'Обновить аватар',
					},
				],
			],
			resize_keyboard: true, // Сделаем клавиатуру компактной
			one_time_keyboard: true, // Клавиатура скрывается после использования
		},
	};
		ctx.reply('Ваш номер телефона успешно сохранен. Спасибо!', keyboard);

};
