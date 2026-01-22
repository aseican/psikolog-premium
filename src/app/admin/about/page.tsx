"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Person1 = {
  name: string;
  role: string;
  image: string;
  intro: string;
  institutions: string[];
  thesis: string;
  experience: string;
  approach: string[];
  specializations: string[];
  trainings: string[];
  footer: string;
};

type ServiceItem = {
  title: string;
  description: string;
};

type Person2 = {
  name: string;
  role: string;
  image: string;
  intro: string;
  services: ServiceItem[];
  applications: ServiceItem[];
};

type AboutData = {
  person1: Person1;
  person2: Person2;
};

const DEFAULT_DATA: AboutData = {
  person1: {
    name: "Psikolog Eda Keklik Akalp",
    role: "Bireysel Danışmanlık",
    image: "/images/eda-keklik.jpg",
    intro: "",
    institutions: [],
    thesis: "",
    experience: "",
    approach: [],
    specializations: [],
    trainings: [],
    footer: "",
  },
  person2: {
    name: "Psikolojik Danışman",
    role: "Ergen & Aile Danışmanlığı",
    image: "/images/nurda-keklik.jpeg",
    intro: "",
    services: [],
    applications: [],
  },
};

export default function AdminAboutPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [data, setData] = useState<AboutData>(DEFAULT_DATA);
  const [activeTab, setActiveTab] = useState<"p1" | "p2">("p1");
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    const { data: result } = await supabase
      .from("cms_blocks")
      .select("data")
      .eq("key", "about")
      .single();

    if (result?.data) {
      setData({ ...DEFAULT_DATA, ...result.data });
    }
    setLoading(false);
  }

  async function handleSave() {
    setSaving(true);
    const { error } = await supabase
      .from("cms_blocks")
      .upsert({ key: "about", data }, { onConflict: "key" });

    setMessage({
      type: error ? "error" : "success",
      text: error?.message ?? "✅ Hakkımda içeriği kaydedildi!",
    });
    setTimeout(() => setMessage(null), 3000);
    setSaving(false);
  }

  function updateP1(field: keyof Person1, value: any) {
    setData((prev) => ({
      ...prev,
      person1: { ...prev.person1, [field]: value },
    }));
  }

  function updateP2(field: keyof Person2, value: any) {
    setData((prev) => ({
      ...prev,
      person2: { ...prev.person2, [field]: value },
    }));
  }

  function addToArray(person: "p1" | "p2", field: string, value: string) {
    if (!value.trim()) return;

    if (person === "p1") {
      setData((prev) => ({
        ...prev,
        person1: {
          ...prev.person1,
          [field]: [...(prev.person1[field as keyof Person1] as any), value.trim()],
        },
      }));
    } else {
      setData((prev) => ({
        ...prev,
        person2: {
          ...prev.person2,
          [field]: [...(prev.person2[field as keyof Person2] as any), value.trim()],
        },
      }));
    }
  }

  function removeFromArray(person: "p1" | "p2", field: string, index: number) {
    if (person === "p1") {
      setData((prev) => ({
        ...prev,
        person1: {
          ...prev.person1,
          [field]: (prev.person1[field as keyof Person1] as any).filter(
            (_: any, i: number) => i !== index
          ),
        },
      }));
    } else {
      setData((prev) => ({
        ...prev,
        person2: {
          ...prev.person2,
          [field]: (prev.person2[field as keyof Person2] as any).filter(
            (_: any, i: number) => i !== index
          ),
        },
      }));
    }
  }

  function updateArrayItem(
    person: "p1" | "p2",
    field: string,
    index: number,
    value: string
  ) {
    if (person === "p1") {
      setData((prev) => ({
        ...prev,
        person1: {
          ...prev.person1,
          [field]: (prev.person1[field as keyof Person1] as any).map(
            (item: any, i: number) => (i === index ? value : item)
          ),
        },
      }));
    } else {
      setData((prev) => ({
        ...prev,
        person2: {
          ...prev.person2,
          [field]: (prev.person2[field as keyof Person2] as any).map(
            (item: any, i: number) => (i === index ? value : item)
          ),
        },
      }));
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-300 border-t-slate-900" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-50 border-b bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <h1 className="text-xl font-semibold text-slate-900">Hakkımda</h1>
          <div className="flex items-center gap-3">
            {message && (
              <span
                className={`rounded-lg px-3 py-1 text-sm ${message.type === "success"
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
                  }`}
              >
                {message.text}
              </span>
            )}
            <button
              onClick={handleSave}
              disabled={saving}
              className="rounded-lg bg-slate-900 px-5 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50"
            >
              {saving ? "Kaydediliyor..." : "Kaydet"}
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 py-6">
        {/* Tabs */}
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab("p1")}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition ${activeTab === "p1"
              ? "bg-slate-900 text-white"
              : "bg-white text-slate-700 hover:bg-slate-100"
              }`}
          >
            👤 Kişi 1 ({data.person1.name})
          </button>
          <button
            onClick={() => setActiveTab("p2")}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition ${activeTab === "p2"
              ? "bg-slate-900 text-white"
              : "bg-white text-slate-700 hover:bg-slate-100"
              }`}
          >
            👤 Kişi 2 ({data.person2.name})
          </button>
        </div>

        {/* Person 1 */}
        {activeTab === "p1" && (
          <div className="mt-6 space-y-6">
            <Card title="Temel Bilgiler">
              <div className="grid gap-4">
                <Input
                  label="İsim"
                  value={data.person1.name}
                  onChange={(v) => updateP1("name", v)}
                />
                <Input
                  label="Rol"
                  value={data.person1.role}
                  onChange={(v) => updateP1("role", v)}
                />
                <Input
                  label="Fotoğraf URL"
                  value={data.person1.image}
                  onChange={(v) => updateP1("image", v)}
                  placeholder="/images/..."
                />
              </div>
            </Card>

            <Card title="Giriş Metni">
              <textarea
                value={data.person1.intro}
                onChange={(e) => updateP1("intro", e.target.value)}
                rows={4}
                className="w-full rounded-lg border px-4 py-2.5 text-sm"
                placeholder="HTML destekli (<b>, <i>, vb.)"
              />
            </Card>

            <Card title="Kurum Listesi">
              <ArrayEditor
                items={data.person1.institutions}
                onAdd={(v) => addToArray("p1", "institutions", v)}
                onRemove={(i) => removeFromArray("p1", "institutions", i)}
                onUpdate={(i, v) =>
                  updateArrayItem("p1", "institutions", i, v)
                }
                placeholder="Kurum adı"
              />
            </Card>

            <Card title="Tez">
              <textarea
                value={data.person1.thesis}
                onChange={(e) => updateP1("thesis", e.target.value)}
                rows={3}
                className="w-full rounded-lg border px-4 py-2.5 text-sm"
                placeholder="HTML destekli"
              />
            </Card>

            <Card title="Deneyim Metni">
              <textarea
                value={data.person1.experience}
                onChange={(e) => updateP1("experience", e.target.value)}
                rows={3}
                className="w-full rounded-lg border px-4 py-2.5 text-sm"
              />
            </Card>

            <Card title="Yaklaşım Paragrafları">
              <ArrayEditor
                items={data.person1.approach}
                onAdd={(v) => addToArray("p1", "approach", v)}
                onRemove={(i) => removeFromArray("p1", "approach", i)}
                onUpdate={(i, v) => updateArrayItem("p1", "approach", i, v)}
                placeholder="Paragraf metni (HTML destekli)"
                isTextarea
              />
            </Card>

            <Card title="Uzmanlık Alanları">
              <ArrayEditor
                items={data.person1.specializations}
                onAdd={(v) => addToArray("p1", "specializations", v)}
                onRemove={(i) => removeFromArray("p1", "specializations", i)}
                onUpdate={(i, v) =>
                  updateArrayItem("p1", "specializations", i, v)
                }
                placeholder="Uzmanlık alanı"
              />
            </Card>

            <Card title="Uygulayıcı Eğitimleri">
              <ArrayEditor
                items={data.person1.trainings}
                onAdd={(v) => addToArray("p1", "trainings", v)}
                onRemove={(i) => removeFromArray("p1", "trainings", i)}
                onUpdate={(i, v) => updateArrayItem("p1", "trainings", i, v)}
                placeholder="Eğitim adı"
              />
            </Card>

            <Card title="Alt Bilgi">
              <textarea
                value={data.person1.footer}
                onChange={(e) => updateP1("footer", e.target.value)}
                rows={3}
                className="w-full rounded-lg border px-4 py-2.5 text-sm"
                placeholder="HTML destekli"
              />
            </Card>
          </div>
        )}

        {/* Person 2 */}
        {activeTab === "p2" && (
          <div className="mt-6 space-y-6">
            <Card title="Temel Bilgiler">
              <div className="grid gap-4">
                <Input
                  label="İsim"
                  value={data.person2.name}
                  onChange={(v) => updateP2("name", v)}
                />
                <Input
                  label="Rol"
                  value={data.person2.role}
                  onChange={(v) => updateP2("role", v)}
                />
                <Input
                  label="Fotoğraf URL (opsiyonel)"
                  value={data.person2.image}
                  onChange={(v) => updateP2("image", v)}
                  placeholder="/images/..."
                />
              </div>
            </Card>

            <Card title="Giriş Metni">
              <textarea
                value={data.person2.intro}
                onChange={(e) => updateP2("intro", e.target.value)}
                rows={4}
                className="w-full rounded-lg border px-4 py-2.5 text-sm"
                placeholder="Danışanlarıma yaklaşımımız hakkında genel bilgi..."
              />
            </Card>

            <Card title="Hizmetler">
              <ServiceArrayEditor
                items={data.person2.services}
                onUpdate={(newItems) => updateP2("services", newItems)}
                placeholder="Hizmet"
              />
            </Card>

            <Card title="Uygulamalar / Testler">
              <ServiceArrayEditor
                items={data.person2.applications}
                onUpdate={(newItems) => updateP2("applications", newItems)}
                placeholder="Uygulama"
              />
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}

// Components
function Card({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border bg-white p-6">
      <h2 className="mb-4 text-lg font-semibold text-slate-900">{title}</h2>
      {children}
    </div>
  );
}

function Input({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-slate-700">
        {label}
      </label>
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

function ArrayEditor({
  items,
  onAdd,
  onRemove,
  onUpdate,
  placeholder,
  isTextarea = false,
}: {
  items: string[];
  onAdd: (value: string) => void;
  onRemove: (index: number) => void;
  onUpdate: (index: number, value: string) => void;
  placeholder: string;
  isTextarea?: boolean;
}) {
  const [newValue, setNewValue] = useState("");

  function handleAdd() {
    if (newValue.trim()) {
      onAdd(newValue);
      setNewValue("");
    }
  }

  return (
    <div className="space-y-3">
      {items.map((item, i) => (
        <div key={i} className="flex gap-2">
          {isTextarea ? (
            <textarea
              value={item}
              onChange={(e) => onUpdate(i, e.target.value)}
              rows={2}
              className="flex-1 rounded-lg border px-3 py-2 text-sm"
            />
          ) : (
            <input
              type="text"
              value={item}
              onChange={(e) => onUpdate(i, e.target.value)}
              className="flex-1 rounded-lg border px-3 py-2 text-sm"
            />
          )}
          <button
            onClick={() => onRemove(i)}
            className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 hover:bg-red-100"
          >
            Sil
          </button>
        </div>
      ))}

      <div className="flex gap-2">
        {isTextarea ? (
          <textarea
            value={newValue}
            onChange={(e) => setNewValue(e.target.value)}
            placeholder={placeholder}
            rows={2}
            className="flex-1 rounded-lg border px-3 py-2 text-sm"
          />
        ) : (
          <input
            type="text"
            value={newValue}
            onChange={(e) => setNewValue(e.target.value)}
            placeholder={placeholder}
            className="flex-1 rounded-lg border px-3 py-2 text-sm"
          />
        )}
        <button
          onClick={handleAdd}
          className="rounded-lg bg-slate-900 px-4 py-2 text-sm text-white hover:bg-slate-800"
        >
          Ekle
        </button>
      </div>
    </div>
  );
}

function ServiceArrayEditor({
  items,
  onUpdate,
  placeholder,
}: {
  items: { title: string; description: string }[];
  onUpdate: (newItems: { title: string; description: string }[]) => void;
  placeholder: string;
}) {
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const safeItems = items ?? [];

  function handleAdd() {
    if (newTitle.trim()) {
      onUpdate([...safeItems, { title: newTitle.trim(), description: newDescription.trim() }]);
      setNewTitle("");
      setNewDescription("");
    }
  }

  function handleRemove(index: number) {
    onUpdate(safeItems.filter((_, i) => i !== index));
  }

  function handleUpdateItem(index: number, field: "title" | "description", value: string) {
    onUpdate(safeItems.map((item, i) => (i === index ? { ...item, [field]: value } : item)));
  }

  return (
    <div className="space-y-3">
      {safeItems.map((item, i) => (
        <div key={i} className="rounded-xl border bg-slate-50 p-4">
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={item.title}
              onChange={(e) => handleUpdateItem(i, "title", e.target.value)}
              className="flex-1 rounded-lg border px-3 py-2 text-sm font-medium"
              placeholder={`${placeholder} başlığı`}
            />
            <button
              onClick={() => handleRemove(i)}
              className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 hover:bg-red-100"
            >
              Sil
            </button>
          </div>
          <textarea
            value={item.description}
            onChange={(e) => handleUpdateItem(i, "description", e.target.value)}
            rows={2}
            className="w-full rounded-lg border px-3 py-2 text-sm"
            placeholder={`${placeholder} açıklaması`}
          />
        </div>
      ))}

      <div className="rounded-xl border border-dashed border-slate-300 p-4">
        <input
          type="text"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          placeholder={`Yeni ${placeholder.toLowerCase()} başlığı`}
          className="w-full rounded-lg border px-3 py-2 text-sm mb-2"
        />
        <textarea
          value={newDescription}
          onChange={(e) => setNewDescription(e.target.value)}
          placeholder={`${placeholder} açıklaması`}
          rows={2}
          className="w-full rounded-lg border px-3 py-2 text-sm mb-2"
        />
        <button
          onClick={handleAdd}
          className="rounded-lg bg-slate-900 px-4 py-2 text-sm text-white hover:bg-slate-800"
        >
          Ekle
        </button>
      </div>
    </div>
  );
}
