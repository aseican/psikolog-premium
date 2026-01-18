"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";

// ==================== TYPES ====================
type NavItem = { href: string; label: string; cta?: boolean };
type FooterLink = { label: string; href: string };

type ThemeData = {
  bg: string;
  navBg?: string;
  primary?: string;
};

type HeroData = {
  badge?: string;
  titleA?: string;
  titleB?: string;
  titleC?: string;
  lead?: string;
  heroImage?: string;
  words?: string[];
  ctaButtons?: { text: string; href: string; style: "primary" | "secondary" | "ghost" }[];
};

type CardsData = {
  card1?: { title: string; description: string };
  card2?: { title: string; description: string };
};

type ProfileData = {
  name?: string;
  description?: string;
  tags?: string[];
  buttonText?: string;
  buttonHref?: string;
  footerText?: string;
  image?: string;
};

type SectionsData = {
  services?: { title: string; description: string; buttonText: string };
  faq?: { title: string };
};

type AboutData = {
  title?: string;
  content?: string;
  image?: string;
};

type CtaData = {
  title?: string;
  description?: string;
  buttonText?: string;
  buttonHref?: string;
};

type FooterData = {
  copyright?: string;
  links?: FooterLink[];
};

type ContactData = {
  email?: string;
  phone?: string;
  address?: string;
  whatsapp?: string;
  instagram?: string;
};

type PageData = {
  title?: string;
  content?: string;
};

// ==================== TABS ====================
const TABS = [
  { id: "hero", label: "Hero Bölümü", icon: "🏠" },
  { id: "cards", label: "Kartlar", icon: "🃏" },
  { id: "profile", label: "Profil Kartı", icon: "👤" },
  { id: "sections", label: "Bölüm Başlıkları", icon: "📝" },
  { id: "about", label: "Hakkımda", icon: "📖" },
  { id: "theme", label: "Tema", icon: "🎨" },
  { id: "menu", label: "Menü", icon: "☰" },
  { id: "footer", label: "Footer", icon: "📋" },
  { id: "contact", label: "İletişim", icon: "📞" },
  { id: "sayfalar", label: "Sayfalar", icon: "📄" },
  { id: "services", label: "Hizmetler", icon: "⚡" },
  { id: "faqs", label: "SSS", icon: "❓" },
  { id: "medya", label: "Medya", icon: "🖼️" },
  { id: "blocks", label: "Tüm Bloklar", icon: "🔧" },
] as const;

type TabId = (typeof TABS)[number]["id"];

const PAGES = [
  { key: "page.hakkinda", label: "Hakkımızda", path: "/hakkinda" },
  { key: "page.hizmetler", label: "Hizmetler", path: "/hizmetler" },
  { key: "page.testler", label: "Testler", path: "/testler" },
  { key: "page.randevu", label: "Randevu", path: "/randevu" },
  { key: "page.iletisim", label: "İletişim", path: "/iletisim" },
  { key: "page.kvkk", label: "KVKK", path: "/kvkk" },
  { key: "page.gizlilik", label: "Gizlilik", path: "/gizlilik" },
  { key: "page.cerez", label: "Çerez Politikası", path: "/cerez" },
];

