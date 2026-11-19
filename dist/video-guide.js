'use strict';

window.EcoVideo = (() => {
  const languages = {uz:'O‘zbekcha', ru:'Русский', en:'English'};
  const guides = [
    {title:"Eco AI bilan tanishing", file:"eco-ai-video", poster:"eco-ai-video"},
    {
      title:'Pomidor parvarishi sirlari', file:'tomato-care', poster:'tomatoes',
      uz:['Ko‘chat uchun quyoshli joy tanlang.', 'Tuproq namligini tekshiring.', 'Poyani tayanchga ehtiyotkor bog‘lang.', 'Bir tekis rang olgan hosilni tering.'],
      ru:['Выберите солнечное место для рассады.', 'Проверьте влажность почвы.', 'Бережно подвяжите стебель к опоре.', 'Соберите равномерно окрашенные плоды.'],
      en:['Choose a sunny spot for the seedlings.', 'Check the soil moisture.', 'Gently tie the stem to a support.', 'Pick the fruit once it is evenly coloured.']
    },
    {
      title:'Sug‘orishni rejalash', file:'watering', poster:'greenhouse',
      uz:['Tuproq namligini o‘lchang.', 'Tuproq quruq bo‘lsa, ildiz atrofini sug‘oring.', 'Barglarni ho‘llamaslikka harakat qiling.', 'Navbatdagi o‘lchovni ishlar rejasiga kiriting.'],
      ru:['Измерьте влажность почвы.', 'Если почва сухая, полейте у корней.', 'Старайтесь не мочить листья.', 'Внесите следующий замер в план работ.'],
      en:['Measure the soil moisture.', 'If the soil is dry, water around the roots.', 'Try to keep the leaves dry.', 'Schedule the next reading in the work plan.']
    }
  ];
  function play(index = 0) {
    const guide = guides[index] || guides[0];
    const lang = EcoLocale.lang;
    const src = 'assets/' + guide.file + '.mp4';
    const title = EcoLocale.t(guide.title);
    const chapterHeading = guide[lang] ? '<p><strong>' + EcoLocale.t('Qo‘llanma bosqichlari','Этапы урока','Guide chapters') + '</strong></p><div id="eco-chapters"></div>' : '';
    modal(title, '<video id="eco-guide" controls playsinline preload="auto" style="width:100%;aspect-ratio:16/9;border-radius:12px;background:#183c2c" poster="assets/'+guide.poster+'.jpg" aria-label="'+esc(title)+'"></video>' + chapterHeading);
    const player = document.getElementById('eco-guide');
    const chapters = document.getElementById('eco-chapters');
    let chapterTime = 0;
    player.src = src;
    player.muted = true;
    player.play().catch(() => { /* Native controls remain available if autoplay is disabled. */ });
    for (const [code,name] of Object.entries(languages)) {
      if (!guide[code] || typeof VTTCue !== 'function' || !player.addTextTrack) break;
      const track = player.addTextTrack('captions',name,code);
      track.mode = code === lang ? 'showing' : 'disabled';
      guide[code].forEach((caption,i) => track.addCue(new VTTCue(i*6,(i+1)*6,caption)));
    }
    (guide[lang] || []).forEach((caption,i) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'choice';
      button.textContent = '0:' + String(i*6).padStart(2,'0') + ' · ' + caption;
      button.onclick = () => {
        chapterTime = i*6;
        if (player.readyState >= 1) {
          player.currentTime = chapterTime;
          player.play().catch(()=>{});
        }
      };
      chapters.append(button);
    });
    dlg.addEventListener('close', () => {
      player.pause();
    }, {once:true});
    player.addEventListener('loadedmetadata', () => {
      if (chapterTime) player.currentTime = chapterTime;
    }, {once:true});
  }
  return {play, titles: guides.map(guide => guide.title)};
})();
