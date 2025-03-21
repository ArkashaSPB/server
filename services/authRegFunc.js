import { connectToDatabase } from '../func/db.js';
import crypto from 'crypto';
import {getSahblonFunc, sendMail} from "../func/smtp.js";
import {addHistoryFunc} from "../func/history.js";

// Регистрация пользователя
export const regUserFunc = async (password, email, lang) => {
	const connection = await connectToDatabase();
	if(!email || !password){
		return {status: false, message: 'Не указан Email или пароль'};
	}
	try {
		// Проверка, существует ли пользователь с таким email
		const [existingUser] = await connection.query('SELECT * FROM users WHERE mail = ?', [email]);
		if (existingUser.length > 0) {
			throw new Error('Пользователь с таким email уже зарегистрирован.');
		}

		// Генерация хэша пароля
		//const token = crypto.createHash('sha256').update(password).digest('hex');
		const token = crypto.randomBytes(16).toString('hex');

		// Сохранение пользователя в базу данных
		const [result] = await connection.query(
			'INSERT INTO users (pass, mail, token, local) VALUES ( ?, ?, ?, ? )',
			[ password, email, token, lang]
		);

		const userId = result.insertId
		const shablon = await getSahblonFunc(1, lang);
		if (shablon) {
			const newText = shablon.text.replace('[var]', password);
			sendMail(email, shablon.subject, newText);
		}
		const t = `${email} зарегистрировался`;
		addHistoryFunc('Регистрация', t)
		return {
			status : true,
			message: 'Пользователь успешно зарегистрирован',
			token: token,
			userId: userId
		};

	} catch (error) {
		throw new Error('Ошибка регистрации пользователя: ' + error.message);
	} finally {
		await connection.close();
	}
};


export const getPassFunc = async (email, lang) => {
	const connection = await connectToDatabase();

	try {

		const t = `${email}  восстановил пароль`;
		addHistoryFunc('Восстановление пароля', t)

		// Проверяем, есть ли email в базе
		const [rows] = await connection.execute(
			"SELECT * FROM users WHERE mail = ?",
			[email]
		);
		if (rows.length === 0) {
			return {success: false, message: 'Email не найден'};
		}
		// Генерируем новый пароль
		const newPassword = Math.floor(100000 + Math.random() * 900000).toString();

		// Обновляем пароль в базе
		await connection.execute(
			"UPDATE users SET pass = ? WHERE mail = ?",
			[newPassword, email]
		);

		const shablon = await getSahblonFunc(2, lang);
		if (shablon) {


			const newText = shablon.text.replace('[var]', newPassword);
			console.log("Шаблон до:", shablon.text);
			console.log("Шаблон после:", newText);
			sendMail(email, shablon.subject, newText);
		}
		return { success: true, message: "Пароль отправлен на почту" }
	} catch (error) {
		throw new Error("Ошибка при работе с базой данных: " + error.message);
	} finally {
		await connection.end();
	}
};

// Авторизация пользователя
export const authUserFunc = async (email, password) => {
	const connection = await connectToDatabase();
	try {
		// Поиск пользователя по email и паролю
		const [user] = await connection.query('SELECT * FROM users WHERE mail = ? AND pass = ?', [email, password]);

		if (user.length === 0) {
			throw new Error('Неверный email или пароль.');
		}
		let token = ''
	if (!user[0].token ){
		token = crypto.randomBytes(16).toString('hex');
	} else{
		token = user[0].token;
	}
		// Генерация токена
		// Сохранение токена в базе данных

		await connection.query('UPDATE users SET token = ? WHERE id = ?', [token, user[0].id]);

		const t = `${email} авторизовался`;
		addHistoryFunc('Авторизация', t)
		return { message: 'Авторизация успешна', token };
	} catch (error) {
		throw new Error('Ошибка авторизации: ' + error.message);
	} finally {
		await connection.close();
	}
};

export const checkUser = async (token) => {
	const connection = await connectToDatabase();
	try {
		const [user] = await connection.query(
			'SELECT id, mail, name, local FROM users WHERE token = ?',[token]
		)
		if(user.length > 0) {
			return user[0]
		}	else{
			return []
		}
		} catch (error) {
			throw new Error('Ошибка при запросе к базе данных: ' + error.message);
		} finally {
			await connection.end();
		}

}

export const updateLangFunc = async (token, lang) => {
	const connection = await connectToDatabase();
	try {
		const [user] = await connection.query(
			'SELECT id, mail, name, local FROM users WHERE token = ?',[token]
		)
		if(user.length > 0) {
			return user[0]
		}	else{
			return []
		}
	} catch (error) {
		throw new Error('Ошибка при запросе к базе данных: ' + error.message);
	} finally {
		await connection.end();
	}

}