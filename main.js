// Подключение необходимых библиотек
const { Client, LocalAuth } = require('whatsapp-web.js'); // WhatsApp API клиент
const qrcode = require('qrcode-terminal'); // Для отображения QR-кода
const winston = require('winston'); // Для логирования
const fs = require('fs'); // Для работы с файлами
const moment = require('moment'); // Для работы с датой и временем
const momentTimezone = require('moment-timezone'); // Для работы с часовыми поясами

const logFileName = 'app.log'; // Имя файла для хранения логов

// Создание папки для хранения логов, если она не существует
if (!fs.existsSync('logs')) {
    fs.mkdirSync('logs');
}

let receivedMessagesCount = 0; // Счетчик полученных сообщений
let forwardedMessagesCount = 0; // Счетчик пересланных сообщений

// Создание логгера с настройками
const logger = winston.createLogger({
    level: 'debug', // Уровень логирования
    format: winston.format.combine(
        // Форматирование сообщений лога
        winston.format((info) => {
            info.timestamp = momentTimezone.tz('Europe/Moscow').format('YYYY-MM-DD HH:mm:ss'); // Добавление временной метки с учетом часового пояса
            return info;
        })(),
        winston.format.printf(({ timestamp, level, message }) => {
            let color = '';

            // Определение цвета в зависимости от уровня логирования
            if (level === 'error') {
                color = '\x1b[31m'; // Красный
            } else if (level === 'warn') {
                color = '\x1b[33m'; // Желтый
            } else if (level === 'info') {
                color = '\x1b[32m'; // Зеленый
            } else if (level === 'verbose') {
                color = '\x1b[34m'; // Синий
            } else if (level === 'debug') {
                color = '\x1b[35m'; // Малиновый
            }

            // Сброс цвета после сообщения
            const resetColor = '\x1b[0m';

            return `${color}[${timestamp}] ${level}:${resetColor} ${message}`;
        })
    ),
    transports: [
        new winston.transports.Console(), // Вывод логов в консоль
        new winston.transports.File({
            filename: `logs/${logFileName}` // Запись логов в файл
        })
    ]
});

// Создание клиента WhatsApp
const client = new Client({
    authStrategy: new LocalAuth(), // Использование локальной аутентификации
    puppeteer: {
        executablePath: process.env.CHROME_EXECUTABLE_PATH, // Путь к исполняемому файлу браузера
        args: ['--no-sandbox', '--disable-setuid-sandbox'], // Аргументы для браузера
        headless: 'new', // Режим без графического интерфейса
    }
});

// Идентификаторы чатов WhatsApp
const chats = {
    first: "",
    second: "",
    third: ""
};

// Список контактов, которые исключены из определенных действий
const excludedContacts = new Set(['']);

// Функция для проверки, исключен ли контакт
async function isExcluded(contactNumber) {
    return excludedContacts.has(contactNumber);
}

// Функция для проверки членства в группе
async function checkGroupMembership(msg, contactNumber) {
    if (await isExcluded(contactNumber)) {
        logger.info("Исключение сработало");
        return;
    } else {
        setTimeout(3000); // Задержка в миллисекундах
        const groups = await client.getChats(); // Получение списка чатов
        console.log(groups);
        const targetSubstring = 'AVTOO';

        for (const group of groups) {
            if (group.isGroup && group.name.includes(targetSubstring)) {
                const isMember = group.participants.some(participant => participant.id._serialized === msg.from);
                if (isMember) {
                    await msg.reply('Я бот, который пересылает сообщения. Я не владею никакой информацией из сообщений в чате, а лишь пересылаю сообщения. Обратитесь по номеру указанному в сообщении, а если его нет, напишите в чат интересующий вас вопрос и ваш контактный номер, я перешлю его в другие чаты.');
                    logger.info("Написал человеку, что я бот.");
                } else {
                    logger.info("Человек написал в ЛС и он не состоит в чатах");
                }
                break;
            }
        }
    }
}

// Инициализация клиента WhatsApp
client.initialize();

// Обработка события получения QR-кода
client.on('qr', qr => {
    qrcode.generate(qr, { small: true });
});

// Обработка события загрузки экрана
client.on('loading_screen', (percent, message) => {
    const text = "Экран загрузки: " + percent + "% Сообщение: " + message;
    logger.debug(text);
});

// Обработка события ошибки аутентификации
client.on('auth_failure', msg => {
    // Вызывается, если восстановление сессии было неуспешным
    const text = "Вход не выполнен. Ошибка: " + msg;
    logger.error(text);
});

// Обработка события успешной аутентификации
client.on('authenticated', () => {
    logger.debug('Вошел в аккаунт.');
});

// Обработка события готовности к работе
client.on('ready', () => {
    logger.debug('Готов к работе.');
});

// Отклонение входящих вызовов
let rejectCalls = true;

client.on('call', async (call) => {
    logger.info('Call received, rejecting.', call);
    if (rejectCalls) await call.reject();
});

// Обработка события отключения клиента
client.on('disconnected', (reason) => {
    const text = "Сессия закончена. Причина: " + reason;
    logger.error(text);
});

// Обработка входящих сообщений
client.on('message', async msg => {
    receivedMessagesCount++; // Увеличение счетчика полученных сообщений
    const contact = await msg.getContact(); // Получение информации о контакте
    const contactNumber = contact.id.user; // Получение номера контакта
    logger.info('Сообщение получено. От: ' + contactNumber);

    if (Object.values(chats).includes(msg.from)) {
        // Если сообщение из одного из чатов из списка
        const targetChats = Object.values(chats).filter(chat => chat !== msg.from);

        for (const chat of targetChats) {
            try {
                logger.info("Переслал в чат: " + chat);
                setTimeout(() => { msg.forward(chat); }, 1500); // Пересылка сообщения с задержкой
                forwardedMessagesCount++; // Увеличение счетчика пересланных сообщений
            } catch (error) {
                console.error("Ошибка при пересылке сообщения: " + error);
            }
        }

    } else {
        // Если сообщение не из списка чатов
        // console.log(1);
        // setTimeout(() => { msg.forward(msg.from); }, 1500);
        // forwardedMessagesCount++;
        //await checkGroupMembership(msg, contactNumber);
    }
    logger.info(`Принято сообщений: ${receivedMessagesCount}`);
    logger.info(`Переслано сообщений: ${forwardedMessagesCount}`);
});
