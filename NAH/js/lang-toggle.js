/*
 * 中/英切換按鈕。
 * 頁面本身只寫中文，NAH_TRANSLATIONS（translations.js）是唯一的英文譯文來源，
 * 依「原始中文字串」為 key 對照查表。切換時才掃描一次頁面上所有含中文的文字
 * 節點與 alt/aria-label 屬性、記住原文，之後兩個語言間互相替換，不需要改動 HTML。
 */
(function(){
  var STORAGE_KEY = 'nah-lang';
  var toggle = document.getElementById('lang-toggle');
  if(!toggle) return;

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

  function apply(lang){
    collect();
    var dict = (typeof NAH_TRANSLATIONS !== 'undefined') ? NAH_TRANSLATIONS : {};
    textNodes.forEach(function(item){
      if(lang === 'en'){
        var en = dict[item.zh.trim()];
        if(en){
          var lead = item.zh.match(/^\s*/)[0];
          var trail = item.zh.match(/\s*$/)[0];
          item.node.nodeValue = lead + en + trail;
        }
      } else {
        item.node.nodeValue = item.zh;
      }
    });
    attrNodes.forEach(function(item){
      if(lang === 'en'){
        item.el.setAttribute(item.attr, dict[item.zh] || item.zh);
      } else {
        item.el.setAttribute(item.attr, item.zh);
      }
    });
  }

  function setLang(lang){
    toggle.setAttribute('data-lang', lang);
    document.documentElement.setAttribute('lang', lang === 'en' ? 'en' : 'zh-Hant');
    document.documentElement.setAttribute('data-lang', lang);
    apply(lang);
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
