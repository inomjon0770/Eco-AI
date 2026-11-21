(() => {
  'use strict';

  const defaults = { minMoisture: 40, maxTemperature: 30, maxAqi: 100, automatic: false, pump: false, fan: false };
  const recordsLimit = 48;
  const copy = {
    title: ['Issiqxona boshqaruvi', 'Управление теплицей', 'Greenhouse controls'],
    controls: ['Boshqaruv', 'Управление', 'Controls'],
    history: ['O‘lchovlar tarixi', 'История замеров', 'Reading history'],
    sample: ['Namunaviy ko‘rsatkichlar', 'Пример показаний', 'Sample readings'],
    last: ['So‘nggi sensor ko‘rsatkichlari', 'Последние показания датчика', 'Latest sensor readings'],
    moisture: ['Namlik', 'Влажность почвы', 'Soil moisture'],
    temperature: ['Harorat', 'Температура', 'Temperature'],
    aqi: ['Havo sifati', 'Качество воздуха', 'Air quality'],
    time: ['Qabul qilindi', 'Получено', 'Received'],
    connect: ['Sensorni ulash', 'Подключить датчик', 'Connect a sensor'],
    simulator: ['Uskunalar simulyatori', 'Симулятор оборудования', 'Equipment simulator'],
    simhelp: ['Kalitlar virtual nasos va ventilyator holatini o‘zgartiradi.', 'Переключатели управляют виртуальным насосом и вентилятором.', 'These switches control a virtual pump and fan.'],
    pump: ['Sug‘orish nasosi', 'Насос полива', 'Irrigation pump'],
    fan: ['Ventilyator', 'Вентилятор', 'Ventilation fan'],
    automatic: ['Avtomatik rejim', 'Автоматический режим', 'Automatic mode'],
    autohelp: ['Namlik quyi chegaradan tushsa, virtual nasos yonadi. Harorat yoki AQI yuqori chegaradan oshsa, virtual ventilyator yonadi.', 'Виртуальный насос включается при влажности ниже порога. Вентилятор включается при превышении порога температуры или AQI.', 'The virtual pump turns on below the moisture limit. The virtual fan turns on above the temperature or AQI limit.'],
    thresholds: ['Nazorat chegaralari', 'Пороговые значения', 'Monitoring limits'],
    minMoisture: ['Eng past namlik (%)', 'Минимальная влажность (%)', 'Minimum moisture (%)'],
    maxTemperature: ['Eng yuqori harorat (°C)', 'Максимальная температура (°C)', 'Maximum temperature (°C)'],
    maxAqi: ['Eng yuqori AQI', 'Максимальный AQI', 'Maximum AQI'],
    apply: ['Saqlash', 'Сохранить', 'Save limits'],
    saved: ['Chegaralar saqlandi.', 'Пороговые значения сохранены.', 'Monitoring limits saved.'],
    empty: ['Sensor ulangach, shu yerda har bir yangi o‘lchov va qabul qilingan vaqti ko‘rinadi.', 'Подключите датчик, и здесь появятся новые замеры со временем получения.', 'Connect a sensor to see new readings and their receipt times here.'],
    historyHelp: ['Shu qurilmada saqlangan oxirgi 48 ta sensor o‘lchovi.', 'Последние 48 замеров датчика, сохранённых на этом устройстве.', 'The last 48 sensor readings saved on this device.'],
    on: ['Yoqilgan', 'Вкл.', 'On'],
    off: ['O‘chiq', 'Выкл.', 'Off']
  };

  function text(key) {
    const lang = document.documentElement.lang.split('-')[0];
    return copy[key][{uz: 0, ru: 1, en: 2}[lang] ?? 0];
  }
  const options = () => ({...defaults, ...state.equipment});
  const fields = [
    {metric: 'moisture', limit: 'minMoisture', direction: 'low', min: 0, max: 100, step: 1, unit: '%'},
    {metric: 'temperature', limit: 'maxTemperature', direction: 'high', min: -40, max: 80, step: 0.1, unit: ' °C'},
    {metric: 'aqi', limit: 'maxAqi', direction: 'high', min: 0, max: 500, step: 1, unit: ' AQI'}
  ];
  const records = () => state.sensorHistory || [];
  const beyond = (reading, limits, field) => field.direction === 'low'
    ? reading[field.metric] < limits[field.limit]
    : reading[field.metric] > limits[field.limit];

  function saveChanges(changes) {
    const previous = state.equipment;
    state.equipment = {...options(), ...changes};
    if (save()) return true;
    state.equipment = previous;
    return false;
  }

  function onReading(event) {
    const data = event.detail || {};
    const reading = data.readings || state.readings;
    const source = data.source || state.endpoint;
    if (!source || !reading || !fields.every(({metric}) => Number.isFinite(reading[metric]))) return;
    const stamp = Number.isFinite(data.receivedAt) ? data.receivedAt : Date.now();
    const previousHistory = records();
    const previous = previousHistory.at(-1);
    if (previous && previous.source === source && previous.receivedAt === stamp) return;
    const entry = {receivedAt: stamp, source, moisture: reading.moisture, temperature: reading.temperature, aqi: reading.aqi};
    state.sensorHistory = [...previousHistory, entry].slice(-recordsLimit);
    if (!save()) {
      state.sensorHistory = previousHistory;
      return;
    }
    {
      const limits = options();
      fields.forEach(field => {
        const alreadyBeyond = previous?.source === source && beyond(previous, limits, field);
        if (alreadyBeyond || !beyond(entry, limits, field)) return;
        document.dispatchEvent(new CustomEvent('eco:threshold', {
          detail: {metric: field.metric, value: entry[field.metric], direction: field.direction}
        }));
      });
    }
    if (visible()) refreshReadings();
  }
  document.addEventListener('eco:readings', onReading);

  const css = document.createElement('style');
  css.textContent = `
    .equipment-panel .eq-tabs{display:flex;gap:4px;padding:4px;background:#f0f4ee;border-radius:12px;margin:0 0 16px}
    .equipment-panel .eq-tabs button{flex:1;border-radius:9px;padding:7px 5px;font-size:.85rem;font-weight:600}
    .equipment-panel .eq-tabs [aria-pressed=true]{color:#175438;background:#fff;box-shadow:0 1px 4px #184a3020}
    .equipment-panel h3{margin:16px 0 4px;font-size:1rem}
    .equipment-panel p.eq-help{font-size:.82rem;margin:4px 0 12px}
    .equipment-panel .eq-values{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:6px}
    .equipment-panel .eq-values div{padding:9px;background:#edf5ec;border-radius:9px;overflow-wrap:anywhere}
    .equipment-panel .eq-values small{display:block;color:#49634d;font-size:.72rem}
    .equipment-panel .eq-values strong{font-size:1rem}
    .equipment-panel .eq-link{padding:4px 0;color:#326740;text-decoration:underline;text-underline-offset:2px;font-size:.83rem}
    .equipment-panel .eq-device{display:flex;align-items:center;justify-content:space-between;text-align:start;width:100%;padding:9px 2px;border-bottom:1px solid #e3e8e2;font-size:.89rem}
    .equipment-panel .eq-device:disabled{cursor:default}
    .equipment-panel .eq-device span{padding:2px 10px;border-radius:10px;background:#eff2ed;color:#536357;font-size:.78rem}
    .equipment-panel .eq-device[aria-checked=true] span{background:#def0d8;color:#235635}
    #content .equipment-panel .eq-form label{display:flex;align-items:center;justify-content:space-between;gap:8px;margin:6px 0}
    .equipment-panel .eq-form input{width:82px;text-align:right}
    .equipment-panel .eq-status{color:#31653e;font-size:.84rem}
    .equipment-panel .eq-scroll{overflow-x:auto;max-height:45vh}
    .equipment-panel table{width:100%;font-size:.8rem;border-collapse:collapse;text-align:left}
    .equipment-panel th,.equipment-panel td{padding:7px 4px;border-bottom:1px solid #e0e7dd}
    .equipment-panel th{background:#f2f6f0;position:sticky;top:0;font-size:.73rem}
  `;
  document.head.append(css);

  let view = 'controls';
  function visible() {return dlg.open && Boolean(content.querySelector('.equipment-panel'))}
  function openEquipment(next = 'controls') {
    view = next;
    const tabs = ['controls','history'].map(key =>
      `<button type="button" data-eq-view="${key}" aria-pressed="${view === key}">${text(key)}</button>`).join('');
    const html = view === 'history' ? `<p class="eq-help">${text('historyHelp')}</p><div id="eq-history"></div>` : controlPanel();
    modal(text('title'), `<section class="equipment-panel"><div class="eq-tabs">${tabs}</div>${html}</section>`);
    refreshReadings();
  }
  function controlPanel() {
    const limits = options();
    const inputs = fields.map(field => `<label>${text(field.limit)}
      <input type="number" name="${field.limit}" min="${field.min}" max="${field.max}" step="${field.step}" required value="${Number(limits[field.limit])}"></label>`).join('');
    return `<div id="eq-summary"></div><button type="button" class="eq-link" data-act="house">${text('connect')}</button>
      <h3>${text('simulator')}</h3><p class="eq-help">${text('simhelp')}</p><div id="eq-devices"></div>
      <details><summary>${text('automatic')}</summary><p class="eq-help">${text('autohelp')}</p></details>
      <form class="eq-form" id="eq-limits"><h3>${text('thresholds')}</h3>${inputs}
      <button class="primary" type="submit">${text('apply')}</button> <span class="eq-status" role="status"></span></form>`;
  }

  function sourceRecords() {
    return records().filter(record => record.source === state.endpoint);
  }
  function exportHistory() {
    const headings = ['received_at_utc','moisture_percent','temperature_c','aqi'];
    const rows = sourceRecords().map(record => [
      new Date(record.receivedAt).toISOString(), record.moisture, record.temperature, record.aqi
    ]);
    const csv = [headings, ...rows].map(row => row.join(',')).join('\r\n');
    const url = URL.createObjectURL(new Blob([csv], {type: 'text/csv;charset=utf-8'}));
    const link = document.createElement('a');
    link.href = url;
    link.download = 'eco-ai-' + day() + '.csv';
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  function refreshReadings() {
    const format = new Intl.NumberFormat(document.documentElement.lang, {maximumFractionDigits: 2});
    if (view === 'history') {
      const time = new Intl.DateTimeFormat(document.documentElement.lang, {month:'short',day:'numeric',year:'numeric',hour:'2-digit',minute:'2-digit',second:'2-digit'});
      const rows = sourceRecords().slice().reverse().map(record => `<tr><td>${time.format(record.receivedAt)}</td>${fields.map(f => `<td>${format.format(record[f.metric])}${f.unit}</td>`).join('')}</tr>`).join('');
      const headings = ['time', ...fields.map(f => f.metric)].map(key => '<th scope="col">'+text(key)+'</th>').join('');
      content.querySelector('#eq-history').innerHTML = rows ? `<div class="eq-scroll"><table><thead><tr>${headings}</tr></thead><tbody>${rows}</tbody></table></div><button class="primary" id="export-readings">${translate('CSV yuklab olish')}</button>` : `<p class="note">${text('empty')}</p><button type="button" class="primary" data-act="house">${text('connect')}</button>`;
      return;
    }
    const latest = state.readings;
    const values = fields.map(f => `<div><small>${text(f.metric)}</small><strong>${format.format(latest[f.metric])}${f.unit}</strong></div>`).join('');
    content.querySelector('#eq-summary').innerHTML = `<p class="eq-help">${text(state.endpoint && state.updated ? 'last' : 'sample')}</p><div class="eq-values">${values}</div>`;
    const config = options();
    const devices = config.automatic ? {automatic: true, pump: beyond(latest, config, fields[0]), fan: beyond(latest, config, fields[1]) || beyond(latest, config, fields[2])} : config;
    content.querySelector('#eq-devices').innerHTML = ['pump','fan','automatic'].map(key =>
      `<button type="button" role="switch" aria-checked="${Boolean(devices[key])}" class="eq-device" data-eq-device="${key}" ${key !== 'automatic' && config.automatic ? 'disabled' : ''}>${text(key)} <span>${text(devices[key] ? 'on' : 'off')}</span></button>`
    ).join('');
  }

  document.addEventListener('click', event => {
    if (event.target.closest('#export-readings')) { exportHistory(); return; }
    if (event.target.closest('#history-button')) { openEquipment('history'); return; }
    if (event.target.closest('#equipment-button')) {openEquipment(); return}
    if (!visible()) return;
    const tab = event.target.closest('[data-eq-view]');
    if (tab) {
      openEquipment(tab.dataset.eqView);
      content.querySelector('[data-eq-view][aria-pressed=true]').focus();
      return;
    }
    const device = event.target.closest('[data-eq-device]');
    if (!device || device.disabled) return;
    const key = device.dataset.eqDevice;
    if (saveChanges({[key]: !options()[key]})) {
      refreshReadings();
      content.querySelector('[data-eq-device="'+key+'"]').focus();
    }
  });
  document.addEventListener('submit', event => {
    if (event.target.id !== 'eq-limits') return;
    event.preventDefault();
    const changes = Object.fromEntries(fields.map(({limit}) => [limit, event.target.elements[limit].valueAsNumber]));
    if (!event.target.reportValidity() || !fields.every(f => Number.isFinite(changes[f.limit]) && changes[f.limit] >= f.min && changes[f.limit] <= f.max)) return;
    if (saveChanges(changes)) {
      render();
      refreshReadings();
      content.querySelector('.eq-status').textContent = text('saved');
    }
  });
  document.addEventListener('eco:language', () => {if (visible()) openEquipment(view)});
})();
