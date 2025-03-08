import express from "express";
import {
	addCategory,
	addCountry,
	addGoods, addPromo,
	delCategory,
	delCountry, deletePromo,
	delGoods, editCategory, editCountry, editGoods, getAllPromo,
	getCategory,
	getCountry,
	getGoods, getGoodsClient, getPromo
} from "../func/goodsFunc.js";
import {
	addOplata,
	addOrder,
	editOplata,
	getCountNew,
	getOneOrders,
	getOrders,
	ordersStatus
} from "../services/orderFunc.js";
const router = express.Router();

//товары
router.get("/", async  (req, res) => {
	try {
		const goods = await getGoods();
		res.status(200).json(goods);
	} catch (error) {
		console.error('Ошибка в получение товара:', error);
		res.status(500).json({ message: 'Произошла ошибка при обработке запроса' });
	}
})
router.get("/client/", async  (req, res) => {
	try {
		const goods = await getGoodsClient();
		res.status(200).json(goods);
	} catch (error) {
		console.error('Ошибка в получение товара:', error);
		res.status(500).json({ message: 'Произошла ошибка при обработке запроса' });
	}
})

router.post("/", async  (req, res) => {
	try {
		const massive = req.body;
		const  otvet = await addGoods(massive);
		res.status(200).json(otvet);
	} catch (error) {
		console.error('Ошибка при добавлении :', error);
		res.status(500).json({ message: 'Произошла ошибка при обработке запроса' });
	}
})

router.patch("/:id", async  (req, res) => {
	try {
		const id = req.params.id;
		const massive = req.body;
		const  otvet = await editGoods(id, massive);
		res.status(200).json(otvet);
	} catch (error) {
		console.error('Ошибка при добавлении :', error);
		res.status(500).json({ message: 'Произошла ошибка при обработке запроса' });
	}
})

router.delete("/:id", async  (req, res) => {
	try {
		const id = req.params.id;
		const  otvet = await delGoods(id);
		res.status(200).json(otvet);
	} catch (error) {
		console.error('Ошибка при удалении товара :', error);
		res.status(500).json({ message: 'Произошла ошибка при обработке запроса' });
	}
})


//страны
router.get("/country", async  (req, res) => {
	try {
		const category = await getCountry();
		res.status(200).json(category);
	} catch (error) {
		console.error('Ошибка в получение страны:', error);
		res.status(500).json({ message: 'Произошла ошибка при обработке запроса' });
	}
})

router.post("/country", async  (req, res) => {
	try {
		const massive = req.body;
		const  otvet = await addCountry(massive);
		res.status(200).json(otvet);
	} catch (error) {
		res.status(500).json({ message: 'Произошла ошибка при обработке запроса' });
	}
})


router.patch("/country/:id", async  (req, res) => {
	try {
		const id = req.params.id;
		const massive = req.body;
		const  otvet = await editCountry(id, massive);
		res.status(200).json(otvet);
	} catch (error) {
		console.error('Ошибка при добавлении :', error);
		res.status(500).json({ message: 'Произошла ошибка при обработке запроса' });
	}
})

router.delete("/country/:id", async  (req, res) => {
	try {
		const id = req.params.id;
		const  otvet = await delCountry(id);
		res.status(200).json(otvet);
	} catch (error) {
		console.error('Ошибка при удалении :', error);
		res.status(500).json({ message: 'Произошла ошибка при обработке запроса' });
	}
})

//категории

router.get("/category", async  (req, res) => {
	try {
		const category = await getCategory();
		res.status(200).json(category);
	} catch (error) {
		console.error('Ошибка в получение категории:', error);
		res.status(500).json({ message: 'Произошла ошибка при обработке запроса' });
	}
})

router.post("/category", async  (req, res) => {
	try {
		const massive = req.body;
		const  otvet = await addCategory(massive);
		res.status(200).json(otvet);
	} catch (error) {
		console.error('Ошибка в создании категории:', error);
		res.status(500).json({ message: 'Произошла ошибка при обработке запроса' });
	}
})

