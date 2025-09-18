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
    var why=$("#why"), how=$("#how"), what=$("#what"),
        devices=$("#devices"), oracle=$("#oracle");
    var weeklyLink=$("#weekly"), tickerWrap=$("#tickerWrap"), tickerRail=$("#tickerRail"), tickerText=$("#tickerText");
    var breatheLink=$("#breathe"), breatheOverlay=$("#breatheOverlay"), stopBtn=$("#stopBtn");
    var breathingBar=$("#breathingBar"),
        layerA=breathingBar && breathingBar.querySelector(".layer-a"),
        layerB=breathingBar && breathingBar.querySelector(".layer-b");
    var topLeft=document.querySelector(".top-left");

    if(!hudWrap||!hud) return;

    /* ---------- HUD helpers ---------- */
    function openHud(contentNode){
      hud.textContent = "";
      if(contentNode) hud.appendChild(contentNode);
      hudWrap.classList.add("is-visible");
      hudWrap.setAttribute("aria-hidden","false");
    }
    function closeHud(){
      hudWrap.classList.remove("is-visible");
      hudWrap.setAttribute("aria-hidden","true");
      hud.textContent = "";
    }

    /* ---------- Standard HUD wiring ---------- */
    function wireHud(el, text){
      if(!el) return;
      el.addEventListener("mouseenter",()=>openHud(document.createTextNode(text)));
      el.addEventListener("mouseleave",()=>closeHud());
    }
    wireHud(why,  "SOMETIMES WE DRIFT OFF-CENTER. THIS IS NOT FAILURE BUT SIGNAL. REALITY-CHECKS ARE KEYS TO REMEMBER WHAT IS REAL.");
    wireHud(how,  "MOVING THROUGH A SPECIFIC EXPLORATION EACH WEEK. VISITING THE ORACLE FOR DAILY SIGNAL. BREATHING RE-CALIBRATES. JOURNAL WHEN YOU DESIRE UNITY.");
    wireHud(what, "MINIMAL INSTRUMENTS DESIGNED FOR ATTENTION. TUNING DEVICES FOR REALIGNMENT. THROUGH PURE COMMITMENT AND DEVOTION TO YOUR SELF. A PRACTICE OF SOVEREIGNTY, REDEMPTION, AND SELF-RELIANCE.");

    /* ---------- DEVICES (custom page with form) ---------- */
    if(devices){
      devices.addEventListener("click",function(e){
        e.preventDefault(); e.stopPropagation();

        var wrap=document.createElement("div");
        wrap.className="hud-content";

        var title=document.createElement("div");
        title.className="hud-title";
        title.textContent="DEVICES ARE INCOMING.";
        wrap.appendChild(title);

        var desc=document.createElement("div");
        desc.innerHTML="Tools for self-tuning, realignment, and sovereign devotion.<br>Minimal instruments. Maximal signal.<br><br>We release nothing until it rings true.";
        wrap.appendChild(desc);

        var form=document.createElement("form");
        form.id="form01";
        form.style.marginTop="2em";
        form.innerHTML = `
          <label>Want to feel the first pulse?<br>Enter your field signature:</label><br><br>
          <input type="text" name="name" placeholder="NAME" required style="margin:.4em;"><br>
          <input type="email" name="email" placeholder="EMAIL" required style="margin:.4em;"><br><br>
          <button type="submit">OK</button><br><br>
          <small>We’ll ping you the moment alignment occurs.</small>
        `;
        wrap.appendChild(form);

        openHud(wrap);
      });
    }

    /* ---------- Close on Escape ---------- */
    document.addEventListener("keydown", function(e){
      if(e.key==="Escape"){ closeHud(); }
    });
  });
})();
