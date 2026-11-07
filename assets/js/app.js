/* Java Swing GUI 따라하기 가이드 — page script
   1. theme, progress, scroll-spy, troubleshooting filter
   2. Java code rendering (highlight + ①②③ markers + copy/download)
   3. ①②③ linking between table / code / simulated screen
   4. "직접 해보기" simulations that imitate Swing's Metal look & feel
*/
(() => {
  "use strict";

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const CIRCLED = "①②③④⑤⑥⑦⑧⑨⑩";

  // h(tag, props, ...children) — tiny DOM builder
  function h(tag, props, ...children) {
    const el = document.createElement(tag);
    if (props) {
      for (const [k, v] of Object.entries(props)) {
        if (k === "class") el.className = v;
        else if (k === "style") Object.assign(el.style, v);
        else if (k === "dataset") Object.assign(el.dataset, v);
        else if (k.startsWith("on") && typeof v === "function") el.addEventListener(k.slice(2), v);
        else if (k === "html") el.innerHTML = v;
        else if (v === true) el.setAttribute(k, "");
        else if (v !== false && v != null) el.setAttribute(k, v);
      }
    }
    for (const c of children.flat()) {
      if (c == null || c === false) continue;
      el.append(c.nodeType ? c : document.createTextNode(String(c)));
    }
    return el;
  }

  function store(key, fallback) {
    try { const v = localStorage.getItem(key); return v == null ? fallback : JSON.parse(v); }
    catch { return fallback; }
  }
  function save(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* private mode etc. */ }
  }

  /* ---------------------------------------------------------------
     1. Page chrome
  --------------------------------------------------------------- */
  function initTheme() {
    const saved = store("swing-guide-theme", null);
    if (saved) document.documentElement.dataset.theme = saved;
    $("#theme-toggle").addEventListener("click", () => {
      const current = document.documentElement.dataset.theme ||
        (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
      const next = current === "dark" ? "light" : "dark";
      document.documentElement.dataset.theme = next;
      save("swing-guide-theme", next);
    });
  }

  function initProgress() {
    const TOTAL = 8;
    let done = new Set(store("swing-guide-done", []));
    const render = () => {
      $$("[data-done]").forEach((cb) => {
        const n = Number(cb.dataset.done);
        cb.checked = done.has(n);
        cb.closest(".step").classList.toggle("is-done", done.has(n));
      });
      $$("#toc li[data-step]").forEach((li) => li.classList.toggle("done", done.has(Number(li.dataset.step))));
      $("#progress-count").textContent = done.size;
      $("#progress-bar").style.width = `${(done.size / TOTAL) * 100}%`;
    };
    $$("[data-done]").forEach((cb) => cb.addEventListener("change", () => {
      const n = Number(cb.dataset.done);
      cb.checked ? done.add(n) : done.delete(n);
      save("swing-guide-done", [...done]);
      render();
    }));
    render();
  }

  function initScrollSpy() {
    const sections = $$("main section[id]");
    const links = $$(".rail a[href^='#']");
    const byId = new Map(links.map((a) => [a.getAttribute("href").slice(1), a]));
    let current = null;
    const update = () => {
      let active = null;
      for (const s of sections) {
        if (s.getBoundingClientRect().top <= 130) active = s.id;
      }
      if (active === current) return;
      current = active;
      links.forEach((a) => a.classList.remove("active"));
      const a = byId.get(active);
      if (a) {
        a.classList.add("active");
        if (matchMedia("(max-width: 960px)").matches) a.scrollIntoView({ block: "nearest", inline: "center", behavior: "smooth" });
      }
    };
    addEventListener("scroll", update, { passive: true });
    update();
  }

  function initTroubleFilter() {
    const input = $("#trouble-filter");
    const rows = $$("#trouble-table tbody tr");
    const count = $("#trouble-count");
    const apply = () => {
      const q = input.value.trim().toLowerCase();
      let shown = 0;
      rows.forEach((tr) => {
        const hit = !q || tr.textContent.toLowerCase().includes(q);
        tr.hidden = !hit;
        if (hit) shown++;
      });
      count.textContent = q ? `${shown}개 항목` : "";
    };
    input.addEventListener("input", apply);
    apply();
  }

  function initTabs() {
    // ?view=try opens every "직접 해보기" panel at once (handy when demonstrating in class)
    const initial = new URLSearchParams(location.search).get("view") === "try" ? "try" : "shot";
    $$(".screen").forEach((screen) => {
      const buttons = $$(".seg button[data-panel]", screen);
      const show = (panel) => {
        buttons.forEach((b) => b.setAttribute("aria-selected", String(b.dataset.panel === panel)));
        $(".panel-shot", screen).hidden = panel !== "shot";
        $(".panel-try", screen).hidden = panel !== "try";
      };
      buttons.forEach((btn) => btn.addEventListener("click", () => show(btn.dataset.panel)));
      show(initial);
    });
  }

  /* ---------------------------------------------------------------
     2. Code blocks
  --------------------------------------------------------------- */
  const KEYWORDS = "abstract assert boolean break byte case catch char class const continue default do double else enum extends final finally float for if implements import instanceof int interface long native new package private protected public return short static strictfp super switch synchronized this throw throws transient try void volatile while true false null var".split(" ");
  const TOKEN_RE = new RegExp(
    "(\\/\\/.*$)" +                               // 1 comment
    "|(\"(?:[^\"\\\\]|\\\\.)*\")" +               // 2 string
    "|('(?:[^'\\\\]|\\\\.)*')" +                  // 3 char
    "|\\b(\\d+(?:\\.\\d+)?[fFdDlL]?)\\b" +        // 4 number
    `|\\b(${KEYWORDS.join("|")})\\b` +            // 5 keyword
    "|\\b([A-Z][A-Za-z0-9_]*)\\b",                // 6 type
    "g"
  );
  const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

  function markers(html) {
    return html.replace(/[①②③④⑤⑥⑦⑧⑨⑩]/g, (ch) =>
      `<i class="n" data-n="${CIRCLED.indexOf(ch) + 1}" tabindex="0" role="button" title="${ch}">${CIRCLED.indexOf(ch) + 1}</i>`);
  }

  function highlightLine(line) {
    let out = "";
    let last = 0;
    TOKEN_RE.lastIndex = 0;
    let m;
    while ((m = TOKEN_RE.exec(line))) {
      out += esc(line.slice(last, m.index));
      const [tok, cm, str, chr, num, kw, ty] = m;
      if (cm) out += `<span class="tok-cm">${markers(esc(cm))}</span>`;
      else if (str || chr) out += `<span class="tok-str">${esc(tok)}</span>`;
      else if (num) out += `<span class="tok-num">${tok}</span>`;
      else if (kw) out += `<span class="tok-kw">${tok}</span>`;
      else if (ty) out += `<span class="tok-ty">${tok}</span>`;
      last = m.index + tok.length;
    }
    return out + esc(line.slice(last));
  }

  function renderCode(block, script) {
    const file = script.dataset.file;
    const raw = script.textContent.replace(/^\n+/, "").replace(/\s+$/, "") + "\n";
    const lines = raw.replace(/\n$/, "").split("\n");
    let inSwap = false;
    const pre = h("pre");
    const code = h("code", { class: "language-java" });
    lines.forEach((line) => {
      const t = line.trim();
      if (t.startsWith("// ▼")) inSwap = true;
      const span = h("span", { class: "line" + (inSwap ? " swap" : ""), html: highlightLine(line) || "" });
      code.append(span);
      if (t.startsWith("// ▲")) inSwap = false;
    });
    pre.append(code);

    const copyBtn = h("button", { class: "cb-btn", type: "button" }, "복사");
    copyBtn.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(raw);
      } catch {
        const ta = h("textarea", { style: { position: "fixed", opacity: 0 } }, raw);
        document.body.append(ta); ta.select(); document.execCommand("copy"); ta.remove();
      }
      copyBtn.textContent = "복사됨";
      copyBtn.classList.add("is-ok");
      setTimeout(() => { copyBtn.textContent = "복사"; copyBtn.classList.remove("is-ok"); }, 1600);
    });

    const head = h("div", { class: "cb-head" }, h("span", { class: "file" }, block.dataset.code), h("span", { class: "spacer" }), copyBtn);
    if (!block.dataset.plain) {
      const dl = h("button", { class: "cb-btn", type: "button" }, `${file} 다운로드`);
      dl.addEventListener("click", () => {
        const url = URL.createObjectURL(new Blob([raw], { type: "text/x-java;charset=utf-8" }));
        const a = h("a", { href: url, download: file });
        document.body.append(a); a.click(); a.remove();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
      });
      head.append(dl);
    }
    block.append(head, pre);
  }

  function initCode() {
    $$(".codeblock[data-code]").forEach((block) => {
      let s = block.nextElementSibling;
      while (s && !(s.tagName === "SCRIPT" && s.type === "text/x-java")) s = s.nextElementSibling;
      if (s) renderCode(block, s);
    });
  }

  /* ---------------------------------------------------------------
     3. ①②③ linking (scoped to the enclosing step / sub-step)
  --------------------------------------------------------------- */
  function scopeOf(el) {
    return el.closest(".substep, .step, #howto") || document.body;
  }
  function setLinked(scope, n, on) {
    $$(`[data-n="${n}"]`, scope).forEach((el) => {
      el.classList.toggle("is-linked", on);
      const line = el.closest(".line");
      if (line) line.classList.toggle("is-linked", on);
    });
  }
  function initLinking() {
    let pinned = null; // { scope, n }
    const clearPinned = () => {
      if (pinned) { setLinked(pinned.scope, pinned.n, false); pinned = null; }
    };
    document.addEventListener("mouseover", (e) => {
      const el = e.target.closest("[data-n]");
      if (!el || pinned) return;
      setLinked(scopeOf(el), el.dataset.n, true);
    });
    document.addEventListener("mouseout", (e) => {
      const el = e.target.closest("[data-n]");
      if (!el || pinned) return;
      setLinked(scopeOf(el), el.dataset.n, false);
    });
    document.addEventListener("focusin", (e) => {
      const el = e.target.closest(".n[data-n]");
      if (el && !pinned) setLinked(scopeOf(el), el.dataset.n, true);
    });
    document.addEventListener("focusout", (e) => {
      const el = e.target.closest(".n[data-n]");
      if (el && !pinned) setLinked(scopeOf(el), el.dataset.n, false);
    });
    document.addEventListener("click", (e) => {
      const el = e.target.closest("[data-n]");
      if (!el) { clearPinned(); return; }
      // clicking inside simulated widgets should not steal the click
      if (e.target.closest(".jframe") && !e.target.closest(".n")) return;
      const scope = scopeOf(el), n = el.dataset.n;
      if (pinned && pinned.scope === scope && pinned.n === n) { clearPinned(); return; }
      clearPinned();
      // remove hover state from everything first
      $$(".is-linked").forEach((x) => x.classList.remove("is-linked"));
      setLinked(scope, n, true);
      pinned = { scope, n };
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") clearPinned();
      if ((e.key === "Enter" || e.key === " ") && e.target.classList?.contains("n")) { e.preventDefault(); e.target.click(); }
    });
  }

  /* ---------------------------------------------------------------
     4. Simulated Swing
  --------------------------------------------------------------- */
  function badge(el, n, pos = "left", extra = {}) {
    // elements are usually not attached yet, so computed position may be ""; treat anything non-positioned as static
    if (!["relative", "absolute", "fixed", "sticky"].includes(getComputedStyle(el).position) && !el.style.position) el.style.position = "relative";
    const b = h("i", { class: "n n-badge", dataset: { n: String(n) }, tabindex: "0", role: "button", title: CIRCLED[n - 1] }, String(n));
    // 24px puts the badge just outside the window edge for edge-flush widgets, as in the PDF screenshots
    const base = pos === "right" ? { right: "-24px", top: "50%", marginTop: "-11px" }
      : pos === "top-left" ? { left: "-11px", top: "-11px" }
      : pos === "bottom-right" ? { right: "-11px", bottom: "-11px" }
      : { left: "-24px", top: "50%", marginTop: "-11px" };
    Object.assign(b.style, base, extra);
    el.append(b);
    return b;
  }

  const jbutton = (text, props = {}) => h("button", { class: "jbutton", type: "button", ...props }, text);
  const jlabel = (text, center) => h("span", { class: "jlabel" + (center ? " center" : "") }, text);
  const jfield = (cols, props = {}) => h("input", { class: "jtextfield", type: "text", style: { width: `${cols * 9 + 10}px` }, ...props });

  function jframe(api, { title, width, height, menubar }) {
    const close = h("button", { class: "tbtn close", type: "button", "aria-label": "닫기" }, "✕");
    close.addEventListener("click", () => api.onClose());
    const ttext = h("span", { class: "ttext" }, title);
    const titlebar = h("div", { class: "jtitle" },
      h("span", { class: "ticon" }), ttext, h("span", { class: "spacer" }),
      h("button", { class: "tbtn", type: "button", "aria-label": "창 크기", tabindex: "-1" }, "▫"), close);
    const content = h("div", { class: "jcontent" });
    const el = h("div", { class: "jframe", style: { width: `${width}px`, height: `${height}px` } }, titlebar);
    if (menubar) el.append(menubar);
    el.append(content);
    return { el, content, ttext };
  }

  // JOptionPane — returns a Promise resolved with the pressed button / input value
  function dialog(api, { type, text, title }) {
    return new Promise((resolve) => {
      const overlay = h("div", { class: "jdialog-overlay" });
      const box = h("div", { class: "jdialog" + (type === "message" ? "" : " q") });
      const finish = (v) => { overlay.remove(); resolve(v); };
      const titleText = title || (type === "message" ? "메시지" : type === "confirm" ? "옵션 선택" : "입력");
      const closeBtn = h("button", { class: "tbtn close", type: "button", "aria-label": "닫기" }, "✕");
      closeBtn.addEventListener("click", () => finish(type === "confirm" ? "closed" : null));
      box.append(h("div", { class: "jtitle" }, h("span", { class: "ttext" }, titleText), h("span", { class: "spacer" }), closeBtn));
      const icon = h("div", { class: "dicon " + (type === "message" ? "info" : "q") }, type === "message" ? "i" : "?");
      const dtext = h("div", { class: "dtext" }, text);
      let input = null;
      if (type === "input") {
        input = h("input", { class: "jtextfield", type: "text" });
        input.addEventListener("keydown", (e) => { if (e.key === "Enter") finish(input.value); if (e.key === "Escape") finish(null); });
        dtext.append(input);
      }
      box.append(h("div", { class: "dbody" }, icon, dtext));
      const btns = h("div", { class: "dbtns" });
      if (type === "message") {
        btns.append(jbutton("확인", { onclick: () => finish("ok") }));
      } else if (type === "confirm") {
        btns.append(
          jbutton("예(Y)", { onclick: () => finish("yes") }),
          jbutton("아니오(N)", { onclick: () => finish("no") }),
          jbutton("취소", { onclick: () => finish("cancel") }));
      } else {
        btns.append(jbutton("확인", { onclick: () => finish(input.value) }), jbutton("취소", { onclick: () => finish(null) }));
      }
      box.append(btns);
      overlay.append(box);
      api.stage.append(overlay);
      (input || btns.querySelector("button")).focus();
    });
  }

  // Demo shell: tools bar + stage + status line, with run / exit lifecycle
  function makeDemo(root, { name, tools, build }) {
    const toolsEl = h("div", { class: "demo-tools" });
    const stage = h("div", { class: "stage" });
    const dot = h("span", { class: "dot" });
    const statusText = h("span");
    const rerun = h("button", { class: "cb-btn", type: "button" }, "다시 실행");
    const status = h("div", { class: "demo-status" }, dot, statusText, h("span", { class: "spacer" }), rerun);
    root.append(toolsEl, stage, status);

    const api = {
      stage, name,
      state: {},
      dialog: (opts) => dialog(api, opts),
      setStatus(text, mode) {
        statusText.textContent = text;
        status.classList.toggle("is-stopped", mode === "stopped");
        status.classList.toggle("is-orphan", mode === "orphan");
      },
      run() {
        stage.replaceChildren();
        api.state = {};
        api.onClose = () => api.exit();
        const frame = build(api);
        stage.append(frame);
        api.setStatus(`${name} 실행 중`);
      },
      exit(message) {
        stage.replaceChildren(h("div", { class: "exited" },
          h("strong", null, "프로그램이 종료되었습니다"),
          message || "setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE) 덕분에 X를 누르면 프로그램도 함께 끝납니다.",
          h("div", { style: { marginTop: "12px" } }, h("button", { class: "cb-btn", type: "button", onclick: () => api.run() }, "다시 실행"))));
        api.setStatus(`${name} 종료됨 (exit code 0)`, "stopped");
      },
    };
    rerun.addEventListener("click", () => api.run());
    if (tools) tools(toolsEl, api); else toolsEl.remove();
    api.run();
    return api;
  }

  const demos = {
    /* 1단계 HelloFrame ------------------------------------------------ */
    hello(root) {
      let dropLine = false;
      makeDemo(root, {
        name: "HelloFrame",
        tools(bar, api) {
          const cb = h("input", { type: "checkbox" });
          cb.addEventListener("change", () => { dropLine = cb.checked; api.run(); });
          bar.append(h("label", null, cb, h("span", null, h("code", null, "setDefaultCloseOperation"), " 줄을 지운 상태로 실행")));
        },
        build(api) {
          const f = jframe(api, { title: "나의 첫 GUI", width: 320, height: 200 });
          badge(f.ttext, 1, "right", { right: "-28px" });
          badge(f.el, 2, "bottom-right");
          api.onClose = () => {
            if (!dropLine) return api.exit();
            f.el.remove();
            api.stage.append(h("div", { class: "exited" },
              h("strong", null, "창은 사라졌지만 프로그램은 아직 실행 중"),
              "EXIT_ON_CLOSE가 없어서 창만 숨겨졌습니다. 편집기의 정지(■) 버튼을 눌러야 끝납니다.",
              h("div", { style: { marginTop: "12px" } }, h("button", { class: "cb-btn", type: "button", onclick: () => api.exit("편집기의 정지 버튼으로 강제 종료했습니다.") }, "■ 정지"))));
            api.setStatus("HelloFrame 실행 중 (창 없음)", "orphan");
          };
          return f.el;
        },
      });
    },

    /* 2단계 ClickCounter --------------------------------------------- */
    counter(root) {
      makeDemo(root, {
        name: "ClickCounter",
        build(api) {
          const f = jframe(api, { title: "클릭 카운터", width: 320, height: 200 });
          let count = 0;
          const label = h("div", { class: "jlabel center ann", style: { flex: "1", display: "grid", placeItems: "center", fontSize: "24px", fontWeight: "700" } }, "0번 눌렀어요");
          const btn = jbutton("눌러 보세요", { class: "jbutton fill ann" });
          let third = null;
          btn.addEventListener("click", () => {
            count++;
            label.firstChild.textContent = `${count}번 눌렀어요`;
            if (!third) third = badge(label, 3, "right");
          });
          badge(label, 1); badge(btn, 2);
          f.content.append(label, btn);
          return f.el;
        },
      });
    },

    /* 3단계 InputForm ------------------------------------------------ */
    inputform(root) {
      makeDemo(root, {
        name: "InputForm",
        build(api) {
          const f = jframe(api, { title: "입력 받기", width: 300, height: 215 });
          const name = jfield(12, { style: { width: "100%" } });
          const pw = h("input", { class: "jpassword", type: "password" });
          const form = h("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "5px", padding: "2px 4px" } },
            jlabel("이름"), name, jlabel("비밀번호"), pw);
          const log = h("div", { class: "jtextarea", style: { flex: "1", margin: "0 4px", fontSize: "13px" }, "aria-readonly": "true" });
          const ok = jbutton("확인", { class: "jbutton fill" });
          ok.addEventListener("click", () => {
            log.append(document.createTextNode(`${name.value}님, 비밀번호 ${pw.value.length}자리를 입력했어요\n`));
            name.value = ""; pw.value = "";
            log.scrollTop = log.scrollHeight;
          });
          badge(name, 1); badge(pw, 2); badge(log, 3); badge(ok, 4);
          f.content.style.gap = "5px";
          f.content.append(form, log, ok);
          return f.el;
        },
      });
    },

    /* 4단계 DrinkOrder ----------------------------------------------- */
    drink(root) {
      let noGroup = false;
      makeDemo(root, {
        name: "DrinkOrder",
        tools(bar, api) {
          const cb = h("input", { type: "checkbox" });
          cb.addEventListener("change", () => { noGroup = cb.checked; api.run(); });
          bar.append(h("label", null, cb, h("span", null, h("code", null, "ButtonGroup"), " 없이 실행")));
        },
        build(api) {
          const f = jframe(api, { title: "음료 주문", width: 320, height: 260 });
          const items = ["아메리카노", "카페라테", "녹차"];
          let selected = 0;
          const cval = h("span", { class: "cval" }, items[0]);
          const cmenu = h("ul", { class: "cmenu" });
          const combo = h("div", { class: "jcombo", tabindex: "0", role: "listbox" }, cval, h("span", { class: "carrow" }, "▼"), cmenu);
          items.forEach((it, i) => {
            const li = h("li", { class: i === selected ? "sel" : "" }, it);
            li.addEventListener("click", (e) => {
              e.stopPropagation();
              selected = i; cval.textContent = it;
              $$("li", cmenu).forEach((x, j) => x.classList.toggle("sel", j === i));
              combo.classList.remove("open");
            });
            cmenu.append(li);
          });
          combo.addEventListener("click", () => combo.classList.toggle("open"));
          combo.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); combo.classList.toggle("open"); } });
          document.addEventListener("click", (e) => { if (!combo.contains(e.target)) combo.classList.remove("open"); });

          const radioName = "size-" + Math.random().toString(36).slice(2);
          const radio = (text, checked) => {
            const input = h("input", { type: noGroup ? "checkbox" : "radio", name: radioName, checked });
            return h("label", { class: "jradio" }, input, h("span", { class: "box" }), text);
          };
          const small = radio("작은 컵", true), large = radio("큰 컵", false);
          const check = (text) => h("label", { class: "jcheck" }, h("input", { type: "checkbox" }), h("span", { class: "box" }), text);
          const shot = check("샷 추가"), syrup = check("시럽 추가");
          const order = jbutton("주문하기", { class: "jbutton fill" });
          const result = h("div", { class: "jlabel center", style: { display: "grid", placeItems: "center" } }, "메뉴를 골라 주세요");
          order.addEventListener("click", () => {
            const menu = items[selected];
            const size = $("input", small).checked ? "작은 컵" : "큰 컵";
            let option = "";
            if ($("input", shot).checked) option += " + 샷";
            if ($("input", syrup).checked) option += " + 시럽";
            result.firstChild.textContent = `주문: ${menu}, ${size}${option}`;
          });

          const row = (...kids) => h("div", { class: "jpanel flow-left", style: { flex: "1", minHeight: "0" } }, ...kids);
          const sizeRow = h("span", { style: { display: "inline-flex", gap: "12px", padding: "2px 4px" } }, small, large);
          const optRow = h("span", { style: { display: "inline-flex", gap: "12px", padding: "2px 4px" } }, shot, syrup);
          badge(combo, 1, "right"); badge(sizeRow, 2, "right"); badge(optRow, 3, "right"); badge(result, 4);
          f.content.append(
            row(jlabel("메뉴"), combo),
            row(sizeRow),
            row(optRow),
            h("div", { style: { flex: "1", display: "flex" } }, order),
            h("div", { style: { flex: "1", display: "grid" } }, result));
          return f.el;
        },
      });
    },

    /* 5-1 TodoList --------------------------------------------------- */
    todo(root) {
      makeDemo(root, {
        name: "TodoList",
        build(api) {
          const f = jframe(api, { title: "할 일 목록", width: 320, height: 260 });
          const model = [];
          let sel = -1;
          const list = h("ul", { class: "jlist" });
          const scroll = h("div", { class: "jscroll", style: { flex: "1", margin: "0 4px" } }, list);
          const render = () => {
            list.replaceChildren(...model.map((t, i) => {
              const li = h("li", { class: i === sel ? "sel" : "" }, t);
              li.addEventListener("click", () => { sel = i; render(); });
              return li;
            }));
          };
          const input = jfield(15);
          const add = jbutton("추가");
          add.addEventListener("click", () => {
            const text = input.value.trim();
            if (text) { model.push(text); input.value = ""; render(); }
          });
          const remove = jbutton("선택 삭제", { class: "jbutton fill" });
          remove.addEventListener("click", () => {
            if (sel !== -1) { model.splice(sel, 1); sel = -1; render(); }
          });
          const inputPanel = h("div", { class: "jpanel flow-center" }, input, add);
          badge(inputPanel, 1, "right"); badge(scroll, 2); badge(remove, 3);
          f.content.append(inputPanel, scroll, remove);
          return f.el;
        },
      });
    },

    /* 5-2 StudentTable ----------------------------------------------- */
    table(root) {
      let noScroll = false;
      makeDemo(root, {
        name: "StudentTable",
        tools(bar, api) {
          const cb = h("input", { type: "checkbox" });
          cb.addEventListener("change", () => { noScroll = cb.checked; api.run(); });
          bar.append(h("label", null, cb, h("span", null, h("code", null, "JScrollPane"), " 없이 ", h("code", null, "add(table)"))));
        },
        build(api) {
          const f = jframe(api, { title: "학생 명단", width: 360, height: 160 });
          const columns = ["학번", "이름", "학과"];
          const rows = [["20260001", "김자바", "컴퓨터공학"], ["20260002", "이객체", "소프트웨어"], ["20260003", "박상속", "인공지능"]];
          const table = buildTable(columns, rows, { editable: true, showHeader: !noScroll });
          const wrap = h("div", { class: noScroll ? "jtable-wrap" : "jscroll jtable-wrap", style: { flex: "1" } }, table.el);
          if (!noScroll) badge(table.thead, 1, "left", { top: "4px", marginTop: "0" });
          badge(table.tbody.firstChild, 2, "left", { top: "2px", marginTop: "0" });
          f.content.append(wrap);
          return f.el;
        },
      });
    },

    /* 6단계 LayoutDemo ----------------------------------------------- */
    layout(root) {
      const presets = { flow: { w: 420, h: 120 }, border: { w: 360, h: 220 }, grid: { w: 360, h: 160 } };
      let kind = "flow", width = 420;
      let api;
      const buttons = (n) => Array.from({ length: n }, (_, i) => jbutton(`버튼 ${i + 1}`));
      makeDemo(root, {
        name: "LayoutDemo",
        tools(bar, a) {
          api = a;
          const seg = h("div", { class: "seg", role: "tablist" });
          const names = { flow: "FlowLayout", border: "BorderLayout", grid: "GridLayout" };
          const range = h("input", { type: "range", min: "240", max: "480", value: String(width), "aria-label": "창 너비" });
          const wlabel = h("span", null, `창 너비 ${width}px`);
          Object.entries(names).forEach(([k, label]) => {
            const b = h("button", { type: "button", role: "tab", "aria-selected": String(k === kind) }, label);
            b.addEventListener("click", () => {
              kind = k; width = presets[k].w; range.value = String(width); wlabel.textContent = `창 너비 ${width}px`;
              $$("button", seg).forEach((x) => x.setAttribute("aria-selected", String(x === b)));
              api.run();
            });
            seg.append(b);
          });
          range.addEventListener("input", () => {
            width = Number(range.value); wlabel.textContent = `창 너비 ${width}px`;
            const frame = $(".jframe", api.stage);
            if (frame) frame.style.width = `${width}px`;
          });
          bar.append(seg, h("label", null, wlabel, range));
        },
        build(api) {
          const p = presets[kind];
          const f = jframe(api, { title: { flow: "FlowLayout", border: "BorderLayout", grid: "GridLayout" }[kind], width, height: p.h });
          if (kind === "flow") {
            f.content.append(h("div", { class: "jpanel flow-center", style: { alignItems: "flex-start", alignContent: "flex-start", flex: "1" } }, buttons(5)));
          } else if (kind === "border") {
            const mk = (t, cls) => jbutton(t, { class: "jbutton " + cls });
            f.content.append(h("div", { class: "jborder" }, mk("NORTH", "north"), mk("WEST", "west"), mk("CENTER", "center"), mk("EAST", "east"), mk("SOUTH", "south")));
          } else {
            f.content.append(h("div", { class: "jgrid", style: { gridTemplateColumns: "repeat(3, 1fr)", gridTemplateRows: "repeat(2, 1fr)", gap: "5px" } }, buttons(5)));
          }
          return f.el;
        },
      });
    },

    /* 7단계 DialogMenuDemo ------------------------------------------- */
    dialog(root) {
      makeDemo(root, {
        name: "DialogMenuDemo",
        build(api) {
          const status = h("div", { class: "jlabel center", style: { flex: "1", display: "grid", placeItems: "center" } }, "메뉴나 버튼을 눌러 보세요");
          const setStatus = (t) => { status.firstChild.textContent = t; };

          const menu = h("div", { class: "jmenu" });
          const menuBtn = h("button", { type: "button", "aria-haspopup": "true" }, "파일");
          const items = h("ul", { class: "mitems" });
          const item = (text, fn) => { const li = h("li", null, text); li.addEventListener("click", () => { menu.classList.remove("open"); fn(); }); return li; };
          items.append(item("새로 만들기", () => setStatus("새로 만들기를 눌렀어요")), h("li", { class: "sep" }), item("종료", () => api.exit("메뉴의 [종료]가 System.exit(0)을 불러서 프로그램이 끝났습니다.")));
          menuBtn.addEventListener("click", (e) => { e.stopPropagation(); menu.classList.toggle("open"); });
          document.addEventListener("click", (e) => { if (!menu.contains(e.target)) menu.classList.remove("open"); });
          menu.append(menuBtn, items);
          badge(menuBtn, 1, "right");
          const menubar = h("div", { class: "jmenubar" }, menu);

          const f = jframe(api, { title: "대화상자와 메뉴", width: 340, height: 220, menubar });
          const msg = jbutton("알림"), confirm = jbutton("확인"), input = jbutton("입력");
          msg.addEventListener("click", () => api.dialog({ type: "message", text: "저장되었습니다." }));
          confirm.addEventListener("click", async () => {
            const answer = await api.dialog({ type: "confirm", text: "정말 삭제할까요?" });
            if (answer === "yes") setStatus("삭제했어요");
          });
          input.addEventListener("click", async () => {
            const name = await api.dialog({ type: "input", text: "이름을 입력하세요" });
            if (name !== null) setStatus(`${name}님, 안녕하세요`);
          });
          badge(msg, 2, "top-left"); badge(confirm, 3, "top-left"); badge(input, 4, "top-left");
          f.content.append(status, h("div", { class: "jpanel flow-center", style: { gap: "8px", padding: "8px 5px" } }, msg, confirm, input));
          return f.el;
        },
      });
    },

    /* 8단계 GradeManager --------------------------------------------- */
    grade(root) {
      makeDemo(root, {
        name: "GradeManager",
        build(api) {
          const f = jframe(api, { title: "성적 관리", width: 380, height: 300 });
          const book = [];
          const nameField = jfield(8), scoreField = jfield(4);
          const addBtn = jbutton("추가");
          const inputPanel = h("div", { class: "jpanel flow-center" }, jlabel("이름"), nameField, jlabel("점수"), scoreField, addBtn);
          const table = buildTable(["이름", "점수"], [], { showHeader: true });
          const scroll = h("div", { class: "jscroll jtable-wrap", style: { flex: "1", margin: "0 5px" } }, table.el);
          const avg = h("span", { class: "jlabel" }, "평균: 0.0점");
          const del = jbutton("선택 삭제");
          const bottom = h("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0 5px 5px 10px" } }, avg, del);
          const updateAverage = () => {
            const a = book.length ? book.reduce((s, x) => s + x.score, 0) / book.length : 0;
            avg.firstChild.textContent = `평균: ${a.toFixed(1)}점`;
          };
          const addStudent = async () => {
            const name = nameField.value.trim();
            if (!name) { await api.dialog({ type: "message", text: "이름을 입력하세요." }); return; }
            const raw = scoreField.value.trim();
            if (!/^[+-]?\d+$/.test(raw)) { await api.dialog({ type: "message", text: "점수는 숫자로 입력하세요." }); return; }
            const score = parseInt(raw, 10);
            book.push({ name, score });
            table.addRow([name, String(score)]);
            updateAverage();
            nameField.value = ""; scoreField.value = "";
          };
          const deleteStudent = async () => {
            const row = table.selectedRow();
            if (row === -1) { await api.dialog({ type: "message", text: "삭제할 줄을 먼저 선택하세요." }); return; }
            book.splice(row, 1);
            table.removeRow(row);
            updateAverage();
          };
          addBtn.addEventListener("click", addStudent);
          scoreField.addEventListener("keydown", (e) => { if (e.key === "Enter") addStudent(); });
          del.addEventListener("click", deleteStudent);
          badge(inputPanel, 1); badge(scroll, 2); badge(avg, 3); badge(del, 4, "right");
          f.content.style.gap = "5px";
          f.content.append(inputPanel, scroll, bottom);
          return f.el;
        },
      });
    },
  };

  // JTable imitation: click selects a row, double-click edits a cell
  function buildTable(columns, rows, { editable = false, showHeader = true } = {}) {
    const thead = h("thead", null, h("tr", null, columns.map((c) => h("th", null, c))));
    const tbody = h("tbody");
    const el = h("table", { class: "jtable" });
    if (showHeader) el.append(thead);
    el.append(tbody);
    let sel = -1;
    const select = (i) => { sel = i; $$("tr", tbody).forEach((tr, j) => tr.classList.toggle("sel", j === i)); };
    const makeRow = (cells) => {
      const tr = h("tr", null, cells.map((c) => h("td", null, c)));
      tr.addEventListener("click", () => select(Array.from(tbody.children).indexOf(tr)));
      if (editable) {
        $$("td", tr).forEach((td) => td.addEventListener("dblclick", () => {
          td.contentEditable = "true"; td.focus();
          const done = () => { td.contentEditable = "false"; td.removeEventListener("blur", done); };
          td.addEventListener("blur", done);
          td.addEventListener("keydown", (e) => { if (e.key === "Enter") { e.preventDefault(); td.blur(); } }, { once: true });
        }));
      }
      return tr;
    };
    rows.forEach((r) => tbody.append(makeRow(r)));
    return {
      el, thead, tbody,
      addRow: (cells) => tbody.append(makeRow(cells)),
      removeRow: (i) => { tbody.children[i]?.remove(); sel = -1; },
      selectedRow: () => sel,
    };
  }

  function initDemos() {
    $$("[data-demo]").forEach((root) => {
      const fn = demos[root.dataset.demo];
      if (fn) fn(root);
    });
  }

  /* --------------------------------------------------------------- */
  initTheme();
  initCode();
  initTabs();
  initLinking();
  initProgress();
  initScrollSpy();
  initTroubleFilter();
  initDemos();
})();
