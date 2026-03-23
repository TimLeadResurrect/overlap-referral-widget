(function () {
  "use strict";

  // ============================================================
  // CONFIG — Edit these values. Don't touch anything below.
  // ============================================================
  var CONFIG = {
    supabaseUrl: "https://jpctdyktycxzoisyesjj.supabase.co/functions/v1/get-dashboard",
    optinUrl: "https://theoverlap.life/prayer-journal",
    milestones: [
      { threshold: 5, label: "Tier 1", reward: '"Redeeming the Time" Planning & Productivity Training' },
      { threshold: 10, label: "Tier 2", reward: 'Full "The Overlap Life" Book Package \u2014 eBook, Audio, & Study Guide' },
      { threshold: 20, label: "Tier 3", reward: "30-Min Q&A Call, Signed Book, & Request-a-Video Topic" },
    ],
    colors: {
      primary: "#7294ab",
      primaryLight: "#e0eef5",
      primaryDark: "#5a7a8f",
      background: "#f0f6fa",
      text: "#2c3e50",
      textLight: "#6b8299",
      success: "#4CAF50",
      white: "#ffffff",
    },
    shareText: "I am LOVING this Prayer Journal so far!",
  };
  // ============================================================

  // SVG icons (inline, no external dependencies)
  var ICONS = {
    email: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="20" height="20"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M22 4L12 13 2 4"/></svg>',
    facebook: '<svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>',
    x: '<svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>',
    copy: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="16" height="16"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>',
    check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" width="16" height="16"><polyline points="20 6 9 17 4 12"/></svg>',
    lock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="22" height="22"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>',
    unlock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="22" height="22"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 9.9-1"/></svg>',
    star: '<svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>',
  };

  var container = document.getElementById("referral-widget");
  if (!container) return;

  // Resolve referral code: data-ref attribute > URL param
  var refCode = container.getAttribute("data-ref");
  if (!refCode) {
    var params = new URLSearchParams(window.location.search);
    refCode = params.get("ref");
  }

  // Inject styles
  injectStyles();

  if (!refCode) {
    // No ref code — show email login form
    renderLoginForm();
    return;
  }

  // Has ref code — load dashboard
  loadDashboard("ref", refCode);

  function loadDashboard(paramName, paramValue) {
    container.innerHTML = '<div class="rw-loading"><div class="rw-spinner"></div><p>Loading your dashboard...</p></div>';

    fetch(CONFIG.supabaseUrl + "?" + paramName + "=" + encodeURIComponent(paramValue))
      .then(function (res) { return res.json(); })
      .then(function (data) {
        if (!data.success) {
          if (paramName === "email") {
            renderLoginForm("We couldn't find that email. Make sure you're using the same email you signed up with.");
          } else {
            container.innerHTML = '<div class="rw-error"><p>We couldn\'t find that referral code. Double-check your link and try again.</p></div>';
          }
          return;
        }
        // Update URL with ref code so bookmarking/sharing works
        if (paramName === "email" && data.referral_code) {
          var newUrl = window.location.pathname + "?ref=" + data.referral_code;
          window.history.replaceState(null, "", newUrl);
        }
        render(data);
      })
      .catch(function () {
        container.innerHTML = '<div class="rw-error"><p>Something went wrong loading your dashboard. Please try refreshing.</p></div>';
      });
  }

  function renderLoginForm(errorMsg) {
    var html = '';
    html += '<div class="rw-card">';
    html += '  <div class="rw-login">';
    html += '    <div class="rw-login-icon">' + ICONS.unlock + '</div>';
    html += '    <h2>View Your Referral Dashboard</h2>';
    html += '    <p class="rw-login-subtitle">Enter the email you signed up with to see your stats and referral link.</p>';
    if (errorMsg) {
      html += '    <p class="rw-login-error">' + errorMsg + '</p>';
    }
    html += '    <form class="rw-login-form" id="rw-login-form">';
    html += '      <input type="email" class="rw-login-input" id="rw-login-email" placeholder="your@email.com" required />';
    html += '      <button type="submit" class="rw-login-btn">View My Dashboard</button>';
    html += '    </form>';
    html += '  </div>';
    html += '</div>';

    container.innerHTML = html;

    document.getElementById("rw-login-form").addEventListener("submit", function (e) {
      e.preventDefault();
      var email = document.getElementById("rw-login-email").value.trim();
      if (email) {
        loadDashboard("email", email);
      }
    });
  }

  // ---- Render ----

  function render(data) {
    var referralLink = CONFIG.optinUrl + "?ref=" + data.referral_code;
    var count = data.referral_count;
    var maxMilestone = CONFIG.milestones[CONFIG.milestones.length - 1].threshold;
    var fillPercent = Math.min((count / maxMilestone) * 100, 100);

    var html = "";

    // Share section
    html += '<div class="rw-card">';
    html += '  <div class="rw-share">';
    html += '    <h2>Share & Earn Rewards</h2>';
    html += '    <p class="rw-share-subtitle">Share your unique link with friends. When they sign up, you earn rewards!</p>';
    html += '    <div class="rw-share-buttons">';
    html += '      <a class="rw-btn-social rw-btn-email" href="' + buildEmailLink(referralLink) + '" target="_blank" rel="noopener" title="Share via Email">' + ICONS.email + '</a>';
    html += '      <a class="rw-btn-social rw-btn-facebook" href="' + buildFacebookLink(referralLink) + '" target="_blank" rel="noopener" title="Share on Facebook">' + ICONS.facebook + '</a>';
    html += '      <a class="rw-btn-social rw-btn-x" href="' + buildXLink(referralLink) + '" target="_blank" rel="noopener" title="Share on X">' + ICONS.x + '</a>';
    html += '    </div>';
    html += '    <div class="rw-link-box">';
    html += '      <input type="text" class="rw-link-input" value="' + referralLink + '" readonly />';
    html += '      <button class="rw-copy-btn" id="rw-copy-btn">' + ICONS.copy + ' COPY</button>';
    html += '    </div>';
    html += '  </div>';

    // Progress section
    html += '  <div class="rw-progress">';
    html += '    <div class="rw-count">';
    html += '      <span class="rw-count-number">' + count + '</span>';
    html += '      <span class="rw-count-label">referral' + (count !== 1 ? "s" : "") + '</span>';
    html += '    </div>';
    html += '    <div class="rw-bar-container">';
    html += '      <div class="rw-bar-fill" style="width:' + fillPercent + '%"></div>';
    for (var i = 0; i < CONFIG.milestones.length; i++) {
      var m = CONFIG.milestones[i];
      var markerPos = (m.threshold / maxMilestone) * 100;
      var reached = count >= m.threshold;
      html += '      <div class="rw-bar-marker' + (reached ? " rw-reached" : "") + '" style="left:' + markerPos + '%">';
      html += '        <span>' + m.threshold + '</span>';
      html += '      </div>';
    }
    html += '    </div>';
    html += '  </div>';

    // Milestones section
    html += '  <div class="rw-milestones">';
    html += '    <h3>Your Rewards</h3>';
    html += '    <div class="rw-milestone-grid">';
    for (var j = 0; j < CONFIG.milestones.length; j++) {
      var ms = CONFIG.milestones[j];
      var unlocked = count >= ms.threshold;
      var remaining = Math.max(ms.threshold - count, 0);
      html += '    <div class="rw-milestone-card' + (unlocked ? " rw-unlocked" : "") + '">';
      html += '      <div class="rw-milestone-icon">' + (unlocked ? ICONS.unlock : ICONS.lock) + '</div>';
      html += '      <div class="rw-milestone-badge">' + ms.threshold + '</div>';
      html += '      <div class="rw-milestone-label">' + ms.label + '</div>';
      html += '      <div class="rw-milestone-reward">' + ms.reward + '</div>';
      html += '      <div class="rw-milestone-status">';
      if (unlocked) {
        html += ICONS.star + ' Unlocked!';
      } else {
        html += remaining + ' more to go';
      }
      html += '      </div>';
      html += '    </div>';
    }
    html += '    </div>';
    html += '  </div>';
    html += '</div>';

    container.innerHTML = html;

    // Wire up copy button
    var copyBtn = document.getElementById("rw-copy-btn");
    if (copyBtn) {
      copyBtn.addEventListener("click", function () {
        var input = container.querySelector(".rw-link-input");
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(input.value);
        } else {
          input.select();
          document.execCommand("copy");
        }
        copyBtn.innerHTML = ICONS.check + " COPIED";
        copyBtn.classList.add("rw-copied");
        setTimeout(function () {
          copyBtn.innerHTML = ICONS.copy + " COPY";
          copyBtn.classList.remove("rw-copied");
        }, 2000);
      });
    }
  }

  // ---- Social share URLs ----

  function buildEmailLink(link) {
    return "mailto:?subject=" + enc(CONFIG.shareText) + "&body=" + enc("Check it out: " + link);
  }

  function buildFacebookLink(link) {
    return "https://www.facebook.com/sharer/sharer.php?u=" + enc(link) + "&t=" + enc(CONFIG.shareText);
  }

  function buildXLink(link) {
    return "https://twitter.com/intent/tweet?text=" + enc(CONFIG.shareText + " " + link);
  }

  function enc(str) {
    return encodeURIComponent(str);
  }

  // ---- Styles ----

  function injectStyles() {
    if (document.getElementById("rw-styles")) return;

    var c = CONFIG.colors;
    var style = document.createElement("style");
    style.id = "rw-styles";
    style.textContent = [
      "/* Referral Widget Styles */",
      "#referral-widget { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; color: " + c.text + "; line-height: 1.5; }",
      "#referral-widget * { box-sizing: border-box; }",

      /* Card wrapper */
      ".rw-card { border-radius: 24px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08), 0 1px 4px rgba(0,0,0,0.04); }",

      /* Loading */
      ".rw-loading { text-align: center; padding: 40px 20px; color: " + c.textLight + "; }",
      ".rw-spinner { width: 32px; height: 32px; border: 3px solid " + c.primaryLight + "; border-top-color: " + c.primary + "; border-radius: 50%; animation: rw-spin 0.8s linear infinite; margin: 0 auto 12px; }",
      "@keyframes rw-spin { to { transform: rotate(360deg); } }",

      /* Error */
      ".rw-error { text-align: center; padding: 30px 20px; color: " + c.textLight + "; background: " + c.background + "; border-radius: 24px; }",

      /* Share section */
      ".rw-share { background: linear-gradient(135deg, " + c.primary + " 0%, " + c.primaryDark + " 100%); color: " + c.white + "; padding: 32px 28px 28px; text-align: center; }",
      ".rw-share h2 { margin: 0 0 8px; font-size: 22px; font-weight: 700; letter-spacing: -0.3px; }",
      ".rw-share-subtitle { margin: 0 0 24px; font-size: 14px; opacity: 0.85; }",

      /* Circular social buttons */
      ".rw-share-buttons { display: flex; gap: 14px; justify-content: center; margin-bottom: 22px; }",
      ".rw-btn-social { display: flex; align-items: center; justify-content: center; width: 48px; height: 48px; border-radius: 50%; text-decoration: none; transition: transform 0.2s, box-shadow 0.2s; cursor: pointer; }",
      ".rw-btn-social:hover { transform: scale(1.1); box-shadow: 0 4px 12px rgba(0,0,0,0.2); }",
      ".rw-btn-social:active { transform: scale(0.95); }",
      ".rw-btn-social svg { display: block; }",
      ".rw-btn-email { background: " + c.white + "; color: " + c.primary + "; }",
      ".rw-btn-facebook { background: #1877F2; color: " + c.white + "; }",
      ".rw-btn-x { background: #000; color: " + c.white + "; }",

      /* Link box */
      ".rw-link-box { display: flex; border-radius: 50px; overflow: hidden; background: rgba(255,255,255,0.15); border: 1px solid rgba(255,255,255,0.3); }",
      ".rw-link-input { flex: 1; border: none; padding: 12px 18px; font-size: 13px; color: " + c.text + "; background: " + c.white + "; outline: none; min-width: 0; border-radius: 50px 0 0 50px; }",
      ".rw-copy-btn { background: " + c.primaryDark + "; color: " + c.white + "; border: none; padding: 12px 22px; font-size: 13px; font-weight: 700; cursor: pointer; transition: background 0.2s; letter-spacing: 0.5px; white-space: nowrap; display: flex; align-items: center; gap: 6px; border-radius: 0 50px 50px 0; }",
      ".rw-copy-btn:hover { background: " + c.text + "; }",
      ".rw-copy-btn.rw-copied { background: " + c.success + "; }",
      ".rw-copy-btn svg { flex-shrink: 0; }",

      /* Progress section */
      ".rw-progress { background: " + c.background + "; padding: 32px 28px; text-align: center; }",
      ".rw-count { margin-bottom: 20px; }",
      ".rw-count-number { font-size: 52px; font-weight: 800; color: " + c.primary + "; display: block; line-height: 1; }",
      ".rw-count-label { font-size: 13px; color: " + c.textLight + "; text-transform: uppercase; letter-spacing: 1.5px; font-weight: 600; }",
      ".rw-bar-container { position: relative; height: 14px; background: " + c.primaryLight + "; border-radius: 50px; overflow: visible; margin: 0 14px; }",
      ".rw-bar-fill { height: 100%; background: linear-gradient(90deg, " + c.primary + ", " + c.primaryDark + "); border-radius: 50px; transition: width 0.8s cubic-bezier(0.4, 0, 0.2, 1); }",
      ".rw-bar-marker { position: absolute; top: -5px; transform: translateX(-50%); text-align: center; }",
      ".rw-bar-marker span { display: block; width: 24px; height: 24px; line-height: 24px; border-radius: 50%; background: " + c.white + "; border: 2px solid " + c.primaryLight + "; font-size: 10px; font-weight: 700; color: " + c.textLight + "; transition: all 0.3s; }",
      ".rw-bar-marker.rw-reached span { background: " + c.primary + "; border-color: " + c.primary + "; color: " + c.white + "; box-shadow: 0 2px 8px rgba(114,148,171,0.4); }",

      /* Milestones section */
      ".rw-milestones { background: " + c.white + "; padding: 28px 28px 32px; }",
      ".rw-milestones h3 { margin: 0 0 18px; font-size: 18px; font-weight: 700; text-align: center; }",
      ".rw-milestone-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; }",
      ".rw-milestone-card { border: 2px solid " + c.primaryLight + "; border-radius: 20px; padding: 22px 14px 18px; text-align: center; transition: all 0.3s; position: relative; }",
      ".rw-milestone-card.rw-unlocked { border-color: " + c.success + "; background: linear-gradient(180deg, rgba(76,175,80,0.04) 0%, rgba(76,175,80,0) 100%); box-shadow: 0 4px 16px rgba(76,175,80,0.12); }",
      ".rw-milestone-icon { margin-bottom: 8px; color: " + c.textLight + "; display: flex; justify-content: center; }",
      ".rw-unlocked .rw-milestone-icon { color: " + c.success + "; }",
      ".rw-milestone-badge { width: 44px; height: 44px; line-height: 44px; border-radius: 50%; background: " + c.primaryLight + "; color: " + c.primary + "; font-weight: 800; font-size: 17px; margin: 0 auto 10px; transition: all 0.3s; }",
      ".rw-unlocked .rw-milestone-badge { background: " + c.success + "; color: " + c.white + "; box-shadow: 0 2px 8px rgba(76,175,80,0.3); }",
      ".rw-milestone-label { font-size: 11px; font-weight: 700; color: " + c.textLight + "; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px; }",
      ".rw-milestone-reward { font-size: 13px; color: " + c.text + "; line-height: 1.4; margin-bottom: 10px; min-height: 36px; }",
      ".rw-milestone-status { font-size: 12px; font-weight: 600; color: " + c.textLight + "; display: flex; align-items: center; justify-content: center; gap: 4px; }",
      ".rw-unlocked .rw-milestone-status { color: " + c.success + "; }",

      /* Login form */
      ".rw-login { background: linear-gradient(135deg, " + c.primary + " 0%, " + c.primaryDark + " 100%); color: " + c.white + "; padding: 40px 28px; text-align: center; }",
      ".rw-login-icon { margin-bottom: 16px; opacity: 0.9; }",
      ".rw-login-icon svg { width: 40px; height: 40px; }",
      ".rw-login h2 { margin: 0 0 8px; font-size: 22px; font-weight: 700; }",
      ".rw-login-subtitle { margin: 0 0 24px; font-size: 14px; opacity: 0.85; }",
      ".rw-login-error { background: rgba(255,255,255,0.15); border-radius: 12px; padding: 10px 16px; font-size: 13px; margin-bottom: 16px; }",
      ".rw-login-form { display: flex; flex-direction: column; gap: 12px; max-width: 360px; margin: 0 auto; }",
      ".rw-login-input { border: none; padding: 14px 18px; border-radius: 50px; font-size: 15px; color: " + c.text + "; outline: none; text-align: center; }",
      ".rw-login-input::placeholder { color: " + c.textLight + "; }",
      ".rw-login-btn { border: none; padding: 14px 24px; border-radius: 50px; font-size: 15px; font-weight: 700; background: " + c.white + "; color: " + c.primary + "; cursor: pointer; transition: transform 0.2s, box-shadow 0.2s; }",
      ".rw-login-btn:hover { transform: scale(1.03); box-shadow: 0 4px 16px rgba(0,0,0,0.15); }",
      ".rw-login-btn:active { transform: scale(0.98); }",

      /* Responsive */
      "@media (max-width: 540px) {",
      "  .rw-share { padding: 24px 18px 22px; }",
      "  .rw-share h2 { font-size: 19px; }",
      "  .rw-btn-social { width: 44px; height: 44px; }",
      "  .rw-count-number { font-size: 40px; }",
      "  .rw-milestone-grid { grid-template-columns: 1fr; max-width: 280px; margin: 0 auto; }",
      "  .rw-progress { padding: 24px 18px; }",
      "  .rw-milestones { padding: 22px 18px 26px; }",
      "  .rw-card { border-radius: 18px; }",
      "  .rw-link-input { font-size: 12px; padding: 11px 14px; }",
      "  .rw-copy-btn { padding: 11px 16px; font-size: 12px; }",
      "}",
    ].join("\n");

    document.head.appendChild(style);
  }
})();
