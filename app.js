'use strict';
const $=s=>document.querySelector(s), dlg=$('#dlg'), content=$('#content');
const paths={leaf:'M20 3C9 2 3 6 5 14c2 7 14 7 15-11ZM4 21l12-13',drop:'M12 2C10 6 5 11 5 15a7 7 0 0 0 14 0c0-4-5-9-7-13Z',temp:'M9 14V5a3 3 0 0 1 6 0v9a5 5 0 1 1-6 0Zm3-6v9',air:'M3 9h11a3 3 0 1 0-3-3M2 13h17a3 3 0 1 1-3 3M5 17h4',coin:'M20 12a8 8 0 1 1-16 0 8 8 0 1 1 16 0ZM12 7l1.5 3.3 3.5.5-2.5 2.5.6 3.4-3.1-1.6-3.1 1.6.6-3.4L7 10.8l3.5-.5Z',bell:'M4 17h16c-2-2-2-4-2-7a6 6 0 0 0-12 0c0 3 0 5-2 7Zm5 3a4 4 0 0 0 6 0',pin:'M19 10c0 5-7 11-7 11S5 15 5 10a7 7 0 1 1 14 0Zm-5 0a2 2 0 1 1-4 0 2 2 0 0 1 4 0Z',list:'M8 5h12M8 12h12M8 19h12M3 5h.1M3 12h.1M3 19h.1',spark:'m12 3 2.2 6.8L21 12l-6.8 2.2L12 21l-2.2-6.8L3 12l6.8-2.2ZM20 2v4m-2-2h4',film:'M3 5h18v14H3zM7 5v14m10-14v14M3 10h4m10 0h4M3 15h4m10 0h4',play:'m7 4 13 8-13 8Z',left:'m14 6-6 6 6 6',right:'m9 6 6 6-6 6',arrow:'M4 12h16m-6-6 6 6-6 6',upRight:'M6 18 18 6M7 6h11v11',down:'m6 9 6 6 6-6',plus:'M12 5v14M5 12h14',clock:'M21 12a9 9 0 1 1-18 0 9 9 0 1 1 18 0ZM12 6v6l4 2',sprout:'M12 21V11C7 12 4 9 4 5c5 0 8 2 8 6Zm0 4c0-5 3-8 9-8 0 5-3 8-9 8Z',check:'m5 12 4 4L19 6',camera:'M3 7h4l2-3h6l2 3h4v13H3ZM16 13a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z',mic:'M9 5a3 3 0 0 1 6 0v7a3 3 0 0 1-6 0ZM5 11v1a7 7 0 0 0 14 0v-1M12 19v3',bug:'M6 11a6 6 0 0 1 12 0v3a6 6 0 0 1-12 0Zm2-8 2 3m6-3-2 3M2 10l4 1m12 0 4-1M2 17l4-2m12 0 4 2M12 9v10',sun:'M16 12a4 4 0 1 1-8 0 4 4 0 1 1 8 0ZM12 2v3m0 14v3M2 12h3m14 0h3M5 5l2 2m10 10 2 2M19 5l-2 2M7 17l-2 2',palette:'M21 12c0 4-5 2-6 4s2 4-1 5C1 23-2 4 11 3c6-1 10 4 10 9ZM7 10h.1M11 7h.1M16 8h.1'};
function icon(k,n=19){return '<svg aria-hidden="true" width="'+n+'" height="'+n+'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="'+(paths[k]||paths.leaf)+'"/></svg>'}
function icons(){document.querySelectorAll('[data-i]').forEach(el=>el.innerHTML=icon(el.dataset.i))}
function esc(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
const translate = EcoLocale.t;
const formatDate = (date, options) => new Intl.DateTimeFormat(EcoLocale.locale, options).format(date);
const formatNumber = n => n.toLocaleString(EcoLocale.locale);
const currentSeason = () => state.season || defaultSeason;
function displayTaskName(task) {
  const careNames = {
    water: ['Sug‘orish','Полив','Watering'],
    care: ['O‘simlik parvarishi','Уход за растениями','Plant care'],
    treatment: ['O‘simlikka ishlov berish','Обработка растений','Plant treatment']
  };
  const care = careNames[task.careKind];
  if (care && care.includes(task.name)) return translate(...care);
  const sample = /^seed[0-2]$/.test(task.id) ? seed.tasks.find(item => item.id === task.id) : null;
  return sample && sample.name === task.name ? translate(sample.name) : task.name;
}
EcoLocale.bind();
const day=()=>new Date().toLocaleDateString('sv-SE'),now=new Date(),seasonNames=['Qish','Bahor','Yoz','Kuz'];
const defaultSeason=seasonNames[Math.floor(((now.getMonth()+1)%12)/3)];
const seed={name:'Ikrom',season:'',tasks:[['Tuproqni sug‘orish','08:00',20,'drop'],['Ko‘chatlarni tekshirish','11:30',15,'sprout'],['Issiqxonani shamollatish','15:00',10,'air']].map(([name,time,points,type],i)=>({id:'seed'+i,name,time,points,type,date:day(),done:false})),readings:{moisture:64,temperature:24.5,aqi:32},endpoint:'',updated:'',phone:''};
let state;try{state={...seed,...JSON.parse(localStorage.getItem('eco-garden-v1')||'{}')}}catch{state=seed}
function save(){try{localStorage.setItem('eco-garden-v1',JSON.stringify(state));return true}catch{alert(translate('Qurilmada saqlash uchun joy yetarli emas.'));return false}}
function modal(title,html){$('#modal-title').textContent=title;content.innerHTML=html;if(!dlg.open)dlg.showModal();icons()}
function toast(msg){$('#toast').textContent=msg;$('#toast').style.display='block';setTimeout(()=>$('#toast').style.display='none',3200)}
let timer,slide=0;const slides=[['Yashil makon','Toshkent, O‘zbekiston','greenhouse'],['Pomidor qatori','Issiqxona · Hosil kuzatuvi','tomatoes'],['Ko‘chatlar maydoni','Issiqxona · Parvarish zonasi','greenhouse']];

const colors={drop:['#e9f1fc','#4d7ab8'],temp:['#fff0df','#c18537'],air:['#e5f5ef','#378675'],coin:['#ddefc2','#547d37'],sprout:['#eff5e6','#6e8a45'],leaf:['#e8f4e2','#4d8042']};
function theme(k){return '--light:'+colors[k][0]+';--ink:'+colors[k][1]}
function chip(k){return '<span class="iconbox" style="'+theme(k in colors?k:'leaf')+'">'+icon(k)+'</span>'}
const trends=[[22,20,20,14,16,13,16,17,9,10,4,6,2],[22,20,21,12,14,8,9,6,10,5,8,4,6],[14,16,9,12,10,14,8,11,7,10,6,7,5],[25,24,19,20,14,16,14,10,12,5,7,2,3]];
function chart(i) {
  let levels = trends[i];
  if (i < 3 && state.endpoint && state.updated) {
    const key = ['moisture','temperature','aqi'][i];
    const values = (state.sensorHistory || [])
      .filter(record => record.source === state.endpoint && Number.isFinite(record[key]))
      .slice(-13).map(record => record[key]);
    if (!values.length) values.push(state.readings[key]);
    if (values.length === 1) {
      return '<svg class="sparkline" viewBox="0 0 98 32" aria-hidden="true"><circle cx="94" cy="16" r="2.5" fill="var(--ink)"/></svg>';
    }
    const low = Math.min(...values), high = Math.max(...values);
    levels = values.map(v => high === low ? 16 : 27 - (v-low)*24/(high-low));
  }
  const step = 96 / (levels.length-1);
  const points = levels.map((y,j)=>[j*step,y]);
  let path = 'M0 '+points[0][1];
  points.slice(1).forEach(([x,y],j)=>{
    const mid = x-step/2;
    path += ' C'+mid+' '+points[j][1]+','+mid+' '+y+','+x+' '+y;
  });
  return `<svg class="sparkline" viewBox="0 0 98 32" preserveAspectRatio="none" aria-hidden="true">
    <defs><linearGradient id="g${i}" x2="0" y2="1"><stop stop-color="var(--ink)" stop-opacity=".18"/><stop offset="1" stop-color="var(--ink)" stop-opacity="0"/></linearGradient></defs>
    <path fill="url(#g${i})" d="${path} L96 32 H0Z"/><path fill="none" stroke="var(--ink)" stroke-width="1.9" stroke-linecap="round" d="${path}"/></svg>`;
}
function balance(){return 120+state.tasks.filter(t=>t.done).reduce((a,t)=>a+t.points,0)}

const toolList=[['photo','camera','Rasm tahlili'],['voice','mic','Ovozli yordamchi'],['plant','sprout','Ekish va hosil'],['pests','bug','Hasharotlar'],['studio','film','Video studiya'],['logo','palette','Ikonka yaratish'],['alerts','bell','Eslatmalar'],['points','coin','Eco ball']];

async function photoData(file,max=640){const url=URL.createObjectURL(file);try{const img=new Image();img.src=url;await img.decode();const c=document.createElement('canvas');const scale=Math.min(1,max/Math.max(img.width,img.height));c.width=Math.max(1,Math.round(img.width*scale));c.height=Math.max(1,Math.round(img.height*scale));const ctx=c.getContext('2d');ctx.drawImage(img,0,0,c.width,c.height);return {src:c.toDataURL('image/jpeg',.72),pixels:ctx.getImageData(0,0,c.width,c.height).data}}finally{URL.revokeObjectURL(url)}}
const fileInput='<input id="picture" type="file" accept="image/*" required>';

const advice={Qish:'Issiqxonada ko‘chatlarni sovuqdan asrang va yorug‘ joy tanlang.',Bahor:'Ko‘chatlarni yorug‘, shamoldan pana joyga bosqichma-bosqich ko‘chiring.',Yoz:'Issiq paytlarda shamollatish va tuproq namligini kuzating.',Kuz:'Sovuq tushishidan oldin yetilgan hosilni yig‘ing va tungi haroratni kuzating.'};

const videoLessons=[['Pomidor parvarishi sirlari','tomatoes',['Ko‘chat uchun quyoshli joy tanlang.','Tuproq namligini tekshiring.','Poyani tayanchga ehtiyotkor bog‘lang.','Bir tekis rang olgan hosilni tering.']],['Sug‘orishni rejalash','greenhouse',['Tuproq namligini o‘lchang.','Namlik past bo‘lsa, ildiz atrofini sug‘oring.','Barglarni ho‘llamaslikka harakat qiling.','Keyingi o‘lchovni ishlar rejasiga kiriting.']]];

function hero() {
  const [title, sub, img] = slides[slide];
  $('#hero-title').textContent = translate(title);
  $('#hero-sub').textContent = translate(sub);
  $('.hero').style.setProperty('--hero', "url('assets/"+img+".jpg')");
  $('.hero').style.backgroundPosition = slide===2 ? 'center bottom' : 'center';
  $('#slide-no').textContent = String(slide+1).padStart(2,'0');
  $('.slide-dots').innerHTML = slides.map((_,i) => `<button class="${slide===i?'on':''}" data-slide="${i}" aria-label="${translate('Ko‘rinish','Вид','View')} ${i+1}"></button>`).join('');
}
function irrigation() {
  const moisture = state.readings.moisture;
  if (moisture < (state.equipment?.minMoisture ?? 40)) return translate('Sug‘orish kerak');
  return translate(moisture > 75 ? 'Namlik yuqori' : 'Me’yorida');
}
function render() {
  const r = state.readings;
  const metrics = [
    ['drop','Tuproq namligi',r.moisture,'%',irrigation()],
    ['temp','Harorat',r.temperature,'°C',r.temperature>(state.equipment?.maxTemperature ?? 30)?'Issiq':r.temperature<16?'Salqin':'Mo‘tadil'],
    ['air','Havo sifati',r.aqi,'AQI',r.aqi<=50?'Toza havo':r.aqi<=100?'O‘rtacha':'Ifloslangan'],
    ['coin','Eco ball',balance(),'ball','Yashil daraja']
  ];
  $('#metrics').innerHTML = metrics.map(([k,label,value,unit,status],i) => `
    <button class="metric ${i===3?'eco':''}" style="${theme(k)}" data-act="${i===3?'points':'house'}">
      <span class="metric-top">${chip(k)}<span class="metric-tag">${translate(label).toLocaleUpperCase(EcoLocale.locale)}</span></span>
      <span class="metric-value">${formatNumber(value)}<small>${translate(unit)}</small></span>
      <span class="metric-bottom"><span class="status">${translate(status)}</span>${chart(i)}</span>
    </button>`).join('');
  const today=state.tasks.filter(t=>t.date===day()).sort((a,b)=>a.time.localeCompare(b.time));
  $('#tasklist').innerHTML=today.slice(0,3).map(row).join('')||'<p>'+translate('Bugun uchun vazifa yo‘q.')+'</p>';
  $('#season').textContent=translate(currentSeason())+(EcoLocale.lang==='uz'?' fasli':'');
  const todayDate = new Date();
  const monthsUz = ['yanvar','fevral','mart','aprel','may','iyun','iyul','avgust','sentabr','oktabr','noyabr','dekabr'];
  $('#date').textContent = EcoLocale.lang === 'uz'
    ? todayDate.getDate()+'-'+monthsUz[todayDate.getMonth()]+', '+todayDate.getFullYear()
    : formatDate(todayDate,{day:'numeric',month:'long',year:'numeric'});
  $('.avatar').textContent=state.name.slice(0,2).toLocaleUpperCase(EcoLocale.locale);
  icons();
}
function row(t) {
  const title = esc(displayTaskName(t));
  const action = t.done ? translate('Natijani ko‘rish','Посмотреть результат','View result')
    : t.startedAt ? translate('Natijani topshirish','Отправить результат','Submit result')
    : translate('Ishni boshlash','Начать работу','Begin task');
  return `<div class="taskrow ${t.done?'done':''}">${chip(t.type)}
    <div><div class="taskname">${title}</div><small>${icon('clock',12)}${esc(t.time)}</small></div>
    <span class="points">+${t.points} ${translate('ball')}</span>
    <button class="check" data-task="${esc(t.id)}" title="${action}" aria-label="${title} — ${action}">${icon(t.done?'check':t.startedAt?'camera':'play',12)}</button></div>`;
}
function renderTools() {
  $('#toolgrid').innerHTML = toolList.map(([act,k,title])=>`<button class="tool" data-act="${act}">${chip(k)}${translate(title)}<i>${icon('upRight',14)}</i></button>`).join('');
}
const btn=(act,key)=>`<button class="primary" data-act="${act}">${translate(key)}</button>`;
const label=(key,input)=>`<label>${translate(key)}${input}</label>`;
const hint=s=>'<p class="note">'+s+'</p>';
const option=(value,key)=>`<option value="${value}">${translate(key)}</option>`;
const show=(key,html)=>modal(translate(key),html);
function plan() {
  const tasks = state.tasks.slice().sort((a,b)=>(a.date+a.time).localeCompare(b.date+b.time));
  show('Ishlar rejasi',tasks.map(t=>'<small>'+esc(formatDay(t.date))+'</small>'+row(t)).join('')+btn('add','Vazifa qo‘shish'));
}
function formatDay(value) {
  const date = new Date(value+'T12:00:00');
  return Number.isFinite(date.valueOf()) ? formatDate(date) : value;
}
function add() {
  show('Yangi vazifa',`<form id="newtask">
    ${label('Vazifa nomi',`<input name="name" required maxlength="80" placeholder="${translate('Masalan, barglarni tekshirish')}">`)}
    ${label('Ish turi','<select name="type">'+option('drop','Sug‘orish')+option('leaf','O‘simlikka dori qo‘llash')+option('sprout','Parvarish')+option('air','Shamollatish')+'</select>')}
    ${label('Sana','<input type="date" name="date" value="'+day()+'" required>')}
    ${label('Vaqt','<input type="time" name="time" required value="09:00">')}
    <label class="inline"><input type="checkbox" name="remind" checked>${translate('Eslatma qo‘yish')}</label>
    <button class="primary">${translate('Saqlash')}</button></form>`);
  $('#newtask').onsubmit=e=>{
    e.preventDefault();
    const values=new FormData(e.target);
    const name=values.get('name').trim();
    if(!name) return;
    state.tasks.push({id:crypto.randomUUID(),name,type:values.get('type'),time:values.get('time'),date:values.get('date'),remind:values.has('remind'),points:15,done:false});
    if (!save()) { state.tasks.pop(); return; }
    render();plan();
  };
}
function task(id) {
  const t=state.tasks.find(x=>x.id===id);
  if(!t) return;
  const name=displayTaskName(t), points='+'+t.points+' '+translate('ball');
  if(t.done) {
    modal(name,`<img class="proof" alt="${translate('Bajarilgan ish surati')}" src="${esc(t.proof)}">`+hint(translate('Bajarildi')+' · '+points));
    return;
  }
  show('Ishni tasdiqlash','<p>'+esc(name)+'</p><form id="evidence">'+label('Natijani suratga oling yoki rasm tanlang',fileInput)+'<button class="primary">'+translate('Tasdiqlash')+' · '+points+'</button></form>');
  $('#evidence').onsubmit=async e=>{
    e.preventDefault();
    const button=e.submitter;button.disabled=true;
    try {
      const p=await photoData($('#picture').files[0]);
      t.proof=p.src;t.done=true;
      if(!save()){delete t.proof;t.done=false;return}
      render();plan();toast(translate('Bajarildi')+' · '+points);
    } catch {toast(translate('Rasmni o‘qib bo‘lmadi. Boshqa fayl tanlang.'))}
    finally {button.disabled=false}
  };
}
function points() {
  show('Eco ball','<div class="metric-value">'+balance()+'<small>'+translate('ball')+'</small></div>'+hint(translate('Boshlang‘ich namuna balansi — 120 ball. Har bir bajarilgan vazifani surat bilan tasdiqlab, ball yig‘ing.'))+state.tasks.filter(t=>t.done).map(row).join('')+btn('plan','Vazifalarni ko‘rish'));
}
function house() {
  const r=state.readings;
  const timestamp = state.updated && /^\d{4}-/.test(state.updated) ? new Date(state.updated).toLocaleString(EcoLocale.locale) : state.updated;
  show('Issiqxona nazorati',`
    <p>${timestamp?translate('Oxirgi o‘lchov')+' · '+esc(timestamp):translate('Namunaviy sensor ko‘rsatkichlari')}</p>
    <div class="result">${translate('Tuproq namligi')} <b>${formatNumber(r.moisture)}%</b> · ${translate('Harorat')} <b>${formatNumber(r.temperature)} °C</b><br>
    ${translate('Havo sifati')} <b>${formatNumber(r.aqi)} AQI</b><br>${translate('Sug‘orish holati')} — ${irrigation()}</div>
    ${hint(translate('Sensor shlyuzining HTTPS manzilini kiriting. JSON maydonlari: moisture (%), temperature (°C), aqi. Ulangan manba har daqiqada yangilanadi.'))}
    <form id="sensor">${label('Sensor manzili','<input name="url" type="url" required placeholder="https://…" value="'+esc(state.endpoint)+'">')}
    <button class="primary">${translate('Ulash va o‘lchash')}</button></form><p id="sensor-msg" role="status"></p>`);
  $('#sensor').onsubmit=async e=>{
    e.preventDefault();
    const msg=$('#sensor-msg'),button=e.submitter;
    msg.textContent=translate('Ulanmoqda…');button.disabled=true;
    try {await syncSensors(e.target.url.value);if(msg.isConnected)house()}
    catch {msg.textContent=translate('Ulanib bo‘lmadi. HTTPS manzili, JSON maydonlari va CORS ruxsatini tekshiring.')}
    finally {button.disabled=false}
  };
}
async function syncSensors(url) {
  if(new URL(url).protocol!=='https:')throw Error();
  const response=await fetch(url,{signal:AbortSignal.timeout(9000),cache:'no-store'});
  if(!response.ok)throw Error();
  const {moisture,temperature,aqi}=await response.json();
  if(![moisture,temperature,aqi].every(Number.isFinite)||moisture<0||moisture>100||aqi<0)throw Error();
  const receivedAt=Date.now();
  state.readings={moisture,temperature,aqi};state.endpoint=url;
  state.updated=new Date(receivedAt).toISOString();save();
  document.dispatchEvent(new CustomEvent('eco:readings',{detail:{...state.readings,readings:{...state.readings},receivedAt,source:url}}));
  render();
}
function alerts() {
  show('Eslatmalar',hint(translate('Sahifa ochiq bo‘lganda belgilangan vaqtda eslatma chiqadi. SMS tugmasi telefoningizdagi xabar oynasini ochadi.'))+
    label('SMS uchun telefon','<input type="tel" id="phone" value="'+esc(state.phone)+'" placeholder="+998…">')+
    state.tasks.filter(t=>!t.done).map(t=>`<div class="taskrow">
      <div><strong>${esc(displayTaskName(t))}</strong><small>${esc(formatDay(t.date))} · ${esc(t.time)}</small></div>
      <label class="inline" style="margin-left:auto"><input type="checkbox" data-rem="${esc(t.id)}" ${t.remind!==false?'checked':''}> ${translate('Eslatma')}</label>
      <a data-sms="${esc(t.id)}" href="#">SMS</a></div>`).join('')+btn('add','Vazifa qo‘shish'));
  $('#phone').onchange=e=>{state.phone=e.target.value;save()};
}
function season() {
  show('Faslni tanlang','<div class="seasonwrap">'+['Avtomatik',...seasonNames].map(s=>`<button class="choice" data-season="${s}">${translate(s)}</button>`).join('')+'</div>'+
    hint(translate('Avtomatik rejimda fasl taqvimga qarab tanlanadi. Ekish tavsiyalari tanlangan faslga moslashadi.')));
}
function plant() {
  const season=currentSeason();
  show('Ekish va hosil',hint(translate(season)+' · '+translate(advice[season]))+label('Ekin turi','<select id="crop">'+['Pomidor','Bodring','Rayhon'].map((v,i)=>option(i,v)).join('')+'</select>')+
    label('Ekish sanasi','<input type="date" id="planted" value="'+day()+'">')+'<div class="result" id="harvest"></div>');
  function update() {
    const idx=$('#crop').selectedIndex, date=new Date($('#planted').value+'T12:00:00');
    if(isNaN(date)){ $('#harvest').textContent=translate('Sanani kiriting.');return }
    const offsets=[[70,90],[50,70],[45,65]][idx];
    const range=offsets.map(n=>{const d=new Date(date);d.setDate(d.getDate()+n);return formatDate(d)}).join(' — ');
    const tip=['Quyoshli, suvni yaxshi o‘tkazadigan tuproq tanlang.','Yorug‘ va shamoldan pana joyda tayanch o‘rnating.','Quyoshli joyda, yumshoq tuproqda eking.'][idx];
    $('#harvest').textContent=translate(tip)+' '+translate('Taxminiy hosil davri')+': '+range+'. '+translate('Muddat nav va sharoitga bog‘liq.');
  }
  $('#crop').onchange=$('#planted').onchange=update;update();
}
function pests() {
  show('Hasharotlardan himoya',label('Hasharotni tanlang','<select id="pest">'+['Oqqanot','O‘simlik biti','O‘rgimchakkana'].map((v,i)=>option(i,v)).join('')+'</select>')+'<p class="result" id="pinfo"></p>'+btn('add','Tekshiruvni rejalash'));
  const tips=[
    'Barg ostida mayda oq hasharotlar ko‘rinadi. Barglarni tekshiring, zararlangan ko‘chatlarni ajrating va sariq yopishqoq tuzoqlardan foydalaning.',
    'Yosh novdalardagi mayda bitlar bargni burishtirishi mumkin. Zararlangan joylarni tekshirib, suv oqimi bilan ehtiyotkorlik bilan tozalang.',
    'Barglarda mayda och dog‘lar va ingichka to‘rlar paydo bo‘ladi. Barg ostini lupa bilan tekshiring va zararlangan o‘simlikni ajrating.'
  ];
  const update=()=>{$('#pinfo').textContent=translate(tips[$('#pest').selectedIndex])};
  $('#pest').onchange=update;update();
}
function photo() {
  show('Rasm tahlili',label('O‘simlik suratini yuklang',fileInput)+'<div id="analysis"></div>');
  const output=$('#analysis'),input=$('#picture');
  input.onchange=async e=>{
    const file=e.target.files[0];if(!file)return;
    try{
      const p=await photoData(file);
      if(input.files[0]!==file)return;
      let green=0,yellow=0;
      for(let i=0;i<p.pixels.length;i+=4){
        const r=p.pixels[i],g=p.pixels[i+1],b=p.pixels[i+2];
        if(g>r*1.08&&g>b*1.15)green++;
        if(r>b*1.4&&g>b*1.3&&r>g*.95)yellow++;
      }
      const percent=n=>Math.round(n*400/p.pixels.length)+'%';
      const summary=translate(
        'Rang tahlili · Yashil maydon '+percent(green)+', sarg‘ish maydon '+percent(yellow)+'. Natijaga suratdagi fon va yorug‘lik ham ta’sir qiladi.',
        'Анализ цвета · Зелёная область '+percent(green)+', желтоватая '+percent(yellow)+'. На результат влияют освещение и фон.',
        'Colour analysis · Green area '+percent(green)+', yellowish area '+percent(yellow)+'. Lighting and background affect the result.');
      output.innerHTML=`<img class="proof" src="${p.src}" alt="${translate('Yuklangan o‘simlik')}">`+hint(summary)+btn('pests','Hasharot belgilarini tekshirish');
    }catch{toast(translate('Suratni o‘qib bo‘lmadi.'))}
  };
}
function studio() {
  show('Video studiya',videoLessons.map(([name],i)=>`<button class="choice" data-lesson="${i}">${icon('play',15)} ${translate(name)}</button>`).join('')+'<p>'+translate('24 soniyali parvarish qo‘llanmasini tanlang.')+'</p>');
}
function video(i=0) {
  if(window.EcoVideo?.play){window.EcoVideo.play(i);return}
  const [name,img,scenes]=videoLessons[i];
  let sec=0,playing=true;
  show(name,'<div class="player" id="player"><span></span></div><div class="progress"></div><button class="primary" id="pause">'+translate('Pauza')+'</button> <span id="vtime"></span>');
  function paint(){
    $('#player').style.backgroundImage="linear-gradient(0deg,#102b1be6,transparent 85%),url('assets/"+img+".jpg')";
    $('#player').style.backgroundSize=(115+sec*.7)+'% auto';
    $('#player span').textContent=translate(scenes[Math.min(3,Math.floor(sec/6))]);
    $('.progress').style.width=(sec/24*100)+'%';
    $('#vtime').textContent='0:'+String(sec).padStart(2,'0')+' / 0:24';
  }
  clearInterval(timer);paint();
  timer=setInterval(()=>{
    if(!dlg.open||!$('#player')){clearInterval(timer);return}
    if(!playing)return;
    sec++;
    if(sec>=24){playing=false;$('#pause').textContent=translate('Qayta ko‘rish')}
    paint();
  },1000);
  $('#pause').onclick=()=>{if(sec===24)sec=0;playing=!playing;$('#pause').textContent=translate(playing?'Pauza':'Davom etish');paint()};
}
function logo() {
  show('Ikonka yaratish',label('Belgi','<select id="symbol">'+option('leaf','Barg')+option('sprout','Nihol')+option('sun','Quyosh')+option('drop','Tomchi')+'</select>')+
    label('Fon rangi','<input id="color" type="color" value="#23573b">')+'<div id="iconview"></div><button class="primary" id="download">'+translate('SVG yuklab olish')+'</button>');
  let svg='';
  function update(){
    svg=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="96" height="96"><rect width="48" height="48" rx="12" fill="${$('#color').value}"/><g transform="translate(8,8) scale(1.33)"><path d="${paths[$('#symbol').value]}" fill="none" stroke="#d6f7a8" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/></g></svg>`;
    $('#iconview').innerHTML=svg;
  }
  update();$('#symbol').onchange=$('#color').oninput=update;
  $('#download').onclick=()=>{const a=document.createElement('a');a.href='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(svg);a.download='eco-icon.svg';a.click()};
}
let recognition;
function finishListening() {
  if(recognition){const listening=recognition;recognition=null;listening.abort()}
}
function voice() {
  const Recognizer=window.SpeechRecognition||window.webkitSpeechRecognition;
  const listen=translate('Gapirish','Говорить','Speak');
  show('Ovozli yordamchi','<p>'+translate('Namlik, harorat, havo sifati, hosil yoki bugungi ishlar haqida so‘rang.')+'</p><form id="ask">'+
    label('Savolingiz','<input required name="q" placeholder="'+translate('Bugun sug‘orish kerakmi?')+'">')+
    '<button class="primary">'+translate('Javob olish')+'</button>'+
    (Recognizer?'<button type="button" class="choice" id="listen">'+icon('mic',16)+' '+listen+'</button>':'')+'</form><div id="reply" aria-live="polite"></div>');
  const form=$('#ask'),reply=$('#reply');
  if(Recognizer)$('#listen').onclick=()=>{
    finishListening();
    const listener=new Recognizer(),button=$('#listen');
    recognition=listener;listener.lang=EcoLocale.locale;listener.interimResults=false;listener.continuous=false;
    listener.onresult=e=>{
      if(!form.isConnected||!dlg.open)return;
      form.elements.q.value=e.results[0][0].transcript;
      form.requestSubmit();
    };
    listener.onerror=e=>{if(e.error!=='aborted')reply.textContent=translate('Ovozni o‘qib bo‘lmadi. Savolni yozishingiz mumkin.','Не удалось распознать речь. Введите вопрос.','Speech could not be recognised. Type your question instead.')};
    listener.onend=()=>{if(recognition===listener)recognition=null;button.disabled=false;button.textContent=listen};
    try{listener.start();button.disabled=true;button.textContent=translate('Tinglanmoqda…','Слушаю…','Listening…')}
    catch{listener.onerror({error:'unavailable'});listener.onend()}
  };
  form.onsubmit=e=>{
    e.preventDefault();
    const q=form.elements.q.value.trim().toLowerCase();
    if(window.EcoCare?.handleIntent(q))return;
    const r=state.readings;
    let answer;
    if(/namlik|sug|влаж|полив|полить|water|moisture/.test(q)) {
      answer=translate('Tuproq namligi')+' '+formatNumber(r.moisture)+'%. '+irrigation()+'.';
    } else if(/harorat|issiq|температур|тепло|холод|hot|temperature|cold/.test(q)) {
      answer=translate('Harorat')+' '+formatNumber(r.temperature)+' °C.';
    } else if(/havo|воздух|air|aqi/.test(q)) {
      answer=translate('Havo sifati')+' '+formatNumber(r.aqi)+' AQI.';
    } else if(/hosil|ekish|fasl|урожай|сезон|посад|сажать|harvest|plant|season/.test(q)) {
      answer=translate(advice[currentSeason()]);
    } else if(/ish|vazifa|reja|задач|план|работ|дела|task|plan|work/.test(q)) {
      const remaining=state.tasks.filter(t=>!t.done&&t.date===day());
      answer=translate('Bugungi ishlar')+' · '+(remaining.map(t=>displayTaskName(t)+' '+t.time).join('. ')||translate('Bugun uchun vazifa yo‘q.'));
    } else answer=translate('Savolni namlik, harorat, havo, hosil yoki ishlar rejasi haqida yozing.');
    reply.innerHTML=hint(esc(answer));
    if(window.speechSynthesis&&window.SpeechSynthesisUtterance){speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(answer);u.lang=EcoLocale.locale;speechSynthesis.speak(u)}
  };
}
function profile() {
  show('Bog‘bon profili','<form id="profile">'+label('Ismingiz','<input name="name" required maxlength="40" value="'+esc(state.name)+'">')+'<button class="primary">'+translate('Saqlash')+'</button></form>');
  $('#profile').onsubmit=e=>{e.preventDefault();const name=e.target.elements.namedItem('name').value.trim();if(!name)return;state.name=name;save();render();dlg.close()};
}
const acts={plan,add,house,season,points,alerts,photo,voice,plant,pests,studio,video,logo,profile,prev(){slide=(slide+2)%3;hero()},next(){slide=(slide+1)%3;hero()}};
document.addEventListener('click',e=>{
  const a=e.target.closest('[data-act],[data-task],[data-slide],[data-season],[data-lesson],[data-sms]');
  if(!a)return;
  const d=a.dataset;
  if(d.act){acts[d.act]?.();return}
  if(d.task){
    const selected=state.tasks.find(t=>t.id===d.task);
    if(!selected)return;
    if(!selected.done&&!selected.startedAt&&window.EcoCare?.startTask)window.EcoCare.startTask(selected);
    else task(d.task);
  } else if(d.slide!==undefined){slide=+d.slide;hero()}
  else if(d.season){state.season=d.season==='Avtomatik'?'':d.season;save();render();dlg.close()}
  else if(d.lesson!==undefined)video(+d.lesson);
  else if(d.sms){
    e.preventDefault();const t=state.tasks.find(x=>x.id===d.sms);
    location.href='sms:'+state.phone.replace(/[^+0-9]/g,'')+'?body='+encodeURIComponent(displayTaskName(t)+' · '+formatDay(t.date)+' '+t.time);
  }
});
document.addEventListener('change',e=>{if(e.target.dataset.rem){state.tasks.find(t=>t.id===e.target.dataset.rem).remind=e.target.checked;save()}});
document.addEventListener('eco:language',()=>{render();hero();renderTools()});
function route(){const hash=location.hash.slice(1)||'panel';document.querySelectorAll('nav a').forEach(a=>a.classList.toggle('active',a.hash==='#'+hash));if(hash==='house')house();if(hash==='plan')plan();if(hash==='tools')$('#toolsection').scrollIntoView({behavior:'smooth'});if(hash==='panel')window.scrollTo({top:0,behavior:'smooth'})}
document.querySelectorAll('nav a,.brand').forEach(a=>a.addEventListener('click',()=>{if(location.hash===a.hash)route()}));window.addEventListener('hashchange',route);$('#close').onclick=()=>dlg.close();dlg.onclick=e=>{if(e.target===dlg){const r=dlg.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dlg.close()}};dlg.onclose=()=>{finishListening();clearInterval(timer);if(window.speechSynthesis)speechSynthesis.cancel();if(['#house','#plan'].includes(location.hash)){history.replaceState(null,'','#panel');document.querySelectorAll('nav a').forEach(a=>a.classList.toggle('active',a.hash==='#panel'))}};
function reminders() {
  const now=new Date(),today=day(),time=now.toTimeString().slice(0,5);
  const due=state.tasks.filter(t=>!t.done&&t.remind!==false&&!t.notified&&t.date===today&&t.time<=time);
  for(const t of due){
    t.notified=true;save();
    document.dispatchEvent(new CustomEvent('eco:reminder',{detail:{id:t.id,name:t.name,date:t.date,time:t.time}}));
    toast(translate('Eslatma')+': '+displayTaskName(t));
  }
}
setInterval(reminders,15000);
setInterval(()=>{if(state.endpoint)syncSensors(state.endpoint).catch(()=>{})},60000);
renderTools();render();hero();route();
window.addEventListener('load', reminders);