// ==================== COMPONENT ====================
export default function ContentManagement() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [activeTab, setActiveTab] = useState<TabId>("hero");

  // CMS Block States
  const [theme, setTheme] = useState<ThemeData>({ bg: "#edf3f1" });
  const [hero, setHero] = useState<HeroData>({});
  const [cards, setCards] = useState<CardsData>({});
  const [profile, setProfile] = useState<ProfileData>({});
  const [sections, setSections] = useState<SectionsData>({});
  const [about, setAbout] = useState<any>({});
  const [nav, setNav] = useState<NavItem[]>([]);
  const [footer, setFooter] = useState<FooterData>({});
  const [contact, setContact] = useState<ContactData>({});

  // Page States
  const [selectedPage, setSelectedPage] = useState(PAGES[0].key);
  const [pageData, setPageData] = useState<PageData>({});
  const [pageLoading, setPageLoading] = useState(false);

  // Services & FAQs States
  const [services, setServices] = useState<any[]>([]);
  const [faqs, setFaqs] = useState<any[]>([]);

  // Media States
  const [uploading, setUploading] = useState(false);
  const [uploadedUrl, setUploadedUrl] = useState("");
  const [mediaList, setMediaList] = useState<{ name: string; url: string }[]>([]);

  // Blocks State
  const [allBlocks, setAllBlocks] = useState<{ key: string; data: any }[]>([]);
  const [selectedBlock, setSelectedBlock] = useState("theme");
  const [blockJson, setBlockJson] = useState("{}");
  const [jsonError, setJsonError] = useState("");

  // ==================== HELPERS ====================
  const showMessage = (type: "success" | "error", text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

  // ==================== LOAD ALL DATA ====================
  const loadAllData = useCallback(async () => {
    setLoading(true);
    setMessage(null);

    try {
      // CMS Blocks
      const { data: blocks } = await supabase.from("cms_blocks").select("key, data").order("key");
      const blockList = blocks ?? [];
      setAllBlocks(blockList);

      const get = (key: string) => blockList.find((b) => b.key === key)?.data ?? {};

      setTheme(get("theme") || { bg: "#edf3f1" });
      setHero(get("home.hero") || {});
      setCards(get("home.cards") || {});
      setProfile(get("home.profile") || {});
      setSections(get("home.sections") || {});
      setAbout(get("about") || {});
      setFooter(get("footer") || {});
      setContact(get("contact") || {});

      const navData = get("nav");
      setNav(navData?.items ?? []);

      // İlk sayfa
      const firstPageData = get(selectedPage);
      setPageData(firstPageData || { title: "", content: "" });

      // Services
      const { data: servicesData } = await supabase.from("services").select("*").order("sort");
      setServices(servicesData ?? []);

      // FAQs
      const { data: faqsData } = await supabase.from("faqs").select("*").order("sort");
      setFaqs(faqsData ?? []);

      // Block JSON
      setBlockJson(JSON.stringify(get(selectedBlock) || {}, null, 2));
    } catch (err: any) {
      showMessage("error", err.message);
    }

    setLoading(false);
  }, [selectedPage, selectedBlock]);

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  // ==================== LOAD PAGE ====================
  const loadPage = useCallback(async (key: string) => {
    setPageLoading(true);
    const { data, error } = await supabase.from("cms_blocks").select("data").eq("key", key).maybeSingle();
    
    if (error || !data) {
      setPageData({ title: "", content: "" });
    } else {
      setPageData(data.data || { title: "", content: "" });
    }
    setPageLoading(false);
  }, []);

  useEffect(() => {
    if (!loading) loadPage(selectedPage);
  }, [selectedPage, loading, loadPage]);

  // ==================== LOAD MEDIA ====================
  const loadMedia = useCallback(async () => {
    const { data } = await supabase.storage.from("site").list("uploads", {
      limit: 100,
      sortBy: { column: "created_at", order: "desc" },
    });
    if (data) {
      setMediaList(
        data.map((file) => ({
          name: file.name,
          url: supabase.storage.from("site").getPublicUrl(`uploads/${file.name}`).data.publicUrl,
        }))
      );
    }
  }, []);

  useEffect(() => {
    if (activeTab === "medya") loadMedia();
  }, [activeTab, loadMedia]);

  // ==================== SAVE FUNCTIONS ====================
  const saveBlock = async (key: string, data: any) => {
    setSaving(true);
    const { error } = await supabase.from("cms_blocks").upsert({ key, data }, { onConflict: "key" });
    showMessage(error ? "error" : "success", error?.message ?? "Kaydedildi!");
    setSaving(false);
    
    if (!error) {
      setAllBlocks((prev) => {
        const exists = prev.find((b) => b.key === key);
        if (exists) {
          return prev.map((b) => (b.key === key ? { ...b, data } : b));
        }
        return [...prev, { key, data }].sort((a, b) => a.key.localeCompare(b.key));
      });
    }
    
    return !error;
  };

  const saveHero = () => saveBlock("home.hero", hero);
  const saveCards = () => saveBlock("home.cards", cards);
  const saveProfile = () => saveBlock("home.profile", profile);
  const saveSections = () => saveBlock("home.sections", sections);
  const saveAbout = () => saveBlock("about", about);
  const saveTheme = () => saveBlock("theme", theme);
  const saveNav = () => saveBlock("nav", { items: nav });
  const saveFooter = () => saveBlock("footer", footer);
  const saveContact = () => saveBlock("contact", contact);
  const savePage = () => saveBlock(selectedPage, pageData);

  const saveBlockJson = async () => {
    setJsonError("");
    try {
      const parsed = JSON.parse(blockJson);
      await saveBlock(selectedBlock, parsed);
    } catch {
      setJsonError("Geçersiz JSON formatı");
    }
  };
  // ==================== SERVICE FUNCTIONS ====================
  const saveService = async (service: any) => {
    setSaving(true);
    if (service.id) {
      const { error } = await supabase.from("services").update(service).eq("id", service.id);
      showMessage(error ? "error" : "success", error?.message ?? "Güncellendi!");
    } else {
      const { error } = await supabase.from("services").insert(service);
      showMessage(error ? "error" : "success", error?.message ?? "Eklendi!");
    }
    setSaving(false);
    loadAllData();
  };

  const deleteService = async (id: number) => {
    if (!confirm("Bu hizmeti silmek istediğinize emin misiniz?")) return;
    const { error } = await supabase.from("services").delete().eq("id", id);
    showMessage(error ? "error" : "success", error?.message ?? "Silindi!");
    loadAllData();
  };

  // ==================== FAQ FUNCTIONS ====================
  const saveFaq = async (faq: any) => {
    setSaving(true);
    if (faq.id) {
      const { error } = await supabase.from("faqs").update(faq).eq("id", faq.id);
      showMessage(error ? "error" : "success", error?.message ?? "Güncellendi!");
    } else {
      const { error } = await supabase.from("faqs").insert(faq);
      showMessage(error ? "error" : "success", error?.message ?? "Eklendi!");
    }
    setSaving(false);
    loadAllData();
  };

  const deleteFaq = async (id: number) => {
    if (!confirm("Bu SSS'yi silmek istediğinize emin misiniz?")) return;
    const { error } = await supabase.from("faqs").delete().eq("id", id);
    showMessage(error ? "error" : "success", error?.message ?? "Silindi!");
    loadAllData();
  };

  // ==================== UPLOAD ====================
  const uploadFile = async (file: File): Promise<string | null> => {
    setUploading(true);
    const ext = file.name.split(".").pop()?.toLowerCase() || "png";
    const path = `uploads/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

    const { error } = await supabase.storage.from("site").upload(path, file);
    if (error) {
      showMessage("error", error.message);
      setUploading(false);
      return null;
    }

    const url = supabase.storage.from("site").getPublicUrl(path).data.publicUrl;
    setUploadedUrl(url);
    setUploading(false);
    loadMedia();
    return url;
  };

  const deleteMedia = async (name: string) => {
    if (!confirm(`"${name}" silinsin mi?`)) return;
    const { error } = await supabase.storage.from("site").remove([`uploads/${name}`]);
    showMessage(error ? "error" : "success", error?.message ?? "Silindi!");
    loadMedia();
  };

  // ==================== BLOCK ACTIONS ====================
  const loadBlockJson = (key: string) => {
    const block = allBlocks.find((b) => b.key === key);
    setBlockJson(JSON.stringify(block?.data ?? {}, null, 2));
    setJsonError("");
  };

  const createBlock = async () => {
    const key = prompt("Yeni block key'i (örn: home.testimonials):");
    if (!key?.trim()) return;
    const cleanKey = key.trim().toLowerCase().replace(/\s+/g, ".");
    await saveBlock(cleanKey, {});
    setSelectedBlock(cleanKey);
    setBlockJson("{}");
  };

  const deleteBlock = async (key: string) => {
    if (!confirm(`"${key}" silinsin mi?`)) return;
    const { error } = await supabase.from("cms_blocks").delete().eq("key", key);
    showMessage(error ? "error" : "success", error?.message ?? "Silindi!");
    setAllBlocks((prev) => prev.filter((b) => b.key !== key));
    if (selectedBlock === key) {
      setSelectedBlock("theme");
      loadBlockJson("theme");
    }
  };

  // ==================== RENDER ====================
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-slate-300 border-t-slate-900" />
          <p className="mt-4 text-slate-600">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          <h1 className="text-xl font-semibold text-slate-900">İçerik Yönetimi</h1>
          <div className="flex items-center gap-3">
            {message && (
              <span className={`rounded-lg px-3 py-1 text-sm ${message.type === "success" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                {message.text}
              </span>
            )}
            <button onClick={loadAllData} className="rounded-lg border px-4 py-2 text-sm hover:bg-slate-50">
              Yenile
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-6">
        <div className="flex gap-6">
          {/* Sidebar */}
          <aside className="w-52 shrink-0">
            <nav className="sticky top-20 space-y-1">
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex w-full items-center gap-3 rounded-lg px-4 py-2.5 text-left text-sm transition ${
                    activeTab === tab.id ? "bg-slate-900 text-white" : "text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  <span>{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </aside>

          {/* Main Content */}
          <main className="min-w-0 flex-1">
            {/* HERO */}
            {activeTab === "hero" && (
              <Card title="Hero Bölümü" onSave={saveHero} saving={saving}>
                <div className="grid gap-5">
                  <Input
                    label="Badge Metni"
                    value={hero.badge ?? ""}
                    onChange={(v) => setHero({ ...hero, badge: v })}
                    placeholder="Gizlilik • Güven • Profesyonellik"
                  />

                  <div className="grid gap-4 sm:grid-cols-3">
                    <Input
                      label="Başlık Satır 1"
                      value={hero.titleA ?? ""}
                      onChange={(v) => setHero({ ...hero, titleA: v })}
                      placeholder="Zihinsel Sağlık İçin"
                    />
                    <Input
                      label="Başlık Satır 2"
                      value={hero.titleB ?? ""}
                      onChange={(v) => setHero({ ...hero, titleB: v })}
                      placeholder="Bilimsel"
                    />
                    <Input
                      label="Başlık Satır 3"
                      value={hero.titleC ?? ""}
                      onChange={(v) => setHero({ ...hero, titleC: v })}
                      placeholder="Çözümler"
                    />
                  </div>

                  <Textarea
                    label="Açıklama (lead)"
                    value={hero.lead ?? ""}
                    onChange={(v) => setHero({ ...hero, lead: v })}
                    rows={3}
                    placeholder="Online seanslar için hızlıca randevu oluşturun."
                  />

                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">
                      Dönen Kelimeler
                      <span className="ml-2 text-xs font-normal text-slate-500">(Her satır bir kelime - yeni satır eklemek için Enter)</span>
                    </label>
                    <textarea
                      value={(hero.words ?? []).join("\n")}
                      onChange={(e) => {
                        const newWords = e.target.value.split("\n");
                        setHero({ ...hero, words: newWords });
                      }}
                      className="w-full rounded-lg border px-4 py-3 font-mono text-sm focus:border-slate-400 focus:outline-none"
                      rows={6}
                      placeholder={"Güven Temelli\nŞefkat Odaklı\nSürdürülebilir\nYumuşak ve Net"}
                    />
                    <p className="mt-1 text-xs text-slate-500">
                      Mevcut kelimeler: {(hero.words ?? []).filter(w => w.trim()).length} adet
                    </p>
                  </div>

                  <ImageUpload
                    label="Hero Görseli"
                    value={hero.heroImage ?? ""}
                    onChange={(v) => setHero({ ...hero, heroImage: v })}
                    onUpload={uploadFile}
                    uploading={uploading}
                  />
                </div>
              </Card>
            )}

            {/* CARDS */}
            {activeTab === "cards" && (
              <Card title="Ana Sayfa Kartları" onSave={saveCards} saving={saving}>
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="rounded-xl border bg-slate-50 p-5">
                    <h3 className="mb-4 font-medium text-slate-900">Kart 1 - Online Seans</h3>
                    <div className="space-y-3">
                      <Input
                        label="Başlık"
                        value={cards.card1?.title ?? ""}
                        onChange={(v) => setCards({ ...cards, card1: { ...cards.card1, title: v, description: cards.card1?.description ?? "" } })}
                        placeholder="Online Seans"
                      />
                      <Textarea
                        label="Açıklama"
                        value={cards.card1?.description ?? ""}
                        onChange={(v) => setCards({ ...cards, card1: { ...cards.card1, description: v, title: cards.card1?.title ?? "" } })}
                        rows={2}
                        placeholder="Güvenli bağlantı ile, bulunduğun yerden."
                      />
                    </div>
                  </div>

                  <div className="rounded-xl border bg-slate-50 p-5">
                    <h3 className="mb-4 font-medium text-slate-900">Kart 2 - Ön Bilgilendirme</h3>
                    <div className="space-y-3">
                      <Input
                        label="Başlık"
                        value={cards.card2?.title ?? ""}
                        onChange={(v) => setCards({ ...cards, card2: { ...cards.card2, title: v, description: cards.card2?.description ?? "" } })}
                        placeholder="Ön Bilgilendirme"
                      />
                      <Textarea
                        label="Açıklama"
                        value={cards.card2?.description ?? ""}
                        onChange={(v) => setCards({ ...cards, card2: { ...cards.card2, description: v, title: cards.card2?.title ?? "" } })}
                        rows={2}
                        placeholder="Testler bölümünde kısa bir ön değerlendirme yapabilirsin."
                      />
                    </div>
                  </div>
                </div>
              </Card>
            )}

            {/* PROFILE */}
            {activeTab === "profile" && (
              <Card title="Profil Kartı (Sağ Taraf)" onSave={saveProfile} saving={saving}>
                <div className="grid gap-5">
                  <Input
                    label="İsim"
                    value={profile.name ?? ""}
                    onChange={(v) => setProfile({ ...profile, name: v })}
                    placeholder="Psikolog Eda Keklik Akalp"
                  />
                  
                  <Textarea
                    label="Açıklama"
                    value={profile.description ?? ""}
                    onChange={(v) => setProfile({ ...profile, description: v })}
                    rows={2}
                    placeholder="Bireysel Terapi • Aile & Çift Terapisi • Çocuk & Ergen"
                  />

                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">
                      Etiketler
                      <span className="ml-2 text-xs font-normal text-slate-500">(Her satır bir etiket)</span>
                    </label>
                    <textarea
                      value={(profile.tags ?? []).join("\n")}
                      onChange={(e) => setProfile({ ...profile, tags: e.target.value.split("\n").filter(t => t.trim()) })}
                      className="w-full rounded-lg border px-4 py-3 font-mono text-sm"
                      rows={4}
                      placeholder={"Güven\nTarafsızlık\nAnlayış"}
                    />
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <Input
                      label="Buton Metni"
                      value={profile.buttonText ?? ""}
                      onChange={(v) => setProfile({ ...profile, buttonText: v })}
                      placeholder="Uygun Saatleri Gör"
                    />
                    <Input
                      label="Buton Linki"
                      value={profile.buttonHref ?? ""}
                      onChange={(v) => setProfile({ ...profile, buttonHref: v })}
                      placeholder="/randevu"
                    />
                  </div>

                  <Textarea
                    label="Alt Yazı"
                    value={profile.footerText ?? ""}
                    onChange={(v) => setProfile({ ...profile, footerText: v })}
                    rows={2}
                    placeholder="Seanslar etik ilkeler ve gizlilik esasına göre yürütülür."
                  />

                  <ImageUpload
                    label="Profil Görseli"
                    value={profile.image ?? ""}
                    onChange={(v) => setProfile({ ...profile, image: v })}
                    onUpload={uploadFile}
                    uploading={uploading}
                  />
                </div>
              </Card>
            )}

            {/* SECTIONS */}
            {activeTab === "sections" && (
              <Card title="Bölüm Başlıkları" onSave={saveSections} saving={saving}>
                <div className="space-y-6">
                  <div className="rounded-xl border bg-slate-50 p-5">
                    <h3 className="mb-4 font-medium text-slate-900">Hizmetler Bölümü</h3>
                    <div className="grid gap-4">
                      <Input
                        label="Başlık"
                        value={sections.services?.title ?? ""}
                        onChange={(v) => setSections({ ...sections, services: { ...sections.services, title: v, description: sections.services?.description ?? "", buttonText: sections.services?.buttonText ?? "" } })}
                        placeholder="Hizmetler"
                      />
                      <Textarea
                        label="Açıklama"
                        value={sections.services?.description ?? ""}
                        onChange={(v) => setSections({ ...sections, services: { ...sections.services, description: v, title: sections.services?.title ?? "", buttonText: sections.services?.buttonText ?? "" } })}
                        rows={2}
                        placeholder="İhtiyacınıza uygun hizmeti seçip randevu oluşturabilirsiniz."
                      />
                      <Input
                        label="Buton Metni"
                        value={sections.services?.buttonText ?? ""}
                        onChange={(v) => setSections({ ...sections, services: { ...sections.services, buttonText: v, title: sections.services?.title ?? "", description: sections.services?.description ?? "" } })}
                        placeholder="Tümünü Gör"
                      />
                    </div>
                  </div>

                  <div className="rounded-xl border bg-slate-50 p-5">
                    <h3 className="mb-4 font-medium text-slate-900">SSS Bölümü</h3>
                    <Input
                      label="Başlık"
                      value={sections.faq?.title ?? ""}
                      onChange={(v) => setSections({ ...sections, faq: { title: v } })}
                      placeholder="Sık Sorulan Sorular"
                    />
                  </div>
                </div>
              </Card>
            )}

            {/* ABOUT */}
            {activeTab === "about" && (
              <Card title="Hakkımda Sayfası" onSave={saveAbout} saving={saving}>
                <div className="rounded-xl border-l-4 border-blue-500 bg-blue-50 p-4 mb-6">
                  <p className="text-sm text-blue-800">
                    ℹ️ <strong>Not:</strong> Bu bölüm, hakkımda sayfasındaki 2 kişinin bilgilerini içerir.
                    Detaylı düzenleme için{" "}
                    <a href="/admin/about" className="underline font-medium">
                      Hakkımda Yönetimi
                    </a>{" "}
                    sayfasını kullanabilirsiniz.
                  </p>
                </div>

                <div className="space-y-6">
                  {/* Kişi 1 */}
                  <div className="rounded-xl border bg-slate-50 p-5">
                    <h3 className="mb-4 font-medium text-slate-900">👤 Kişi 1</h3>
                    <div className="grid gap-4">
                      <Input
                        label="İsim"
                        value={about.person1?.name ?? ""}
                        onChange={(v) =>
                          setAbout({
                            ...about,
                            person1: { ...about.person1, name: v },
                          })
                        }
                        placeholder="Psikolog Eda Keklik Akalp"
                      />
                      <Input
                        label="Rol"
                        value={about.person1?.role ?? ""}
                        onChange={(v) =>
                          setAbout({
                            ...about,
                            person1: { ...about.person1, role: v },
                          })
                        }
                        placeholder="Bireysel Danışmanlık"
                      />
                      <Input
                        label="Fotoğraf URL"
                        value={about.person1?.image ?? ""}
                        onChange={(v) =>
                          setAbout({
                            ...about,
                            person1: { ...about.person1, image: v },
                          })
                        }
                        placeholder="/images/..."
                      />
                    </div>
                  </div>

                  {/* Kişi 2 */}
                  <div className="rounded-xl border bg-slate-50 p-5">
                    <h3 className="mb-4 font-medium text-slate-900">👤 Kişi 2</h3>
                    <div className="grid gap-4">
                      <Input
                        label="İsim"
                        value={about.person2?.name ?? ""}
                        onChange={(v) =>
                          setAbout({
                            ...about,
                            person2: { ...about.person2, name: v },
                          })
                        }
                        placeholder="Psikolojik Danışman"
                      />
                      <Input
                        label="Rol"
                        value={about.person2?.role ?? ""}
                        onChange={(v) =>
                          setAbout({
                            ...about,
                            person2: { ...about.person2, role: v },
                          })
                        }
                        placeholder="Ergen & Aile Danışmanlığı"
                      />
                    </div>
                  </div>

                  <div className="rounded-xl border-l-4 border-amber-500 bg-amber-50 p-4">
                    <p className="text-sm text-amber-800">
                      📝 Eğitim, deneyim, uzmanlık alanları gibi detaylı bilgiler için{" "}
                      <a href="/admin/about" className="underline font-medium">
                        Hakkımda Yönetimi
                      </a>{" "}
                      sayfasını kullanın.
                    </p>
                  </div>
                </div>
              </Card>
            )}
            {/* THEME */}
            {activeTab === "theme" && (
              <Card title="Tema Ayarları" onSave={saveTheme} saving={saving}>
                <div className="grid gap-6 sm:grid-cols-2">
                  <ColorInput label="Site Arkaplanı" value={theme.bg ?? "#edf3f1"} onChange={(v) => setTheme({ ...theme, bg: v })} />
                  <ColorInput label="Navbar Arkaplanı" value={theme.navBg ?? theme.bg ?? "#edf3f1"} onChange={(v) => setTheme({ ...theme, navBg: v })} />
                  <ColorInput label="Primary Renk" value={theme.primary ?? "#0f172a"} onChange={(v) => setTheme({ ...theme, primary: v })} />
                </div>
                <div className="mt-6 rounded-xl border bg-slate-50 p-4">
                  <p className="text-sm font-medium text-slate-700">Önizleme</p>
                  <div className="mt-3 flex gap-4">
                    <div className="h-12 w-12 rounded-lg border" style={{ backgroundColor: theme.bg }} title="Site BG" />
                    <div className="h-12 w-12 rounded-lg border" style={{ backgroundColor: theme.navBg ?? theme.bg }} title="Nav BG" />
                    <div className="h-12 w-12 rounded-lg border" style={{ backgroundColor: theme.primary ?? "#0f172a" }} title="Primary" />
                  </div>
                </div>
              </Card>
            )}

            {/* MENU */}
            {activeTab === "menu" && (
              <Card title="Menü Yönetimi" onSave={saveNav} saving={saving}>
                <div className="space-y-3">
                  {nav.map((item, i) => (
                    <div key={i} className="flex items-center gap-3 rounded-xl border bg-white p-3">
                      <input
                        value={item.label}
                        onChange={(e) => {
                          const newNav = [...nav];
                          newNav[i] = { ...item, label: e.target.value };
                          setNav(newNav);
                        }}
                        className="flex-1 rounded-lg border px-3 py-2 text-sm"
                        placeholder="Menü adı"
                      />
                      <input
                        value={item.href}
                        onChange={(e) => {
                          const newNav = [...nav];
                          newNav[i] = { ...item, href: e.target.value };
                          setNav(newNav);
                        }}
                        className="flex-1 rounded-lg border px-3 py-2 text-sm"
                        placeholder="/sayfa"
                      />
                      <label className="flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={item.cta ?? false}
                          onChange={(e) => {
                            const newNav = [...nav];
                            newNav[i] = { ...item, cta: e.target.checked };
                            setNav(newNav);
                          }}
                        />
                        CTA
                      </label>
                      <button onClick={() => setNav(nav.filter((_, idx) => idx !== i))} className="rounded p-2 text-red-500 hover:bg-red-50">
                        🗑️
                      </button>
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => setNav([...nav, { label: "Yeni", href: "/" }])}
                  className="mt-4 rounded-lg border border-dashed px-4 py-2 text-sm text-slate-600 hover:bg-slate-50"
                >
                  + Menü Ekle
                </button>
              </Card>
            )}

            {/* FOOTER */}
            {activeTab === "footer" && (
              <Card title="Footer Ayarları" onSave={saveFooter} saving={saving}>
                <Input
                  label="Copyright"
                  value={footer.copyright ?? ""}
                  onChange={(v) => setFooter({ ...footer, copyright: v })}
                  placeholder="© {year} Site Adı • Tüm hakları saklıdır."
                />
                <p className="mt-1 text-xs text-slate-500">{`{year}`} otomatik olarak yıl ile değiştirilir.</p>

                <div className="mt-6 border-t pt-6">
                  <h3 className="mb-4 font-medium text-slate-800">Footer Linkleri</h3>
                  <div className="space-y-3">
                    {(footer.links ?? []).map((link, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <input
                          value={link.label}
                          onChange={(e) => {
                            const newLinks = [...(footer.links ?? [])];
                            newLinks[i] = { ...link, label: e.target.value };
                            setFooter({ ...footer, links: newLinks });
                          }}
                          className="flex-1 rounded-lg border px-3 py-2 text-sm"
                          placeholder="Link adı"
                        />
                        <input
                          value={link.href}
                          onChange={(e) => {
                            const newLinks = [...(footer.links ?? [])];
                            newLinks[i] = { ...link, href: e.target.value };
                            setFooter({ ...footer, links: newLinks });
                          }}
                          className="flex-1 rounded-lg border px-3 py-2 text-sm"
                          placeholder="/sayfa"
                        />
                        <button
                          onClick={() => setFooter({ ...footer, links: (footer.links ?? []).filter((_, idx) => idx !== i) })}
                          className="rounded p-2 text-red-500 hover:bg-red-50"
                        >
                          🗑️
                        </button>
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={() => setFooter({ ...footer, links: [...(footer.links ?? []), { label: "Yeni", href: "/" }] })}
                    className="mt-3 rounded-lg border border-dashed px-4 py-2 text-sm text-slate-600 hover:bg-slate-50"
                  >
                    + Link Ekle
                  </button>
                </div>
              </Card>
            )}

            {/* CONTACT */}
            {activeTab === "contact" && (
              <Card title="İletişim Bilgileri" onSave={saveContact} saving={saving}>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Input label="E-posta" value={contact.email ?? ""} onChange={(v) => setContact({ ...contact, email: v })} />
                  <Input label="Telefon" value={contact.phone ?? ""} onChange={(v) => setContact({ ...contact, phone: v })} />
                  <Input label="WhatsApp" value={contact.whatsapp ?? ""} onChange={(v) => setContact({ ...contact, whatsapp: v })} placeholder="905551234567" />
                  <Input label="Instagram" value={contact.instagram ?? ""} onChange={(v) => setContact({ ...contact, instagram: v })} placeholder="@kullaniciadi" />
                </div>
                <Textarea label="Adres" value={contact.address ?? ""} onChange={(v) => setContact({ ...contact, address: v })} rows={3} />
              </Card>
            )}

            {/* SAYFALAR */}
            {activeTab === "sayfalar" && (
              <Card title="Sayfa İçerikleri" onSave={savePage} saving={saving}>
                <div className="mb-6">
                  <label className="mb-2 block text-sm font-medium text-slate-700">Sayfa Seçin</label>
                  <div className="flex flex-wrap gap-2">
                    {PAGES.map((page) => (
                      <button
                        key={page.key}
                        onClick={() => setSelectedPage(page.key)}
                        className={`rounded-lg px-4 py-2 text-sm transition ${
                          selectedPage === page.key ? "bg-slate-900 text-white" : "border bg-white text-slate-700 hover:bg-slate-50"
                        }`}
                      >
                        {page.label}
                      </button>
                    ))}
                  </div>
                </div>

                {pageLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-300 border-t-slate-900" />
                  </div>
                ) : (
                  <div className="space-y-4">
                    <Input
                      label="Sayfa Başlığı"
                      value={pageData.title ?? ""}
                      onChange={(v) => setPageData({ ...pageData, title: v })}
                      placeholder="Sayfa başlığı..."
                    />
                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-700">
                        Sayfa İçeriği (HTML)
                        <span className="ml-2 text-xs font-normal text-slate-500">
                          HTML etiketleri kullanabilirsiniz: &lt;p&gt;, &lt;h2&gt;, &lt;ul&gt;, &lt;li&gt;, &lt;strong&gt;, &lt;a&gt; vb.
                        </span>
                      </label>
                      <textarea
                        value={pageData.content ?? ""}
                        onChange={(e) => setPageData({ ...pageData, content: e.target.value })}
                        className="h-[400px] w-full rounded-lg border p-4 font-mono text-sm focus:border-slate-400 focus:outline-none"
                        placeholder="<p>Sayfa içeriğinizi buraya yazın...</p>"
                      />
                    </div>
                    
                    {/* Preview */}
                    {pageData.content && (
                      <div className="rounded-xl border bg-white p-6">
                        <p className="mb-3 text-sm font-medium text-slate-500">Önizleme:</p>
                        <div className="prose prose-slate max-w-none" dangerouslySetInnerHTML={{ __html: pageData.content }} />
                      </div>
                    )}
                  </div>
                )}
              </Card>
            )}

            {/* SERVICES */}
            {activeTab === "services" && (
              <Card title="Hizmetler">
                <div className="space-y-4">
                  {services.map((service) => (
                    <ServiceItem key={service.id} service={service} onSave={saveService} onDelete={deleteService} saving={saving} />
                  ))}
                </div>
                <button
                  onClick={() => saveService({ title: "Yeni Hizmet", description: "", duration_min: 50, sort: services.length })}
                  disabled={saving}
                  className="mt-4 rounded-lg border border-dashed px-4 py-2 text-sm text-slate-600 hover:bg-slate-50"
                >
                  + Yeni Hizmet Ekle
                </button>
              </Card>
            )}

            {/* FAQS */}
            {activeTab === "faqs" && (
              <Card title="Sık Sorulan Sorular">
                <div className="space-y-4">
                  {faqs.map((faq) => (
                    <FaqItem key={faq.id} faq={faq} onSave={saveFaq} onDelete={deleteFaq} saving={saving} />
                  ))}
                </div>
                <button
                  onClick={() => saveFaq({ question: "Yeni Soru?", answer: "", sort: faqs.length })}
                  disabled={saving}
                  className="mt-4 rounded-lg border border-dashed px-4 py-2 text-sm text-slate-600 hover:bg-slate-50"
                >
                  + Yeni SSS Ekle
                </button>
              </Card>
            )}

            {/* MEDYA */}
            {activeTab === "medya" && (
              <Card title="Medya Galerisi">
                <div className="mb-6 rounded-xl border-2 border-dashed bg-slate-50 p-8 text-center">
                  <input
                    type="file"
                    accept="image/*"
                    disabled={uploading}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) uploadFile(file);
                    }}
                    className="mx-auto"
                  />
                  <p className="mt-2 text-sm text-slate-500">PNG, JPG, WEBP, GIF, SVG</p>
                </div>

                {uploadedUrl && (
                  <div className="mb-6 flex items-center gap-3 rounded-lg bg-green-50 p-4">
                    <span className="text-sm text-green-700">Son yüklenen:</span>
                    <input value={uploadedUrl} readOnly className="flex-1 rounded border bg-white px-3 py-1 text-sm" />
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(uploadedUrl);
                        showMessage("success", "Kopyalandı!");
                      }}
                      className="rounded-lg bg-green-600 px-3 py-1 text-sm text-white hover:bg-green-700"
                    >
                      Kopyala
                    </button>
                  </div>
                )}

                <div className="grid gap-4 sm:grid-cols-3 md:grid-cols-4">
                  {mediaList.map((item) => (
                    <div key={item.name} className="group relative rounded-lg border bg-white p-2">
                      <img src={item.url} alt={item.name} className="h-28 w-full rounded object-cover" />
                      <p className="mt-2 truncate text-xs text-slate-600">{item.name}</p>
                      <div className="absolute inset-0 flex items-center justify-center gap-2 rounded-lg bg-black/60 opacity-0 transition group-hover:opacity-100">
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(item.url);
                            showMessage("success", "URL kopyalandı!");
                          }}
                          className="rounded bg-white px-3 py-1 text-xs text-slate-900 hover:bg-slate-100"
                        >
                          Kopyala
                        </button>
                        <button
                          onClick={() => deleteMedia(item.name)}
                          className="rounded bg-red-500 px-3 py-1 text-xs text-white hover:bg-red-600"
                        >
                          Sil
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* BLOCKS */}
            {activeTab === "blocks" && (
              <Card title="Tüm Bloklar (JSON Editor)">
                <div className="mb-6 flex items-center gap-3">
                  <select
                    value={selectedBlock}
                    onChange={(e) => {
                      setSelectedBlock(e.target.value);
                      loadBlockJson(e.target.value);
                    }}
                    className="flex-1 rounded-lg border px-4 py-2 text-sm"
                  >
                    {allBlocks.map((block) => (
                      <option key={block.key} value={block.key}>
                        {block.key}
                      </option>
                    ))}
                  </select>
                  <button onClick={createBlock} className="rounded-lg border px-4 py-2 text-sm hover:bg-slate-50">
                    + Yeni Block
                  </button>
                  <button
                    onClick={() => deleteBlock(selectedBlock)}
                    className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700 hover:bg-red-100"
                  >
                    Sil
                  </button>
                </div>

                <div>
                  <textarea
                    value={blockJson}
                    onChange={(e) => {
                      setBlockJson(e.target.value);
                      setJsonError("");
                    }}
                    className="h-[500px] w-full rounded-lg border p-4 font-mono text-sm focus:border-slate-400 focus:outline-none"
                    placeholder='{"key": "value"}'
                  />
                  {jsonError && <p className="mt-2 text-sm text-red-600">{jsonError}</p>}
                </div>

                <button
                  onClick={saveBlockJson}
                  disabled={saving}
                  className="mt-4 rounded-lg bg-slate-900 px-5 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50"
                >
                  {saving ? "Kaydediliyor..." : "JSON'u Kaydet"}
                </button>
              </Card>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

// ==================== HELPER COMPONENTS ====================
function Card({ title, onSave, saving, children }: { title: string; onSave?: () => void; saving?: boolean; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border bg-white p-6">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
        {onSave && (
          <button
            onClick={onSave}
            disabled={saving}
            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50"
          >
            {saving ? "Kaydediliyor..." : "Kaydet"}
          </button>
        )}
      </div>
      {children}
    </div>
  );
}

function Input({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-slate-700">{label}</label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-lg border px-4 py-2.5 text-sm focus:border-slate-400 focus:outline-none"
      />
    </div>
  );
}

function Textarea({ label, value, onChange, rows, placeholder }: { label: string; value: string; onChange: (v: string) => void; rows?: number; placeholder?: string }) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-slate-700">{label}</label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={rows ?? 4}
        placeholder={placeholder}
        className="w-full rounded-lg border px-4 py-2.5 text-sm focus:border-slate-400 focus:outline-none"
      />
    </div>
  );
}

function ColorInput({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-slate-700">{label}</label>
      <div className="flex gap-2">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-10 w-16 cursor-pointer rounded border"
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 rounded-lg border px-4 py-2 text-sm font-mono"
          placeholder="#edf3f1"
        />
      </div>
    </div>
  );
}

function ImageUpload({ label, value, onChange, onUpload, uploading }: { label: string; value: string; onChange: (v: string) => void; onUpload: (file: File) => Promise<string | null>; uploading: boolean }) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-slate-700">{label}</label>
      <div className="flex gap-2">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="https://... veya /images/..."
          className="flex-1 rounded-lg border px-4 py-2 text-sm"
        />
        <label className="cursor-pointer rounded-lg border bg-slate-50 px-4 py-2 text-sm hover:bg-slate-100">
          {uploading ? "Yükleniyor..." : "Yükle"}
          <input
            type="file"
            accept="image/*"
            disabled={uploading}
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (file) {
                const url = await onUpload(file);
                if (url) onChange(url);
              }
            }}
            className="hidden"
          />
        </label>
      </div>
      {value && (
        <div className="mt-2 rounded-lg border p-2">
          <img src={value} alt="Preview" className="h-32 w-full rounded object-cover" />
        </div>
      )}
    </div>
  );
}

