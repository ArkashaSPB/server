import { checkAndAddUser } from '../services/userService.js';

// Обработчик команды /start
export const startHandler = async (ctx) => {
	const userExists = await checkAndAddUser(ctx);
	// if (userExists) {
	// 	ctx.reply('Привет! Вы уже зарегистрированы в системе.');
	// } else {
	// 	ctx.reply('Привет! Вы успешно зарегистрированы в системе. Пожалуйста, отправьте свой номер телефона для дальнейшего использования.');
	// }
};
