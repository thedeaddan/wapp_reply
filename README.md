Это WhatsApp Web бот, написанный на JavaScript с использованием библиотеки `whatsapp-web.js`. Этот бот позволяет автоматизировать различные задачи на WhatsApp Web, включая прием и пересылку сообщений, ведение журнала событий и обработку аутентификации.

### Возможности

- **Пересылка сообщений**: Бот может пересылать полученные сообщения в указанные группы или контакты WhatsApp.

- **Ведение журнала**: Бот регистрирует важные события и сообщения в журнале для отслеживания и отладки.

- **Аутентификация**: Обрабатывает аутентификацию WhatsApp Web с использованием QR-кода.

- **Обработка ошибок**: Предоставляет обработку ошибок и регистрирует сообщения об ошибках.

### Подготовка

Прежде чем запустить этот WhatsApp Web бот, убедитесь, что у вас установлены следующие компоненты:

- Node.js: [Скачать и установить Node.js](https://nodejs.org/)

- npm: Обычно npm включен в установку Node.js. Вы можете проверить наличие npm, запустив команду `npm -v` в вашем терминале.

- Google Chrome: Бот использует безголовый браузер Chromium для работы с WhatsApp Web. Убедитесь, что у вас установлен Google Chrome на вашем компьютере.

### Установка

1. Клонируйте этот репозиторий на ваш компьютер:

   ```bash
   git clone https://github.com/thedeaddan/wapp_reply.git
   ```

2. Перейдите в директорию проекта:

   ```bash
   cd wapp_reply
   ```

3. Установите необходимые пакеты Node.js:

   ```bash
   npm install
   ```

### Настройка

Перед запуском бота WhatsApp Web вам необходимо настроить его. Откройте файл `config.js` и установите следующие параметры:

- `CHROME_EXECUTABLE_PATH`: Укажите путь к исполняемому файлу Google Chrome. Например:

  ```javascript
  CHROME_EXECUTABLE_PATH: '/usr/bin/google-chrome-stable',
  ```

- Определите чаты и исключенные контакты в объектах `chats` и `excludedContacts`.

### Использование

Для запуска бота WhatsApp Web используйте следующую команду:

```bash
npm start
```

Бот отобразит QR-код в терминале. Отсканируйте этот QR-код с помощью мобильного приложения WhatsApp, чтобы связать бота с вашей учетной записью WhatsApp.

### Ведение журнала

Бот ведет журнал событий и сообщений. Вы можете найти файл журнала в директории `logs` с именем `app.log`.

### Обработка ошибок

Бот обрабатывает события сбоев аутентификации и отключения, регистрируя сообщения об ошибках для последующего анализа.

### Участие в разработке

Вклад в этот проект приветствуется. Вы можете участвовать, создавая задачи (issues), предлагая новые функции или отправляя запросы на внесение изменений (pull requests).


### Признательность

- [whatsapp-web.js](https://github.com/pedroslopez/whatsapp-web.js): Библиотека, используемая для взаимодействия с WhatsApp Web.

- [qrcode-terminal](https://github.com/gtanner/qrcode-terminal): Используется для отображения QR-кода в терминале.

- [winston](https://github.com/winstonjs/winston): Используется для ведения журнала.

- [moment](https://github.com/moment/moment): Используется для работы с датами и временем.

- [moment-timezone](https://github.com/moment/moment-timezone): Используется для работы с часовыми поясами.

### Отказ от ответственности

Этот проект предназначен исключительно для образовательных и личных целей. Используйте его ответственно и уважайте условия использования WhatsApp. Авторы этого проекта не несут ответственности за неправомерное использование или нарушение правил.