function ServiceItem({ service, onSave, onDelete, saving }: { service: any; onSave: (s: any) => void; onDelete: (id: number) => void; saving: boolean }) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(service.title);
  const [description, setDescription] = useState(service.description);

  return (
    <div className="rounded-xl border bg-white p-4">
      {editing ? (
        <div className="space-y-3">
          <input value={title} onChange={(e) => setTitle(e.target.value)} className="w-full rounded-lg border px-3 py-2 text-sm" placeholder="Hizmet Adı" />
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} className="w-full rounded-lg border px-3 py-2 text-sm" placeholder="Açıklama" />
          <div className="flex gap-2">
            <button
              onClick={() => {
                onSave({ ...service, title, description });
                setEditing(false);
              }}
              disabled={saving}
              className="rounded-lg bg-slate-900 px-3 py-1 text-sm text-white hover:bg-slate-800"
            >
              Kaydet
            </button>
            <button onClick={() => setEditing(false)} className="rounded-lg border px-3 py-1 text-sm hover:bg-slate-50">
              İptal
            </button>
          </div>
        </div>
      ) : (
        <div className="flex items-start justify-between">
          <div>
            <h4 className="font-medium text-slate-900">{service.title}</h4>
            <p className="mt-1 text-sm text-slate-600">{service.description}</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setEditing(true)} className="text-sm text-blue-600 hover:underline">
              Düzenle
            </button>
            <button onClick={() => onDelete(service.id)} className="text-sm text-red-600 hover:underline">
              Sil
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function FaqItem({ faq, onSave, onDelete, saving }: { faq: any; onSave: (f: any) => void; onDelete: (id: number) => void; saving: boolean }) {
  const [editing, setEditing] = useState(false);
  const [question, setQuestion] = useState(faq.question);
  const [answer, setAnswer] = useState(faq.answer);

  return (
    <div className="rounded-xl border bg-white p-4">
      {editing ? (
        <div className="space-y-3">
          <input value={question} onChange={(e) => setQuestion(e.target.value)} className="w-full rounded-lg border px-3 py-2 text-sm" placeholder="Soru" />
          <textarea value={answer} onChange={(e) => setAnswer(e.target.value)} rows={2} className="w-full rounded-lg border px-3 py-2 text-sm" placeholder="Cevap" />
          <div className="flex gap-2">
            <button
              onClick={() => {
                onSave({ ...faq, question, answer });
                setEditing(false);
              }}
              disabled={saving}
              className="rounded-lg bg-slate-900 px-3 py-1 text-sm text-white hover:bg-slate-800"
            >
              Kaydet
            </button>
            <button onClick={() => setEditing(false)} className="rounded-lg border px-3 py-1 text-sm hover:bg-slate-50">
              İptal
            </button>
          </div>
        </div>
      ) : (
        <div className="flex items-start justify-between">
          <div>
            <h4 className="font-medium text-slate-900">{faq.question}</h4>
            <p className="mt-1 text-sm text-slate-600">{faq.answer}</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setEditing(true)} className="text-sm text-blue-600 hover:underline">
              Düzenle
            </button>
            <button onClick={() => onDelete(faq.id)} className="text-sm text-red-600 hover:underline">
              Sil
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
