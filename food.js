(function(){
  /* mobile menu */
  var nav=document.getElementById('navbar'),t=nav.querySelector('.nav-toggle'),l=document.getElementById('nav-links');
  function set(o){l.classList.toggle('open',o);t.setAttribute('aria-expanded',o);t.setAttribute('aria-label',o?'Close menu':'Open menu');}
  t.addEventListener('click',function(){set(t.getAttribute('aria-expanded')!=='true');});
  document.addEventListener('keydown',function(e){if(e.key==='Escape'&&l.classList.contains('open')){set(false);t.focus();}});

  /* per-dish reveal: only switched on when the visitor allows motion and the browser supports it */
  var reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var stories=[].slice.call(document.querySelectorAll('.story'));
  if(reduce||!('IntersectionObserver' in window)) return;
  var target=location.hash&&document.querySelector(location.hash);
  document.documentElement.classList.add('fx');
  if(target&&target.classList.contains('story')) target.classList.add('in');   // arriving from a "More" link
  var io=new IntersectionObserver(function(es){
    es.forEach(function(e){ if(e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); } });
  },{threshold:.22,rootMargin:'0px 0px -8% 0px'});
  stories.forEach(function(s){ if(!s.classList.contains('in')) io.observe(s); });

  /* gentle parallax on dish photos (wide screens only) */
  var imgs=stories.map(function(s){return s.querySelector('.plate img, .plate .plate-ph');}).filter(Boolean), ticking=false;
  function para(){
    ticking=false; if(innerWidth<900){imgs.forEach(function(im){im.style.transform='';});return;}
    var vh=innerHeight;
    imgs.forEach(function(im){
      var r=im.closest('.story-media').getBoundingClientRect(); if(r.bottom<0||r.top>vh) return;
      var p=(r.top+r.height/2-vh/2)/vh; im.style.transform='rotate('+(p*-18).toFixed(1)+'deg)';
    });
  }
  addEventListener('scroll',function(){ if(!ticking){ticking=true;requestAnimationFrame(para);} },{passive:true});
  addEventListener('resize',para); para();
})();
