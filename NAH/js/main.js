function showDay(idx){
  document.querySelectorAll('.tab-panel').forEach((el,i)=>el.classList.toggle('active', i===idx));
  document.querySelectorAll('.tab-btn').forEach((el,i)=>el.classList.toggle('active', i===idx));
}

var carouselIndex = {};
function showMiniTab(id, tab){
  document.querySelectorAll('.mini-tab-btn').forEach(function(btn){
    var wrap = btn.closest('.mini-tabs');
    if(wrap && wrap.dataset.mini === id){
      btn.classList.toggle('active', btn.getAttribute('onclick').indexOf("'" + tab + "'") !== -1);
    }
  });
  document.querySelectorAll('.mini-tab-panel[data-mini="' + id + '"]').forEach(function(panel){
    panel.classList.toggle('active', panel.dataset.mtab === tab);
  });
}

// ── Place Detail (全螢幕詳情頁) ──
var placeHeroIndex = {};
function openPlaceDetail(id){
  var overlay = document.getElementById('place-overlay-' + id);
  if(!overlay) return;
  overlay.classList.add('active');
  document.body.style.overflow = 'hidden';
}
function closePlaceDetail(){
  document.querySelectorAll('.place-overlay').forEach(function(o){ o.classList.remove('active'); });
  document.body.style.overflow = '';
}
var lightboxImages = [];
var lightboxIndex = 0;
function openLightbox(e, imgEl){
  var lb = document.getElementById('lightbox-overlay');
  var img = document.getElementById('lightbox-img');
  if(!lb || !img) return;
  var gallery = imgEl.closest('.place-gallery');
  lightboxImages = gallery ? Array.prototype.slice.call(gallery.querySelectorAll('img')) : [imgEl];
  lightboxIndex = lightboxImages.indexOf(imgEl);
  if(lightboxIndex < 0) lightboxIndex = 0;
  showLightboxImage();
  lb.classList.add('active');
  if(e) e.stopPropagation();
}
function showLightboxImage(){
  var img = document.getElementById('lightbox-img');
  var counter = document.getElementById('lightbox-counter');
  var navs = document.querySelectorAll('.lightbox-nav');
  if(!img || !lightboxImages.length) return;
  img.src = lightboxImages[lightboxIndex].src;
  img.alt = lightboxImages[lightboxIndex].alt || '';
  if(lightboxImages.length > 1){
    counter.textContent = (lightboxIndex+1) + ' / ' + lightboxImages.length;
    counter.style.display = '';
    navs.forEach(function(n){ n.style.display = ''; });
  } else {
    counter.style.display = 'none';
    navs.forEach(function(n){ n.style.display = 'none'; });
  }
}
function lightboxImageClick(e){
  e.stopPropagation();
  if(lightboxImages.length <= 1) return;
  var rect = e.currentTarget.getBoundingClientRect();
  var clickX = e.clientX - rect.left;
  lightboxNav(null, clickX < rect.width / 2 ? -1 : 1);
}
function lightboxNav(e, dir){
  if(e) e.stopPropagation();
  if(!lightboxImages.length) return;
  lightboxIndex = (lightboxIndex + dir + lightboxImages.length) % lightboxImages.length;
  showLightboxImage();
}
function closeLightbox(){
  var lb = document.getElementById('lightbox-overlay');
  if(!lb) return;
  lb.classList.remove('active');
  document.getElementById('lightbox-img').src = '';
  lightboxImages = [];
  lightboxIndex = 0;
}
document.addEventListener('keydown', function(ev){
  var lb = document.getElementById('lightbox-overlay');
  if(!lb || !lb.classList.contains('active')) return;
  if(ev.key === 'ArrowRight') lightboxNav(null, 1);
  else if(ev.key === 'ArrowLeft') lightboxNav(null, -1);
  else if(ev.key === 'Escape') closeLightbox();
});
var lbTouchStartX = null;
document.addEventListener('touchstart', function(ev){
  if(!ev.target.closest('#lightbox-overlay')) return;
  lbTouchStartX = ev.touches[0].clientX;
}, {passive:true});
document.addEventListener('touchend', function(ev){
  if(lbTouchStartX === null) return;
  var dx = ev.changedTouches[0].clientX - lbTouchStartX;
  if(Math.abs(dx) > 40){ lightboxNav(null, dx < 0 ? 1 : -1); }
  lbTouchStartX = null;
}, {passive:true});
function showPlaceTab(id, tab){
  document.querySelectorAll('.place-tab-btn[onclick*="\'' + id + '\'"]').forEach(function(btn){
    btn.classList.toggle('active', btn.getAttribute('onclick').indexOf("'" + tab + "'") !== -1);
  });
  document.querySelectorAll('.place-panel[data-place="' + id + '"]').forEach(function(panel){
    panel.classList.toggle('active', panel.dataset.tab === tab);
  });
  var scrollArea = document.getElementById('place-overlay-' + id);
  if(scrollArea) scrollArea.scrollTop = 0;
}
function setPlaceHero(id, idx){
  var hero = document.querySelector('.place-hero[data-place="' + id + '"]');
  if(!hero) return;
  var imgs = hero.querySelectorAll(':scope > img, :scope > .hero-video');
  var dots = hero.parentElement.querySelectorAll('.place-hero-dot');
  idx = ((idx % imgs.length) + imgs.length) % imgs.length;
  placeHeroIndex[id] = idx;
  imgs.forEach(function(im,i){ im.classList.toggle('active', i===idx); });
  dots.forEach(function(d,i){ d.classList.toggle('active', i===idx); });
}
var heroTouchStartX = null, heroTouchId = null;
document.addEventListener('touchstart', function(e){
  var hero = e.target.closest('.place-hero');
  if(!hero) return;
  heroTouchStartX = e.touches[0].clientX;
  heroTouchId = hero.dataset.place;
}, {passive:true});
document.addEventListener('touchend', function(e){
  if(heroTouchId === null) return;
  var dx = e.changedTouches[0].clientX - heroTouchStartX;
  if(Math.abs(dx) > 40){ setPlaceHero(heroTouchId, (placeHeroIndex[heroTouchId]||0) + (dx < 0 ? 1 : -1)); }
  heroTouchId = null;
}, {passive:true});

