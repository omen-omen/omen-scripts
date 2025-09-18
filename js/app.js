/* ================= OMEN app.js — click-to-toggle nav + Carrd Form overlay (form01) ================= */
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

    // Bail if key scaffold missing; fail quietly
    if(!hudWrap||!hud||!weeklyLink||!tickerWrap||!tickerRail||!tickerText||!breatheLink||!breatheOverlay||!stopBtn||!breathingBar||!layerA||!layerB){
      return;
    }

    /* ---------- OMEN title → Instagram (robust) ---------- */
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

    var weeklyOpen=false, weeklyHideTimer=null, labelLoop=null, labelTs=[];
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
    }
    function exitBreathe(){
      stopCenterWords();
      barStop();
      breatheOverlay.classList.remove("is-open"); breatheOverlay.setAttribute("aria-hidden","true");
    }

    // Close BREATHE by clicking anywhere on the overlay background
    breatheOverlay.addEventListener("click", function (e) {
      if (e.target === breatheOverlay) { exitBreathe(); if (typeof active!=="undefined") active=null; }
    }, true);
    breatheOverlay.addEventListener("touchstart", function (e) {
      if (e.target === breatheOverlay) { exitBreathe(); if (typeof active!=="undefined") active=null; }
    }, { passive: true, capture: true });

    /* ================= DEVICES — overlay that uses the real Carrd Form (#form01) ================= */
    var devicesOverlay = null, devicesContent = null, formPark = null, extForm = $("#form01");

    // Create an invisible parking spot to hold the form when hidden
    formPark = document.createElement("div");
    formPark.id = "form01-park";
    formPark.style.display = "none";
    if (extForm && extForm.parentNode) { extForm.parentNode.insertBefore(formPark, extForm); formPark.appendChild(extForm); }

    function ensureDevicesOverlay(){
      if (devicesOverlay) return devicesOverlay;

      // Fullscreen overlay that centers content but allows scrolling on small screens
      devicesOverlay = document.createElement("div");
      devicesOverlay.id = "devicesOverlay";
      Object.assign(devicesOverlay.style, {
        position: "fixed",
        inset: "0",
        zIndex: "6000",
        display: "none",
        background: "var(--bg, #f6f3ef)",
        display: "grid",
        placeItems: "center",
        padding: "6vh 6vw",
        overflowY: "auto"
      });

      // Content (no container box) — natural width, centered text
      devicesContent = document.createElement("div");
      devicesContent.id = "devicesContent";
      Object.assign(devicesContent.style, {
        textAlign: "center",
        textTransform: "uppercase",
        fontWeight: "800",
        letterSpacing: ".06em",
        margin: "0 auto",
        maxWidth: "100%"
      });

      // Title lines
      var line1 = document.createElement("div");
      line1.textContent = "DEVICES ARE FORMING";
      line1.style.fontSize = "50px";
      line1.style.fontWeight = "800";
      line1.style.letterSpacing = "0";
      devicesContent.appendChild(line1);

      var line2 = document.createElement("div");
      line2.textContent = "Signal will be sent when ready";
      line2.style.fontSize = "25px";
      line2.style.fontWeight = "800";
      line2.style.letterSpacing = "1px";
      line2.style.marginTop = ".2em";
      devicesContent.appendChild(line2);

      // Attach overlay
      devicesOverlay.appendChild(devicesContent);
      document.body.appendChild(devicesOverlay);

      // Close on background click (not when clicking content or form)
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
      // Move the external Carrd form into the overlay and show it
      if (extForm) {
        devicesContent.appendChild(extForm);
        extForm.style.display = "block";
        // optional spacing above inputs
        if (!extForm.style.marginTop) extForm.style.marginTop = "1.2em";
        // optional: make the input row wrap nicely
        extForm.style.textTransform = "uppercase";
        extForm.style.fontWeight = "800";
      }
      devicesOverlay.style.display = "block";
    }

    function closeDevicesOverlay(){
      if (!devicesOverlay) return;
      // Move the form back to its hidden parking div and hide it
      if (extForm && formPark) {
        formPark.appendChild(extForm);
        extForm.style.display = "none";
      }
      devicesOverlay.style.display = "none";
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

    /* NOTE: Hover-only blockers removed; everything is click-based now. */
  });
})();
