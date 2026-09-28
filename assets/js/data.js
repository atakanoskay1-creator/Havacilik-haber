// Portalın statik içerikleri: hazır arama konuları, harici arama motorları ve kaynak listesi.

window.ATC_TOPICS = [
  { label: "İş yükü", query: "air traffic controller workload" },
  { label: "Yorgunluk", query: "air traffic controller fatigue" },
  { label: "Durumsal farkındalık", query: "situational awareness air traffic control" },
  { label: "Uzak kule", query: "remote tower" },
  { label: "Yapay zekâ / otomasyon", query: "artificial intelligence air traffic management automation" },
  { label: "Çatışma tespiti", query: "conflict detection and resolution air traffic" },
  { label: "Pilot-kontrolör iletişimi", query: "pilot controller communication phraseology" },
  { label: "Stres", query: "air traffic controller stress" },
  { label: "Sektör kapasitesi", query: "airspace sector capacity" },
  { label: "İnsan faktörleri", query: "human factors air traffic control" },
  { label: "Pist güvenliği", query: "runway incursion" },
  { label: "SESAR / NextGen", query: "SESAR NextGen air traffic management" },
  { label: "Eğitim / simülatör", query: "air traffic controller training simulator" },
  { label: "Emniyet yönetimi", query: "safety management system air navigation service provider" },
  { label: "Konuşma tanıma", query: "automatic speech recognition air traffic control" },
  { label: "Türkçe çalışmalar", query: "hava trafik kontrolörü" }
];

// {q} arama terimiyle değiştirilir (URL-kodlu).
window.ATC_EXTERNAL_SEARCH = [
  { name: "Google Scholar", url: "https://scholar.google.com/scholar?q={q}" },
  { name: "Semantic Scholar", url: "https://www.semanticscholar.org/search?q={q}" },
  { name: "DergiPark", url: "https://dergipark.org.tr/tr/search?q={q}" },
  { name: "YÖK Ulusal Tez Merkezi", url: "https://tez.yok.gov.tr/UlusalTezMerkezi/" },
  { name: "NASA NTRS", url: "https://ntrs.nasa.gov/search?q={q}" },
  { name: "ScienceDirect", url: "https://www.sciencedirect.com/search?qs={q}" },
  { name: "IEEE Xplore", url: "https://ieeexplore.ieee.org/search/searchresult.jsp?queryText={q}" },
  { name: "AIAA ARC", url: "https://arc.aiaa.org/action/doSearch?AllField={q}" },
  { name: "Taylor & Francis", url: "https://www.tandfonline.com/action/doSearch?AllField={q}" },
  { name: "SpringerLink", url: "https://link.springer.com/search?query={q}" },
  { name: "ResearchGate", url: "https://www.researchgate.net/search/publication?q={q}" },
  { name: "CORE (açık erişim)", url: "https://core.ac.uk/search?q={q}" },
  { name: "BASE", url: "https://www.base-search.net/Search/Results?lookfor={q}" },
  { name: "arXiv", url: "https://arxiv.org/search/?query={q}&searchtype=all" },
  { name: "SKYbrary", url: "https://skybrary.aero/search?search_api_fulltext={q}" }
];

