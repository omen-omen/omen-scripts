/* OMEN app.js (self-mounting) */
/* It injects the entire HTML scaffold if missing, then wires up all hovers. */
(function(){
  "use strict";

  function ready(fn){
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", fn);
    else fn();
  }

  // ---- Inject the scaffold (HTML) if it isn't on the page ----
  function ensureScaffold(){
    if (document.querySelector("#hudWrap")) return; // already present

    var html = [
      '<div class="app">',
        '<div class="omen" aria-hidden="true">OMEN</div>',
        '<div class="top-left">',
          '<a class="corner" id="why">WHY</a>',
          '<a class="corner" id="how">HOW</a>',
          '<a class="corner" id="what">WHAT</a>',
        '</div>',
        '<div class="bottom-left">',
          '<a class="corner" id="breathe">BREATHE</a>',
          '<a class="corner" id="oracle" aria-disabled="true" role="presentation">ORACLE</a>',
          '<a class="corner" id="book">BOOK</a>',
        '</div>',
        '<div class="bottom-right">',
          '<a id="weekly">WEEKLY<span class="mbr"></span> EXPLORATION</a>',
        '</div>',
      '</div>',

      '<div class="hud-wrap" id="hudWrap" aria-hidden="true"><div class="hud" id="hud"></div></div>',

      '<div class="ticker-wrap" id="tickerWrap" aria-hidden="true">',
        '<div class="ticker-rail" id="tickerRail"><div class="ticker" id="tickerText"></div></div>',
      '</div>',

      '<div class="breathe" id="breatheOverlay" aria-hidden="true"><div id="stopBtn">INHALE</div></div>',

      '<div id="breathingBar" aria-hidden="true">',
        '<div class="layer layer-a">',
          '<div class="seg top"></div><div class="seg right"></div>',
          '<div class="seg bottom"></div><div class="seg left"></div>',
        '</div>',
        '<div class="layer layer-b">',
          '<div class="seg top"></div><div class="seg right"></div>',
          '<div class="seg bottom"></div><div class="seg left"></div>',
        '</div>',
      '</div>'
    ].join("");

    document.body.insertAdjacentHTML("beforeend", html);
  }

  ready(function init(){
    ensureScaffold(); // make sure the DOM exists even if Carrd has nothing embedded

    var $ = function(q){ return document.querySelector(q); };
    var isTouch = ("ontouchstart" in window) || (navigator.maxTouchPoints>0) || (navigator.msMaxTouchPoints>0);

    // elements
    var hudWrap = $("#hudWrap"), hud = $("#hud");
    var why = $("#why"), how = $("#how"), what = $("#what"), book = $("#book");
    var oracle = $("#oracle");

    var weeklyLink = $("#weekly"), tickerWrap = $("#tickerWrap"),
        tickerRail = $("#tickerRail"), tickerText = $("#tickerText");

    var breatheLink = $("#breathe"), breatheOverlay = $("#breatheOverlay"), stopBtn = $("#stopBtn");

    var breathingBar = $("#breathingBar"),
        layerA = breathingBar ? breathingBar.querySelector(".layer-a") : null,
        layerB = breathingBar ? breathingBar.querySelector(".layer-b") : null;

    var topLeft = document.querySelector(".top-left");

    // prevent clicks (desktop) but keep hover
    if (!isTouch){
      var anchors = document.querySelectorAll("a");
      for (var i=0;i<anchors.length;i++){
        anchors[i].addEventListener("click", function(e){ e.preventDefault(); e.stopPropagation(); });
      }
    }

    // ---------- HUD ----------
    function openHud(text){
      hud.textContent = text || "";
      hudWrap.classList.add("is-visible");
      hudWrap.setAttribute("aria-hidden","false");
    }
    function closeHud(){
      hudWrap.classList.remove("is-visible");
      hudWrap.setAttribute("aria-hidden","true");
      hud.textContent = "";
    }
    var overHud=false, hudHideTimer=null;
    function armHudHide(){ clearTimeout(hudHideTimer); hudHideTimer=setTimeout(function(){ if(!overHud) closeHud(); },180); }
    function wireHud(el,text){
      el.addEventListener("mouseenter", function(){ overHud=true; openHud(text); clearTimeout(hudHideTimer); });
      el.addEventListener("mouseleave", function(){ overHud=false; armHudHide(); });
    }

    wireHud(why,  "OMEN OFFERS A WEEKLY ORIENTING SIGNAL SO YOU CAN CUT THROUGH NOISE, RESET YOUR NERVOUS SYSTEM, AND RETURN TO WHAT IS ESSENTIAL.");
    wireHud(how,  "HOVER WEEKLY EXPLORATION TO READ THE WEEK’S LINE WHILE A THIN BORDER LOOPS. HOVER BREATHE FOR A BLANK FIELD WITH A THICKER LOOPING BORDER.");
    wireHud(what, "OMEN IS A MINIMAL ORACLE—PART RITUAL, PART TOOL. ONE PRECISE PROMPT PER WEEK AND A BREATHING FRAME TO HOLD YOUR ATTENTION.");
    wireHud(book, "COMING SOON");
    hud.addEventListener("mouseenter", function(){ overHud=true; clearTimeout(hudHideTimer); });
    hud.addEventListener("mouseleave", function(){ overHud=false; armHudHide(); });

    // mobile sticky
    if (isTouch){
      function sticky(el,text){
        el.addEventListener("touchstart", function(e){ e.preventDefault(); e.stopPropagation(); openHud(text); }, {passive:false});
        el.addEventListener("click", function(e){ e.preventDefault(); e.stopPropagation(); openHud(text); });
      }
      sticky(why,  "OMEN OFFERS A WEEKLY ORIENTING SIGNAL SO YOU CAN CUT THROUGH NOISE, RESET YOUR NERVOUS SYSTEM, AND RETURN TO WHAT IS ESSENTIAL.");
      sticky(how,  "HOVER WEEKLY EXPLORATION TO READ THE WEEK’S LINE WHILE A THIN BORDER LOOPS. HOVER BREATHE FOR A BLANK FIELD WITH A THICKER LOOPING BORDER.");
      sticky(what, "OMEN IS A MINIMAL ORACLE—PART RITUAL, PART TOOL. ONE PRECISE PROMPT PER WEEK AND A BREATHING FRAME TO HOLD YOUR ATTENTION.");
      sticky(book, "COMING SOON");
      document.addEventListener("touchstart", function(ev){
        var t=ev.target; if(!(topLeft&&topLeft.contains(t)) && !(hud&&hud.contains(t))) closeHud();
      }, {passive:true});
      document.addEventListener("click", function(ev){
        var t=ev.target; if(!(topLeft&&topLeft.contains(t)) && !(hud&&hud.contains(t))) closeHud();
      });
    }

    // ---------- ORACLE ----------
    var MOMENTS = window.MOMENTS || [];
    function getDailyIndex(len){
      var K_DATE="omen_oracle_date", K_IDX="omen_oracle_idx";
      var today=(new Date()).toISOString().slice(0,10);
      var sd=localStorage.getItem(K_DATE), si=localStorage.getItem(K_IDX);
      if(sd===today && si!=null) return Number(si);
      var idx=Math.floor(Math.random()*Math.max(1,len||1));
      if(si!=null && len>1 && Number(si)===idx) idx=(idx+1)%len;
      localStorage.setItem(K_DATE,today); localStorage.setItem(K_IDX,String(idx));
      return idx;
    }
    function getTitle(m){ return (m&&m.title)||"UNTITLED"; }
    function getLines(m){ return (m&&m.levels)||(m&&m.lines)||[]; }

    function showOracle(m){
      var wrap=document.createElement("div"); wrap.className="hud-content";
      var title=document.createElement("div"); title.className="hud-title"; title.textContent=getTitle(m); wrap.appendChild(title);
      var holder=document.createElement("div"); holder.style.display="flex"; holder.style.flexDirection="column"; holder.style.alignItems="center"; wrap.appendChild(holder);
      hud.textContent=""; hud.appendChild(wrap);
      hudWrap.classList.add("is-visible"); hudWrap.setAttribute("aria-hidden","false");
      var lines=getLines(m).slice(0,3);
      for(var i=0;i<lines.length;i++){
        (function(line,delay){
          setTimeout(function(){
            var p=document.createElement("div"); p.className="hud-line"; p.textContent=line; holder.appendChild(p);
            setTimeout(function(){ p.style.opacity="1"; },0);
          },delay);
        })(lines[i],(i+1)*1000);
      }
    }
    function oracleOpen(){ var idx=getDailyIndex((window.MOMENTS||MOMENTS).length); showOracle((window.MOMENTS||MOMENTS)[idx]||{}); }
    var over=false;
    oracle.addEventListener("mouseenter", function(){ over=true; oracleOpen(); });
    oracle.addEventListener("mouseleave", function(){ over=false; armHudHide(); });
    if (isTouch){
      oracle.addEventListener("touchstart", function(e){ e.preventDefault(); e.stopPropagation(); oracleOpen(); }, {passive:false});
      oracle.addEventListener("click", function(e){ e.preventDefault(); e.stopPropagation(); oracleOpen(); });
      document.addEventListener("touchstart", function(ev){ var t=ev.target; if(t!==oracle && !(hud&&hud.contains(t))) closeHud(); }, {passive:true});
      document.addEventListener("click", function(ev){ var t=ev.target; if(t!==oracle && !(hud&&hud.contains(t))) closeHud(); });
    }

    // ---------- Snake (double buffer) ----------
    var timers=[], loopInt=null, startBto=null, barRunning=false;
    function clearTimers(){ while(timers.length) clearTimeout(timers.pop()); }
    function resetLayer(layer){
      if(!layer) return;
      layer.classList.remove("run");
      var segs=layer.querySelectorAll(".seg");
      for(var i=0;i<segs.length;i++){ segs[i].classList.remove("is-fading"); segs[i].style.animation="none"; }
      void layer.offsetWidth;
      for(var j=0;j<segs.length;j++){ segs[j].style.animation=""; }
    }
    function startLayer(layer){
      if(!layer) return;
      resetLayer(layer);
      layer.classList.add("run");
      timers.push(setTimeout(function(){ var s=layer.querySelector(".right");  if(s) s.classList.add("is-fading"); },12000)); // 12s → 14s
      timers.push(setTimeout(function(){ var s=layer.querySelector(".bottom"); if(s) s.classList.add("is-fading"); },14000)); // 14s → 16s
      timers.push(setTimeout(function(){ var s=layer.querySelector(".top");    if(s) s.classList.add("is-fading"); },16000)); // 16s
      timers.push(setTimeout(function(){ var s=layer.querySelector(".left");   if(s) s.classList.add("is-fading"); },16000));
    }
    function barStart(thick){
      if(barRunning) return;
      barRunning=true;
      document.body.classList.toggle("small-bar", !thick);
      document.body.classList.toggle("big-bar", !!thick);
      breathingBar.classList.add("is-active");
      clearTimers(); if(loopInt) clearInterval(loopInt); if(startBto) clearTimeout(startBto);
      startLayer(layerA);
      startBto=setTimeout(function(){ startLayer(layerB); },16000);
      loopInt=setInterval(function(){
        resetLayer(layerA); startLayer(layerA);
        setTimeout(function(){ resetLayer(layerB); startLayer(layerB); },16000);
      },32000);
    }
    function barStop(){
      if(!barRunning) return;
      barRunning=false;
      breathingBar.classList.remove("is-active");
      clearTimers(); if(loopInt) clearInterval(loopInt); loopInt=null; if(startBto) clearTimeout(startBto); startBto=null;
      resetLayer(layerA); resetLayer(layerB);
    }

    // ---------- Weekly ----------
    function weeklyText(){
      var pools=[], src=window.EXPLORATIONS||{};
      for(var k in src){ if(Object.prototype.hasOwnProperty.call(src,k) && Array.isArray(src[k])) pools=pools.concat(src[k]); }
      if(!pools.length) return "NO EXPLORATIONS LOADED";
      var item=pools[0]; return (typeof item==='string')? item : (item.text||JSON.stringify(item));
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
      tickerText.textContent=weeklyText();
      tickerWrap.classList.add("is-visible"); tickerWrap.setAttribute("aria-hidden","false");
      weeklyOpen=true; barStart(false); restartWeeklyLabels();
    }
    function hideWeekly(){
      tickerWrap.classList.remove("is-visible"); tickerWrap.setAttribute("aria-hidden","true");
      weeklyOpen=false; clearWeeklyLabelTimers(); if(breatheLink) breatheLink.textContent="BREATHE"; barStop();
    }
    var overWeekly=false, overRail=false;
    weeklyLink.addEventListener("mouseenter", function(){ overWeekly=true; showWeekly(); });
    weeklyLink.addEventListener("mouseleave", function(){ overWeekly=false; scheduleHideWeekly(); });
    tickerRail.addEventListener("mouseenter", function(){ overRail=true; clearTimeout(weeklyHideTimer); });
    tickerRail.addEventListener("mouseleave", function(){ overRail=false; scheduleHideWeekly(); });
    function scheduleHideWeekly(){ clearTimeout(weeklyHideTimer); weeklyHideTimer=setTimeout(function(){ if(!overWeekly && !overRail) hideWeekly(); },300); }
    if(isTouch){
      weeklyLink.addEventListener("touchstart", function(e){ e.preventDefault(); e.stopPropagation(); showWeekly(); }, {passive:false});
      weeklyLink.addEventListener("click", function(e){ e.preventDefault(); e.stopPropagation(); showWeekly(); });
      document.addEventListener("touchstart", function(ev){ var t=ev.target; if(t!==weeklyLink && !(tickerRail && tickerRail.contains(t))) hideWeekly(); }, {passive:true});
      document.addEventListener("click", function(ev){ var t=ev.target; if(t!==weeklyLink && !(tickerRail && tickerRail.contains(t))) hideWeekly(); });
    }

    // ---------- BREATHE ----------
    var centerWordsLoop=null;
    function startCenterWords(){
      var words=["INHALE","HOLD","EXHALE","HOLD"], i=0;
      stopBtn.textContent=words[0];
      clearInterval(centerWordsLoop);
      centerWordsLoop=setInterval(function(){ i=(i+1)%words.length; stopBtn.textContent=words[i]; },4000);
    }
    function stopCenterWords(){ clearInterval(centerWordsLoop); centerWordsLoop=null; }
    function enterBreathe(){ hideWeekly(); breatheOverlay.classList.add("is-open"); breatheOverlay.setAttribute("aria-hidden","false"); barStart(true); startCenterWords(); }
    function exitBreathe(){ stopCenterWords(); barStop(); breatheOverlay.classList.remove("is-open"); breatheOverlay.setAttribute("aria-hidden","true"); }
    breatheLink.addEventListener("mouseenter", enterBreathe);
    breatheLink.addEventListener("mouseleave", exitBreathe);
    if(isTouch){
      breatheLink.addEventListener("touchstart", function(e){ e.preventDefault(); e.stopPropagation(); enterBreathe(); }, {passive:false});
      breatheLink.addEventListener("click", function(e){ e.preventDefault(); e.stopPropagation(); enterBreathe(); });
      document.addEventListener("touchstart", function(ev){ var t=ev.target; if(t!==breatheLink) exitBreathe(); }, {passive:true});
      document.addEventListener("click", function(ev){ var t=ev.target; if(t!==breatheLink) exitBreathe(); });
    }

    // ESC to close overlays
    document.addEventListener("keydown", function(e){
      if(e.key==="Escape"){ closeHud(); exitBreathe(); hideWeekly(); }
    });
  });
})();
