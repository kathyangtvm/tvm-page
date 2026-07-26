/*
 * 中/英切換按鈕 — 目前僅為架構預留。
 * 這支腳本只負責：記住使用者選的語言、更新按鈕外觀、更新 <html lang>。
 * 尚未提供英文文字內容，之後要加上翻譯時，可以監聽 "nah:langchange" 事件，
 * 或讀取 document.documentElement.getAttribute('data-lang') 來決定要顯示哪個語言的文字。
 */
(function(){
  var STORAGE_KEY = 'nah-lang';
  var toggle = document.getElementById('lang-toggle');
  if(!toggle) return;

  function setLang(lang){
    toggle.setAttribute('data-lang', lang);
    document.documentElement.setAttribute('lang', lang === 'en' ? 'en' : 'zh-Hant');
    document.documentElement.setAttribute('data-lang', lang);
    document.dispatchEvent(new CustomEvent('nah:langchange', {detail:{lang:lang}}));
  }

  var saved = localStorage.getItem(STORAGE_KEY) || 'zh';
  setLang(saved);

  toggle.addEventListener('click', function(){
    var next = toggle.getAttribute('data-lang') === 'zh' ? 'en' : 'zh';
    setLang(next);
    localStorage.setItem(STORAGE_KEY, next);
  });
})();
