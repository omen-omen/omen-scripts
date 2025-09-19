/* ================= OMEN app.js — click-to-toggle + inline Buttondown form (API) ================= */
(function () {
  "use strict";

  function ready(fn){
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", fn);
    else fn();
  }

  ready(function init(){
    const $ = (q)=>document.querySelector(q);

    /* ---------- Elements present in Carrd ---------- */
    const hudWrap=$("#hudWrap"), hud=$("#hud");
    const why=$("#why"), how=$("#how"), what=$("#what"),
          devices=$("#devices"), oracle=$("#oracle");
    const weeklyLink=$("#weekly"), tickerWrap=$("#tickerWrap"), tickerText=$("#tickerText");
    const breatheLink=$("#breathe"), breatheOverlay=$("#breatheOverlay"), stopBtn=$("#stopBtn");
    const breathingBar=$("#breathingBar"),
          layerA=breathingBar && breathingBar.querySelector(".layer-a"),
          layerB=breathingBar && breathingBar.querySelector(".layer-b");

    // Fail quietly if the site scaffold isn't present (prevents half-rendered states)
    if(!hudWrap||!hud||!weeklyLink||!tickerWrap||!tickerText||!breatheLink||!breatheOverlay||!stopBtn||!breathingBar||!layerA||!layerB){
      return;
    }

    /* ---------- OMEN title → Instagram ---------- */
    (function(){
      const omenTitle = document.querySelector(".omen");
      const IG_URL = "https://www.instagram.com/omen___omen/";
      const openIG = (e)=>{ window.open(IG_URL, "_blank", "noopener"); e && (e.preventDefault(), e.stopPropagation()); };
      if (omenTitle) {
        omenTitle.style.pointerEvents = "auto";
        omenTitle.style.cursor = "pointer";
        omenTitle.style.zIndex = "5000";
        omenTitle.setAttribute("role","link");
        omenTitle.setAttribute("tabindex","0");
        omenTitle.addEventListener("click", openIG);
        omenTitle.addEventListener("touchstart", openIG, {passive:false});
        omenTitle.addEventListener("keydown", (e)=>{ if (e.key==="Enter"||e.key===" "){ e.preventDefault(); openIG(); }});
      }
    })();

    /* ================= HUD helpers ================= */
    function openHud(text){ hud.textContent=text||""; hudWrap.classList.add("is-visible"); hudWrap.setAttribute("aria-hidden","false"); }
    function closeHud(){ hudWrap.classList.remove("is-visible"); hudWrap.setAttribute("aria-hidden","true"); hud.textContent=""; }

    /* ================= Oracle ================= */
    const MOMENTS=window.MOMENTS||[];
    function getDailyIndex(len){
      const K_DATE='omen_oracle_date',K_IDX='omen_oracle_idx';
      const today=(new Date()).toISOString().slice(0,10);
      const sd=localStorage.getItem(K_DATE), si=localStorage.getItem(K_IDX);
      if(sd===today && si!=null) return Number(si);
      let idx=Math.floor(Math.random()*Math.max(1,len||1));
      if(si!=null && len>1 && Number(si)===idx) idx=(idx+1)%len;
      localStorage.setItem(K_DATE,today); localStorage.setItem(K_IDX,String(idx));
      return idx;
    }
    function getTitle(m){ return (m&&m.title)||'UNTITLED'; }
    function getLines(m){ return (m&&m.levels)||(m&&m.lines)||[]; }
    function showOracle(m){
      const wrap=document.createElement('div'); wrap.className='hud-content';
      const title=document.createElement('div'); title.className='hud-title'; title.textContent=getTitle(m); wrap.appendChild(title);
      const holder=document.createElement('div'); holder.style.display='flex'; holder.style.flexDirection='column'; holder.style.alignItems='center'; wrap.appendChild(holder);
      hud.textContent=''; hud.appendChild(wrap);
      hudWrap.classList.add('is-visible'); hudWrap.setAttribute('aria-hidden','false');
      const lines=getLines(m).slice(0,3);
      for(let i=0;i<lines.length;i++){
        ((line,delay)=>{ setTimeout(()=>{ const p=document.createElement('div'); p.className='hud-line'; p.textContent=line; holder.appendChild(p); requestAnimationFrame(()=>{ p.style.opacity='1'; }); },delay); })(lines[i],(i+1)*1000);
      }
    }

    /* ================= Weekly ticker + breathing bar ================= */
    let timers=[], loopInt=null, startBto=null, barRunning=false;
    function clearTimers(){ while(timers.length) clearTimeout(timers.pop()); }
    function resetLayer(layer){
      if(!layer) return;
      layer.classList.remove('run');
      layer.querySelectorAll('.seg').forEach(seg=>{ seg.classList.remove('is-fading'); seg.style.animation='none'; });
      layer.offsetWidth; layer.querySelectorAll('.seg').forEach(seg=>{ seg.style.animation=''; });
    }
    function fadeAll(layer){ ['.top','.right','.bottom','.left'].forEach(sel=>{ const s=layer.querySelector(sel); if(s) s.classList.add('is-fading'); }); }
    function startLayer(layer){
      if(!layer) return;
      resetLayer(layer);
      requestAnimationFrame(()=>{ requestAnimationFrame(()=>{ layer.classList.add('run'); timers.push(setTimeout(()=>fadeAll(layer),16000)); }); });
    }
    function barStart(thick){
      if(barRunning) return; barRunning=true;
      document.body.classList.toggle('small-bar', !thick);
      document.body.classList.toggle('big-bar',  !!thick);
      breathingBar.classList.add('is-active');
      clearTimers(); if(loopInt) clearInterval(loopInt); if(startBto) clearTimeout(startBto);
      resetLayer(layerA); resetLayer(layerB);
      startLayer(layerA);
      startBto=setTimeout(()=>startLayer(layerB),16000);
      loopInt=setInterval(()=>{ resetLayer(layerA); startLayer(layerA); setTimeout(()=>{ resetLayer(layerB); startLayer(layerB); },16000); },32000);
    }
    function barStop(){
      if(!barRunning) return; barRunning=false;
      breathingBar.classList.remove('is-active');
      clearTimers(); if(loopInt) clearInterval(loopInt); loopInt=null; if(startBto) clearTimeout(startBto); startBto=null;
      resetLayer(layerA); resetLayer(layerB);
    }
    function weeklyText(){
      const src = window.EXPLORATIONS || window.explorations || {};
      let list = [];
      if(Array.isArray(src)) list = src;
      else { for(const k in src){ if(Object.prototype.hasOwnProperty.call(src,k) && Array.isArray(src[k])) list=list.concat(src[k]); } }
      if(!list.length) return "NO EXPLORATIONS LOADED";
      const item=list[0]; return (typeof item==='string') ? item : (item.text || item.title || "EXPLORATION");
    }
    let weeklyOpen=false, labelLoop=null, labelTs=[];
    function clearWeeklyLabelTimers(){ for(let i=0;i<labelTs.length;i++) clearTimeout(labelTs[i]); labelTs=[]; if(labelLoop){ clearInterval(labelLoop); labelLoop=null; } }
    function runWeeklyLabelCycleOnce(){
      const seq=["INHALE","HOLD","EXHALE","HOLD"];
      for(let i=0;i<seq.length;i++){
        ((word,delay)=>{ labelTs.push(setTimeout(()=>{ if(weeklyOpen && breatheLink) breatheLink.textContent=word; },delay)); })(seq[i], i*4000);
      }
    }
    function restartWeeklyLabels(){ clearWeeklyLabelTimers(); runWeeklyLabelCycleOnce(); labelLoop=setInterval(()=>{ clearWeeklyLabelTimers(); runWeeklyLabelCycleOnce(); },16000); }
    function showWeekly(){
      if(weeklyOpen) return;
      tickerText.textContent = weeklyText();
      tickerWrap.classList.add("is-visible"); tickerWrap.setAttribute("aria-hidden","false");
      weeklyOpen = true; barStart(false); restartWeeklyLabels();
    }
    function hideWeekly(){
      tickerWrap.classList.remove("is-visible"); tickerWrap.setAttribute("aria-hidden","true");
      weeklyOpen=false; clearWeeklyLabelTimers(); if(breatheLink) breatheLink.textContent="BREATHE";
      barStop();
    }

    /* ================= BREATHE overlay (close by clicking anywhere) ================= */
    let centerWordsLoop=null;
    function startCenterWords(){ const words=["INHALE","HOLD","EXHALE","HOLD"]; let i=0; stopBtn.textContent=words[0]; clearInterval(centerWordsLoop); centerWordsLoop=setInterval(()=>{ i=(i+1)%words.length; stopBtn.textContent=words[i]; },4000); }
    function stopCenterWords(){ clearInterval(centerWordsLoop); centerWordsLoop=null; }
    function enterBreathe(){
      hideWeekly();
      breatheOverlay.classList.add("is-open"); breatheOverlay.setAttribute("aria-hidden","false");
      barStart(true); startCenterWords();
      // global capture → clicking anywhere closes
      setTimeout(()=>{ document.addEventListener("click", globalBreatheClose, true); }, 0);
      setTimeout(()=>{ document.addEventListener("touchstart", globalBreatheClose, {passive:true, capture:true}); }, 0);
    }
    function exitBreathe(){
      stopCenterWords(); barStop();
      breatheOverlay.classList.remove("is-open"); breatheOverlay.setAttribute("aria-hidden","true");
      document.removeEventListener("click", globalBreatheClose, true);
      document.removeEventListener("touchstart", globalBreatheClose, true);
    }
    function globalBreatheClose(){ if (breatheOverlay.classList.contains("is-open")) exitBreathe(); }
    breatheOverlay.addEventListener("click", ()=>exitBreathe(), true);
    breatheOverlay.addEventListener("touchstart", ()=>exitBreathe(), { passive: true, capture: true });

    /* ================= DEVICES — overlay with inline Buttondown form ================= */

    const BUTTONDOWN_USERNAME = "YOUR_BUTTONDOWN_USERNAME"; // ← set this once
    let devicesOverlay = null, devicesContent = null, devicesForm = null;

    // Hidden iframe for API response (prevents navigation)
    function ensureBDIframe(){
      let iframe = document.getElementById("bd_iframe");
      if (!iframe){
        iframe = document.createElement("iframe");
        iframe.name = "bd_iframe";
        iframe.id = "bd_iframe";
        iframe.style.display = "none";
        document.body.appendChild(iframe);
      }
      return iframe;
    }

    function buildDevicesForm(){
      if (devicesForm) return devicesForm;
      ensureBDIframe();

      const form = document.createElement("form");
      form.id = "inlineDevicesForm";
      form.method = "post";
      form.action = "https://buttondown.email/api/emails/subscribe"; // API endpoint (no CSRF)
      form.target = "bd_iframe";

      // Inputs (typography handled by CSS)
      const nameI = document.createElement("input");
      nameI.type = "text";
      nameI.name = "metadata__name";     // stored as metadata
      nameI.placeholder = "NAME";

      const emailI = document.createElement("input");
      emailI.type = "email";
      emailI.name = "email";
      emailI.placeholder = "EMAIL";
      emailI.required = true;

      // Required flags
      const embedI = document.createElement("input");
      embedI.type = "hidden";
      embedI.name = "embed";
      embedI.value = "1";

      const listI = document.createElement("input");
      listI.type = "hidden";
      listI.name = "list";
      listI.value = BUTTONDOWN_USERNAME; // explicit routing to your newsletter

      const btn = document.createElement("button");
      btn.type = "submit";
      btn.textContent = "SUBMIT";

      form.addEventListener("submit", function(){
        btn.disabled = true;
        btn.style.opacity = "0.75";
        btn.textContent = "SENT";
        // optional: auto-close after a beat
        // setTimeout(closeDevicesOverlay, 1200);
      });

      [nameI, emailI, embedI, listI, btn].forEach(el=>form.appendChild(el));
      devicesForm = form;
      return form;
    }

    function ensureDevicesOverlay(){
      if (devicesOverlay) return devicesOverlay;

      devicesOverlay = document.createElement("div");
      devicesOverlay.id = "devicesOverlay";
      Object.assign(devicesOverlay.style, {
        position: "fixed", inset: "0", zIndex: "6000",
        display: "none", background: "var(--bg, #f6f3ef)",
        display: "grid", placeItems: "start center",
        padding: "10vh 6vw 6vh", overflowY: "auto",
        textAlign: "center", textTransform: "uppercase",
        fontWeight: "800", letterSpacing: ".06em"
      });

      devicesContent = document.createElement("div");
      devicesContent.id = "devicesContent";

      const line1 = document.createElement("div");
      line1.textContent = "DEVICES ARE FORMING";
      line1.style.fontSize = "50px"; line1.style.fontWeight = "800"; line1.style.letterSpacing = "0";

      const line2 = document.createElement("div");
      line2.textContent = "SIGNAL WILL BE SENT WHEN READY";
      line2.style.fontSize = "50px"; line2.style.fontWeight = "800"; line2.style.letterSpacing = "1px"; line2.style.marginTop = ".2em";

      devicesContent.appendChild(line1);
      devicesContent.appendChild(line2);

      devicesOverlay.appendChild(devicesContent);
      devicesOverlay.appendChild(buildDevicesForm());
      document.body.appendChild(devicesOverlay);

      // Click outside to close
      devicesOverlay.addEventListener("click", (e)=>{ if (e.target === devicesOverlay) closeDevicesOverlay(); }, true);
      devicesOverlay.addEventListener("touchstart", (e)=>{ if (e.target === devicesOverlay) closeDevicesOverlay(); }, { passive: true, capture: true });

      return devicesOverlay;
    }

    function positionFormUnderTitle(){
      if (!devicesOverlay || !devicesContent || !devicesForm) return;
      const rect = devicesContent.getBoundingClientRect();
      Object.assign(devicesForm.style, {
        position: "fixed",
        left: "0", right: "0",
        margin: "0 auto",
        top: (rect.bottom + 24) + "px",
        zIndex: "7000",
        width: "min(90vw, 1000px)",
        maxWidth: "100%",
        padding: "0",
        transform: "none",
        display: "grid"
      });
    }

    function openDevicesOverlay(){
      ensureDevicesOverlay();
      devicesOverlay.style.display = "grid";
      document.documentElement.style.overflow = "hidden";
      document.body.classList.add("devices-open");
      positionFormUnderTitle();
      window.addEventListener("resize", positionFormUnderTitle);
    }

    function closeDevicesOverlay(){
      if (!devicesOverlay) return;
      devicesOverlay.style.display = "none";
      document.documentElement.style.overflow = "";
      document.body.classList.remove("devices-open");
      window.removeEventListener("resize", positionFormUnderTitle);
    }

    /* ================= Click-to-toggle NAV ================= */
    let active = null;
    function closeAllUI(){ closeHud(); hideWeekly(); exitBreathe(); closeDevicesOverlay(); }

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

    if (oracle) oracle.addEventListener('click', (e)=>{ e.preventDefault(); e.stopPropagation(); if(active==='oracle'){ closeHud(); active=null; return; } closeAllUI(); showOracle(MOMENTS[getDailyIndex(MOMENTS.length)]||{}); active='oracle'; }, true);
    if (weeklyLink) weeklyLink.addEventListener("click", (e)=>{ e.preventDefault(); e.stopPropagation(); if(active==='weekly'){ hideWeekly(); active=null; return; } closeAllUI(); showWeekly(); active='weekly'; }, true);
    if (breatheLink) breatheLink.addEventListener("click", (e)=>{ e.preventDefault(); e.stopPropagation(); if(active==='breathe'){ exitBreathe(); active=null; return; } closeAllUI(); enterBreathe(); active='breathe'; }, true);
    if (devices) devices.addEventListener("click", (e)=>{ e.preventDefault(); e.stopPropagation(); if(active==='devices'){ closeDevicesOverlay(); active=null; return; } closeAllUI(); openDevicesOverlay(); active='devices'; }, true);

    document.addEventListener("keydown", (e)=>{ if(e.key==="Escape"){ closeAllUI(); active=null; }});
  });
})();
