/* ================= OMEN app.js ================= */
(function () {
  "use strict";

  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  ready(function init() {
    var $ = function (q) {
      return document.querySelector(q);
    };
    var $$ = function (q) {
      return document.querySelectorAll(q);
    };

    var isTouch =
      "ontouchstart" in window ||
      navigator.maxTouchPoints > 0 ||
      navigator.msMaxTouchPoints > 0;

    /* ================= SNAKE ================= */

    var timers = [];

    function resetLayer(layer) {
      if (!layer) return;
      layer.classList.remove("run");
      layer.querySelectorAll(".is-fading").forEach(function (el) {
        el.classList.remove("is-fading");
      });
    }

    // FIXED: All four sides fade together at 16s
    function startLayer(layer) {
      if (!layer) return;
      resetLayer(layer);
      layer.classList.add("run");

      var T = 16000;
      timers.push(
        setTimeout(function () {
          var s = layer.querySelector(".top");
          if (s) s.classList.add("is-fading");
        }, T)
      );
      timers.push(
        setTimeout(function () {
          var s = layer.querySelector(".right");
          if (s) s.classList.add("is-fading");
        }, T)
      );
      timers.push(
        setTimeout(function () {
          var s = layer.querySelector(".bottom");
          if (s) s.classList.add("is-fading");
        }, T)
      );
      timers.push(
        setTimeout(function () {
          var s = layer.querySelector(".left");
          if (s) s.classList.add("is-fading");
        }, T)
      );
    }

    function stopAll() {
      timers.forEach(clearTimeout);
      timers = [];
      $$(".snake-layer").forEach(resetLayer);
    }

    function runSnake(wrapper) {
      if (!wrapper) return;
      var layers = wrapper.querySelectorAll(".snake-layer");
      var i = 0;
      stopAll();

      function loop() {
        startLayer(layers[i]);
        i = (i + 1) % layers.length;
        timers.push(setTimeout(loop, 16000));
      }
      loop();
    }

    /* ================= WEEKLY TEXT ================= */

    function weeklyText() {
      var src = window.EXPLORATIONS || window.explorations || {};
      var list = [];

      if (Array.isArray(src)) {
        list = src;
      } else {
        for (var k in src) {
          if (
            Object.prototype.hasOwnProperty.call(src, k) &&
            Array.isArray(src[k])
          ) {
            list = list.concat(src[k]);
          }
        }
      }

      if (!list.length) return "NO EXPLORATIONS LOADED";

      var item = list[0];
      return typeof item === "string"
        ? item
        : item.text || item.title || "EXPLORATION";
    }

    /* ================= MENU HOVERS ================= */

    var breathe = $("#breathe");
    var weekly = $("#weekly");
    var oracle = $("#oracle");
    var book = $("#book");

    if (!isTouch) {
      if (breathe) {
        breathe.addEventListener("mouseenter", function () {
          runSnake($("#breathe-snake"));
        });
        breathe.addEventListener("mouseleave", stopAll);
      }

      if (weekly) {
        weekly.addEventListener("mouseenter", function () {
          runSnake($("#weekly-snake"));
        });
        weekly.addEventListener("mouseleave", stopAll);
      }
    } else {
      // Touch devices: tap toggles snake & keeps text visible
      if (breathe) {
        breathe.addEventListener("click", function () {
          runSnake($("#breathe-snake"));
        });
      }
      if (weekly) {
        weekly.addEventListener("click", function () {
          runSnake($("#weekly-snake"));
        });
      }
    }

    /* ================= WEEKLY TEXT INJECTION ================= */

    var weeklyLabel = $("#weekly-label");
    if (weeklyLabel) {
      weeklyLabel.textContent = weeklyText();
    }

    /* ================= ORACLE ================= */
    if (oracle) {
      oracle.addEventListener("click", function () {
        alert("Oracle feature coming soon!");
      });
    }
  });
})();
