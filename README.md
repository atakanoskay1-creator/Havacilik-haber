# Havacilik-haber — ATC Bilgi Portalı

Hava trafik kontrolörleri için statik (sunucusuz) bir havacılık bilgi portalı.

## Özellikler

- **Akademik arama** – [OpenAlex](https://openalex.org) veya [Crossref](https://www.crossref.org) açık API'leri üzerinden makale, bildiri ve tez araması.
  - Tam metni **ücretli/kısıtlı** olan çalışmalar da listelenir: başlık, yazarlar, yıl, dergi, atıf sayısı, özet (varsa) ve DOI/yayıncı bağlantısı gösterilir.
  - Açık erişimli bir sürüm (yayıncı, arşiv/green, ön baskı) bulunursa “Tam metin (açık)” bağlantısı eklenir.
  - Her sonuç için Google Scholar'da diğer sürümleri arama, APA atıf kopyalama ve kaydetme.
  - Yıl aralığı, sıralama (ilgililik / en yeni / en çok atıf) ve erişim türü filtreleri; hazır ATC konu etiketleri.
  - Aynı aramayı Google Scholar, DergiPark, YÖK Tez, IEEE Xplore, NASA NTRS vb. veri tabanlarında açan bağlantılar.
- **Kaynaklar** – SHGM, DHMİ, ICAO, EUROCONTROL, EASA, FAA, AIP/NOTAM, emniyet raporları, dergiler ve haber siteleri.
- **METAR/TAF** – aviationweather.gov verileriyle ICAO kodu bazında sorgu.
- **Kaydedilenler** – tarayıcıda saklanan liste, BibTeX olarak dışa aktarma.
- UTC saat, açık/koyu tema, mobil uyumlu arayüz.

## Çalıştırma

Derleme gerekmez. Bir statik sunucuyla açın:

```bash
python3 -m http.server 8000
# http://localhost:8000
```

GitHub Pages ile yayınlamak için depo ayarlarında **Pages → Deploy from a branch** seçip kök dizini gösterin.

## Yapı

```
index.html            Sayfa iskeleti
assets/css/style.css  Stiller
assets/js/data.js     Hazır konular, harici arama motorları, kaynak listesi (buradan düzenleyin)
assets/js/app.js      Arama, METAR/TAF, kaydedilenler
```

> Bu portal resmi bir kaynak değildir; operasyonel kararlar için yürürlükteki mevzuat ve AIP esas alınmalıdır.
