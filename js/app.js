/* ================= OMEN app.js — click-to-toggle + Carrd form overlay (no DOM moves) ================= */
(function () {
  "use strict";

  function ready(fn){
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", fn);
    else fn();
  }

  ready(function init(){
    var $ = function(q){ return document.querySelector(q); };

    /* ---------- Elements ---------- */
    var hudWrap=$("#hudWrap"), hud=$("#hud");
    var why=$("#why"), how=$("#how"), what=$("#what"),
        devices=$("#devices"), oracle=$("#oracle");
    var weeklyLink=$("#weekly"), tickerWrap=$("#tickerWrap"), tickerRail=$("#tickerRail"), tickerText=$("#tickerText");
    var breatheLink=$("#breathe"), breatheOverlay=$("#breatheOverlay"), stopBtn=$("#stopBtn");
    var breathingBar=$("#breathingBar"),
        layerA=breathingBar && breathingBar.querySelector(".layer-a"),
        layerB=breathingBar && breathingBar.querySelector(".layer-b");
    var form01 = $("#form01"); // Carrd form (we never remove it from the DOM)

    // Bail if core scaffold missing; fail quietly
    if(!hudWrap||!hud||!weeklyLink||!tickerWrap||!tickerRail||!tickerText||!breatheLink||!breatheOverlay||!stopBtn||!breathingBar||!layerA||!layerB){
      return;
    }

    /* ---------- OMEN title → Instagram ---------- */
    (function(){
      var omenTitle = document.querySelector(".omen");
      var IG_URL = "https://www.instagram.com/omen___omen/";
      function openIG(){ window.open(IG_URL, "_blank", "noopener"); }
      if (omenTitle) {
        omenTitle.style.pointerEvents = "auto";
        omenTitle.style.cursor = "pointer";
        omenTitle.style.zIndex = "5000";
        omenTitle.setAttribute("role","link");
        omenTitle.setAttribute("tabindex","0");
        omenTitle.setAttribute("aria-label","Open OMEN Instagram");
        omenTitle.addEventListener("click", function(e){ openIG(); e.preventDefault(); e.stopPropagation(); });
        omenTitle.addEventListener("touchstart", function(e){ openIG(); e.preventDefault(); e.stopPropagation(); }, {passive:false});
        omenTitle.addEventListener("keydown", function(e){ if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openIG(); } });
        document.addEventListener("click", function(e){
          if (e.target && e.target.closest(".omen")) { openIG(); e.preventDefault(); e.stopPropagation(); }
        }, true);
      }
    })();

    /* ================= Shared HUD helpers ================= */
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

    /* ================= Oracle ================= */
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
      var wrap=document.createElement('div'); wrap.className='hud-content';
      var title=document.createElement('div'); title.className='hud-title'; title.textContent=getTitle(m); wrap.appendChild(title);
      var holder=document.createElement('div'); holder.style.display='flex'; holder.style.flexDirection='column'; holder.style.alignItems='center'; wrap.appendChild(holder);
      hud.textContent=''; hud.appendChild(wrap);
      hudWrap.classList.add('is-visible'); hudWrap.setAttribute('aria-hidden','false');
      var lines=getLines(m).slice(0,3);
      for(var i=0;i<lines.length;i++){
        (function(line,delay){
          setTimeout(function(){
            var p=document.createElement('div'); p.className='hud-line'; p.textContent=line; holder.appendChild(p);
            requestAnimationFrame(function(){ p.style.opacity='1'; });
          },delay);
        })(lines[i],(i+1)*1000);
      }
    }

    /* ================= Weekly ticker + breathing bar ================= */
    var timers=[], loopInt=null, startBto=null, barRunning=false;

    function clearTimers(){ while(timers.length) clearTimeout(timers.pop()); }

    function resetLayer(layer){
      if(!layer) return;
      layer.classList.remove('run');
      layer.querySelectorAll('.seg').forEach(function(seg){
        seg.classList.remove('is-fading');
        seg.style.animation='none';
      });
      layer.offsetWidth;  // reflow
      layer.querySelectorAll('.seg').forEach(function(seg){ seg.style.animation=''; });
    }

    function fadeAll(layer){
      ['.top','.right','.bottom','.left'].forEach(function(sel){
        var s=layer.querySelector(sel); if(s) s.classList.add('is-fading');
      });
    }

    function startLayer(layer){
      if(!layer) return;
      resetLayer(layer);
      requestAnimationFrame(function(){
        requestAnimationFrame(function(){
          layer.classList.add('run');
          timers.push(setTimeout(function(){ fadeAll(layer); }, 16000));
        });
      });
    }

    function barStart(thick){
      if(barRunning) return;
      barRunning=true;
      document.body.classList.toggle('small-bar', !thick);
      document.body.classList.toggle('big-bar',  !!thick);
      breathingBar.classList.add('is-active');
      clearTimers(); if(loopInt) clearInterval(loopInt); if(startBto) clearTimeout(startBto);
      resetLayer(layerA); resetLayer(layerB);
      startLayer(layerA);
      startBto = setTimeout(function(){ startLayer(layerB); }, 16000);
      loopInt = setInterval(function(){
        resetLayer(layerA); startLayer(layerA);
        setTimeout(function(){ resetLayer(layerB); startLayer(layerB); }, 16000);
      }, 32000);
    }

    function barStop(){
      if(!barRunning) return;
      barRunning=false;
      breathingBar.classList.remove('is-active');
      clearTimers(); if(loopInt) clearInterval(loopInt); loopInt=null; if(startBto) clearTimeout(startBto); startBto=null;
      resetLayer(layerA); resetLayer(layerB);
    }

    function weeklyText(){
      var src = window.EXPLORATIONS || window.explorations || {};
      var list = [];
      if(Array.isArray(src)) list = src;
      else { for(var k in src){ if(Object.prototype.hasOwnProperty.call(src,k) && Array.isArray(src[k])) list=list.concat(src[k]); } }
      if(!list.length) return "NO EXPLORATIONS LOADED";
      var item=list[0]; return (typeof item==='string') ? item : (item.text || item.title || "EXPLORATION");
    }

    var weeklyOpen=false, labelLoop=null, labelTs=[];
    function clearWeeklyLabelTimers(){ for(var i=0;i<labelTs.length;i++) clearTimeout(labelTs[i]); labelTs=[]; if(labelLoop){ clearInterval(labelLoop); labelLoop=null; } }
    function runWeeklyLabelCycleOnce(){
      var seq=["INHALE","HOLD","EXHALE","HOLD"];
      for(var i=0;i<seq.length;i++){
        (function(word,delay){
          labelTs.push(setTimeout(function(){ if(weeklyOpen && breatheLink) breatheLink.textContent=word; },delay));
        })(seq[i], i*4000);
      }
    }
    function restartWeeklyLabels(){ clearWeeklyLabelTimers(); runWeeklyLabelCycleOnce(); labelLoop=setInterval(function(){ clearWeeklyLabelTimers(); runWeeklyLabelCycleOnce(); },16000); }

    function showWeekly(){
      if(weeklyOpen) return;
      tickerText.textContent = weeklyText();
      tickerWrap.classList.add("is-visible"); tickerWrap.setAttribute("aria-hidden","false");
      weeklyOpen = true;
      barStart(false);
      restartWeeklyLabels();
    }
    function hideWeekly(){
      tickerWrap.classList.remove("is-visible"); tickerWrap.setAttribute("aria-hidden","true");
      weeklyOpen=false; clearWeeklyLabelTimers(); if(breatheLink) breatheLink.textContent="BREATHE";
      barStop();
    }

    /* ================= BREATHE overlay ================= */
    var centerWordsLoop=null;
    function startCenterWords(){
      var words=["INHALE","HOLD","EXHALE","HOLD"], i=0;
      stopBtn.textContent = words[0];
      clearInterval(centerWordsLoop);
      centerWordsLoop=setInterval(function(){ i=(i+1)%words.length; stopBtn.textContent=words[i]; },4000);
    }
    function stopCenterWords(){ clearInterval(centerWordsLoop); centerWordsLoop=null; }

    function enterBreathe(){
      hideWeekly();
      breatheOverlay.classList.add("is-open"); breatheOverlay.setAttribute("aria-hidden","false");
      barStart(true);
      startCenterWords();
      // global click-to-close
      setTimeout(function(){ document.addEventListener("click", globalBreatheClose, true); }, 0);
      setTimeout(function(){ document.addEventListener("touchstart", globalBreatheClose, {passive:true, capture:true}); }, 0);
    }
    function exitBreathe(){
      stopCenterWords();
      barStop();
      breatheOverlay.classList.remove("is-open"); breatheOverlay.setAttribute("aria-hidden","true");
      document.removeEventListener("click", globalBreatheClose, true);
      document.removeEventListener("touchstart", globalBreatheClose, true);
    }
    function globalBreatheClose(){ if (breatheOverlay.classList.contains("is-open")) exitBreathe(); }

    // Also close if you click directly on the overlay element
    breatheOverlay.addEventListener("click", function(){ exitBreathe(); }, true);
    breatheOverlay.addEventListener("touchstart", function(){ exitBreathe(); }, { passive: true, capture: true });

    /* ================= DEVICES — overlay using the real Carrd Form (#form01) ================= */
    var devicesOverlay = null, devicesContent = null;
    var formWrap = null; // a higher wrapper around the form

    // Find & hide the wrapper + form on load so nothing leaks on base page
    if (form01) {
      var p = form01;
      for (var i = 0; i < 3 && p && p.parentElement; i++) p = p.parentElement;
      formWrap = p || form01.parentElement;
      if (formWrap) formWrap.style.display = "none";
      form01.style.display = "none";
    }

    // Normalize Carrd form before first paint (prevents WEB URL & right-shift)
    function normalizeCarrdForm(){
      if (!form01) return;

      // 1) Hide honeypot/URL fields (Carrd often injects one)
      [
        'input[type="url"]',
        'input[name*="url" i]',
        'input[id*="url" i]',
        'input[name*="website" i]',
        'input[id*="website" i]',
        'input[aria-hidden="true"]',
        'input[tabindex="-1"]'
      ].forEach(function(sel){
        var trap = form01.querySelector(sel);
        if (trap) {
          var field = trap.closest('.field') || trap.parentElement;
          if (field) field.style.display = 'none';
          trap.style.display = 'none';
        }
      });

      // 2) Force wrappers to centered, full-width grid
      var inner = form01.querySelector('.inner');
      if (inner) {
        Object.assign(inner.style, {
          width: '100%', maxWidth: '100%', margin: '0 auto',
          display: 'grid', placeItems: 'center', gap: '0.6em'
        });
      }
      form01.querySelectorAll('.field').forEach(function(f){
        Object.assign(f.style, {
          width: '100%', display: 'block', textAlign: 'center',
          background: 'transparent', border: '0', boxShadow: 'none'
        });
      });

      // 3) Inputs/submit: 50px, bold, black, centered (no all:unset)
      var inputs = form01.querySelectorAll('input[type="text"], input[type="email"]');
      inputs.forEach(function(inp){
        Object.assign(inp.style, {
          width: '100%', textAlign: 'center',
          fontSize: '50px', fontWeight: '800', lineHeight: '1.1', letterSpacing: '0',
          color: '#000', padding: '.1em 0',
          border: 'none', outline: 'none', background: 'transparent', boxShadow: 'none'
        });
      });

      var submit = form01.querySelector('button[type="submit"], input[type="submit"]');
      if (submit) {
        Object.assign(submit.style, {
          cursor: 'pointer',
          fontSize: '50px', fontWeight: '800', lineHeight: '1.1',
          textTransform: 'uppercase', color: '#000',
          border: 'none', outline: 'none', background: 'transparent', boxShadow: 'none'
        });
      }

      // 4) Force reflow now (prevents the jump on first focus)
      void form01.offsetHeight;
    }

    // Place the form directly under the DEVICES title block
    function positionFormUnderTitle(){
      if (!devicesOverlay || !devicesContent || !formWrap) return;
      var rect = devicesContent.getBoundingClientRect();
      Object.assign(formWrap.style, {
        position: "fixed",
        left: "0",
        right: "0",
        margin: "0 auto",
        top: (rect.bottom + 24) + "px",   // 24px gap under the title
        zIndex: "7000",
        width: "min(90vw, 1000px)",
        maxWidth: "100%",
        padding: "0",
        display: "block",
        transform: "none"
      });
    }

    function ensureDevicesOverlay(){
      if (devicesOverlay) return devicesOverlay;

      // Fullscreen overlay (beige)
      devicesOverlay = document.createElement("div");
      devicesOverlay.id = "devicesOverlay";
      Object.assign(devicesOverlay.style, {
        position: "fixed",
        inset: "0",
        zIndex: "6000",
        display: "none",
        background: "var(--bg, #f6f3ef)",
        display: "grid",
        placeItems: "start center",   // headings at top-center
        padding: "10vh 6vw 6vh",
        overflowY: "auto",
        textAlign: "center",
        textTransform: "uppercase",
        fontWeight: "800",
        letterSpacing: ".06em",
        visibility: "hidden"          // we’ll reveal after normalization
      });

      // Titles
      devicesContent = document.createElement("div");
      devicesContent.id = "devicesContent";

      var line1 = document.createElement("div");
      line1.textContent = "DEVICES ARE FORMING";
      line1.style.fontSize = "50px";
      line1.style.fontWeight = "800";
      line1.style.letterSpacing = "0";
      devicesContent.appendChild(line1);

      var line2 = document.createElement("div");
      line2.textContent = "SIGNAL WILL BE SENT WHEN READY";
      line2.style.fontSize = "50px";
      line2.style.fontWeight = "800";
      line2.style.letterSpacing = "1px";
      line2.style.marginTop = ".2em";
      devicesContent.appendChild(line2);

      devicesOverlay.appendChild(devicesContent);
      document.body.appendChild(devicesOverlay);

      // Close on background click
      devicesOverlay.addEventListener("click", function(e){
        if (e.target === devicesOverlay) closeDevicesOverlay();
      }, true);
      devicesOverlay.addEventListener("touchstart", function(e){
        if (e.target === devicesOverlay) closeDevicesOverlay();
      }, { passive: true, capture: true });

      return devicesOverlay;
    }

    function openDevicesOverlay(){
      ensureDevicesOverlay();
      devicesOverlay.style.display = "grid";
      document.documentElement.style.overflow = "hidden";
      document.body.classList.add("devices-open");

      if (formWrap) { formWrap.style.display = "block"; formWrap.style.visibility = "hidden"; }
      if (form01)  { form01.style.display  = "block"; }

      normalizeCarrdForm();          // style before first paint
      positionFormUnderTitle();      // initial placement

      // Reveal after two frames to beat Carrd's late reflow
      requestAnimationFrame(function(){
        positionFormUnderTitle();
        requestAnimationFrame(function(){
          if (formWrap) formWrap.style.visibility = "visible";
          devicesOverlay.style.visibility = "visible";
        });
      });

      window.addEventListener("resize", positionFormUnderTitle);
    }

    function closeDevicesOverlay(){
      if (!devicesOverlay) return;
      devicesOverlay.style.display = "none";
      devicesOverlay.style.visibility = "hidden";
      document.documentElement.style.overflow = "";
      document.body.classList.remove("devices-open");
      window.removeEventListener("resize", positionFormUnderTitle);
      if (formWrap) { formWrap.style.visibility = ""; formWrap.style.display = "none"; }
      if (form01)  { form01.style.display  = "none"; }
    }

    /* ================= CLICK-TO-TOGGLE NAV ================= */
    let active = null; // 'hud:why' | 'hud:how' | 'hud:what' | 'oracle' | 'weekly' | 'breathe' | 'devices'

    function closeAllUI(){
      closeHud();
      hideWeekly();
      exitBreathe();
      closeDevicesOverlay();
    }

    function wireHudClick(el, text, key){
      if(!el) return;
      el.addEventListener("click", function(e){
        e.preventDefault(); e.stopPropagation();
        if(active === ('hud:'+key)) { closeHud(); active = null; return; }
        closeAllUI(); openHud(text); active = 'hud:'+key;
      }, true);
    }

    wireHudClick(why,  "SOMETIMES WE DRIFT OFF-CENTER. THIS IS NOT FAILURE BUT SIGNAL. REALITY-CHECKS ARE KEYS TO REMEMBER WHAT IS REAL.", "why");
    wireHudClick(how,  "MOVING THROUGH A SPECIFIC EXPLORATION EACH WEEK. VISITING THE ORACLE FOR DAILY SIGNAL. BREATHING RE-CALIBRATES. JOURNAL WHEN YOU DESIRE UNITY.", "how");
    wireHudClick(what, "MINIMAL INSTRUMENTS DESIGNED FOR ATTENTION. TUNING DEVICES FOR REALIGNMENT. THROUGH PURE COMMITMENT AND DEVOTION TO YOUR SELF. A PRACTICE OF SOVEREIGNTY, REDEMPTION, AND SELF-RELIANCE.", "what");

    if (oracle) {
      oracle.addEventListener('click', function(e){
        e.preventDefault(); e.stopPropagation();
        if(active === 'oracle'){ closeHud(); active = null; return; }
        closeAllUI(); showOracle(MOMENTS[getDailyIndex(MOMENTS.length)] || {}); active = 'oracle';
      }, true);
    }

    if (weeklyLink) {
      weeklyLink.addEventListener("click", function(e){
        e.preventDefault(); e.stopPropagation();
        if(active === 'weekly'){ hideWeekly(); active = null; return; }
        closeAllUI(); showWeekly(); active = 'weekly';
      }, true);
    }

    if (breatheLink) {
      breatheLink.addEventListener("click", function(e){
        e.preventDefault(); e.stopPropagation();
        if(active === 'breathe'){ exitBreathe(); active = null; return; }
        closeAllUI(); enterBreathe(); active = 'breathe';
      }, true);
    }

    if (devices) {
      devices.addEventListener("click", function(e){
        e.preventDefault(); e.stopPropagation();
        if(active === 'devices'){ closeDevicesOverlay(); active = null; return; }
        closeAllUI(); openDevicesOverlay(); active = 'devices';
      }, true);
    }

    /* ================= Global ESC to close ================= */
    document.addEventListener("keydown", function(e){
      if(e.key==="Escape"){ closeAllUI(); active = null; }
    });
  });
})();
