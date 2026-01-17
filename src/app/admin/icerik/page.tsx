"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";

type CmsBlockRow = { key: string; data: any };
type NavItem = { label: string; href: string; cta?: boolean };

const PAGE_KEYS = [
  { key: "page.hakkinda", label: "Hakkımızda" },
  { key: "page.hizmetler", label: "Hizmetler" },
  { key: "page.testler", label: "Testler" },
  { key: "page.randevu", label: "Randevu" },
  { key: "page.iletisim", label: "İletişim" },
  { key: "page.kvkk", label: "KVKK" },
  { key: "page.gizlilik", label: "Gizlilik" },
  { key: "page.cerez", label: "Çerez" },
] as const;

type ThemeData = {
  bg?: string; // legacy
  siteBg?: string;
  navBg?: string;
  primary?: string;
};

type FooterLink = { label: string; href: string };
type FooterData = {
  copyright?: string;
  links?: FooterLink[];
};

function safeJsonParse(input: string) {
  try {
    return { ok: true as const, value: JSON.parse(input) };
  } catch (e: any) {
    return { ok: false as const, error: e?.message ?? "JSON parse error" };
  }
}

export default function Page() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  // tabs
  const [tab, setTab] = useState<
    "menu" | "theme" | "hero" | "pages" | "media" | "footer" | "blocks"
  >("menu");

  // NAV
  const [navItems, setNavItems] = useState<NavItem[]>([]);

  // THEME
  const [themeSiteBg, setThemeSiteBg] = useState("#edf3f1");
  const [themeNavBg, setThemeNavBg] = useState("#edf3f1");
  const [themePrimary, setThemePrimary] = useState("#0f172a");

  // HERO
  const [badge, setBadge] = useState("Gizlilik • Güven • Profesyonellik");
  const [titleA, setTitleA] = useState("Zihinsel Sağlık İçin");
  const [titleB, setTitleB] = useState("Bilimsel Çözümler");
  const [lead, setLead] = useState("Online seanslar için hızlıca randevu oluşturun.");
  const [wordsText, setWordsText] = useState(
    "Güven Temelli\nŞefkat Odaklı\nSürdürülebilir\nYumuşak ve Net"
  );
  const [heroImage, setHeroImage] = useState<string>("/images/eda-keklik-2.png");

  // PAGES
  const [selectedPageKey, setSelectedPageKey] = useState<string>(PAGE_KEYS[0].key);
  const [pageTitle, setPageTitle] = useState<string>("");
  const [pageContent, setPageContent] = useState<string>("");

  // MEDIA
  const [lastUploadUrl, setLastUploadUrl] = useState<string>("");

  // FOOTER
  const [footerCopyright, setFooterCopyright] = useState<string>(
    "© {year} Psikolog Eda Keklik Akalp • Tüm hakları saklıdır."
  );
  const [footerLinks, setFooterLinks] = useState<FooterLink[]>([
    { label: "KVKK", href: "/kvkk" },
    { label: "Gizlilik", href: "/gizlilik" },
    { label: "Çerez", href: "/cerez" },
  ]);

  // BLOCKS (generic json editor)
  const [allKeys, setAllKeys] = useState<string[]>([]);
  const [blockKey, setBlockKey] = useState<string>("theme");
  const [blockJson, setBlockJson] = useState<string>("{}");
  const [blockErr, setBlockErr] = useState<string | null>(null);

  const words = useMemo(
    () =>
      wordsText
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean),
    [wordsText]
  );

  async function loadAll() {
    setMsg(null);
    setLoading(true);

    // admin ekranı için temel keyler
    const keys = ["theme", "home.hero", "nav", "footer", ...PAGE_KEYS.map((p) => p.key)];
    const { data, error } = await supabase.from("cms_blocks").select("key,data").in("key", keys);

    if (error) {
      setMsg(error.message);
      setLoading(false);
      return;
    }

    const rows = (data ?? []) as CmsBlockRow[];

    // key listesi (blocks için)
    setAllKeys(Array.from(new Set(rows.map((r) => r.key))).sort());

    const theme = (rows.find((r) => r.key === "theme")?.data ?? {}) as ThemeData;
    const hero = rows.find((r) => r.key === "home.hero")?.data ?? {};
    const nav = rows.find((r) => r.key === "nav")?.data ?? {};
    const footer = (rows.find((r) => r.key === "footer")?.data ?? {}) as FooterData;
    const firstPage = rows.find((r) => r.key === selectedPageKey)?.data ?? {};

    // THEME legacy fallback
    const fallbackBg = theme.bg ?? "#edf3f1";
    setThemeSiteBg(theme.siteBg ?? fallbackBg);
    setThemeNavBg(theme.navBg ?? fallbackBg);
    setThemePrimary(theme.primary ?? "#0f172a");

    // HERO
    setBadge(hero.badge ?? "Gizlilik • Güven • Profesyonellik");
    setTitleA(hero.titleA ?? "Zihinsel Sağlık İçin");
    setTitleB(hero.titleB ?? "Bilimsel Çözümler");
    setLead(hero.lead ?? "Online seanslar için hızlıca randevu oluşturun.");
    setHeroImage(hero.heroImage ?? "/images/eda-keklik-2.png");
    setWordsText(Array.isArray(hero.words) ? hero.words.join("\n") : wordsText);

    // NAV
    const items = (nav.items ??
      [
        { href: "/", label: "Ana Sayfa" },
        { href: "/hakkinda", label: "Hakkımızda" },
        { href: "/hizmetler", label: "Hizmetler" },
        { href: "/testler", label: "Testler" },
        { href: "/randevu", label: "Randevu Al", cta: true },
        { href: "/iletisim", label: "İletişim" },
      ]) as NavItem[];
    setNavItems(Array.isArray(items) ? items : []);

    // PAGES
    setPageTitle(firstPage.title ?? "");
    setPageContent(firstPage.content ?? "");

    // FOOTER
    setFooterCopyright(
      typeof footer.copyright === "string" && footer.copyright.trim()
        ? footer.copyright.trim()
        : "© {year} Psikolog Eda Keklik Akalp • Tüm hakları saklıdır."
    );
    const fLinks =
      Array.isArray(footer.links) && footer.links.length
        ? footer.links.filter((l) => l?.label && l?.href)
        : [
            { label: "KVKK", href: "/kvkk" },
            { label: "Gizlilik", href: "/gizlilik" },
            { label: "Çerez", href: "/cerez" },
          ];
    setFooterLinks(fLinks);

    // BLOCKS: seçili key varsa onun jsonunu göster
    const current = rows.find((r) => r.key === blockKey)?.data ?? {};
    setBlockJson(JSON.stringify(current, null, 2));
    setBlockErr(null);

    setLoading(false);
  }

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadOnePage(key: string) {
    setMsg(null);

    const { data, error } = await supabase.from("cms_blocks").select("data").eq("key", key).single();
    if (error) return setMsg(error.message);

    setPageTitle(data?.data?.title ?? "");
    setPageContent(data?.data?.content ?? "");
  }

  async function saveAll() {
    setMsg(null);
    setSaving(true);

    const themeData: ThemeData = {
      siteBg: themeSiteBg,
      navBg: themeNavBg,
      primary: themePrimary,
      bg: themeSiteBg, // legacy uyumluluk
    };

    const heroData = { badge, titleA, titleB, lead, words, heroImage };
    const navData = { items: navItems };

    const footerData: FooterData = {
      copyright: footerCopyright,
      links: footerLinks.filter((l) => l.label?.trim() && l.href?.trim()),
    };

    const { error } = await supabase.from("cms_blocks").upsert(
      [
        { key: "theme", data: themeData },
        { key: "home.hero", data: heroData },
        { key: "nav", data: navData },
        { key: "footer", data: footerData },
      ],
      { onConflict: "key" }
    );

    setMsg(error ? error.message : "Kaydedildi ✅");
    setSaving(false);
  }

  async function savePage() {
    setMsg(null);
    setSaving(true);

    const { error } = await supabase.from("cms_blocks").upsert(
      [{ key: selectedPageKey, data: { title: pageTitle, content: pageContent } }],
      { onConflict: "key" }
    );

    setMsg(error ? error.message : "Sayfa kaydedildi ✅");
    setSaving(false);
  }

  async function uploadToSiteBucket(file: File) {
    setMsg(null);

    const ext = file.name.split(".").pop()?.toLowerCase() || "png";
    const safeExt = ["png", "jpg", "jpeg", "webp", "gif", "svg"].includes(ext) ? ext : "png";
    const path = `uploads/${Date.now()}-${Math.random().toString(16).slice(2)}.${safeExt}`;

    const { error: upErr } = await supabase.storage.from("site").upload(path, file, { upsert: false });
    if (upErr) return setMsg(upErr.message);

    const { data } = supabase.storage.from("site").getPublicUrl(path);
    setLastUploadUrl(data.publicUrl);
    setMsg("Yüklendi ✅ (URL kopyalayabilirsin)");
  }

  async function reloadBlock(k: string) {
    setBlockErr(null);
    const { data, error } = await supabase.from("cms_blocks").select("data").eq("key", k).maybeSingle();
    if (error) {
      setBlockErr(error.message);
      return;
    }
    setBlockJson(JSON.stringify(data?.data ?? {}, null, 2));
  }

  async function saveBlock() {
    setMsg(null);
    setSaving(true);
    setBlockErr(null);

    const parsed = safeJsonParse(blockJson);
    if (!parsed.ok) {
      setBlockErr(parsed.error);
      setSaving(false);
      return;
    }

    const { error } = await supabase.from("cms_blocks").upsert(
      [{ key: blockKey, data: parsed.value }],
      { onConflict: "key" }
    );

    setMsg(error ? error.message : "Block kaydedildi ✅");
    if (!error) {
      setAllKeys((prev) => Array.from(new Set([...prev, blockKey])).sort());
    }
    setSaving(false);
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-10">
        <h1 className="text-2xl font-semibold text-slate-900">İçerik (Admin)</h1>
        <p className="mt-2 text-slate-600">Yükleniyor…</p>
      </div>
    );
  }

  const TabBtn = ({ id, text }: { id: typeof tab; text: string }) => (
    <button
      type="button"
      onClick={() => setTab(id)}
      className={[
        "rounded-full px-4 py-2 text-sm transition",
        tab === id
          ? "bg-slate-900 text-white"
          : "border border-slate-300/60 bg-white/60 text-slate-800 hover:bg-white/80",
      ].join(" ")}
    >
      {text}
    </button>
  );

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">İçerik (Admin)</h1>
          <p className="mt-2 text-slate-600">Menü • Tema • Ana Sayfa • Sayfalar • Footer • Görseller • Blocks</p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={
              tab === "pages" ? savePage : tab === "blocks" ? saveBlock : saveAll
            }
            disabled={saving}
            className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-60"
          >
            {saving ? "Kaydediliyor..." : "Kaydet"}
          </button>
        </div>
      </div>

      {msg ? <div className="mt-4 text-sm text-slate-700">{msg}</div> : null}

      {/* TABS */}
      <div className="mt-6 flex flex-wrap gap-2">
        <TabBtn id="menu" text="Menü" />
        <TabBtn id="theme" text="Tema" />
        <TabBtn id="hero" text="Ana Sayfa" />
        <TabBtn id="pages" text="Sayfalar" />
        <TabBtn id="footer" text="Footer" />
        <TabBtn id="media" text="Görseller" />
        <TabBtn id="blocks" text="Blocks" />
      </div>

      {/* MENU */}
      {tab === "menu" && (
        <div className="mt-6 rounded-3xl border bg-white/60 p-6">
          <div className="text-lg font-semibold text-slate-900">Menü</div>

          <div className="mt-4 grid gap-3">
            {navItems.map((it, i) => (
              <div key={it.href} className="grid gap-2 sm:grid-cols-[1fr_1fr]">
                <div className="rounded-2xl border bg-white/60 px-4 py-3 text-sm text-slate-700">{it.href}</div>

                <input
                  className="w-full rounded-2xl border px-4 py-3 text-sm"
                  value={it.label}
                  onChange={(e) => {
                    const v = e.target.value;
                    setNavItems((prev) => prev.map((x, idx) => (idx === i ? { ...x, label: v } : x)));
                  }}
                  placeholder="Menü adı"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* THEME */}
      {tab === "theme" && (
        <div className="mt-6 rounded-3xl border bg-white/60 p-6">
          <div className="text-lg font-semibold text-slate-900">Tema</div>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <label className="text-sm text-slate-700">
              Site Arkaplanı
              <div className="mt-2 flex items-center gap-3">
                <input
                  type="color"
                  value={themeSiteBg}
                  onChange={(e) => setThemeSiteBg(e.target.value)}
                  className="h-10 w-12 rounded-xl border"
                />
                <input
                  value={themeSiteBg}
                  onChange={(e) => setThemeSiteBg(e.target.value)}
                  className="w-full rounded-2xl border px-4 py-3 text-sm"
                />
              </div>
            </label>

            <label className="text-sm text-slate-700">
              Navbar Arkaplanı
              <div className="mt-2 flex items-center gap-3">
                <input
                  type="color"
                  value={themeNavBg}
                  onChange={(e) => setThemeNavBg(e.target.value)}
                  className="h-10 w-12 rounded-xl border"
                />
                <input
                  value={themeNavBg}
                  onChange={(e) => setThemeNavBg(e.target.value)}
                  className="w-full rounded-2xl border px-4 py-3 text-sm"
                />
              </div>
            </label>

            <label className="text-sm text-slate-700">
              Primary
              <div className="mt-2 flex items-center gap-3">
                <input
                  type="color"
                  value={themePrimary}
                  onChange={(e) => setThemePrimary(e.target.value)}
                  className="h-10 w-12 rounded-xl border"
                />
                <input
                  value={themePrimary}
                  onChange={(e) => setThemePrimary(e.target.value)}
                  className="w-full rounded-2xl border px-4 py-3 text-sm"
                />
              </div>
            </label>

            <div className="rounded-2xl border bg-white/60 p-4 text-xs text-slate-600 sm:col-span-2">
              Not: Uyumluluk için <span className="font-mono">theme.bg</span> alanı otomatik olarak “Site Arkaplanı” ile aynı kaydedilir.
            </div>
          </div>
        </div>
      )}

      {/* HERO */}
      {tab === "hero" && (
        <div className="mt-6 rounded-3xl border bg-white/60 p-6">
          <div className="text-lg font-semibold text-slate-900">Ana Sayfa — Hero</div>

          <div className="mt-4 grid gap-4">
            <label className="text-sm text-slate-700">
              Badge
              <input value={badge} onChange={(e) => setBadge(e.target.value)} className="mt-2 w-full rounded-2xl border px-4 py-3 text-sm" />
            </label>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="text-sm text-slate-700">
                Başlık A
                <input value={titleA} onChange={(e) => setTitleA(e.target.value)} className="mt-2 w-full rounded-2xl border px-4 py-3 text-sm" />
              </label>

              <label className="text-sm text-slate-700">
                Başlık B
                <input value={titleB} onChange={(e) => setTitleB(e.target.value)} className="mt-2 w-full rounded-2xl border px-4 py-3 text-sm" />
              </label>
            </div>

            <label className="text-sm text-slate-700">
              Açıklama
              <textarea value={lead} onChange={(e) => setLead(e.target.value)} className="mt-2 w-full rounded-2xl border px-4 py-3 text-sm" rows={3} />
            </label>

            <label className="text-sm text-slate-700">
              Dönen kelimeler (satır satır)
              <textarea value={wordsText} onChange={(e) => setWordsText(e.target.value)} className="mt-2 w-full rounded-2xl border px-4 py-3 font-mono text-xs" rows={6} />
            </label>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="text-sm text-slate-700">
                Görsel URL
                <input value={heroImage} onChange={(e) => setHeroImage(e.target.value)} className="mt-2 w-full rounded-2xl border px-4 py-3 text-sm" />
              </label>

              <label className="text-sm text-slate-700">
                Görsel yükle
                <input
                  type="file"
                  accept="image/*"
                  className="mt-2 w-full rounded-2xl border bg-white px-4 py-3 text-sm"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) uploadToSiteBucket(f).then(() => {
                      if (lastUploadUrl) setHeroImage(lastUploadUrl);
                    });
                  }}
                />
              </label>
            </div>

            {heroImage ? (
              <div className="mt-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={heroImage} alt="Hero preview" className="max-h-64 rounded-2xl border" />
              </div>
            ) : null}
          </div>
        </div>
      )}

      {/* PAGES */}
      {tab === "pages" && (
        <div className="mt-6 rounded-3xl border bg-white/60 p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div className="text-lg font-semibold text-slate-900">Sayfalar</div>

            <select
              value={selectedPageKey}
              onChange={(e) => {
                const k = e.target.value;
                setSelectedPageKey(k);
                loadOnePage(k);
              }}
              className="w-full rounded-2xl border bg-white px-4 py-3 text-sm sm:w-[280px]"
            >
              {PAGE_KEYS.map((p) => (
                <option key={p.key} value={p.key}>
                  {p.label}
                </option>
              ))}
            </select>
          </div>

          <div className="mt-4 grid gap-4">
            <label className="text-sm text-slate-700">
              Başlık
              <input value={pageTitle} onChange={(e) => setPageTitle(e.target.value)} className="mt-2 w-full rounded-2xl border px-4 py-3 text-sm" />
            </label>

            <label className="text-sm text-slate-700">
              İçerik (HTML)
              <textarea
                value={pageContent}
                onChange={(e) => setPageContent(e.target.value)}
                className="mt-2 h-[320px] w-full rounded-2xl border p-4 font-mono text-xs"
              />
            </label>

            <div className="rounded-2xl border bg-white/60 p-4 text-xs text-slate-600">
              İpucu: Şimdilik içerik HTML. Sonraki adımda buraya “zengin metin editörü” ekleriz (Wordpress gibi).
            </div>
          </div>
        </div>
      )}

      {/* FOOTER */}
      {tab === "footer" && (
        <div className="mt-6 rounded-3xl border bg-white/60 p-6">
          <div className="text-lg font-semibold text-slate-900">Footer</div>

          <div className="mt-4 grid gap-4">
            <label className="text-sm text-slate-700">
              Copyright ( {`{year}`} otomatik)
              <input
                value={footerCopyright}
                onChange={(e) => setFooterCopyright(e.target.value)}
                className="mt-2 w-full rounded-2xl border px-4 py-3 text-sm"
              />
            </label>

            <div className="rounded-2xl border bg-white/60 p-4">
              <div className="text-sm font-medium text-slate-900">Linkler</div>

              <div className="mt-3 grid gap-3">
                {footerLinks.map((l, i) => (
                  <div key={`${l.href}-${i}`} className="grid gap-2 sm:grid-cols-2">
                    <input
                      value={l.label}
                      onChange={(e) => {
                        const v = e.target.value;
                        setFooterLinks((prev) => prev.map((x, idx) => (idx === i ? { ...x, label: v } : x)));
                      }}
                      className="w-full rounded-2xl border px-4 py-3 text-sm"
                      placeholder="Label"
                    />
                    <input
                      value={l.href}
                      onChange={(e) => {
                        const v = e.target.value;
                        setFooterLinks((prev) => prev.map((x, idx) => (idx === i ? { ...x, href: v } : x)));
                      }}
                      className="w-full rounded-2xl border px-4 py-3 text-sm"
                      placeholder="/kvkk"
                    />
                  </div>
                ))}
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  type="button"
                  className="rounded-2xl border bg-white/70 px-4 py-2 text-sm text-slate-800 hover:bg-white/90"
                  onClick={() => setFooterLinks((p) => [...p, { label: "Yeni Link", href: "/" }])}
                >
                  + Link Ekle
                </button>

                <button
                  type="button"
                  className="rounded-2xl border bg-white/70 px-4 py-2 text-sm text-slate-800 hover:bg-white/90"
                  onClick={() => setFooterLinks((p) => p.slice(0, Math.max(0, p.length - 1)))}
                >
                  − Son Linki Sil
                </button>
              </div>

              <div className="mt-4 rounded-2xl border bg-white/60 p-4 text-xs text-slate-600">
                Not: Footer kaydı <span className="font-mono">cms_blocks.key = "footer"</span> olarak saklanır.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MEDIA */}
      {tab === "media" && (
        <div className="mt-6 rounded-3xl border bg-white/60 p-6">
          <div className="text-lg font-semibold text-slate-900">Görseller</div>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <label className="text-sm text-slate-700">
              Dosya yükle
              <input
                type="file"
                accept="image/*"
                className="mt-2 w-full rounded-2xl border bg-white px-4 py-3 text-sm"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) uploadToSiteBucket(f);
                }}
              />
            </label>

            <label className="text-sm text-slate-700">
              Son yüklenen URL
              <input
                value={lastUploadUrl}
                onChange={(e) => setLastUploadUrl(e.target.value)}
                className="mt-2 w-full rounded-2xl border px-4 py-3 text-sm"
                placeholder="(yükleyince otomatik dolacak)"
              />
            </label>
          </div>

          {lastUploadUrl ? (
            <div className="mt-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={lastUploadUrl} alt="Last upload preview" className="max-h-64 rounded-2xl border" />
            </div>
          ) : null}
        </div>
      )}

      {/* BLOCKS */}
      {tab === "blocks" && (
        <div className="mt-6 grid gap-6 lg:grid-cols-[320px_1fr]">
          <div className="rounded-3xl border bg-white/60 p-6">
            <div className="text-lg font-semibold text-slate-900">Blocks</div>
            <p className="mt-2 text-xs text-slate-600">Her şeyi buradan yönetebilirsin (JSON).</p>

            <label className="mt-4 block text-sm text-slate-700">
              Key (yeni key de yazabilirsin)
              <input
                value={blockKey}
                onChange={(e) => setBlockKey(e.target.value)}
                className="mt-2 w-full rounded-2xl border px-4 py-3 text-sm"
                placeholder="contact / footer / appointment.questions ..."
              />
            </label>

            <div className="mt-4 rounded-2xl border bg-white/60 p-2">
              <div className="max-h-[420px] overflow-auto">
                {allKeys.map((k) => (
                  <button
                    key={k}
                    type="button"
                    className={[
                      "w-full rounded-xl px-3 py-2 text-left text-sm transition",
                      k === blockKey ? "bg-slate-900 text-white" : "hover:bg-white/70 text-slate-800",
                    ].join(" ")}
                    onClick={() => {
                      setBlockKey(k);
                      reloadBlock(k);
                    }}
                  >
                    {k}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="rounded-3xl border bg-white/60 p-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="text-lg font-semibold text-slate-900">JSON Editor</div>
                <div className="mt-1 text-xs text-slate-600">Seçili key: {blockKey}</div>
              </div>

              <button
                type="button"
                className="rounded-2xl border bg-white/70 px-4 py-2 text-sm text-slate-800 hover:bg-white/90"
                onClick={() => reloadBlock(blockKey)}
              >
                Yeniden Yükle
              </button>
            </div>

            <label className="mt-4 block text-sm text-slate-700">
              Data (JSON)
              <textarea
                value={blockJson}
                onChange={(e) => {
                  setBlockJson(e.target.value);
                  setBlockErr(null);
                }}
                className="mt-2 h-[520px] w-full rounded-2xl border p-4 font-mono text-xs"
              />
            </label>

            {blockErr ? <div className="mt-3 text-sm text-red-600">{blockErr}</div> : null}
          </div>
        </div>
      )}
    </div>
  );
}
