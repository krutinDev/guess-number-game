const net = require("net");

const PORT = 4000; // Порт сервера

console.log("Готов к игре...");

const server = net.createServer((socket) => {
	console.log("Клиент подключился.");

	let currentMin = null;
	let currentMax = null;

	socket.on("data", (data) => {
		try {
			const message = JSON.parse(data.toString());

			if (message.range) {
				// Получили диапазон от клиента
				const [min, max] = message.range.split("-").map(Number);
				currentMin = min;
				currentMax = max;
				// Сделаем первый ответ с середины диапазона
				const guess = Math.floor((currentMin + currentMax) / 2);
				const response = { answer: guess };
				socket.write(JSON.stringify(response));
				console.log(`Отправил ответ: ${guess}`);
			} else if (message.hint) {
				if (currentMin === null || currentMax === null) {
					console.log("Диапазон не был установлен.");
					return;
				}

				if (message.hint === "more") {
					currentMin =
						currentMin !== Math.floor((currentMin + currentMax) / 2)
							? Math.floor((currentMin + currentMax) / 2) + 1
							: currentMin + 1;
				} else if (message.hint === "less") {
					currentMax = Math.floor((currentMin + currentMax) / 2) - 1;
				}

				// Проверка, правильный ли ответ
				if (currentMin > currentMax) {
					console.log(
						"Нет возможных чисел, клиент, возможно, ошибся в подсказках."
					);
					socket.end();
					return;
				}

				const guess = Math.floor((currentMin + currentMax) / 2);
				const response = { answer: guess };
				socket.write(JSON.stringify(response));
				console.log(`Отправил ответ: ${guess}`);
			}
		} catch (err) {
			console.error("Ошибка обработки данных:", err);
		}
	});

	socket.on("close", () => {
		console.log("Клиент отключился.");
	});

	socket.on("error", (err) => {
		console.error("Ошибка сокета:", err);
	});
});

server.listen(PORT, () => {
	console.log(`Сервер слушает порт ${PORT}`);
});
