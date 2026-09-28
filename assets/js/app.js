(function () {
  "use strict";

  const PER_PAGE = 20;
  const FAV_KEY = "atc-portal-favorites";
  const ATC_CONTEXT = /air traffic|hava trafi|\batc\b|\batm\b|airspace|hava sahas|runway|pist|tower|kule|controller|kontrolör|aviation|havacılık|sesar|nextgen|notam/i;

  const $ = (sel, root = document) => root.querySelector(sel);
  const el = (tag, props = {}, text) => {
    const node = Object.assign(document.createElement(tag), props);
    if (text != null) node.textContent = text;
    return node;
  };

  const storage = {
    get(key, fallback) {
      try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; }
    },
    set(key, value) {
      try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* depolama kapalı olabilir */ }
    }
  };

  /* ---------- Sekmeler ---------- */

  const tabs = document.querySelectorAll("[data-tab]");
  function showTab(name) {
    if (!$("#tab-" + name)) name = "akademik";
    tabs.forEach(t => t.setAttribute("aria-selected", String(t.dataset.tab === name)));
    document.querySelectorAll(".tab-panel").forEach(p => { p.hidden = p.id !== "tab-" + name; });
    if (name === "favoriler") renderFavorites();
  }
  tabs.forEach(t => t.addEventListener("click", () => {
    history.replaceState(null, "", location.search + "#" + t.dataset.tab);
    showTab(t.dataset.tab);
  }));

  /* ---------- UTC saati ---------- */

  function tickClock() {
    $("#utcClock").textContent = new Date().toISOString().slice(11, 19) + "Z";
  }
  tickClock();
  setInterval(tickClock, 1000);

  /* ---------- Yardımcılar ---------- */

  function stripTags(html) {
    if (!html) return "";
    const doc = new DOMParser().parseFromString(html, "text/html");
    return (doc.body.textContent || "").replace(/\s+/g, " ").trim();
  }

  function abstractFromInvertedIndex(index) {
    if (!index) return "";
    const words = [];
    for (const [word, positions] of Object.entries(index)) {
      for (const p of positions) words[p] = word;
    }
    return words.filter(Boolean).join(" ");
  }

  function normalizeDoi(doi) {
    return doi ? doi.replace(/^https?:\/\/(dx\.)?doi\.org\//i, "").toLowerCase() : "";
  }

  const TYPE_LABELS = {
    article: "Makale", "journal-article": "Makale", "proceedings-article": "Bildiri",
    "book-chapter": "Kitap bölümü", book: "Kitap", dissertation: "Tez", preprint: "Ön baskı",
    "posted-content": "Ön baskı", review: "Derleme", report: "Rapor", dataset: "Veri seti"
  };

  const OA_LABELS = {
    gold: "Açık erişim (gold)", diamond: "Açık erişim (diamond)", green: "Açık erişim (green – arşiv sürümü)",
    hybrid: "Açık erişim (hybrid)", bronze: "Ücretsiz okunabilir (bronze)"
  };

  /* ---------- Akademik arama ---------- */

  const state = { page: 1, total: 0, lastParams: null };

  function readParams() {
    let q = $("#q").value.trim();
    if (q && $("#atcScope").checked && !ATC_CONTEXT.test(q)) q += " air traffic";
    return {
      q,
      rawQ: $("#q").value.trim(),
      source: $("#source").value,
      yearFrom: parseInt($("#yearFrom").value, 10) || null,
      yearTo: parseInt($("#yearTo").value, 10) || null,
      sort: $("#sort").value,
      access: $("#access").value
    };
  }

  async function fetchJson(url) {
    const res = await fetch(url, { headers: { Accept: "application/json" } });
    if (!res.ok) throw new Error("HTTP " + res.status);
    return res.json();
  }

  function fromOpenAlex(w) {
    const loc = w.primary_location || {};
    const oa = w.open_access || {};
    const best = w.best_oa_location || {};
    const doi = normalizeDoi(w.doi);
    return {
      id: doi || w.id,
      doi,
      title: w.display_name || "(başlıksız)",
      authors: (w.authorships || []).map(a => a.author && a.author.display_name).filter(Boolean),
      year: w.publication_year,
      venue: loc.source ? loc.source.display_name : "",
      type: w.type,
      cited: w.cited_by_count,
      abstract: abstractFromInvertedIndex(w.abstract_inverted_index),
      landing: doi ? "https://doi.org/" + doi : (loc.landing_page_url || w.id),
      isOa: !!oa.is_oa,
      oaStatus: oa.oa_status,
      oaUrl: best.pdf_url || oa.oa_url || best.landing_page_url || null,
      openalex: w.id
    };
  }

  function fromCrossref(w) {
    const doi = normalizeDoi(w.DOI);
    const dateParts = (w.issued || w.published || {})["date-parts"];
    return {
      id: doi,
      doi,
      title: (w.title && w.title[0]) || "(başlıksız)",
      authors: (w.author || []).map(a => [a.given, a.family].filter(Boolean).join(" ") || a.name).filter(Boolean),
      year: dateParts && dateParts[0] && dateParts[0][0],
      venue: (w["container-title"] && w["container-title"][0]) || w.publisher || "",
      type: w.type,
      cited: w["is-referenced-by-count"],
      abstract: stripTags(w.abstract),
      landing: doi ? "https://doi.org/" + doi : w.URL,
      isOa: null,
      oaStatus: null,
      oaUrl: null
    };
  }

  async function searchOpenAlex(p, page) {
    const filters = [];
    if (p.yearFrom) filters.push("from_publication_date:" + p.yearFrom + "-01-01");
    if (p.yearTo) filters.push("to_publication_date:" + p.yearTo + "-12-31");
    if (p.access === "oa") filters.push("is_oa:true");
    if (p.access === "closed") filters.push("is_oa:false");
    const url = new URL("https://api.openalex.org/works");
    url.searchParams.set("search", p.q);
    if (filters.length) url.searchParams.set("filter", filters.join(","));
    if (p.sort === "date") url.searchParams.set("sort", "publication_date:desc");
    if (p.sort === "cited") url.searchParams.set("sort", "cited_by_count:desc");
    url.searchParams.set("per_page", PER_PAGE);
    url.searchParams.set("page", page);
    url.searchParams.set("select", "id,doi,display_name,publication_year,authorships,primary_location,open_access,best_oa_location,cited_by_count,abstract_inverted_index,type");
    const data = await fetchJson(url);
    return { total: data.meta.count, items: data.results.map(fromOpenAlex) };
  }

  // Crossref erişim durumu vermez; DOI'ler üzerinden OpenAlex'ten açık erişim bilgisini tamamlarız.
  async function enrichWithOpenAlex(items) {
    const dois = items.map(i => i.doi).filter(Boolean);
    if (!dois.length) return;
    const url = new URL("https://api.openalex.org/works");
    url.searchParams.set("filter", "doi:" + dois.join("|"));
    url.searchParams.set("per_page", 50);
    url.searchParams.set("select", "doi,open_access,best_oa_location,abstract_inverted_index");
    try {
      const data = await fetchJson(url);
      const byDoi = new Map(data.results.map(r => [normalizeDoi(r.doi), r]));
      for (const item of items) {
        const r = byDoi.get(item.doi);
        if (!r) continue;
        const oa = r.open_access || {};
        const best = r.best_oa_location || {};
        item.isOa = !!oa.is_oa;
        item.oaStatus = oa.oa_status;
        item.oaUrl = best.pdf_url || oa.oa_url || best.landing_page_url || null;
        if (!item.abstract) item.abstract = abstractFromInvertedIndex(r.abstract_inverted_index);
      }
    } catch { /* zenginleştirme isteğe bağlı */ }
  }

  async function searchCrossref(p, page) {
    const url = new URL("https://api.crossref.org/works");
    url.searchParams.set("query", p.q);
    const filters = [];
    if (p.yearFrom) filters.push("from-pub-date:" + p.yearFrom);
    if (p.yearTo) filters.push("until-pub-date:" + p.yearTo);
    if (filters.length) url.searchParams.set("filter", filters.join(","));
    if (p.sort === "date") { url.searchParams.set("sort", "published"); url.searchParams.set("order", "desc"); }
    if (p.sort === "cited") { url.searchParams.set("sort", "is-referenced-by-count"); url.searchParams.set("order", "desc"); }
    url.searchParams.set("rows", PER_PAGE);
    url.searchParams.set("offset", (page - 1) * PER_PAGE);
    url.searchParams.set("select", "DOI,title,author,issued,published,container-title,publisher,type,is-referenced-by-count,abstract,URL");
    const data = await fetchJson(url);
    let items = data.message.items.map(fromCrossref);
    await enrichWithOpenAlex(items);
    if (p.access === "oa") items = items.filter(i => i.isOa);
    if (p.access === "closed") items = items.filter(i => i.isOa === false);
    return { total: Math.min(data.message["total-results"], 10000), items, filteredClientSide: p.access !== "all" };
  }

  async function runSearch(page = 1) {
    const p = readParams();
    if (!p.q) return;
    state.page = page;
    state.lastParams = p;

    const url = new URL(location.href);
    url.searchParams.set("q", p.rawQ);
    history.replaceState(null, "", url.pathname + url.search + location.hash);
    renderExternalLinks(p.rawQ);

    const status = $("#status");
    status.className = "status loading";
    status.textContent = "Aranıyor…";
    $("#results").replaceChildren();
    $("#prevPage").disabled = $("#nextPage").disabled = true;

    try {
      const res = p.source === "crossref" ? await searchCrossref(p, page) : await searchOpenAlex(p, page);
      state.total = res.total;
      const favIds = new Set(getFavorites().map(f => f.id));
      $("#results").replaceChildren(...res.items.map(item => renderResult(item, favIds.has(item.id))));

      const lastPage = Math.max(1, Math.ceil(res.total / PER_PAGE));
      status.className = "status";
      if (!res.total) {
        status.textContent = "Sonuç bulunamadı. Daha genel bir terim deneyin veya “ATC bağlamıyla sınırla” seçeneğini kapatın.";
      } else {
        const oaCount = res.items.filter(i => i.isOa).length;
        status.textContent = `${res.total.toLocaleString("tr-TR")} sonuç • bu sayfada ${oaCount}/${res.items.length} çalışmanın açık erişimli sürümü var` +
          (res.filteredClientSide ? " (Crossref'te erişim filtresi yalnızca bu sayfaya uygulanır)" : "") +
          (p.q !== p.rawQ ? ` • aranan: “${p.q}”` : "");
      }
      $("#pageInfo").textContent = res.total ? `Sayfa ${page} / ${lastPage.toLocaleString("tr-TR")}` : "";
      $("#prevPage").disabled = page <= 1;
      $("#nextPage").disabled = page >= lastPage || (p.source === "openalex" && page * PER_PAGE >= 10000);
    } catch (err) {
      status.className = "status error";
      status.textContent = "Arama başarısız oldu (" + err.message + "). Bağlantınızı kontrol edip tekrar deneyin veya diğer kaynağı seçin.";
    }
  }

  function formatAuthors(authors, max = 6) {
    if (!authors.length) return "Yazar bilgisi yok";
    return authors.length > max ? authors.slice(0, max).join(", ") + " ve ark." : authors.join(", ");
  }

  function badge(text, cls) { return el("span", { className: "badge " + cls }, text); }

  function renderResult(item, isFav) {
    const li = $("#resultTpl").content.firstElementChild.cloneNode(true);
    const a = $(".title a", li);
    a.href = item.landing;
    a.textContent = item.title;

    const badges = $(".badges", li);
    if (item.isOa === true) badges.append(badge(OA_LABELS[item.oaStatus] || "Açık erişim", "oa"));
    else if (item.isOa === false) badges.append(badge("Kısıtlı erişim", "closed"));
    else badges.append(badge("Erişim bilinmiyor", "unknown"));
    if (item.type) badges.append(badge(TYPE_LABELS[item.type] || item.type, "type"));

    const meta = [formatAuthors(item.authors), item.year, item.venue].filter(Boolean).join(" • ");
    $(".meta", li).textContent = meta + (item.cited != null ? ` • ${item.cited} atıf` : "");

    if (item.abstract) {
      const details = $(".abstract", li);
      details.hidden = false;
      $("p", details).textContent = item.abstract;
    }

    const actions = $(".actions", li);
    if (item.oaUrl) actions.append(el("a", { className: "btn small primary", href: item.oaUrl, target: "_blank", rel: "noopener" }, "Tam metin (açık)"));
    actions.append(el("a", { className: "btn small", href: item.landing, target: "_blank", rel: "noopener" }, item.isOa ? "Yayıncı sayfası" : "Yayıncı sayfası / özet"));
    actions.append(el("a", {
      className: "btn small", target: "_blank", rel: "noopener",
      href: "https://scholar.google.com/scholar?q=" + encodeURIComponent('"' + item.title + '"'),
      title: "Ön baskı veya yazar sürümü bulmak için"
    }, "Scholar'da diğer sürümler"));

    const citeBtn = el("button", { className: "btn small", type: "button" }, "Atıf kopyala (APA)");
    citeBtn.addEventListener("click", () => copyText(toApa(item), citeBtn));
    actions.append(citeBtn);

    const favBtn = el("button", { className: "btn small fav", type: "button" });
    const setFavLabel = on => { favBtn.textContent = on ? "★ Kaydedildi" : "☆ Kaydet"; favBtn.classList.toggle("on", on); };
    setFavLabel(isFav);
    favBtn.addEventListener("click", () => setFavLabel(toggleFavorite(item)));
    actions.append(favBtn);

    return li;
  }

  function toApa(item) {
    const authors = item.authors.length ? item.authors.slice(0, 20).join(", ") : "Anonim";
    return `${authors} (${item.year || "t.y."}). ${item.title}.` +
      (item.venue ? ` ${item.venue}.` : "") + (item.doi ? ` https://doi.org/${item.doi}` : "");
  }

  function toBibtex(item, i) {
    const first = (item.authors[0] || "anon").split(" ").pop().replace(/[^A-Za-z]/g, "").toLowerCase() || "anon";
    const key = first + (item.year || "") + "_" + (i + 1);
    const esc = s => String(s || "").replace(/[{}]/g, "");
    const fields = [
      ["title", item.title], ["author", item.authors.join(" and ")], ["year", item.year],
      ["journal", item.venue], ["doi", item.doi], ["url", item.oaUrl || item.landing]
    ].filter(([, v]) => v);
    return `@article{${key},\n` + fields.map(([k, v]) => `  ${k} = {${esc(v)}}`).join(",\n") + "\n}";
  }

  async function copyText(text, btn) {
    const original = btn.textContent;
    try {
      await navigator.clipboard.writeText(text);
      btn.textContent = "Kopyalandı ✓";
    } catch {
      window.prompt("Kopyalayın:", text);
    }
    setTimeout(() => { btn.textContent = original; }, 1500);
  }

  function renderExternalLinks(q) {
    const box = $("#externalLinks");
    box.replaceChildren(...window.ATC_EXTERNAL_SEARCH.map(s =>
      el("a", { href: s.url.replace("{q}", encodeURIComponent(q || "air traffic control")), target: "_blank", rel: "noopener", className: "ext-link" }, s.name)
    ));
  }

  $("#searchForm").addEventListener("submit", e => { e.preventDefault(); runSearch(1); });
  ["source", "sort", "access", "atcScope"].forEach(id => $("#" + id).addEventListener("change", () => { if ($("#q").value.trim()) runSearch(1); }));
  $("#prevPage").addEventListener("click", () => { runSearch(state.page - 1); window.scrollTo({ top: $("#status").offsetTop - 80, behavior: "smooth" }); });
  $("#nextPage").addEventListener("click", () => { runSearch(state.page + 1); window.scrollTo({ top: $("#status").offsetTop - 80, behavior: "smooth" }); });

  $("#topicChips").replaceChildren(...window.ATC_TOPICS.map(t => {
    const b = el("button", { type: "button", className: "chip" }, t.label);
    b.addEventListener("click", () => { $("#q").value = t.query; runSearch(1); });
    return b;
  }));

  /* ---------- Kaydedilenler ---------- */

  function getFavorites() { return storage.get(FAV_KEY, []); }

  function toggleFavorite(item) {
    const favs = getFavorites();
    const idx = favs.findIndex(f => f.id === item.id);
    if (idx >= 0) favs.splice(idx, 1); else favs.unshift(item);
    storage.set(FAV_KEY, favs);
    updateFavCount();
    return idx < 0;
  }

  function updateFavCount() { $("#favCount").textContent = getFavorites().length; }

  function renderFavorites() {
    const favs = getFavorites();
    const list = $("#favList");
    if (!favs.length) {
      list.replaceChildren(el("li", { className: "empty" }, "Henüz kaydedilmiş çalışma yok. Arama sonuçlarındaki “☆ Kaydet” düğmesini kullanın."));
      return;
    }
    list.replaceChildren(...favs.map(f => {
      const li = renderResult(f, true);
      $(".fav", li).addEventListener("click", () => setTimeout(renderFavorites, 0));
      return li;
    }));
  }

  $("#exportBib").addEventListener("click", () => {
    const favs = getFavorites();
    if (!favs.length) return;
    const blob = new Blob([favs.map(toBibtex).join("\n\n")], { type: "application/x-bibtex" });
    const a = el("a", { href: URL.createObjectURL(blob), download: "atc-kaynakca.bib" });
    document.body.append(a);
    a.click();
    setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 0);
  });

  $("#clearFav").addEventListener("click", () => {
    if (!getFavorites().length || !confirm("Tüm kaydedilen çalışmalar silinsin mi?")) return;
    storage.set(FAV_KEY, []);
    updateFavCount();
    renderFavorites();
  });

  /* ---------- Kaynaklar ---------- */

  function renderResources(filter = "") {
    const f = filter.toLocaleLowerCase("tr-TR");
    const groups = window.ATC_RESOURCES.map(g => {
      const items = g.items.filter(i => !f || (i.name + " " + i.desc).toLocaleLowerCase("tr-TR").includes(f));
      if (!items.length) return null;
      const section = el("section", { className: "res-group" });
      section.append(el("h2", {}, g.group));
      const grid = el("div", { className: "res-grid" });
      for (const i of items) {
        const card = el("a", { className: "res-card", href: i.url, target: "_blank", rel: "noopener" });
        card.append(el("strong", {}, i.name), el("span", {}, i.desc), el("small", {}, new URL(i.url).hostname.replace(/^www\./, "")));
        grid.append(card);
      }
      section.append(grid);
      return section;
    }).filter(Boolean);
    $("#resources").replaceChildren(...(groups.length ? groups : [el("p", { className: "muted" }, "Eşleşen kaynak yok.")]));
  }
  $("#resFilter").addEventListener("input", e => renderResources(e.target.value));

  /* ---------- METAR / TAF ---------- */

  async function fetchText(url) {
    const res = await fetch(url);
    if (!res.ok) throw new Error("HTTP " + res.status);
    return res.text();
  }

  async function loadWeather() {
    const ids = $("#icao").value.toUpperCase().split(/[\s,;]+/).filter(s => /^[A-Z0-9]{4}$/.test(s));
    const status = $("#wxStatus");
    const out = $("#wxResults");
    if (!ids.length) { status.className = "status error"; status.textContent = "Geçerli 4 karakterli ICAO kodu girin."; return; }
    storage.set("atc-portal-icao", ids.join(" "));
    status.className = "status loading";
    status.textContent = "Getiriliyor…";
    out.replaceChildren();
    const q = encodeURIComponent(ids.join(","));
    try {
      const [metars, tafs] = await Promise.all([
        fetchText(`https://aviationweather.gov/api/data/metar?ids=${q}&format=raw&hours=2`),
        fetchText(`https://aviationweather.gov/api/data/taf?ids=${q}&format=raw`)
      ]);
      const metarLines = metars.split("\n").map(s => s.trim()).filter(Boolean);
      const tafBlocks = tafs.split(/\n(?=TAF\b)/).map(s => s.trim()).filter(Boolean);
      for (const id of ids) {
        const card = el("article", { className: "card wx-card" });
        card.append(el("h3", {}, id));
        const m = metarLines.filter(l => new RegExp("(^|\\s)" + id + "\\s").test(l));
        const t = tafBlocks.filter(b => new RegExp("(^|\\s)" + id + "\\s").test(b));
        card.append(el("h4", {}, "METAR"), el("pre", {}, m.length ? m.join("\n") : "Veri yok"));
        card.append(el("h4", {}, "TAF"), el("pre", {}, t.length ? t.join("\n\n") : "Veri yok"));
        out.append(card);
      }
      status.className = "status";
      status.textContent = "Güncellendi: " + new Date().toISOString().slice(11, 16) + "Z";
    } catch (err) {
      status.className = "status error";
      status.replaceChildren(
        document.createTextNode("Veriler alınamadı (" + err.message + "). "),
        el("a", { href: "https://aviationweather.gov/data/metar/?ids=" + q + "&taf=1", target: "_blank", rel: "noopener" }, "aviationweather.gov'da aç"),
        document.createTextNode(" veya "),
        el("a", { href: "https://www.mgm.gov.tr/havacilik/", target: "_blank", rel: "noopener" }, "MGM Havacılık")
      );
    }
  }
  $("#wxForm").addEventListener("submit", e => { e.preventDefault(); loadWeather(); });

  /* ---------- Başlangıç ---------- */

  const savedIcao = storage.get("atc-portal-icao", null);
  if (savedIcao) $("#icao").value = savedIcao;
  updateFavCount();
  renderResources();
  showTab(location.hash.slice(1) || "akademik");
  window.addEventListener("hashchange", () => showTab(location.hash.slice(1)));

  const initialQ = new URLSearchParams(location.search).get("q");
  $("#q").value = initialQ || "air traffic controller workload";
  renderExternalLinks($("#q").value);
  runSearch(1);
})();
