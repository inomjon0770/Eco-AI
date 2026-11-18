'use strict';

(() => {
  const tr = (uz, ru, en) => EcoLocale.t(uz, ru, en);
  const storeKey = 'eco-care-messages-v1';
  const careWords = {
    water: ['Sug‘orish', 'Полив', 'Watering'],
    care: ['O‘simlik parvarishi', 'Уход за растениями', 'Plant care'],
    treatment: ['O‘simlikka ishlov berish', 'Обработка растений', 'Plant treatment']
  };
  const activity = kind => tr(...careWords[kind]);
  const taskName = t => t.careKind && careWords[t.careKind] ? activity(t.careKind) :
    (typeof displayTaskName === 'function' ? displayTaskName(t) : t.name);
  const inboxButton = document.getElementById('inbox-button');
  let messages = [];
  try {
    const saved = JSON.parse(localStorage.getItem(storeKey) || '[]');
    if (Array.isArray(saved)) messages = saved.slice(-60);
  } catch { /* An unavailable store still permits messages for this visit. */ }

  function messageText(m) {
    if (m.kind === 'reminder' || m.kind === 'started') {
      const target = state.tasks.find(t => t.id === m.taskId);
      const title = target ? taskName(target) : m.name;
      return (m.kind === 'reminder' ? tr('Vazifa vaqti', 'Время задачи', 'Task reminder') :
        tr('Ish boshlandi', 'Работа начата', 'Work started')) + ' · ' + title;
    }
    const metric = {
      moisture: tr('Tuproq namligi', 'Влажность почвы', 'Soil moisture'),
      temperature: tr('Harorat', 'Температура', 'Temperature'),
      aqi: tr('Havo sifati indeksi', 'Индекс качества воздуха', 'Air quality index')
    };
    const unit = {moisture: '%', temperature: ' °C', aqi: ' AQI'};
    return metric[m.metric] + ' ' + m.value + unit[m.metric] + ' · ' +
      (m.direction === 'low' ? tr('Quyi chegaradan past', 'Ниже нижнего порога', 'Below the lower limit') :
       tr('Yuqori chegaradan baland', 'Выше верхнего порога', 'Above the upper limit'));
  }

  function updateBadge() {
    inboxButton.querySelector('em')?.remove();
    if (messages.some(m => !m.read)) inboxButton.append(document.createElement('em'));
  }
  function persistMessages() {
    try { localStorage.setItem(storeKey, JSON.stringify(messages)); } catch { /* Session remains usable. */ }
    updateBadge();
  }
  function receive(message, notify) {
    if (message.id && messages.some(m => m.id === message.id)) return;
    const item = {...message, at: Date.now(), read: false};
    messages = [...messages.slice(-59), item];
    persistMessages();
    if (notify && 'Notification' in window && Notification.permission === 'granted') {
      try { new Notification('Eco AI', {body: messageText(item), icon: 'assets/eco-ai-icon.svg'}); }
      catch { /* In-app messages remain available on mobile. */ }
    }
    if (dlg.open && content.querySelector('#care-inbox')) openInbox();
  }
  document.addEventListener('eco:reminder', ({detail: t}) => {
    receive({kind: 'reminder', id: 'rem-' + t.id + '-' + t.date + '-' + t.time, taskId: t.id, name: t.name}, true);
  });
  document.addEventListener('eco:threshold', ({detail}) => {
    if (['moisture','temperature','aqi'].includes(detail.metric) && Number.isFinite(detail.value)) {
      receive({kind: 'threshold', metric: detail.metric, value: detail.value, direction: detail.direction}, true);
    }
  });

  const inboxTitle = () => tr('Xabarlar', 'Сообщения', 'Messages');
  function activityChoices() {
    return '<p>' + tr('Qaysi ishni boshlamoqchisiz?', 'Какую работу вы начинаете?', 'Which task are you starting?') +
      '</p>' + ['water','care','treatment'].map(k =>
        '<button class="choice" data-care-kind="' + k + '">' + activity(k) + '</button>').join('');
  }
  function bindChoices() {
    content.querySelectorAll('[data-care-kind]').forEach(b => b.onclick = () => startCare(b.dataset.careKind));
  }
  function chooseActivity() {
    modal(tr('Ishni boshlash', 'Начать работу', 'Start a task'), activityChoices());
    bindChoices();
  }
  function openInbox() {
    messages.forEach(m => { m.read = true; });
    persistMessages();
    const items = [...messages].reverse().map(m => {
      const time = new Date(m.at).toLocaleString(EcoLocale.locale, {day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'});
      return '<li><strong>' + esc(messageText(m)) + '</strong><br><small>' + esc(time) + '</small></li>';
    }).join('');
    const permission = 'Notification' in window ? Notification.permission : 'unsupported';
    modal(inboxTitle(), '<div id="care-inbox">' + activityChoices() +
      '<h3>' + tr('So‘nggi xabarlar', 'Последние сообщения', 'Recent messages') + '</h3>' +
      (items ? '<ul class="care-feed">' + items + '</ul>' : '<p>' +
        tr('Hozircha xabar yo‘q. Vazifa eslatmalari va sensor ogohlantirishlari shu yerda ko‘rinadi.',
           'Здесь будут напоминания о задачах и предупреждения датчиков.',
           'Task reminders and sensor alerts will appear here.') + '</p>') +
      (permission === 'default' ? '<button class="primary" id="allow-alerts">' +
        tr('Brauzer xabarlarini yoqish', 'Включить уведомления браузера', 'Enable browser notifications') + '</button>' : '') +
      '<p><small>'+tr('Eslatmalar sayt ochiq paytda ishlaydi.', 'Напоминания работают, пока сайт открыт.', 'Reminders work while the site is open.')+'</small></p></div>');
    bindChoices();
    const allow = content.querySelector('#allow-alerts');
    if (allow) allow.onclick = async () => {
      let permission;
      try { permission = await Notification.requestPermission(); } catch { permission = 'denied'; }
      if (content.contains(allow)) {
        openInbox();
        content.querySelector('#care-inbox').insertAdjacentHTML('beforeend', '<p role="status">' +
          (permission === 'granted' ? tr('Xabarlar yoqildi.', 'Уведомления включены.', 'Notifications enabled.') :
            tr('Xabarlar sayt ichida ko‘rinadi.', 'Сообщения доступны на сайте.', 'Messages will appear inside the site.')) + '</p>');
      }
    };
  }

  function startCare(kind, existing) {
    if (existing?.done || existing?.startedAt) { task(existing.id); return; }
    const name = existing ? taskName(existing) : activity(kind);
    const questions = [
      tr('Qo‘llaringizni yuvdingizmi?', 'Вы вымыли руки?', 'Have you washed your hands?'),
      tr('Ishga mos qo‘lqop kiydingizmi?', 'Вы надели подходящие для работы перчатки?', 'Are you wearing suitable gloves for this task?')
    ];
    if (kind === 'treatment') questions.push(tr('Vosita yorlig‘idagi foydalanish va himoya talablarini o‘qidingizmi?',
      'Вы прочитали на этикетке средства указания по применению и защите?', 'Have you read the use and protection instructions on the product label?'));
    modal(tr('Ishdan oldin', 'Перед началом работы', 'Before you begin'),
      '<form id="care-check"><p class="note">' + esc(name) + '</p>' +
      questions.map((q,i) => '<fieldset class="care-question"><legend>' + q + '</legend>' +
        [['yes',tr('Ha','Да','Yes')], ['no',tr('Hali yo‘q','Пока нет','Not yet')]].map(([v,l]) =>
        '<label class="care-answer"><input type="radio" name="q'+i+'" required value="'+v+'"> '+l+'</label>').join('') + '</fieldset>').join('') +
      '<div id="care-feedback" role="status"></div><button type="submit" class="primary">' +
      tr('Ishni boshlash', 'Начать работу', 'Start task') + '</button></form>');
    const form = content.querySelector('#care-check');
    const feedback = content.querySelector('#care-feedback');
    function guidance() {
      const answers = new FormData(form);
      const tips = [
        tr('Avval qo‘llaringizni suv va sovun bilan yuving.', 'Сначала вымойте руки водой с мылом.', 'Wash your hands with soap and water first.'),
        tr('Ishga mos qo‘lqopni tayyorlab, kiyib oling.', 'Подготовьте и наденьте подходящие перчатки.', 'Put on gloves suitable for the task.'),
        tr('Ishlov berishdan avval yorliqdagi ko‘rsatmalarni o‘qing.', 'Перед обработкой прочтите указания на этикетке.', 'Read the product label before treatment.')
      ].filter((_, i) => answers.get('q'+i) === 'no');
      feedback.textContent = tips.join(' ');
      return !tips.length;
    }
    form.onchange = guidance;
    form.onsubmit = e => {
      e.preventDefault();
      if (!guidance()) return;
      const timestamp = new Date();
      const target = existing || {
        id: crypto.randomUUID(), name, careKind: kind, type: kind === 'water' ? 'drop' : kind === 'treatment' ? 'leaf' : 'sprout',
        date: day(), time: timestamp.toTimeString().slice(0,5), done:false, remind:false, points:15
      };
      target.startedAt = timestamp.toISOString();
      if (!existing) state.tasks.push(target);
      if (!save()) {
        delete target.startedAt;
        if (!existing) state.tasks = state.tasks.filter(t => t !== target);
        return;
      }
      receive({kind:'started', id:'start-'+target.id, taskId:target.id, name:target.name}, false);
      render();
      modal(tr('Ish boshlandi', 'Работа начата', 'Task started'),
        '<p class="note">'+esc(name)+'</p><p>' +
        tr('Gigiyena savollariga javob berdingiz. Ishni tugatgach, natijani surat bilan tasdiqlang.',
           'Вы ответили на вопросы о гигиене. Когда закончите, приложите фото результата.',
           'Your hygiene check is complete. When you finish, add a photo of the result.') +
        '</p><button class="primary" id="care-finish">' +
        tr('Natijani biriktirish', 'Приложить результат', 'Add result') + '</button>' +
        '<button class="choice" id="care-later">' + tr('Keyinroq', 'Позже', 'Later') + '</button>');
      content.querySelector('#care-finish').onclick = () => task(target.id);
      content.querySelector('#care-later').onclick = () => dlg.close();
    };
  }

  function handleIntent(input) {
    const q = String(input).toLowerCase().normalize('NFKC').replace(/[’‘ʻʼ`']/g,'').trim();
    if (/\?|\b(?:how|when|should|not|dont|wont)\b|\b(?:kerakmi|qachon|qanday)\b|(?:^|\s)(?:как|когда|не|нужно ли)(?:\s|$)/u.test(q)) return false;
    if (/sugoraman|sugormoqchi|sugorishni boshl|(?:буду|хочу|пора|собираюсь) полив|хочу полить|буду поливать|полью|(?:i(?:ll| will| want to| am going to|m going to|m about to)|lets|start) water/.test(q)) {
      startCare('water'); return true;
    }
    if (/dori (?:sepaman|sepm|qollayman)|ishlov beraman|обработаю растени|буду обрабатыва|(?:i will|ill|i want to) (?:spray|treat)/.test(q)) {
      startCare('treatment'); return true;
    }
    if (/parvarishlayman|parvarish (?:qilaman|qilmoqchi|boshl)|буду ухаживать|хочу ухаживать|(?:i(?:ll| will| want to|m going to| am going to)|lets) (?:tend|care for|look after|take care of)/.test(q)) {
      startCare('care'); return true;
    }
    return false;
  }
  window.EcoCare = {
    handleIntent,
    startTask(t) { startCare(t.type === 'leaf' ? 'treatment' : t.type === 'drop' ? 'water' : 'care', t); }
  };
  inboxButton.onclick = openInbox;
  const quickStart = document.getElementById('care-quick-start');
  if (quickStart) quickStart.onclick = chooseActivity;
  updateBadge();
})();