function setSlide(id, idx){
  var modal = document.getElementById('meal-modal-' + id);
  if(!modal) return;
  var slides = modal.querySelectorAll('.carousel-slide');
  var dots = modal.querySelectorAll('.carousel-dot');
  if(!slides.length) return;
  idx = ((idx % slides.length) + slides.length) % slides.length;
  carouselIndex[id] = idx;
  slides.forEach(function(s,i){ s.classList.toggle('active', i===idx); });
  dots.forEach(function(d,i){ d.classList.toggle('active', i===idx); });
}
function moveSlide(id, dir, ev){
  if(ev){ ev.stopPropagation(); }
  setSlide(id, (carouselIndex[id]||0) + dir);
}
function openMealModal(id){
  var overlay = document.getElementById('meal-modal-overlay');
  document.querySelectorAll('.meal-modal').forEach(function(m){ m.style.display = 'none'; });
  var modal = document.getElementById('meal-modal-' + id);
  if(modal){
    modal.style.display = 'block';
    overlay.classList.add('active');
    if(modal.querySelector('.carousel-slide')) setSlide(id, 0);
  }
}
function closeMealModal(){
  document.getElementById('meal-modal-overlay').classList.remove('active');
}
var carTouchStartX = null, carTouchId = null;
document.addEventListener('touchstart', function(e){
  var c = e.target.closest('.meal-modal .carousel');
  if(!c) return;
  carTouchStartX = e.touches[0].clientX;
  carTouchId = c.dataset.modal;
}, {passive:true});
document.addEventListener('touchend', function(e){
  if(carTouchId === null) return;
  var dx = e.changedTouches[0].clientX - carTouchStartX;
  if(Math.abs(dx) > 40){ moveSlide(carTouchId, dx < 0 ? 1 : -1); }
  carTouchId = null;
}, {passive:true});
