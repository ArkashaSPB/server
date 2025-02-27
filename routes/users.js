import express from "express";
import {getUserOneFunc, getUsersAll, getWho} from "../services/usersFunc.js";
import {authUserFunc, checkUser, regUserFunc} from "../services/authRegFunc.js";


const router = express.Router();

router.post('/reg', async (req, res) => {
	const { name, password, email } = req.body;
	try {
		const response = await regUserFunc(name, password, email);
		res.json(response);
	} catch (error) {
		res.status(400).json({ error: error.message });
	}
});

// Авторизация пользователя
router.post('/auth', async (req, res) => {
	const { email, password } = req.body;
	try {
		const response = await authUserFunc(email, password);
		res.json(response);
	} catch (error) {
		res.status(401).json({ error: error.message });
	}
});

router.get('/check/:token', async (req, res) => {
	const { token } = req.params;


	try {
		const response = await checkUser(token);
		res.json(response);
	} catch (error) {
		res.status(401).json({ error: error.message });
	}
});


router.get('/', async (req, res) => {
	const users = await  getUsersAll()
	res.json(users);
})

router.get('/:id', async (req, res) => {

	const { id } = req.params;

	const users = await  getUserOneFunc(id)
	res.json(users);
})
router.get('/orders/:id', async (req, res) => {
	const { id } = req.params;
	const data = await  getUserOneFunc(id)
	res.json(data.orders ? data.orders : []);
})

router.get('/who', async (req, res) => {
	const { name } = req.query; // Получаем параметр name из запроса
	const who = await  getWho(name)
	res.json(who);
})



export default router