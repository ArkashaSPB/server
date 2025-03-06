import cron from 'node-cron';
import {connectToDatabase} from "./func/db.js";
import axios from "axios";
import {getSahblonFunc, sendMail} from "./func/smtp.js";
import {addHistoryFunc} from "./func/history.js";

export  async function getTronData(tron) {
	const url = `https://api.trongrid.io/v1/accounts/${tron}/transactions/trc20?only_to=true`;

	try {
		const response = await axios.get(url);
		return response.data.data;  // Возвращаем данные транзакций
	} catch (error) {
		console.error('Ошибка при получении данных с TronGrid:', error);
		return [];
	}
}



export  const checkTron = async  () => {
	const connection = await connectToDatabase();
	try {
		const [res] = await connection.execute(`SELECT tron FROM setting  LIMIT 1`)
		const tron = res[0].tron
// Получаем только те записи из oplata, где trid еще не установлен и статус = 2
		const [dan] = await connection.execute(`SELECT * FROM oplata WHERE status = 2 AND trid IS NULL`);
		if (dan.length === 0) {return}
		// Получаем транзакции с TronGrid
		const transactions = await getTronData(tron);
		// Получаем уже обработанные транзакции, где status = 1
		const [propusk] = await connection.execute(`SELECT trid FROM oplata WHERE status = 1`);
		// Создаем массив из всех тридов, которые уже обработаны
		const processedTrids = propusk.map(item => item.trid);
		// Фильтруем транзакции, исключая те, которые уже были обработаны
		const filteredTransactions = transactions.filter(transaction => !processedTrids.includes(transaction.transaction_id));

			if (dan.length ) {
				// console.log(dan, transactions);
				for (let item of dan) {
					const { orderId, id, date, summa: rawSumma } = item;
					const summa = parseFloat(rawSumma); // или Number(rawSumma)
					for (let transaction of filteredTransactions) {
						// Если transaction_id и сумма совпадают
						// console.log(summa,transaction.value / 1000000)
						if ( summa === transaction.value / 1000000) {
							const date2 = transaction.block_timestamp / 1000;
							const dateObj = new Date(date);
							const timestamp = Math.floor(dateObj.getTime() / 1000);
							if (timestamp < date2) {
								console.log(transaction.transaction_id, orderId, summa)
								await connection.execute(
									`UPDATE oplata SET trid = ?, status = 1, dateCheck = FROM_UNIXTIME(?) WHERE id = ?`,
									[transaction.transaction_id, date2, id]
								);
								await connection.execute(`UPDATE orders SET oplata = 1 WHERE id = ${orderId}`)
								const [userEmailRow] = await connection.execute(
									`SELECT users.mail FROM orders INNER JOIN users ON users.id = orders.user WHERE orders.id = ?`,
									[orderId]
								);
								const userEmail = userEmailRow.length > 0 ? userEmailRow[0].mail : null; // Проверка на наличие email

								const [adminRow] = await connection.execute(`SELECT admin FROM setting`);
								const admin = adminRow.length > 0 ? adminRow[0].admin : null; // Проверка на наличие admin

								// if (!userEmail || !admin) {
								// 	console.error("❌ Ошибка: Не найден email пользователя или admin.");
								// 	return;
								// }
								const shablonAdmin = await getSahblonFunc(4);
								if (shablonAdmin && admin) {
									const t = `<p>Оплата по заказу ${orderId} от пользователя ${userEmail} получена.</p>
									<p>tid = <span style="font-size: 1.2rem">${transaction.transaction_id}</span></p>`;
									const newText = shablonAdmin.text.replace('<body>', t);
									sendMail(admin, shablonAdmin.subject, newText);
								}

								const shablonUser = await getSahblonFunc(6);
								if (shablonUser && userEmail) {
									const t2 =
										`<p>Ваш заказ ${orderId} полностью оплачен</p>
										<p>Мы свяжемся с вами в самое ближайшее время.</p>`;
									const newText2 = shablonUser.text.replace('<body>', t2);
									sendMail(userEmail, shablonUser.subject, newText2);
								}

								const t = `Оплата по ${orderId} от ${userEmail} получена`
								addHistoryFunc('Получение оплаты', t)

								break;
							}
						}
					}
				}
			}
		} catch (error) {
			throw new Error('Ошибка при запросе к базе данных: ' + error.message);
		} finally {
			await connection.end();
		}
}
checkTron();
// Пример задания, которое выполняется каждую минуту
cron.schedule('* * * * *', () => {
	checkTron()
	console.log('Чекнул')
});