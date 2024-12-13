const net = require("net");

const args = process.argv.slice(2);

if (args.length !== 2) {
	console.error("Использование: node index.js <min> <max>");
	process.exit(1);
}

const min = Number(args[0]);
const max = Number(args[1]);

if (isNaN(min) || isNaN(max) || min >= max) {
	console.error(
		"Укажите корректные числа диапазона: min и max, где min < max."
	);
	process.exit(1);
}

// Выбираем случайное число в диапазоне
const secretNumber = Math.floor(Math.random() * (max - min + 1)) + min;
console.log(`Загадано число: ${secretNumber}`); // Для отладки, можно убрать в продакшене

const PORT = 4000; // Порт сервера
const HOST = "localhost"; // Адрес сервера

const client = new net.Socket();

client.connect(PORT, HOST, () => {
	// Отправляем диапазон
	const message = { range: `${min}-${max}` };
	client.write(JSON.stringify(message));
});

client.on("data", (data) => {
	try {
		const message = JSON.parse(data.toString());

		if (message.answer !== undefined) {
			const guess = Number(message.answer);
			console.log(`Server guessed: ${guess}`);

			if (guess < secretNumber) {
				const hint = { hint: "more" };
				client.write(JSON.stringify(hint));
			} else if (guess > secretNumber) {
				const hint = { hint: "less" };
				client.write(JSON.stringify(hint));
			} else {
				console.log("Server угадал число!");
				client.end();
			}
		}
	} catch (err) {
		console.error("Ошибка обработки данных:", err);
	}
});

client.on("close", () => {
	console.log("Соединение закрыто.");
});

client.on("error", (err) => {
	console.error("Ошибка клиента:", err);
});
