(() => {
  const MYLEON_HOST_RE = /^https?:\/\/(?:www\.)?myleon\.co/i;
  const WEBFLOW_GLOBAL_RE = /^https?:\/\/global-uploads\.webflow\.com\/(.+)$/i;
  const WEBFLOW_UPLOADS_SSL_RE = /^https?:\/\/uploads-ssl\.webflow\.com\/(.+)$/i;
  const WAYBACK_WRAP_RE = /^https?:\/\/web\.archive\.org\/web\/\d{6,14}(?:[a-z_]+)?\/(https?:\/\/.+)$/i;
  const WAYBACK_WRAP_REL_RE = /^\/web\/\d{6,14}(?:[a-z_]+)?\/(https?:\/\/.+)$/i;

  const HASH_LINK_RULES = [
    { match: /leon home/i, href: "/" },
    { match: /integrations?/i, href: "/integrations" },
    { match: /(okr|goals?)/i, href: "/features" },
    { match: /partners?/i, href: "/partners" },
    { match: /events?/i, href: "/leon-events" },
    { match: /(ebook|books?\s*&?\s*guides?)/i, href: "/guides" },
    { match: /(view all posts|the leon blog)/i, href: "/manifesto" },
    { match: /start playbook/i, href: "/playbooks" },
    { match: /playbook playlists?/i, href: "/playlists" },
    { match: /(request a demo|contact us)/i, href: "/demo-request" },
    { match: /(get started|start for free)/i, href: "/sign-up" },
    { match: /(apply today|become a leon expert)/i, href: "/leon-experts" },
    { match: /^terms$/i, href: "/terms" },
    { match: /^privacy$/i, href: "/user-privacy" },
    { match: /^support$/i, href: "https://help.myleon.co/en/" }
  ];

  function decodeHref(href) {
    if (!href) return href;
    let out = href.trim();

    const wbAbs = out.match(WAYBACK_WRAP_RE);
    if (wbAbs) out = wbAbs[1];

    const wbRel = out.match(WAYBACK_WRAP_REL_RE);
    if (wbRel) out = wbRel[1];

    const wbMailto = out.match(/^https?:\/\/web\.archive\.org\/web\/\d{6,14}(?:[a-z_]+)?\/(mailto:.+)$/i);
    if (wbMailto) out = wbMailto[1];

    if (MYLEON_HOST_RE.test(out)) {
      try {
        const u = new URL(out);
        out = u.pathname + u.search + u.hash;
      } catch {
        // no-op
      }
    }

    const wfGlobal = out.match(WEBFLOW_GLOBAL_RE);
    if (wfGlobal) return `/_wb/global-uploads/${wfGlobal[1]}`;

    const wfUploadsSsl = out.match(WEBFLOW_UPLOADS_SSL_RE);
    if (wfUploadsSsl) return `/_wb/uploads-ssl/${wfUploadsSsl[1]}`;

    return out;
  }

  function fixHashLink(anchor) {
    const href = (anchor.getAttribute("href") || "").trim();
    if (href !== "#") return;

    const text = (anchor.textContent || "").replace(/\s+/g, " ").trim();
    if (!text) return;

    for (const rule of HASH_LINK_RULES) {
      if (rule.match.test(text)) {
        anchor.setAttribute("href", rule.href);
        if (/^https?:\/\//i.test(rule.href)) {
          anchor.setAttribute("target", "_blank");
          anchor.setAttribute("rel", "noopener noreferrer");
        }
        break;
      }
    }
  }

  function normalizeAnchors() {
    const anchors = document.querySelectorAll("a[href]");
    for (const a of anchors) {
      fixHashLink(a);
      const href = a.getAttribute("href");
      const normalized = decodeHref(href || "");
      if (normalized && normalized !== href) {
        a.setAttribute("href", normalized);
      }
    }
  }

  function normalizeAssets() {
    const elements = document.querySelectorAll("[src], [href]");
    for (const el of elements) {
      if (el.hasAttribute("src")) {
        const src = el.getAttribute("src");
        const normalized = decodeHref(src || "");
        if (normalized && normalized !== src) {
          el.setAttribute("src", normalized);
        }
      }

      if (el.hasAttribute("href")) {
        const href = el.getAttribute("href");
        const normalized = decodeHref(href || "");
        if (normalized && normalized !== href) {
          el.setAttribute("href", normalized);
        }
      }
    }
  }

  function improveForms() {
    const forms = document.querySelectorAll("form");
    for (const form of forms) {
      const action = (form.getAttribute("action") || "").trim();
      const hasAction = action.length > 0 && action !== "#";
      if (hasAction) continue;

      form.addEventListener("submit", (event) => {
        event.preventDefault();
        window.alert("Form submission is not available in this restored archive site yet.");
      });
    }
  }

  document.addEventListener("DOMContentLoaded", () => {
    normalizeAssets();
    normalizeAnchors();
    improveForms();
  });
})();
