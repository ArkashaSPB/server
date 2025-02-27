import cron from 'node-cron';
import {connectToDatabase} from "./func/db.js";
import axios from "axios";

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

		if (dan.length) {
				for (let item of dan) {
					const { summa, orderId, id, date } = item;
					for (let transaction of filteredTransactions) {
						// Если transaction_id и сумма совпадают
						if ( summa === transaction.value / 1000000) {
							const date2 = transaction.block_timestamp / 1000;
							const dateObj = new Date(date);
							const timestamp = Math.floor(dateObj.getTime() / 1000);
							if (timestamp < date2) {
								// Проверяем, если запись существует в coin_user
								console.log(transaction.transaction_id)
								await connection.execute(`UPDATE oplata SET trid = ?, status = 1 WHERE id  = ? `, [transaction.transaction_id, id])
								await connection.execute(`UPDATE orders SET oplata = 1 WHERE id = ${orderId}`)
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



// Пример задания, которое выполняется каждую минуту
cron.schedule('* * * * *', () => {
	checkTron()
	console.log('Чекнул')
});