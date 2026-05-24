// === THEME (must run first) ===
(function initTheme() {
  const STORAGE_KEY = "aanya-theme";
  const root = document.documentElement;
  const stored = localStorage.getItem(STORAGE_KEY);
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const theme = stored === "light" || stored === "dark" ? stored : prefersDark ? "dark" : "light";
  root.setAttribute("data-theme", theme);

  function updateToggleLabel(btn) {
    if (!btn) return;
    const isDark = root.getAttribute("data-theme") === "dark";
    btn.setAttribute("aria-label", isDark ? "Switch to light mode" : "Switch to dark mode");
    btn.textContent = isDark ? "☀️" : "🌙";
  }

  function bindToggle() {
    const toggle = document.getElementById("theme-toggle");
    updateToggleLabel(toggle);
    if (toggle) {
      toggle.addEventListener("click", function () {
        const next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
        root.setAttribute("data-theme", next);
        localStorage.setItem(STORAGE_KEY, next);
        updateToggleLabel(toggle);
      });
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bindToggle);
  } else {
    bindToggle();
  }
})();

function onReady(fn) {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", fn);
  } else {
    fn();
  }
}

// === SCROLL PROGRESS BAR ===
(function initScrollProgress() {
  const bar = document.createElement("div");
  bar.className = "scroll-progress";
  bar.setAttribute("role", "presentation");
  bar.setAttribute("aria-hidden", "true");
  document.body.prepend(bar);

  let ticking = false;

  function updateBar() {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = docHeight > 0 ? Math.min(scrollTop / docHeight, 1) : 0;
    bar.style.width = progress * 100 + "%";
    ticking = false;
  }

  window.addEventListener(
    "scroll",
    function () {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(updateBar);
      }
    },
    { passive: true }
  );
  updateBar();
})();

// === REVEAL ON SCROLL ===
(function initReveal() {
  onReady(function () {
    const reveals = document.querySelectorAll(".reveal");
    if (!reveals.length) return;

    const observer = new IntersectionObserver(
      function (entries, obs) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );

    reveals.forEach(function (el) {
      observer.observe(el);
    });
  });
})();

// === NAV SHRINK ON SCROLL ===
(function initNavScroll() {
  onReady(function () {
    const nav = document.querySelector(".nav");
    if (!nav) return;

    function onScroll() {
      nav.classList.toggle("is-scrolled", window.scrollY > 8);
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  });
})();

// === ABOUT STATS COUNTERS ===
(function initStatsCounters() {
  onReady(function () {
    const strip = document.querySelector(".about-stats");
    if (!strip) return;

    const numbers = strip.querySelectorAll(".stat-number");
    if (!numbers.length) return;

    function animateCounter(el) {
      const target = parseInt(el.getAttribute("data-target"), 10);
      const suffix = el.getAttribute("data-suffix") || "";
      const duration = 1400;
      const start = performance.now();

      function frame(now) {
        const elapsed = now - start;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        const value = Math.round(eased * target);
        el.textContent = value + suffix;
        if (progress < 1) requestAnimationFrame(frame);
      }

      requestAnimationFrame(frame);
    }

    const observer = new IntersectionObserver(
      function (entries, obs) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            numbers.forEach(animateCounter);
            obs.disconnect();
          }
        });
      },
      { threshold: 0.35 }
    );

    observer.observe(strip);
  });
})();

// === PAGE-LOAD SPLASH ===
(function initSplash() {
  const splash = document.createElement("div");
  splash.className = "page-splash";
  splash.setAttribute("aria-hidden", "true");
  splash.innerHTML = '<p class="page-splash-brand">Aanya Sharma</p>';
  document.body.appendChild(splash);

  requestAnimationFrame(function () {
    splash.classList.add("is-active");
  });

  setTimeout(function () {
    splash.classList.add("is-done");
    setTimeout(function () {
      splash.remove();
    }, 300);
  }, 900);
})();

console.log("Portfolio loaded ✅");

const contactForm = document.getElementById("contact-form");

if (contactForm) {
  const contactSuccess = document.getElementById("contact-success");
  const contactError = document.getElementById("contact-error");

  contactForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    if (!contactForm.checkValidity()) {
      contactForm.reportValidity();
      return;
    }

    // Hide any previous error while we try a new submission.
    if (contactError) {
      contactError.setAttribute("hidden", "");
    }

    // Read the four values from the form fields (names match our Supabase table).
    const full_name = document.getElementById("full-name").value.trim();
    const email = document.getElementById("email").value.trim();
    const subject = document.getElementById("subject").value;
    const message = document.getElementById("message").value.trim();

    // Send the row to Supabase's "form" table and wait for the response.
    const response = await supabaseClient
      .from("form")
      .insert([{ full_name, email, subject, message }]);

    // Log the full response so we can debug in the browser console.
    console.log(response);

    // If Supabase returned an error, keep the form visible and show the red message.
    if (response.error) {
      if (contactError) {
        contactError.removeAttribute("hidden");
      }
      return;
    }

    // Success: hide the form, show the green thank-you message, clear the inputs.
    contactForm.setAttribute("hidden", "");
    contactForm.reset();
    if (contactSuccess) {
      contactSuccess.removeAttribute("hidden");
    }
  });
}