router.patch("/category/:id", async  (req, res) => {
	try {
		const id = req.params.id;
		const massive = req.body;
		const  otvet = await editCategory(id, massive);
		res.status(200).json(otvet);
	} catch (error) {
		console.error('Ошибка при категории :', error);
		res.status(500).json({ message: 'Произошла ошибка при обработке запроса' });
	}
})

router.delete("/category/:id", async  (req, res) => {
	try {
		const id = req.params.id;
		const  otvet = await delCategory(id);
		res.status(200).json(otvet);
	} catch (error) {
		console.error('Ошибка при удалении категории :', error);
		res.status(500).json({ message: 'Произошла ошибка при обработке запроса' });
	}
})


router.post("/order", async  (req, res) => {
	try {
		const massive = req.body;
		const  otvet = await addOrder(massive);
		res.status(200).json(otvet);
	} catch (error) {
		console.error('Ошибка при добавлении заказа :', error);
		res.status(500).json({ message: 'Произошла ошибка при обработке запроса' });
	}
})

router.get("/order", async  (req, res) => {
	try {
		const  otvet = await getOrders();
		res.status(200).json(otvet);
	} catch (error) {
		console.error('Ошибка при заказов :', error);
		res.status(500).json({ message: 'Произошла ошибка при обработке запроса' });
	}
})

router.get("/order/new", async  (req, res) => {
	try {
		const  otvet = await getCountNew();
		res.status(200).json(otvet);
	} catch (error) {
		console.error('Ошибка при заказов :', error);
		res.status(500).json({ message: 'Произошла ошибка при обработке запроса' });
	}
})

router.patch("/order/status/:id", async  (req, res) => {
	try {
		const id = req.params.id;
		const  otvet = await ordersStatus(id);
		res.status(200).json(otvet);
	} catch (error) {
		// console.error('Ошибка при удалении категории :', error);
		res.status(500).json({ message: 'Произошла ошибка при обработке запроса' });
	}
})

router.post("/order/oplata/:id", async  (req, res) => {
	try {
		const id = req.params.id;
		const  otvet = await addOplata(id);
		res.status(200).json(otvet);
	} catch (error) {
		// console.error('Ошибка при удалении категории :', error);
		res.status(500).json({ message: 'Произошла ошибка при обработке запроса' });
	}
})

router.patch("/order/oplata/:id", async  (req, res) => {
	try {
		const id = req.params.id;
		const  otvet = await editOplata(id);
		res.status(200).json(otvet);
	} catch (error) {
		// console.error('Ошибка при удалении категории :', error);
		res.status(500).json({ message: 'Произошла ошибка при обработке запроса' });
	}
})


router.get("/order/:id", async  (req, res) => {
	try {
		const id = req.params.id;
		const  otvet = await getOneOrders(id);
		res.status(200).json(otvet);
	} catch (error) {
		// console.error('Ошибка при удалении категории :', error);
		res.status(500).json({ message: 'Произошла ошибка при обработке запроса' });
	}
})



router.get("/promo", async  (req, res) => {
	try {
		const  otvet = await getAllPromo();
		res.status(200).json(otvet);
	} catch (error) {
		res.status(500).json({ message: 'promo Произошла ошибка при обработке запроса' });
	}
})

router.delete("/promo/:id", async  (req, res) => {
	try {
		const id = req.params.id;
		const  otvet = await deletePromo(id);
		res.status(200).json(otvet);
	} catch (error) {
		res.status(500).json({ message: 'promo Произошла ошибка при обработке запроса' });
	}
})

router.get("/promo/:name", async  (req, res) => {
	const name = req.params.name;
	try {
		const  otvet = await getPromo(name);
		res.status(200).json(otvet);
	} catch (error) {
		res.status(500).json({ message: 'promo Произошла ошибка при обработке запроса' });
	}
})

router.post("/promo", async  (req, res) => {
	try {
		const massive = req.body;
		const  otvet = await addPromo(massive);
		res.status(200).json(otvet);
	} catch (error) {
		res.status(500).json({ message: 'promo Произошла ошибка при обработке запроса' });
	}
})


export default router;
