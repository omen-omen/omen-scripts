/* ================= OMEN app.js (RTP + bulletproof OMEN→Instagram) ================= */
(function () {
  "use strict";

  function ready(fn){
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", fn);
    else fn();
  }

  ready(function init(){
    var $ = function(q){ return document.querySelector(q); };
    var isTouch = ("ontouchstart" in window) || (navigator.maxTouchPoints>0) || (navigator.msMaxTouchPoints>0);

    /* ---------- Elements ---------- */
    var hudWrap=$("#hudWrap"), hud=$("#hud");
    var why=$("#why"), how=$("#how"), what=$("#what"), devices=$("#devices"), oracle=$("#oracle");
    var weeklyLink=$("#weekly"), tickerWrap=$("#tickerWrap"), tickerRail=$("#tickerRail"), tickerText=$("#tickerText");
    var breatheLink=$("#breathe"), breatheOverlay=$("#breatheOverlay"), stopBtn=$("#stopBtn");
    var breathingBar=$("#breathingBar"),
        layerA=breathingBar && breathingBar.querySelector(".layer-a"),
        layerB=breathingBar && breathingBar.querySelector(".layer-b");
    var topLeft=document.querySelector(".top-left");

    // Bail if scaffold missing
    if(!hudWrap||!hud||!weeklyLink||!tickerWrap||!tickerRail||!tickerText||!breatheLink||!breatheOverlay||!stopBtn||!breathingBar||!layerA||!layerB){
      return;
    }

    /* ---------- Make OMEN title clickable → Instagram (robust) ---------- */
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

    /* ---------- Prevent clicks (hover-only UX on desktop) ---------- */
    if(!isTouch){
      document.querySelectorAll("a").forEach(function(a){
        if (a.classList.contains("omen-link") || a.id === "omenLink") return;
        a.addEventListener("click", function(e){ e.preventDefault(); e.stopPropagation(); });
      });
    }

    /* ================= HUD (WHY/HOW/WHAT) ================= */
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
    var over=false, hideT=null;
    function armHide(){ clearTimeout(hideT); hideT=setTimeout(function(){ if(!over) closeHud(); },180); }

    function wireHud(el, text){
      if(!el) return;
      el.addEventListener("mouseenter",function(){
        over=true;
        hideWeekly();
        openHud(text);
        clearTimeout(hideT);
      });
      el.addEventListener("mouseleave",function(){ over=false; armHide(); });
    }
    wireHud(why,  "SOMETIMES WE DRIFT OFF-CENTER. THIS IS NOT FAILURE BUT SIGNAL. REALITY-CHECKS ARE KEYS TO REMEMBER WHAT IS REAL.");
    wireHud(how,  "MOVING THROUGH A SPECIFIC EXPLORATION EACH WEEK. VISITING THE ORACLE FOR DAILY SIGNAL. BREATHING RE-CALIBRATES. JOURNAL WHEN YOU DESIRE UNITY.");
    wireHud(what, "MINIMAL INSTRUMENTS DESIGNED FOR ATTENTION. TUNING DEVICES FOR REALIGNMENT. THROUGH PURE COMMITMENT AND DEVOTION TO YOUR SELF. A PRACTICE OF SOVEREIGNTY, REDEMPTION, AND SELF-RELIANCE.");

    hud.addEventListener("mouseenter",function(){ over=true; clearTimeout(hideT); });
    hud.addEventListener("mouseleave",function(){ over=false; armHide(); });

    if(isTouch){
      function sticky(el,text){
        if(!el) return;
        el.addEventListener("touchstart",function(e){
          e.preventDefault(); e.stopPropagation();
          hideWeekly(); openHud(text);
        },{passive:false});
        el.addEventListener("click",function(e){
          e.preventDefault(); e.stopPropagation();
          hideWeekly(); openHud(text);
        });
      }
      sticky(why,  "SOMETIMES WE DRIFT OFF-CENTER. THIS IS NOT FAILURE BUT SIGNAL. REALITY-CHECKS ARE KEYS TO REMEMBER WHAT IS REAL.");
      sticky(how,  "MOVING THROUGH A SPECIFIC EXPLORATION EACH WEEK. VISITING THE ORACLE FOR DAILY SIGNAL. BREATHING RE-CALIBRATES. JOURNAL WHEN YOU DESIRE UNITY.");
      sticky(what, "MINIMAL INSTRUMENTS DESIGNED FOR ATTENTION. TUNING DEVICES FOR REALIGNMENT. THROUGH PURE COMMITMENT AND DEVOTION TO YOUR SELF. A PRACTICE OF SOVEREIGNTY, REDEMPTION, AND SELF-RELIANCE.");

      document.addEventListener("touchstart",function(ev){
        var t=ev.target;
        if(!(topLeft&&topLeft.contains(t)) && !(hud&&hud.contains(t))) closeHud();
      },{passive:true});
      document.addEventListener("click",function(ev){
        var t=ev.target;
        if(!(topLeft&&topLeft.contains(t)) && !(hud&&hud.contains(t))) closeHud();
      });
    }

    /* ================= ORACLE (unchanged) ================= */
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
    if(oracle){
      oracle.addEventListener('mouseenter',function(){
        over=true; hideWeekly();
        showOracle(MOMENTS[getDailyIndex(MOMENTS.length)]||{});
      });
      oracle.addEventListener('mouseleave',function(){ over=false; armHide(); });
      if(isTouch){
        oracle.addEventListener('touchstart',function(e){
          e.preventDefault(); e.stopPropagation();
          hideWeekly(); showOracle(MOMENTS[getDailyIndex(MOMENTS.length)]||{});
        },{passive:false});
        oracle.addEventListener('click',function(e){
          e.preventDefault(); e.stopPropagation();
          hideWeekly(); showOracle(MOMENTS[getDailyIndex(MOMENTS.length)]||{});
        });
      }
    }

    /* ================= Snake / Weekly / BREATHE (unchanged) ================= */
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

    var overWeekly=false, overRail=false;
    weeklyLink.addEventListener("mouseenter", function(){ overWeekly=true; showWeekly(); });
    weeklyLink.addEventListener("mouseleave", function(){ overWeekly=false; scheduleHideWeekly(); });
    tickerRail.addEventListener("mouseenter", function(){ overRail=true; clearTimeout(weeklyHideTimer); });
    tickerRail.addEventListener("mouseleave", function(){ overRail=false; scheduleHideWeekly(); });

    function scheduleHideWeekly(){
      clearTimeout(weeklyHideTimer);
      weeklyHideTimer=setTimeout(function(){ if(!overWeekly && !overRail) hideWeekly(); }, 300);
    }

    if(isTouch){
      weeklyLink.addEventListener("touchstart", function(e){ e.preventDefault(); e.stopPropagation(); showWeekly(); }, {passive:false});
      weeklyLink.addEventListener("click", function(e){ e.preventDefault(); e.stopPropagation(); showWeekly(); });
      document.addEventListener("touchstart", function(ev){
        var t=ev.target; if(t!==weeklyLink && !(tickerRail && tickerRail.contains(t))) hideWeekly();
      }, {passive:true});
      document.addEventListener("click", function(ev){
        var t=ev.target; if(t!==weeklyLink && !(tickerRail && tickerRail.contains(t))) hideWeekly();
      });
    }

    /* ================= BREATHE (thick snake + center words) ================= */
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

    breatheLink.addEventListener("mouseenter", enterBreathe);
    breatheLink.addEventListener("mouseleave", exitBreathe);
    if(isTouch){
      breatheLink.addEventListener("touchstart", function(e){ e.preventDefault(); e.stopPropagation(); enterBreathe(); }, {passive:false});
      breatheLink.addEventListener("click", function(e){ e.preventDefault(); e.stopPropagation(); enterBreathe(); });
      document.addEventListener("touchstart", function(ev){ var t=ev.target; if(t!==breatheLink) exitBreathe(); }, {passive:true});
      document.addEventListener("click", function(ev){ var t=ev.target; if(t!==breatheLink) exitBreathe(); });
    }

    document.addEventListener("keydown", function(e){
      if(e.key==="Escape"){ closeHud(); exitBreathe(); hideWeekly(); closeDevicesOverlay(); }
    });

    /* ================= DEVICES — full-blank overlay with framed form ================= */
    var devicesOverlay=null;
    function ensureDevicesOverlay(){
      if(devicesOverlay) return devicesOverlay;

      // overlay
      devicesOverlay = document.createElement("div");
      devicesOverlay.id = "devicesOverlay";
      Object.assign(devicesOverlay.style, {
        position:"fixed", inset:"0", background:"#fff", zIndex:"6000",
        display:"none"
      });

      // center container (frame)
      var frame = document.createElement("div");
      frame.id = "devicesFrame";
      Object.assign(frame.style, {
        position:"absolute", left:"50%", top:"50%", transform:"translate(-50%,-50%)",
        maxWidth:"520px", width:"min(90vw,520px)",
        border:"1px solid #000", padding:"24px", boxSizing:"border-box",
        textAlign:"center", textTransform:"uppercase", fontWeight:"800",
        letterSpacing:".06em", lineHeight:"1.4"
      });

      // content
      var title = document.createElement("div");
      title.style.marginBottom = "1.2em";
      title.innerHTML = "DEVICES ARE INCOMING.<br>Tools for self-tuning, realignment, and sovereign devotion.<br>Minimal instruments. Maximal signal.<br><br>We release nothing until it rings true.";
      frame.appendChild(title);

      var form = document.createElement("form");
      form.id = "form01";
      form.setAttribute("novalidate","novalidate");
form.innerHTML = [
  '<label style="display:block;margin:0 0 .8em;">Devices are forming.<br>Signal will be sent when ready.</label>',
  '<div style="display:flex; gap:.6em; justify-content:center; flex-wrap:wrap;">',
    '<input type="text" name="name" placeholder="Name" required ',
      'style="border:1px solid #000;padding:.6em 1em;outline:none;background:transparent;min-width:10ch;">',
    '<input type="email" name="email" placeholder="Email" required ',
      'style="border:1px solid #000;padding:.6em 1em;outline:none;background:transparent;min-width:16ch;">',
    '<button type="submit" ',
      'style="border:1px solid #000;padding:.6em 1.4em;cursor:pointer;background:#000;color:#fff;">submit</button>',
  '</div>'
].join("");
      frame.appendChild(form);

      devicesOverlay.appendChild(frame);
      document.body.appendChild(devicesOverlay);

      // close on outside click
      devicesOverlay.addEventListener("click", function(e){
        var frameEl = document.getElementById("devicesFrame");
        if(frameEl && !frameEl.contains(e.target)) closeDevicesOverlay();
      }, true);

      // basic submit (prevent navigation; you’ll hook to Buttondown later)
      form.addEventListener("submit", function(e){
        e.preventDefault();
        // TODO: integrate Buttondown fetch() here if desired.
        closeDevicesOverlay();
      });

      return devicesOverlay;
    }

    function openDevicesOverlay(){
      ensureDevicesOverlay();
      devicesOverlay.style.display = "block";
    }
    function closeDevicesOverlay(){
      if(devicesOverlay) devicesOverlay.style.display = "none";
    }

    if(devices){
      // Use capture so our handler fires even with the global click-preventer on <a>
      devices.addEventListener("click", function(e){
        e.preventDefault();
        e.stopPropagation();
        hideWeekly(); closeHud(); // clear any other UI
        openDevicesOverlay();
      }, true);
      if(isTouch){
        devices.addEventListener("touchstart", function(e){
          e.preventDefault(); e.stopPropagation();
          hideWeekly(); closeHud();
          openDevicesOverlay();
        }, {passive:false, capture:true});
      }
    }
  });
})();
