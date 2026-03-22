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

  var container = document.getElementById("referral-dashboard");
  if (!container) return;

  // Resolve referral code: data-ref attribute > URL param
  var refCode = container.getAttribute("data-ref");
  if (!refCode) {
    var params = new URLSearchParams(window.location.search);
    refCode = params.get("ref");
  }

  if (!refCode) {
    container.innerHTML = '<p style="text-align:center;color:#999;padding:20px;">No referral code found.</p>';
    return;
  }

  // Inject styles
  injectStyles();

  // Show loading state
  container.innerHTML = '<div class="rw-loading"><div class="rw-spinner"></div><p>Loading your dashboard...</p></div>';

  // Fetch data
  fetch(CONFIG.supabaseUrl + "?ref=" + encodeURIComponent(refCode))
    .then(function (res) { return res.json(); })
    .then(function (data) {
      if (!data.success) {
        container.innerHTML = '<div class="rw-error"><p>We couldn\'t find that referral code. Double-check your link and try again.</p></div>';
        return;
      }
      render(data);
    })
    .catch(function () {
      container.innerHTML = '<div class="rw-error"><p>Something went wrong loading your dashboard. Please try refreshing.</p></div>';
    });

  // ---- Render ----

  function render(data) {
    var referralLink = CONFIG.optinUrl + "?ref=" + data.referral_code;
    var count = data.referral_count;
    var maxMilestone = CONFIG.milestones[CONFIG.milestones.length - 1].threshold;
    var fillPercent = Math.min((count / maxMilestone) * 100, 100);

    var html = "";

    // Share section
    html += '<div class="rw-share">';
    html += "  <h2>Share & Earn Rewards</h2>";
    html += '  <p class="rw-share-subtitle">Share your unique link with friends. When they sign up, you earn rewards!</p>';
    html += '  <div class="rw-share-buttons">';
    html += '    <a class="rw-btn rw-btn-email" href="' + buildEmailLink(referralLink) + '" target="_blank" rel="noopener">Email</a>';
    html += '    <a class="rw-btn rw-btn-facebook" href="' + buildFacebookLink(referralLink) + '" target="_blank" rel="noopener">Facebook</a>';
    html += '    <a class="rw-btn rw-btn-x" href="' + buildXLink(referralLink) + '" target="_blank" rel="noopener">X</a>';
    html += "  </div>";
    html += '  <div class="rw-link-box">';
    html += '    <input type="text" class="rw-link-input" value="' + referralLink + '" readonly />';
    html += '    <button class="rw-copy-btn" id="rw-copy-btn">COPY</button>';
    html += "  </div>";
    html += "</div>";

    // Progress section
    html += '<div class="rw-progress">';
    html += '  <div class="rw-count">';
    html += '    <span class="rw-count-number">' + count + "</span>";
    html += '    <span class="rw-count-label">referral' + (count !== 1 ? "s" : "") + "</span>";
    html += "  </div>";
    html += '  <div class="rw-bar-container">';
    html += '    <div class="rw-bar-fill" style="width:' + fillPercent + '%"></div>';
    // Milestone markers on the bar
    for (var i = 0; i < CONFIG.milestones.length; i++) {
      var m = CONFIG.milestones[i];
      var markerPos = (m.threshold / maxMilestone) * 100;
      var reached = count >= m.threshold;
      html += '<div class="rw-bar-marker' + (reached ? " rw-reached" : "") + '" style="left:' + markerPos + '%">';
      html += "  <span>" + m.threshold + "</span>";
      html += "</div>";
    }
    html += "  </div>";
    html += "</div>";

    // Milestones section
    html += '<div class="rw-milestones">';
    html += "  <h3>Your Rewards</h3>";
    html += '  <div class="rw-milestone-grid">';
    for (var j = 0; j < CONFIG.milestones.length; j++) {
      var ms = CONFIG.milestones[j];
      var unlocked = count >= ms.threshold;
      var remaining = Math.max(ms.threshold - count, 0);
      html += '<div class="rw-milestone-card' + (unlocked ? " rw-unlocked" : "") + '">';
      html += '  <div class="rw-milestone-badge">' + ms.threshold + "</div>";
      html += '  <div class="rw-milestone-label">' + ms.label + "</div>";
      html += '  <div class="rw-milestone-reward">' + ms.reward + "</div>";
      html += '  <div class="rw-milestone-status">' + (unlocked ? "Unlocked!" : remaining + " more to go") + "</div>";
      html += "</div>";
    }
    html += "  </div>";
    html += "</div>";

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
        copyBtn.textContent = "\u2714";
        copyBtn.classList.add("rw-copied");
        setTimeout(function () {
          copyBtn.textContent = "COPY";
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
      "#referral-dashboard { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; color: " + c.text + "; }",

      /* Loading */
      ".rw-loading { text-align: center; padding: 40px 20px; color: " + c.textLight + "; }",
      ".rw-spinner { width: 32px; height: 32px; border: 3px solid " + c.primaryLight + "; border-top-color: " + c.primary + "; border-radius: 50%; animation: rw-spin 0.8s linear infinite; margin: 0 auto 12px; }",
      "@keyframes rw-spin { to { transform: rotate(360deg); } }",

      /* Error */
      ".rw-error { text-align: center; padding: 30px 20px; color: " + c.textLight + "; background: " + c.background + "; border-radius: 12px; }",

      /* Share section */
      ".rw-share { background: " + c.primary + "; color: " + c.white + "; padding: 28px 24px; border-radius: 12px 12px 0 0; text-align: center; }",
      ".rw-share h2 { margin: 0 0 6px; font-size: 22px; font-weight: 700; }",
      ".rw-share-subtitle { margin: 0 0 20px; font-size: 14px; opacity: 0.9; }",
      ".rw-share-buttons { display: flex; gap: 10px; justify-content: center; margin-bottom: 18px; flex-wrap: wrap; }",
      ".rw-btn { display: inline-block; padding: 10px 20px; border-radius: 6px; text-decoration: none; font-size: 14px; font-weight: 600; cursor: pointer; transition: opacity 0.2s; }",
      ".rw-btn:hover { opacity: 0.85; }",
      ".rw-btn-email { background: " + c.white + "; color: " + c.primary + "; }",
      ".rw-btn-facebook { background: #1877F2; color: " + c.white + "; }",
      ".rw-btn-x { background: #000; color: " + c.white + "; }",
      ".rw-link-box { display: flex; gap: 0; border-radius: 6px; overflow: hidden; background: " + c.white + "; }",
      ".rw-link-input { flex: 1; border: none; padding: 10px 12px; font-size: 13px; color: " + c.text + "; outline: none; min-width: 0; }",
      ".rw-copy-btn { background: " + c.primaryDark + "; color: " + c.white + "; border: none; padding: 10px 18px; font-size: 13px; font-weight: 700; cursor: pointer; transition: background 0.2s; letter-spacing: 0.5px; white-space: nowrap; }",
      ".rw-copy-btn:hover { background: " + c.text + "; }",
      ".rw-copy-btn.rw-copied { background: " + c.success + "; }",

      /* Progress section */
      ".rw-progress { background: " + c.background + "; padding: 28px 24px; text-align: center; }",
      ".rw-count { margin-bottom: 18px; }",
      ".rw-count-number { font-size: 48px; font-weight: 800; color: " + c.primary + "; display: block; line-height: 1; }",
      ".rw-count-label { font-size: 14px; color: " + c.textLight + "; text-transform: uppercase; letter-spacing: 1px; }",
      ".rw-bar-container { position: relative; height: 12px; background: " + c.primaryLight + "; border-radius: 6px; overflow: visible; margin: 0 10px; }",
      ".rw-bar-fill { height: 100%; background: " + c.primary + "; border-radius: 6px; transition: width 0.6s ease; }",
      ".rw-bar-marker { position: absolute; top: -6px; transform: translateX(-50%); text-align: center; }",
      ".rw-bar-marker span { display: block; width: 24px; height: 24px; line-height: 24px; border-radius: 50%; background: " + c.white + "; border: 2px solid " + c.primaryLight + "; font-size: 10px; font-weight: 700; color: " + c.textLight + "; }",
      ".rw-bar-marker.rw-reached span { background: " + c.primary + "; border-color: " + c.primary + "; color: " + c.white + "; }",

      /* Milestones section */
      ".rw-milestones { background: " + c.white + "; padding: 28px 24px; border-radius: 0 0 12px 12px; }",
      ".rw-milestones h3 { margin: 0 0 16px; font-size: 18px; font-weight: 700; text-align: center; }",
      ".rw-milestone-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 14px; }",
      ".rw-milestone-card { border: 2px solid " + c.primaryLight + "; border-radius: 10px; padding: 18px 14px; text-align: center; transition: border-color 0.3s, box-shadow 0.3s; }",
      ".rw-milestone-card.rw-unlocked { border-color: " + c.success + "; box-shadow: 0 2px 8px rgba(76,175,80,0.15); }",
      ".rw-milestone-badge { width: 40px; height: 40px; line-height: 40px; border-radius: 50%; background: " + c.primaryLight + "; color: " + c.primary + "; font-weight: 800; font-size: 16px; margin: 0 auto 10px; }",
      ".rw-unlocked .rw-milestone-badge { background: " + c.success + "; color: " + c.white + "; }",
      ".rw-milestone-label { font-size: 12px; font-weight: 700; color: " + c.textLight + "; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 6px; }",
      ".rw-milestone-reward { font-size: 13px; color: " + c.text + "; line-height: 1.4; margin-bottom: 8px; min-height: 36px; }",
      ".rw-milestone-status { font-size: 12px; font-weight: 600; color: " + c.textLight + "; }",
      ".rw-unlocked .rw-milestone-status { color: " + c.success + "; }",

      /* Responsive */
      "@media (max-width: 480px) {",
      "  .rw-share { padding: 22px 16px; }",
      "  .rw-share h2 { font-size: 19px; }",
      "  .rw-btn { padding: 9px 14px; font-size: 13px; }",
      "  .rw-count-number { font-size: 36px; }",
      "  .rw-milestone-grid { grid-template-columns: 1fr; }",
      "  .rw-progress { padding: 22px 16px; }",
      "  .rw-milestones { padding: 22px 16px; }",
      "}",
    ].join("\n");

    document.head.appendChild(style);
  }
})();
