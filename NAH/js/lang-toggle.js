/*
 * 中/EN/日 三語切換。
 * 頁面本身只寫中文，NAH_TRANSLATIONS（translations.js）是唯一的英文／日文譯文
 * 來源，依「原始中文字串」為 key 對照查表（每個 key 對應 {en, ja} 兩種譯文）。
 * 切換時才掃描一次頁面上所有含中文的文字節點與 alt/aria-label 屬性、記住原文，
 * 之後三個語言間互相替換，不需要改動 HTML。
 */
(function(){
  var STORAGE_KEY = 'nah-lang';
  var toggle = document.getElementById('lang-toggle');
  if(!toggle) return;
  var options = toggle.querySelectorAll('.lang-opt');

  var CJK_RE = /[\u{3400}-\u{9FFF}\u{F900}-\u{FAFF}]/u;
  var textNodes = [];
  var attrNodes = [];
  var collected = false;

  function collect(){
    if(collected) return;
    collected = true;
    var walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null);
    var n;
    while((n = walker.nextNode())){
      var p = n.parentNode;
      if(!p || p.nodeType !== 1) continue;
      if(p.tagName === 'SCRIPT' || p.tagName === 'STYLE') continue;
      var trimmed = n.nodeValue.trim();
      if(!trimmed || !CJK_RE.test(trimmed)) continue;
      textNodes.push({node: n, zh: n.nodeValue});
    }
    var els = document.body.querySelectorAll('[alt],[aria-label]');
    els.forEach(function(el){
      ['alt','aria-label'].forEach(function(attr){
        var val = el.getAttribute(attr);
        if(val && CJK_RE.test(val)){
          attrNodes.push({el: el, attr: attr, zh: val});
        }
      });
    });
  }

  function lookup(zh, lang){
    var dict = (typeof NAH_TRANSLATIONS !== 'undefined') ? NAH_TRANSLATIONS : {};
    var entry = dict[zh];
    if(!entry) return null;
    return entry[lang] || null;
  }

  function apply(lang){
    collect();
    textNodes.forEach(function(item){
      if(lang === 'zh'){
        item.node.nodeValue = item.zh;
      } else {
        var translated = lookup(item.zh.trim(), lang);
        if(translated){
          var lead = item.zh.match(/^\s*/)[0];
          var trail = item.zh.match(/\s*$/)[0];
          item.node.nodeValue = lead + translated + trail;
        }
      }
    });
    attrNodes.forEach(function(item){
      if(lang === 'zh'){
        item.el.setAttribute(item.attr, item.zh);
      } else {
        item.el.setAttribute(item.attr, lookup(item.zh, lang) || item.zh);
      }
    });
  }

  function setLang(lang){
    toggle.setAttribute('data-lang', lang);
    options.forEach(function(btn){
      var isActive = btn.getAttribute('data-lang-option') === lang;
      btn.classList.toggle('active', isActive);
    });
    document.documentElement.setAttribute('lang', lang === 'en' ? 'en' : (lang === 'ja' ? 'ja' : 'zh-Hant'));
    document.documentElement.setAttribute('data-lang', lang);
    apply(lang);
    document.dispatchEvent(new CustomEvent('nah:langchange', {detail:{lang:lang}}));
  }

  var saved = localStorage.getItem(STORAGE_KEY) || 'zh';
  setLang(saved);

  options.forEach(function(btn){
    btn.addEventListener('click', function(){
      var lang = btn.getAttribute('data-lang-option');
      setLang(lang);
      localStorage.setItem(STORAGE_KEY, lang);
    });
  });
})();