const navToggle = document.getElementById("nav-toggle");
const nav = document.querySelector(".nav");

if (navToggle && nav) {
  const navMenu = document.getElementById("nav-menu");

  const closeNav = () => {
    nav.classList.remove("is-open");
    navToggle.setAttribute("aria-expanded", "false");
    navToggle.setAttribute("aria-label", "Open menu");
  };

  navToggle.addEventListener("click", () => {
    const isOpen = nav.classList.toggle("is-open");
    navToggle.setAttribute("aria-expanded", String(isOpen));
    navToggle.setAttribute("aria-label", isOpen ? "Close menu" : "Open menu");
  });

  if (navMenu) {
    navMenu.querySelectorAll(".nav-link").forEach((link) => {
      link.addEventListener("click", closeNav);
    });
  }
}

// === ADMIN INBOX ===

// Turn a database timestamp into a friendly relative time string.
function timeAgo(dateInput) {
  const date = new Date(dateInput);
  const now = new Date();
  const seconds = Math.floor((now - date) / 1000);

  if (seconds < 60) {
    return "just now";
  }

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) {
    return minutes + (minutes === 1 ? " minute ago" : " minutes ago");
  }

  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return hours + (hours === 1 ? " hour ago" : " hours ago");
  }

  const days = Math.floor(hours / 24);
  if (days < 7) {
    return days + (days === 1 ? " day ago" : " days ago");
  }

  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

onReady(function () {
  const inboxGrid = document.getElementById("admin-inbox-grid");

  // Only run this block on admin.html (when the inbox grid exists).
  if (!inboxGrid || typeof supabaseClient === "undefined") {
    return;
  }

  const countEl = document.getElementById("admin-count");
  const unreadToggle = document.getElementById("unread-only-toggle");

  // Build one card element from a single database row.
  function createMessageCard(row) {
    const card = document.createElement("article");
    card.className = "message-card";
    card.dataset.id = row.id;

    if (row.is_read) {
      card.classList.add("is-read");
    }

    card.innerHTML =
      '<div class="message-card-top">' +
      '<h3 class="message-card-subject"></h3>' +
      '<span class="message-card-time"></span>' +
      "</div>" +
      '<p class="message-card-sender"></p>' +
      '<p class="message-card-body"></p>' +
      '<div class="message-card-footer">' +
      '<button type="button" class="message-mark-read">Mark as Read</button>' +
      "</div>";

    card.querySelector(".message-card-subject").textContent = row.subject;
    card.querySelector(".message-card-time").textContent = timeAgo(row.created_at);
    card.querySelector(".message-card-sender").textContent =
      row.full_name + " · " + row.email;
    card.querySelector(".message-card-body").textContent = row.message;

    const markReadBtn = card.querySelector(".message-mark-read");

    // When clicked, tell Supabase this row is read, then update just this card.
    markReadBtn.addEventListener("click", async function () {
      const response = await supabaseClient
        .from("form")
        .update({ is_read: true })
        .eq("id", row.id);

      console.log(response);

      if (response.error) {
        return;
      }

      card.classList.add("is-read");
      row.is_read = true;
    });

    return card;
  }

  // Update the toolbar counter text.
  function updateCount(total) {
    if (!countEl) {
      return;
    }
    countEl.textContent =
      "📬 " + total + (total === 1 ? " message" : " messages");
  }

  // Fetch every message from Supabase and paint the grid.
  async function loadInbox() {
    const response = await supabaseClient
      .from("form")
      .select("*")
      .order("created_at", { ascending: false });

    console.log(response);

    inboxGrid.innerHTML = "";

    if (response.error) {
      inboxGrid.innerHTML =
        '<p class="admin-inbox-empty">Could not load messages. Check the console.</p>';
      return;
    }

    const rows = response.data || [];
    updateCount(rows.length);

    if (rows.length === 0) {
      inboxGrid.innerHTML =
        '<p class="admin-inbox-empty">No messages yet.</p>';
      return;
    }

    rows.forEach(function (row) {
      inboxGrid.appendChild(createMessageCard(row));
    });
  }

  // When "Unread only" is checked, hide read cards with a CSS class on the grid.
  if (unreadToggle) {
    unreadToggle.addEventListener("change", function () {
      inboxGrid.classList.toggle("filter-unread-only", unreadToggle.checked);
    });
  }

  loadInbox();
});
