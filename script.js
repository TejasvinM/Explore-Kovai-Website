(function(){
  var nav=document.getElementById('navbar'), toggle=nav.querySelector('.nav-toggle'), links=document.getElementById('nav-links');
  function onScroll(){nav.classList.toggle('scrolled', window.scrollY>40);}
  onScroll(); window.addEventListener('scroll',onScroll,{passive:true});
  function setMenu(open){links.classList.toggle('open',open);toggle.setAttribute('aria-expanded',open);toggle.setAttribute('aria-label',open?'Close menu':'Open menu');}
  toggle.addEventListener('click',function(){setMenu(toggle.getAttribute('aria-expanded')!=='true');});
  links.addEventListener('click',function(e){if(e.target.closest('a'))setMenu(false);});
  document.addEventListener('keydown',function(e){if(e.key==='Escape'&&links.classList.contains('open')){setMenu(false);toggle.focus();}});

  var strip=document.getElementById('places-strip');
  document.querySelectorAll('.strip-ctrls button').forEach(function(b){
    b.addEventListener('click',function(){
      var card=strip.querySelector('.carousel-card'); var step=card?card.getBoundingClientRect().width+20:300;
      strip.scrollBy({left:step*Number(b.dataset.dir),behavior:'smooth'});
    });
  });

  /* ===== Featured destinations ===== */
  var FEAT=[
    {tag:'Park &amp; walk',name:'Race Course',text:'A green and clean oasis in the heart of Coimbatore city.',loc:'Coimbatore city'},
    {tag:'Neighbourhood',name:'RS Puram',text:'A popular attraction and a beautifully lit landmark.',loc:'R.S. Puram'},
    {tag:'Lake',name:'Valankulam Lake',text:'The gateway to a gentle adventure in the middle of the city.',loc:'Coimbatore city',link:'adventures.html#valankulam-boating',linkText:'Boating on the lake'},
    {tag:'Shopping',name:'Brookefields Mall',text:'Shopping mall with over 100 stores, a six-screen cinema and a multi-cuisine food court.',loc:'Krishnasamy Road (Brookebond Road)',link:'places.html#brookefields-mall',linkText:'See it on the map'},
    {tag:'Museum',name:'GeDee Car Museum',text:'A collection of vintage and classic cars.',loc:'734 Avinashi Road',link:'places.html#gedee-car-museum',linkText:'See it on the map'}
  ];
  var slides=document.querySelectorAll('.feat-slide'), tabs=document.querySelectorAll('.feat-index button'),
      copy=document.getElementById('feat-copy'), num=document.getElementById('feat-n'), cur=0;
  function show(i,focusTab){
    i=(i+FEAT.length)%FEAT.length; if(i===cur&&!focusTab) return; cur=i;
    slides.forEach(function(s,k){s.classList.toggle('is-active',k===i);});
    tabs.forEach(function(t,k){t.setAttribute('aria-selected',k===i);t.tabIndex=k===i?0:-1;});
    var d=FEAT[i];
    copy.innerHTML='<span class="tag">'+d.tag+'</span><h3>'+d.name+'</h3><p>'+d.text+'</p><p class="loc">'+d.loc+'</p>'+(d.link?'<a class="feat-link" href="'+d.link+'">'+d.linkText+' <span aria-hidden="true">&#8594;</span></a>':'');
    copy.classList.remove('swap'); void copy.offsetWidth; copy.classList.add('swap');
    num.textContent=('0'+(i+1)).slice(-2);
    if(focusTab) tabs[i].focus();
  }
  tabs.forEach(function(t){
    t.addEventListener('click',function(){show(+t.dataset.i);});
    t.addEventListener('keydown',function(e){
      if(e.key==='ArrowDown'||e.key==='ArrowRight'){e.preventDefault();show(cur+1,true);}
      if(e.key==='ArrowUp'||e.key==='ArrowLeft'){e.preventDefault();show(cur-1,true);}
    });
  });
  document.querySelectorAll('.feat-nav button').forEach(function(b){b.addEventListener('click',function(){show(cur+Number(b.dataset.step));});});


  /* ===== Adventures: expanding panels ===== */
  (function(){
    var row=document.getElementById('adv-row'); if(!row) return;
    var advs=[].slice.call(row.querySelectorAll('.adv')), narrow=function(){return innerWidth<=820;};
    function fitOpen(a){ if(!narrow()){a.style.removeProperty('--open-h');return;}
      var b=a.querySelector('.adv-body'); a.style.setProperty('--open-h',Math.max(440,b.scrollHeight+200)+'px'); }
    function open(a,focus){
      advs.forEach(function(x){var on=x===a; x.classList.toggle('is-open',on); x.querySelector('.adv-tab').setAttribute('aria-expanded',on);
        x.querySelectorAll('.adv-body a').forEach(function(l){l.tabIndex=on?0:-1;});});
      fitOpen(a); if(focus) a.querySelector('.adv-body').focus({preventScroll:true});
    }
    advs.forEach(function(a){
      var tab=a.querySelector('.adv-tab'), t;
      a.querySelector('.adv-body').tabIndex=-1;
      tab.addEventListener('click',function(){open(a,true);});
      if(matchMedia('(hover:hover) and (pointer:fine)').matches){
        a.addEventListener('mouseenter',function(){ if(narrow()) return; t=setTimeout(function(){open(a,false);},160); });
        a.addEventListener('mouseleave',function(){clearTimeout(t);});
      }
    });
    open(row.querySelector('.adv.is-open')||advs[0],false);
    addEventListener('resize',function(){var o=row.querySelector('.adv.is-open'); if(o) fitOpen(o);});
    if(!matchMedia('(prefers-reduced-motion: reduce)').matches && 'IntersectionObserver' in window){
      row.classList.add('adv-anim');
      var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){row.classList.add('in');io.disconnect();}});},{threshold:.15});
      io.observe(row);
    }
  })();

  /* ===== Food coverflow ===== */
  (function(){
    var cf=document.getElementById('cf'); if(!cf) return;
    var cards=[].slice.call(cf.querySelectorAll('.cf-card')), n=cards.length, cur=0, dots=document.getElementById('cf-dots');
    cards.forEach(function(c,i){
      var d=document.createElement('button'); d.type='button'; d.setAttribute('aria-label','Show '+c.querySelector('h3').textContent);
      d.addEventListener('click',function(){go(i);}); dots.appendChild(d);
      c.addEventListener('click',function(e){ if(i!==cur){e.preventDefault();go(i);} });
    });
    function size(){
      var w=Math.min(330,Math.round(window.innerWidth*0.74));
      cf.style.setProperty('--cf-w',w+'px');
      var h=0; cards.forEach(function(c){c.style.height='auto';});
      cf.classList.add('ready');
      cards.forEach(function(c){h=Math.max(h,c.offsetHeight); c.style.height='';});
      cf.style.setProperty('--cf-h',h+'px');
      layout();
    }
    function layout(){
      var w=parseFloat(getComputedStyle(cf).getPropertyValue('--cf-w'))||330, small=window.innerWidth<640;
      cards.forEach(function(c,i){
        var d=i-cur; if(d>n/2) d-=n; if(d<-n/2) d+=n;
        var a=Math.abs(d), max=small?1:2;
        var x=d*w*(small?0.78:0.62), s=1-0.13*Math.min(a,3), ry=Math.max(-1,Math.min(1,d))*-14;
        c.style.transform='translateX('+x+'px) scale('+s+') rotateY('+(a?ry:0)+'deg)';
        c.style.opacity=a===0?1:(a<=max?(a===1?0.9:0.45):0);
        c.style.zIndex=10-a;
        c.style.pointerEvents=a<=max?'auto':'none';
        c.classList.toggle('is-center',a===0);
        c.setAttribute('aria-hidden',a===0?'false':'true');
        c.querySelectorAll('a').forEach(function(l){l.tabIndex=a===0?0:-1;});
      });
      [].forEach.call(dots.children,function(b,i){b.setAttribute('aria-current',i===cur);});
    }
    function go(i){cur=(i+n)%n; layout();}
    document.querySelectorAll('.cf-btn').forEach(function(b){b.addEventListener('click',function(){go(cur+Number(b.dataset.step));});});
    cf.addEventListener('keydown',function(e){if(e.key==='ArrowRight'){e.preventDefault();go(cur+1);} if(e.key==='ArrowLeft'){e.preventDefault();go(cur-1);}});
    var x0=null; cf.addEventListener('touchstart',function(e){x0=e.touches[0].clientX;},{passive:true});
    cf.addEventListener('touchend',function(e){if(x0===null)return;var dx=e.changedTouches[0].clientX-x0;if(Math.abs(dx)>40)go(cur+(dx<0?1:-1));x0=null;});

    /* scroll to turn the carousel:
       - sideways scroll (trackpad swipe, Shift + wheel) turns it either way
       - an ordinary wheel steps through the dishes, then hands the scroll back to the page
         at the first / last dish so the page never gets stuck */
    var acc=0, lockUntil=0;
    cf.addEventListener('wheel',function(e){
      if(!cf.classList.contains('ready')) return;
      var sideways=Math.abs(e.deltaX)>Math.abs(e.deltaY), d=sideways?e.deltaX:(e.shiftKey?e.deltaY:e.deltaY);
      if(!sideways && !e.shiftKey){ if((d>0 && cur>=n-1) || (d<0 && cur<=0)) return; }   // let the page scroll on
      e.preventDefault();
      var now=Date.now(); if(now<lockUntil) return;
      acc+=d;
      if(Math.abs(acc)>=40){ var step=acc>0?1:-1; acc=0; lockUntil=now+420;
        if(sideways||e.shiftKey) go(cur+step); else go(Math.min(n-1,Math.max(0,cur+step))); }
    },{passive:false});

    /* click-and-drag with a mouse */
    var px=null, dragged=false;
    cf.addEventListener('pointerdown',function(e){ if(e.pointerType!=='mouse'||e.button!==0) return; px=e.clientX; dragged=false; });
    addEventListener('pointerup',function(e){
      if(px===null) return; var dx=e.clientX-px; px=null;
      if(Math.abs(dx)>40){ dragged=true; go(cur+(dx<0?1:-1)); }
    });
    cf.addEventListener('click',function(e){ if(dragged){ e.preventDefault(); e.stopPropagation(); dragged=false; } },true);
    cf.addEventListener('dragstart',function(e){ e.preventDefault(); });
    var t; window.addEventListener('resize',function(){clearTimeout(t);t=setTimeout(size,120);});
    size();
    cf.querySelectorAll('img').forEach(function(im){ if(!im.complete) im.addEventListener('load',size,{once:true}); });
  })();
  // swipe on touch screens
  var media=document.getElementById('feat-media'), x0=null;
  media.addEventListener('touchstart',function(e){x0=e.touches[0].clientX;},{passive:true});
  media.addEventListener('touchend',function(e){ if(x0===null)return; var dx=e.changedTouches[0].clientX-x0; if(Math.abs(dx)>40) show(cur+(dx<0?1:-1)); x0=null;});
})();
