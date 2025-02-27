import {checkAndAddUser, messageNew, replyWithHTML} from "../services/userService.js";

export const messageHandler = async (ctx) => {

	const userExists = await checkAndAddUser(ctx);


	userExists && await messageNew(ctx);
};
