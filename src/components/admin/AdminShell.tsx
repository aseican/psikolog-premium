import Link from "next/link";

const nav = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/icerik", label: "İçerik" },
  { href: "/admin/hizmetler", label: "Hizmetler" },
  { href: "/admin/randevular", label: "Randevular" },
];

export function AdminShell({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
        <aside className="rounded-3xl border p-4">
          <div className="px-3 py-2 text-sm font-semibold">Admin (Demo)</div>
          <nav className="mt-2 grid">
            {nav.map((n) => (
              <Link
                key={n.href}
                href={n.href}
                className="rounded-2xl px-3 py-2 text-sm hover:bg-slate-50"
              >
                {n.label}
              </Link>
            ))}
          </nav>
        </aside>

        <main className="rounded-3xl border p-8">
          <h1 className="text-2xl font-semibold">{title}</h1>
          <div className="mt-6">{children}</div>
        </main>
      </div>
    </div>
  );
}
