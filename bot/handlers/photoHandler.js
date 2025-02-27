import {savePhoto} from "../services/photo.js";

export const photoHandler = async (ctx) => {
	try {
		// Получаем массив фото
		const photos = ctx.message.photo;

		const smallPhotoId = photos[0].file_id;

		const largePhotoId = photos[photos.length - 1].file_id;

		// Сохраняем обе версии
		await savePhoto(smallPhotoId, 'small');
		await savePhoto(largePhotoId, 'large');
		ctx.reply('Фото успешно сохранены в большом и маленьком размере!');

	} catch (error) {
		console.error('Ошибка обработки фото:', error);
		ctx.reply('Произошла ошибка при обработке фото.');
	}
}