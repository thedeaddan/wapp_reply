const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

const client = new Client({
    authStrategy: new LocalAuth(),
    // proxyAuthentication: { username: 'username', password: 'password' },
    puppeteer: { 
        // args: ['--proxy-server=proxy-server-that-requires-authentication.example.com'],
        args: ['--no-sandbox'],
    }
});
//Чаты которые надо обрабатывать
first_chat = ""; // V.1 
second_chat = ""; // V.2
third_chat = ""; // V.3

// Список исключений контактов по номеру телефона
const excludedContacts = ['7123456789'];

// Функция для проверки, есть ли отправитель в исключениях
function isExcluded(contactNumber) {
    return excludedContacts.includes(contactNumber);
}


async function checkGroupMembership(msg, contactNumber) {
    if (msg.fromMe) {
        // Если сообщение отправлено самому себе, то не обрабатываем его
        return;
    }
// Проверяем, есть ли отправитель в исключениях
    if (isExcluded(contactNumber)) {
        console.log("Исключение сработало")
        return;
    }else{
        // Проверяем, есть ли в названии группы "AVTOO"
        const groups = await client.getChats();
        const targetSubstring = 'AVTOO';

        for (const group of groups) {
            if (group.isGroup && group.name.includes(targetSubstring)) {
                const isMember = group.participants.some(participant => participant.id._serialized === msg.from);
                    if (isMember) {
                        await msg.reply('Я Бот который пересылает сообщения, я не владею никакой информацией из сообщений в чате, а лишь пересылаю сообщения. Обратитесь по номеру указанному в сообщении, а если его нет напишите в чат интересующий вас вопрос и ваш контактный номер, я перешлю его в другие чаты.');
                    }else{
                        console.log("Не состоит")
                    }
                break; // Выход из цикла, если нужная группа найдена
            }
        }
    }
}


client.initialize();

client.on('qr', qr => {
    qrcode.generate(qr, {small: true});
});

client.on('authenticated', () => {
    console.log('AUTHENTICATED');
});

client.on('auth_failure', msg => {
    console.error('AUTHENTICATION FAILURE', msg);
});

client.on('ready', () => {
    console.log('READY');
});

client.on('message', async msg => {
    console.log('MESSAGE RECEIVED');
    //console.log(msg);
    if (msg.from === first_chat || msg.from == second_chat || msg.from == third_chat) {
        console.log(msg.from);
        console.log(msg.body);
        if (msg.body) {
            // Проверяем, есть ли в тексте номер телефона с цифрами "8" или "7"
            const phoneNumberRegex = /[87]\d{10}/g;
            const matches = msg.body.match(phoneNumberRegex);

            if (matches && matches.length > 0) {
                //msg.reply(`В вашем сообщении найден номер телефона: ${matches.join(', ')}.`);
                console.log("Найдено");
            } else {
                //msg.reply('В вашем сообщении нет номера телефона с цифрами "8" или "7".');
                console.log("Не найдено");
            }
        }        
        if (msg.from === third_chat) {
            console.log("Сообщение из 3го чата, пересылаю во второй и первый");
            msg.forward(second_chat);
            msg.forward(first_chat);
        }
        if (msg.from === first_chat) {
            console.log("Сообщение из 1го чата, пересылаю во второй и третий");
            msg.forward(second_chat);
            msg.forward(third_chat);
        }
        if (msg.from === second_chat) {
            console.log("Сообщение из 2го чата, пересылаю во первый и третий");
            msg.forward(third_chat);
            msg.forward(first_chat);
        }
    } else {
        // Проверяем присутствие отправителя в группе с названием, содержащим "AVTOO"
        const contact = await msg.getContact();
        const contactNumber = contact.id.user;
        console.log(contactNumber);
        await checkGroupMembership(msg, contactNumber);
    }
});
