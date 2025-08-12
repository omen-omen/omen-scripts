/* ================= OMEN app.js ================= */
(function () {
  "use strict";

  function ready(fn){
    if(document.readyState === "loading"){ document.addEventListener("DOMContentLoaded", fn); }
    else { fn(); }
  }

  ready(function init(){
    var $ = function(q){ return document.querySelector(q); };
    var isTouch = ("ontouchstart" in window) || (navigator.maxTouchPoints>0) || (navigator.msMaxTouchPoints>0);

    /* ---------- Elements ---------- */
    var hudWrap=$("#hudWrap"), hud=$("#hud");
    var why=$("#why"), how=$("#how"), what=$("#what"), book=$("#book"), oracle=$("#oracle");
    var weeklyLink=$("#weekly"), tickerWrap=$("#tickerWrap"), tickerRail=$("#tickerRail"), tickerText=$("#tickerText");
    var breatheLink=$("#breathe"), breatheOverlay=$("#breatheOverlay"), stopBtn=$("#stopBtn");
    var breathingBar=$("#breathingBar"), layerA=breathingBar && breathingBar.querySelector(".layer-a"), layerB=breathingBar && breathingBar.querySelector(".layer-b");
    var topLeft=document.querySelector(".top-left");

    /* Prevent clicks (hover-only UX on desktop) */
    if(!isTouch){
      document.querySelectorAll("a").forEach(function(a){
        a.addEventListener("click", function(e){ e.preventDefault(); e.stopPropagation(); });
      });
    }

    /* ---------- HUD (WHY/HOW/WHAT/BOOK) ---------- */
    function openHud(text){
      if(!hudWrap || !hud) return;
      hud.textContent = text || "";
      hudWrap.classList.add("is-visible");
      hudWrap.setAttribute("aria-hidden","false");
    }
    function closeHud(){
      if(!hudWrap || !hud) return;
      hudWrap.classList.remove("is-visible");
      hudWrap.setAttribute("aria-hidden","true");
      hud.textContent = "";
    }
    var over=false, hideT=null;
    function armHide(){ clearTimeout(hideT); hideT=setTimeout(function(){ if(!over) closeHud(); },180); }
    function wireHud(el, text){
      if(!el) return;
      el.addEventListener("mouseenter",function(){ over=true; openHud(text); clearTimeout(hideT); });
      el.addEventListener("mouseleave",function(){ over=false; armHide(); });
    }
    wireHud(why,"OMEN OFFERS A WEEKLY ORIENTING SIGNAL SO YOU CAN CUT THROUGH NOISE, RESET YOUR NERVOUS SYSTEM, AND RETURN TO WHAT IS ESSENTIAL.");
    wireHud(how,"HOVER WEEKLY EXPLORATION TO READ THE WEEK’S LINE WHILE A THIN BORDER LOOPS. HOVER BREATHE FOR A BLANK FIELD WITH A THICKER LOOPING BORDER.");
    wireHud(what,"OMEN IS A MINIMAL ORACLE—PART RITUAL, PART TOOL. ONE PRECISE PROMPT PER WEEK AND A BREATHING FRAME TO HOLD YOUR ATTENTION.");
    wireHud(book,"COMING SOON");
    if(hud){
      hud.addEventListener("mouseenter",function(){ over=true; clearTimeout(hideT); });
      hud.addEventListener("mouseleave",function(){ over=false; armHide(); });
    }
    if(isTouch){
      function sticky(el,text){
        if(!el) return;
        el.addEventListener("touchstart",function(e){ e.preventDefault(); e.stopPropagation(); openHud(text); },{passive:false});
        el.addEventListener("click",function(e){ e.preventDefault(); e.stopPropagation(); openHud(text); });
      }
      sticky(why,  "OMEN OFFERS A WEEKLY ORIENTING SIGNAL SO YOU CAN CUT THROUGH NOISE, RESET YOUR NERVOUS SYSTEM, AND RETURN TO WHAT IS ESSENTIAL.");
      sticky(how,  "HOVER WEEKLY EXPLORATION TO READ THE WEEK’S LINE WHILE A THIN BORDER LOOPS. HOVER BREATHE FOR A BLANK FIELD WITH A THICKER LOOPING BORDER.");
      sticky(what, "OMEN IS A MINIMAL ORACLE—PART RITUAL, PART TOOL. ONE PRECISE PROMPT PER WEEK AND A BREATHING FRAME TO HOLD YOUR ATTENTION.");
      sticky(book, "COMING SOON");
      document.addEventListener("touchstart",function(ev){ var t=ev.target; if(!(topLeft&&topLeft.contains(t)) && !(hud&&hud.contains(t))) closeHud(); },{passive:true});
      document.addEventListener("click",function(ev){ var t=ev.target; if(!(topLeft&&topLeft.contains(t)) && !(hud&&hud.contains(t))) closeHud(); });
    }

    /* ---------- ORACLE ---------- */
    var MOMENTS=window.MOMENTS||[];
    function getDailyIndex(len){
      var K_DATE='omen_oracle_date',K_IDX='omen_oracle_idx';
      var today=(new Date()).toISOString().slice(0,10);
      var sd=localStorage.getItem(K_DATE), si=localStorage.getItem(K_IDX);
      if(sd===today && si!=null) return Number(si);
      var idx=Math.floor(Math.random()*Math.max(1,len||1));
      if(si!=null && len>1 && Number(si)===idx) idx=(idx+1)%len;
      localStorage.setItem(K_DATE,today); localStorage.setItem(K_IDX,String(idx));
      return idx;
    }
    function getTitle(m){ return (m&&m.title)||'UNTITLED'; }
    function getLines(m){ return (m&&m.levels)||(m&&m.lines)||[]; }
    function showOracle(m){
      if(!hud||!hudWrap) return;
      var wrap=document.createElement('div'); wrap.className='hud-content';
      var title=document.createElement('div'); title.className='hud-title'; title.textContent=getTitle(m); wrap.appendChild(title);
      var holder=document.createElement('div'); holder.style.display='flex'; holder.style.flexDirection='column'; holder.style.alignItems='center'; wrap.appendChild(holder);
      hud.textContent=''; hud.appendChild(wrap);
      hudWrap.classList.add('is-visible'); hudWrap.setAttribute('aria-hidden','false');
      var lines=getLines(m).slice(0,3);
      for(var i=0;i<lines.length;i++){
        (function(line,delay){
          setTimeout(function(){ var p=document.createElement('div'); p.className='hud-line'; p.textContent=line; holder.appendChild(p); requestAnimationFrame(function(){ p.style.opacity='1'; }); },delay);
        })(lines[i],(i+1)*1000);
      }
    }
    if(oracle){
      oracle.addEventListener('mouseenter',function(){ over=true; showOracle(MOMENTS[getDailyIndex(MOMENTS.length)]||{}); });
      oracle.addEventListener('mouseleave',function(){ over=false; armHide(); });
      if(isTouch){
        oracle.addEventListener('touchstart',function(e){ e.preventDefault(); e.stopPropagation(); showOracle(MOMENTS[getDailyIndex(MOMENTS.length)]||{}); },{passive:false});
        oracle.addEventListener('click',function(e){ e.preventDefault(); e.stopPropagation(); showOracle(MOMENTS[getDailyIndex(MOMENTS.length)]||{}); });
      }
    }

    /* ---------- Snake (double buffer, robust first start) ---------- */
    var timers=[], loopInt=null, startBto=null, barRunning=false;

    function clearTimers(){ while(timers.length) clearTimeout(timers.pop()); }

    function resetLayer(layer){
      if(!layer) return;
      layer.classList.remove('run');
      layer.querySelectorAll('.seg').forEach(function(seg){
        seg.classList.remove('is-fading');
        seg.style.animation = 'none';
      });
      // reflow to apply 'none', then clear to let CSS keyframes re-attach
      layer.offsetWidth;  // force reflow
      layer.querySelectorAll('.seg').forEach(function(seg){ seg.style.animation = ''; });
    }

    function fadeAll(layer){
      ['.top','.right','.bottom','.left'].forEach(function(sel){
        var s=layer.querySelector(sel); if(s) s.classList.add('is-fading');
      });
    }

    function startLayer(layer){
      if(!layer) return;
      resetLayer(layer);
      // delay adding .run by two RAFs so browsers treat it as a fresh start
      requestAnimationFrame(function(){
        requestAnimationFrame(function(){
          layer.classList.add('run');
          timers.push(setTimeout(function(){ fadeAll(layer); }, 16000)); // all sides fade together at 16s
        });
      });
    }

    function barStart(thick){
      if(barRunning) return;
      barRunning = true;

      document.body.classList.toggle('small-bar', !thick);
      document.body.classList.toggle('big-bar',  !!thick);
      if(breathingBar) breathingBar.classList.add('is-active');

      clearTimers(); if(loopInt) clearInterval(loopInt); if(startBto) clearTimeout(startBto);

      // Hard reset both layers before first start
      resetLayer(layerA); resetLayer(layerB);

      // Start A immediately; B after 16s for seamless overlap
      startLayer(layerA);
      startBto = setTimeout(function(){ startLayer(layerB); }, 16000);

      // Loop every 32s with same staggering
      loopInt = setInterval(function(){
        resetLayer(layerA); startLayer(layerA);
        setTimeout(function(){ resetLayer(layerB); startLayer(layerB); }, 16000);
      }, 32000);
    }

    function barStop(){
      if(!barRunning) return;
      barRunning=false;
      if(breathingBar) breathingBar.classList.remove('is-active');
      clearTimers(); if(loopInt) clearInterval(loopInt); loopInt=null; if(startBto) clearTimeout(startBto); startBto=null;
      resetLayer(layerA); resetLayer(layerB);
    }

    /* ---------- Weekly (thin snake + ticker + BREATHE label cycle) ---------- */
    function weeklyText(){
      var src = window.EXPLORATIONS || window.explorations || {};
      var list = [];
      if(Array.isArray(src)) list = src;
      else { for(var k in src){ if(Object.prototype.hasOwnProperty.call(src,k) && Array.isArray(src[k])) list=list.concat(src[k]); } }
      if(!list.length) return "NO EXPLORATIONS LOADED";
      var item=list[0]; return (typeof item==='string') ? item : (item.text || item.title || "EXPLORATION");
    }

    var weeklyOpen=false, weeklyHideTimer=null, labelLoop=null, labelTs=[];
    function clearWeeklyLabelTimers(){ for(var i=0;i<labelTs.length;i++) clearTimeout(labelTs[i]); labelTs=[]; if(labelLoop){ clearInterval(labelLoop); labelLoop=null; } }
    function runWeeklyLabelCycleOnce(){
      var seq=["INHALE","HOLD","EXHALE","HOLD"];
      for(var i=0;i<seq.length;i++){
        (function(word,delay){ labelTs.push(setTimeout(function(){ if(weeklyOpen && breatheLink) breatheLink.textContent=word; },delay)); })(seq[i], i*4000);
      }
    }
    function restartWeeklyLabels(){ clearWeeklyLabelTimers(); runWeeklyLabelCycleOnce(); labelLoop=setInterval(function(){ clearWeeklyLabelTimers(); runWeeklyLabelCycleOnce(); },16000); }

    function showWeekly(){
      if(weeklyOpen) return;
      if(tickerText) tickerText.textContent = weeklyText();
      if(tickerWrap){ tickerWrap.classList.add('is-visible'); tickerWrap.setAttribute('aria-hidden','false'); }
      weeklyOpen = true;
      barStart(false);      // thin snake
      restartWeeklyLabels();
    }
    function hideWeekly(){
      if(tickerWrap){ tickerWrap.classList.remove('is-visible'); tickerWrap.setAttribute('aria-hidden','true'); }
      weeklyOpen=false; clearWeeklyLabelTimers(); if(breatheLink) breatheLink.textContent='BREATHE';
      barStop();
    }
    var overWeekly=false, overRail=false;
    if(weeklyLink){
      weeklyLink.addEventListener('mouseenter',function(){ overWeekly=true; showWeekly(); });
      weeklyLink.addEventListener('mouseleave',function(){ overWeekly=false; scheduleHideWeekly(); });
    }
    if(tickerRail){
      tickerRail.addEventListener('mouseenter',function(){ overRail=true; clearTimeout(weeklyHideTimer); });
      tickerRail.addEventListener('mouseleave',function(){ overRail=false; scheduleHideWeekly(); });
    }
    function scheduleHideWeekly(){ clearTimeout(weeklyHideTimer); weeklyHideTimer=setTimeout(function(){ if(!overWeekly && !overRail) hideWeekly(); },300); }
    if(isTouch && weeklyLink){
      weeklyLink.addEventListener('touchstart',function(e){ e.preventDefault(); e.stopPropagation(); showWeekly(); },{passive:false});
      weeklyLink.addEventListener('click',function(e){ e.preventDefault(); e.stopPropagation(); showWeekly(); });
      document.addEventListener('touchstart',function(ev){ var t=ev.target; if(t!==weeklyLink && !(tickerRail && tickerRail.contains(t))) hideWeekly(); },{passive:true});
      document.addEventListener('click',function(ev){ var t=ev.target; if(t!==weeklyLink && !(tickerRail && tickerRail.contains(t))) hideWeekly(); });
    }

    /* ---------- BREATHE (thick snake + center words) ---------- */
    var centerWordsLoop=null;
    function startCenterWords(){
      var words=["INHALE","HOLD","EXHALE","HOLD"], i=0;
      if(stopBtn) stopBtn.textContent=words[0];
      clearInterval(centerWordsLoop);
      centerWordsLoop=setInterval(function(){ i=(i+1)%words.length; if(stopBtn) stopBtn.textContent=words[i]; },4000);
    }
    function stopCenterWords(){ clearInterval(centerWordsLoop); centerWordsLoop=null; }
    function enterBreathe(){ hideWeekly(); if(breatheOverlay){ breatheOverlay.classList.add('is-open'); breatheOverlay.setAttribute('aria-hidden','false'); } barStart(true); startCenterWords(); }
    function exitBreathe(){ stopCenterWords(); barStop(); if(breatheOverlay){ breatheOverlay.classList.remove('is-open'); breatheOverlay.setAttribute('aria-hidden','true'); } }

    if(breatheLink){
      breatheLink.addEventListener('mouseenter', enterBreathe);
      breatheLink.addEventListener('mouseleave', exitBreathe);
      if(isTouch){
        breatheLink.addEventListener('touchstart',function(e){ e.preventDefault(); e.stopPropagation(); enterBreathe(); },{passive:false});
        breatheLink.addEventListener('click',function(e){ e.preventDefault(); e.stopPropagation(); enterBreathe(); });
        document.addEventListener('touchstart',function(ev){ var t=ev.target; if(t!==breatheLink) exitBreathe(); },{passive:true});
        document.addEventListener('click',function(ev){ var t=ev.target; if(t!==breatheLink) exitBreathe(); });
      }
    }

    /* ESC closes overlays */
    document.addEventListener('keydown',function(e){ if(e.key==='Escape'){ closeHud(); exitBreathe(); hideWeekly(); } });
  });
})();