window.ATC_RESOURCES = [
  {
    group: "Otoriteler ve hizmet sağlayıcılar",
    items: [
      { name: "SHGM – Sivil Havacılık Genel Müdürlüğü", url: "https://web.shgm.gov.tr/", desc: "Türkiye sivil havacılık otoritesi, yönetmelik ve talimatlar." },
      { name: "DHMİ – Hava Seyrüsefer Dairesi", url: "https://www.dhmi.gov.tr/", desc: "Türkiye hava seyrüsefer hizmet sağlayıcısı." },
      { name: "ICAO", url: "https://www.icao.int/", desc: "Uluslararası Sivil Havacılık Örgütü; SARPs, Annex'ler, Doc'lar." },
      { name: "EUROCONTROL", url: "https://www.eurocontrol.int/", desc: "Avrupa hava seyrüsefer emniyeti örgütü; NM, raporlar, yayınlar." },
      { name: "EASA", url: "https://www.easa.europa.eu/", desc: "Avrupa Birliği Havacılık Emniyeti Ajansı; ATM/ANS kuralları." },
      { name: "FAA – Air Traffic", url: "https://www.faa.gov/air_traffic", desc: "ABD Federal Havacılık İdaresi hava trafik bölümü." },
      { name: "CANSO", url: "https://canso.org/", desc: "Sivil hava seyrüsefer hizmet sağlayıcıları organizasyonu." },
      { name: "IFATCA", url: "https://ifatca.org/", desc: "Uluslararası Hava Trafik Kontrolörleri Dernekleri Federasyonu." },
      { name: "TATCA – Türkiye Hava Trafik Kontrolörleri Derneği", url: "https://www.tatca.org.tr/", desc: "Türkiye'deki meslek derneği." }
    ]
  },
  {
    group: "Mevzuat, AIP ve NOTAM",
    items: [
      { name: "AIP Türkiye (DHMİ AIM)", url: "https://aim.dhmi.gov.tr/", desc: "Türkiye Havacılık Bilgi Yayını, AIC ve AIP değişiklikleri." },
      { name: "EAD – European AIS Database", url: "https://www.ead.eurocontrol.int/", desc: "Avrupa AIS veri tabanı (kayıt gerekli)." },
      { name: "FAA NOTAM Search", url: "https://notams.aim.faa.gov/notamSearch/", desc: "Uluslararası NOTAM sorgulama." },
      { name: "ICAO Store (Doc 4444 PANS-ATM vb.)", url: "https://store.icao.int/", desc: "ICAO dokümanları (ücretli)." },
      { name: "EASA Easy Access Rules – ATM/ANS", url: "https://www.easa.europa.eu/en/document-library/easy-access-rules", desc: "Konsolide AB ATM/ANS kuralları." },
      { name: "FAA JO 7110.65", url: "https://www.faa.gov/air_traffic/publications/atpubs/atc_html/", desc: "ABD hava trafik kontrol usulleri." }
    ]
  },
  {
    group: "Emniyet ve olay raporları",
    items: [
      { name: "SKYbrary", url: "https://skybrary.aero/", desc: "Havacılık emniyeti bilgi bankası; ATM makaleleri ve olay özetleri." },
      { name: "KAİK – Kaza Kırım İnceleme Kurulu", url: "https://kaik.gov.tr/", desc: "Türkiye kaza/olay inceleme raporları." },
      { name: "BEA (Fransa)", url: "https://bea.aero/", desc: "Fransız kaza inceleme bürosu raporları." },
      { name: "NTSB", url: "https://www.ntsb.gov/", desc: "ABD Ulusal Ulaştırma Güvenliği Kurulu." },
      { name: "Aviation Safety Network", url: "https://aviation-safety.net/", desc: "Kaza veri tabanı." },
      { name: "NASA ASRS", url: "https://asrs.arc.nasa.gov/", desc: "Gönüllü emniyet raporlama sistemi ve CALLBACK bülteni." }
    ]
  },
  {
    group: "Akademik dergiler ve yayın kaynakları",
    items: [
      { name: "The Journal of Air Traffic Control", url: "https://www.atca.org/", desc: "ATCA yayını." },
      { name: "Journal of Air Transport Management", url: "https://www.sciencedirect.com/journal/journal-of-air-transport-management", desc: "Elsevier." },
      { name: "The International Journal of Aerospace Psychology", url: "https://www.tandfonline.com/journals/hiap21", desc: "Taylor & Francis." },
      { name: "Aviation Psychology and Applied Human Factors", url: "https://econtent.hogrefe.com/loi/aph", desc: "Hogrefe." },
      { name: "Transportation Research Part C", url: "https://www.sciencedirect.com/journal/transportation-research-part-c-emerging-technologies", desc: "Elsevier; ATM optimizasyonu ve otomasyon." },
      { name: "Journal of Aviation (DergiPark)", url: "https://dergipark.org.tr/tr/pub/jav", desc: "Türkçe/İngilizce açık erişim dergi." },
      { name: "Journal of Aviation Research (DergiPark)", url: "https://dergipark.org.tr/tr/pub/jar", desc: "Açık erişim." },
      { name: "SESAR Innovation Days bildirileri", url: "https://www.sesarju.eu/sesarinnovationdays", desc: "Açık erişimli ATM araştırma bildirileri." },
      { name: "USA/Europe ATM R&D Seminar", url: "https://www.atmseminar.org/", desc: "Açık erişimli ATM seminer bildirileri." },
      { name: "EUROCONTROL yayınları", url: "https://www.eurocontrol.int/publications", desc: "Raporlar, HindSight dergisi, analizler." }
    ]
  },
  {
    group: "Haber",
    items: [
      { name: "AirportHaber", url: "https://www.airporthaber.com/", desc: "Türkçe havacılık haberleri." },
      { name: "Aviation Week", url: "https://aviationweek.com/", desc: "Sektörel haber ve analiz." },
      { name: "Simple Flying", url: "https://simpleflying.com/", desc: "Genel havacılık haberleri." },
      { name: "Aerotime Hub", url: "https://www.aerotime.aero/", desc: "Havacılık haberleri." },
      { name: "Air Traffic Management (dergi)", url: "https://www.airtrafficmanagement.net/", desc: "ATM sektörü haberleri." },
      { name: "EUROCONTROL haberleri", url: "https://www.eurocontrol.int/news", desc: "Ağ durumu ve duyurular." }
    ]
  },
  {
    group: "Operasyonel araçlar",
    items: [
      { name: "EUROCONTROL NOP Portal", url: "https://www.public.nm.eurocontrol.int/PUBPORTAL/gateway/spec/", desc: "Ağ operasyon planı, regülasyonlar." },
      { name: "aviationweather.gov", url: "https://aviationweather.gov/", desc: "METAR, TAF, SIGMET, grafikler." },
      { name: "MGM Havacılık Meteorolojisi", url: "https://www.mgm.gov.tr/havacilik/", desc: "Meteoroloji Genel Müdürlüğü havacılık ürünleri." },
      { name: "Flightradar24", url: "https://www.flightradar24.com/", desc: "Canlı uçuş takibi." },
      { name: "SkyVector", url: "https://skyvector.com/", desc: "Seyrüsefer haritaları." }
    ]
  }
];
