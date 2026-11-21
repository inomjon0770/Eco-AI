'use strict';

// Uzbek keys are shared by the original dashboard markup and the app views.
window.EcoLocale = (() => {
  const locales = { uz: 'uz-UZ', ru: 'ru-RU', en: 'en-GB' };
  let language = 'uz';
  try {
    const saved = localStorage.getItem('eco-language');
    if (Object.hasOwn(locales, saved)) language = saved;
  } catch {}
  const messages = new Map();
  function add(rows) {
    for (const line of rows.trim().split('\n')) {
      const [uz, ru, en] = line.split('|');
      messages.set(uz, [uz, ru, en]);
    }
  }
  function t(uz, ru, en) {
    if (ru === undefined) return messages.get(uz)?.[{uz:0,ru:1,en:2}[language]] ?? uz;
    return language === 'ru' ? ru : language === 'en' ? en : uz;
  }
  const staticText = [];
  const attributes = [];
  function bind() {
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    while (walker.nextNode()) {
      const node = walker.currentNode;
      if (!node.parentElement || node.parentElement.closest('script, style, #language')) continue;
      const key = node.data.trim();
      if (key && messages.has(key)) staticText.push([node, node.data, key]);
    }
    for (const el of document.querySelectorAll('[aria-label], [title], [alt]')) {
      for (const attr of ['aria-label','title','alt']) {
        const key = el.getAttribute(attr);
        if (key && messages.has(key)) attributes.push([el,attr,key]);
      }
    }
    const select = document.getElementById('language');
    if (select) {
      select.value = language;
      select.addEventListener('change', () => {
        if (!Object.hasOwn(locales, select.value)) return;
        language = select.value;
        try { localStorage.setItem('eco-language', language); } catch {}
        paint();
        document.dispatchEvent(new CustomEvent('eco:language', {detail: language}));
      });
    }
    paint();
  }
  function paint() {
    document.documentElement.lang = language;
    document.title = 'Eco AI · ' + t('Boshqaruv paneli');
    staticText.forEach(([node, original, key]) => { node.data = original.replace(key, t(key)); });
    attributes.forEach(([el, attr, key]) => el.setAttribute(attr,t(key)));
  }
  add(`
Bosh panel|Главная|Overview
Issiqxona|Теплица|Greenhouse
AI vositalar|ИИ-инструменты|AI tools
Ishlar rejasi|План работ|Work plan
Asosiy menyu|Главное меню|Main menu
Tilni tanlash|Выбрать язык|Choose language
Uskunalar|Оборудование|Equipment
Ishni boshlash|Начать работу|Start work
Issiqxona uskunalarini boshqarish|Управление оборудованием теплицы|Greenhouse equipment controls
Xabarlar|Сообщения|Inbox
Eslatmalar|Напоминания|Reminders
Bog‘bon profili|Профиль садовода|Gardener profile
ISSIQXONA MONITORINGI|МОНИТОРИНГ ТЕПЛИЦЫ|GREENHOUSE MONITORING
Boshqaruv paneli|Панель управления|Greenhouse dashboard
Issiqxonangiz holati va kunlik ishlar bir joyda.|Состояние теплицы и задачи на сегодня.|Your greenhouse conditions and daily tasks in one place.
Mening issiqxonam|Моя теплица|My greenhouse
Issiqxonani ochish|Открыть теплицу|Open greenhouse
ISSIQXONA|ТЕПЛИЦА|GREENHOUSE
Yashil makon|Зелёный уголок|Green haven
Toshkent, O‘zbekiston|Ташкент, Узбекистан|Tashkent, Uzbekistan
Oldingi ko‘rinish|Предыдущий вид|Previous view
Keyingi ko‘rinish|Следующий вид|Next view
KUNLIK REJA|ПЛАН НА ДЕНЬ|DAILY PLAN
Bugungi ishlar|Задачи на сегодня|Today's tasks
Barchasi|Все задачи|View all
Vazifa qo‘shish|Добавить задачу|Add task
AI STUDIO|ИИ-СТУДИЯ|AI STUDIO
AI video|Видеоуроки|Video guides
Video studiyani ochish|Открыть видеостудию|Open video studio
Video qo‘llanma|Видеоурок|Video guide
Eco AI bilan tanishing|Знакомство с Eco AI|Meet Eco AI
Rasm tahlili, issiqxona nazorati va Eco ball haqida video.|Видео об анализе фото, контроле теплицы и экобаллах.|Explore photo analysis, greenhouse monitoring and Eco points.
Pomidor parvarishi sirlari|Уход за томатами|Caring for tomatoes
Ekishdan hosilgacha bo‘lgan qisqa qo‘llanma.|Краткий путь от посадки до сбора урожая.|A quick guide from planting to harvest.
YORDAMCHILAR|ПОМОЩНИКИ|ASSISTANTS
Namunaviy issiqxona · Ma’lumotlar qurilmangizda saqlanadi|Демонстрационная теплица · Данные хранятся на вашем устройстве|Demo greenhouse · Your data is stored on this device
Yopish|Закрыть|Close
Qish|Зима|Winter
Bahor|Весна|Spring
Yoz|Лето|Summer
Kuz|Осень|Autumn
Avtomatik|Автоматически|Automatic
Tuproqni sug‘orish|Полить почву|Water the soil
Ko‘chatlarni tekshirish|Проверить рассаду|Check the seedlings
Issiqxonani shamollatish|Проветрить теплицу|Ventilate the greenhouse
Qurilmada saqlash uchun joy yetarli emas.|Недостаточно места для сохранения данных на устройстве.|There is not enough storage space on this device.
Pomidor qatori|Грядка томатов|Tomato bed
Issiqxona · Hosil kuzatuvi|Теплица · Наблюдение за урожаем|Greenhouse · Crop monitoring
Ko‘chatlar maydoni|Зона рассады|Seedling beds
Issiqxona · Parvarish zonasi|Теплица · Зона ухода|Greenhouse · Growing area
Sug‘orish kerak|Пора поливать|Watering needed
Namlik yuqori|Высокая влажность|High moisture
Me’yorida|В норме|In range
Tuproq namligi|Влажность почвы|Soil moisture
Harorat|Температура|Temperature
Issiq|Жарко|Hot
Salqin|Прохладно|Cool
Mo‘tadil|Умеренно|Moderate
Havo sifati|Качество воздуха|Air quality
Toza havo|Чистый воздух|Clean air
O‘rtacha|Умеренное|Moderate
Ifloslangan|Загрязнённый|Polluted
Eco ball|Экобаллы|Eco points
ball|балл.|pts
Yashil daraja|Зелёный уровень|Green level
Bugun uchun vazifa yo‘q.|На сегодня задач нет.|No tasks for today.
Rasm tahlili|Анализ фото|Photo analysis
Ovozli yordamchi|Голосовой помощник|Voice assistant
Ekish va hosil|Посадка и урожай|Planting and harvest
Hasharotlar|Вредители|Pests
Video studiya|Видеостудия|Video studio
Ikonka yaratish|Создать значок|Icon studio
Yangi vazifa|Новая задача|New task
Vazifa nomi|Название задачи|Task name
Masalan, barglarni tekshirish|Например, осмотреть листья|For example, inspect the leaves
Ish turi|Вид работы|Task type
Sug‘orish|Полив|Watering
O‘simlikka dori qo‘llash|Обработка растений|Plant treatment
Parvarish|Уход за растениями|Plant care
Shamollatish|Проветривание|Ventilation
Sana|Дата|Date
Vaqt|Время|Time
Eslatma qo‘yish|Установить напоминание|Set a reminder
Saqlash|Сохранить|Save
Bajarilgan ish surati|Фото выполненной работы|Completed task photo
Bajarildi|Выполнено|Completed
Ishni tasdiqlash|Подтвердить выполнение|Confirm completed work
Natijani suratga oling yoki rasm tanlang|Сделайте снимок результата или выберите фото|Take a photo of the result or choose a photo
Tasdiqlash|Подтвердить|Confirm
Rasmni o‘qib bo‘lmadi. Boshqa fayl tanlang.|Не удалось открыть фото. Выберите другой файл.|Unable to open the photo. Choose another file.
Boshlang‘ich namuna balansi — 120 ball. Har bir bajarilgan vazifani surat bilan tasdiqlab, ball yig‘ing.|Начальный демонстрационный баланс — 120 баллов. Подтверждайте выполненные задачи фотографиями, чтобы получать баллы.|The demo starts with 120 points. Earn points by attaching photos of completed tasks.
Vazifalarni ko‘rish|Посмотреть задачи|View tasks
Issiqxona nazorati|Состояние теплицы|Greenhouse conditions
Oxirgi o‘lchov|Последнее измерение|Last reading
Namunaviy sensor ko‘rsatkichlari|Демонстрационные показания датчиков|Sample sensor readings
Sug‘orish holati|Потребность в поливе|Watering status
Sensor shlyuzining HTTPS manzilini kiriting. JSON maydonlari: moisture (%), temperature (°C), aqi. Ulangan manba har daqiqada yangilanadi.|Введите HTTPS-адрес шлюза датчиков. Поля JSON: moisture (%), temperature (°C), aqi. Опрос каждую минуту.|Enter the HTTPS address of your sensor gateway. JSON fields: moisture (%), temperature (°C), aqi. Readings refresh every minute.
Sensor manzili|Адрес датчика|Sensor address
Ulash va o‘lchash|Подключить и измерить|Connect and measure
Ulanmoqda…|Подключение…|Connecting…
Ulanib bo‘lmadi. HTTPS manzili, JSON maydonlari va CORS ruxsatini tekshiring.|Ошибка подключения. Проверьте HTTPS-адрес, поля JSON и разрешение CORS.|Connection failed. Check the HTTPS address, JSON fields and CORS permissions.
Sahifa ochiq bo‘lganda belgilangan vaqtda eslatma chiqadi. SMS tugmasi telefoningizdagi xabar oynasini ochadi.|Напоминания появляются в назначенное время, пока страница открыта. Кнопка SMS открывает приложение сообщений.|Reminders appear at the scheduled time while the page is open. SMS opens your messaging app.
SMS uchun telefon|Номер телефона для SMS|Phone number for SMS
Eslatma|Напоминание|Reminder
Faslni tanlang|Выберите сезон|Choose a season
Avtomatik rejimda fasl taqvimga qarab tanlanadi. Ekish tavsiyalari tanlangan faslga moslashadi.|В автоматическом режиме сезон выбирается по календарю. Советы по посадке меняются в зависимости от сезона.|Automatic mode follows the calendar. Planting advice changes with the selected season.
Issiqxonada ko‘chatlarni sovuqdan asrang va yorug‘ joy tanlang.|Защитите рассаду от холода и выберите хорошо освещённое место.|Shelter seedlings from cold and choose a well-lit spot.
Ko‘chatlarni yorug‘, shamoldan pana joyga bosqichma-bosqich ko‘chiring.|Постепенно переносите рассаду в светлое место, защищённое от ветра.|Move seedlings gradually to a bright, sheltered spot.
Issiq paytlarda shamollatish va tuproq namligini kuzating.|В жаркую погоду следите за вентиляцией и влажностью почвы.|Monitor ventilation and soil moisture in hot weather.
Sovuq tushishidan oldin yetilgan hosilni yig‘ing va tungi haroratni kuzating.|Соберите спелые плоды до заморозков и следите за ночной температурой.|Gather ripe crops before frost and monitor night temperatures.
Ekin turi|Культура|Crop
Pomidor|Томат|Tomato
Bodring|Огурец|Cucumber
Rayhon|Базилик|Basil
Ekish sanasi|Дата посадки|Planting date
Sanani kiriting.|Введите дату.|Enter a date.
Quyoshli, suvni yaxshi o‘tkazadigan tuproq tanlang.|Выберите солнечный участок с хорошо дренированной почвой.|Choose a sunny spot with well-drained soil.
Yorug‘ va shamoldan pana joyda tayanch o‘rnating.|Установите опору в светлом месте, защищённом от ветра.|Set up a support in a bright, sheltered spot.
Quyoshli joyda, yumshoq tuproqda eking.|Сажайте в рыхлую почву на солнечном участке.|Plant in loose soil in a sunny spot.
Taxminiy hosil davri|Ожидаемый период сбора|Estimated harvest window
Muddat nav va sharoitga bog‘liq.|Сроки зависят от сорта и условий выращивания.|Timing varies by variety and growing conditions.
Hasharotlardan himoya|Защита от вредителей|Pest protection
Hasharotni tanlang|Выберите вредителя|Choose a pest
Oqqanot|Белокрылка|Whitefly
O‘simlik biti|Тля|Aphid
O‘rgimchakkana|Паутинный клещ|Spider mite
Tekshiruvni rejalash|Запланировать осмотр|Schedule an inspection
Barg ostida mayda oq hasharotlar ko‘rinadi. Barglarni tekshiring, zararlangan ko‘chatlarni ajrating va sariq yopishqoq tuzoqlardan foydalaning.|Снизу листьев видны мелкие белые насекомые. Осмотрите листья, изолируйте поражённые растения и используйте жёлтые клеевые ловушки.|Look under leaves for tiny white insects. Inspect leaves, isolate affected seedlings and use yellow sticky traps.
Yosh novdalardagi mayda bitlar bargni burishtirishi mumkin. Zararlangan joylarni tekshirib, suv oqimi bilan ehtiyotkorlik bilan tozalang.|Мелкая тля на молодых побегах может вызывать скручивание листьев. Осмотрите поражённые участки и осторожно смойте вредителей водой.|Tiny aphids on young shoots can cause leaf curling. Inspect affected areas and gently rinse off the pests.
Barglarda mayda och dog‘lar va ingichka to‘rlar paydo bo‘ladi. Barg ostini lupa bilan tekshiring va zararlangan o‘simlikni ajrating.|На листьях появляются светлые точки и тонкая паутина. Осмотрите нижнюю сторону листьев под лупой и изолируйте растение.|Look for pale speckles and fine webbing on leaves. Inspect the undersides with a magnifier and isolate affected plants.
O‘simlik suratini yuklang|Загрузите фото растения|Upload a plant photo
Yuklangan o‘simlik|Загруженное фото растения|Uploaded plant photo
Hasharot belgilarini tekshirish|Проверить признаки вредителей|Check for signs of pests
Suratni o‘qib bo‘lmadi.|Не удалось открыть фото.|Unable to open the photo.
Sug‘orishni rejalash|Планирование полива|Planning irrigation
Ko‘chat uchun quyoshli joy tanlang.|Выберите для рассады солнечное место.|Choose a sunny spot for the seedling.
Tuproq namligini tekshiring.|Проверьте влажность почвы.|Check the soil moisture.
Poyani tayanchga ehtiyotkor bog‘lang.|Аккуратно подвяжите стебель к опоре.|Gently tie the stem to a support.
Bir tekis rang olgan hosilni tering.|Собирайте плоды, когда они равномерно окрасятся.|Pick the fruit when it is evenly coloured.
Tuproq namligini o‘lchang.|Измерьте влажность почвы.|Measure the soil moisture.
Namlik past bo‘lsa, ildiz atrofini sug‘oring.|Если почва сухая, полейте прикорневую зону.|If moisture is low, water around the roots.
Barglarni ho‘llamaslikka harakat qiling.|Старайтесь не мочить листья.|Try to keep leaves dry.
Keyingi o‘lchovni ishlar rejasiga kiriting.|Добавьте следующее измерение в план работ.|Add the next reading to your work plan.
24 soniyali parvarish qo‘llanmasini tanlang.|Выберите 24-секундный урок по уходу за растениями.|Choose a 24-second plant care guide.
Pauza|Пауза|Pause
Qayta ko‘rish|Повторить|Replay
Davom etish|Продолжить|Resume
Belgi|Символ|Symbol
Barg|Лист|Leaf
Nihol|Росток|Sprout
Quyosh|Солнце|Sun
Tomchi|Капля|Drop
Fon rangi|Цвет фона|Background colour
SVG yuklab olish|Скачать SVG|Download SVG
Namlik, harorat, havo sifati, hosil yoki bugungi ishlar haqida so‘rang.|Спросите о влажности, температуре, качестве воздуха, урожае или задачах на сегодня.|Ask about moisture, temperature, air quality, harvest or today's tasks.
Savolingiz|Ваш вопрос|Your question
Bugun sug‘orish kerakmi?|Нужно ли сегодня поливать?|Should I water today?
Javob olish|Получить ответ|Get answer
Savolni namlik, harorat, havo, hosil yoki ishlar rejasi haqida yozing.|Задайте вопрос о влажности, температуре, воздухе, урожае или плане работ.|Ask a question about moisture, temperature, air quality, harvest or your work plan.
Ismingiz|Ваше имя|Your name
`);
  add(`
Ko‘rsatkichlar|Показатели|Readings
O‘lchovlar tarixi|История замеров|Reading history
Ma’lumotlar qurilmangizda saqlanadi|Данные сохраняются на вашем устройстве|Data is saved on your device
Vazifani qidirish|Поиск задач|Search tasks
Vazifa holati|Статус задачи|Task status
Rejada|Запланировано|Planned
Jarayonda|В процессе|In progress
Vazifa topilmadi|Задач не найдено|No tasks found
Vazifani tahrirlash|Изменить задачу|Edit task
Tahrirlash|Изменить|Edit
CSV yuklab olish|Скачать CSV|Download CSV
`);
  return { get lang(){return language}, get locale(){return locales[language]}, t, bind };
})();
