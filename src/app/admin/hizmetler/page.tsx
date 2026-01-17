import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function Page() {
  const cookieName = process.env.ADMIN_COOKIE_NAME || "psikolog_admin";
  const h = await headers();
  const cookieHeader = h.get("cookie") || "";

  const hasAdminCookie = cookieHeader.includes(`${cookieName}=`);

  if (!hasAdminCookie) {
    redirect("/admin/login?next=/admin/hizmetler");
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-2xl font-semibold text-slate-900">Hizmetler (Admin)</h1>
      <p className="mt-2 text-slate-600">Bu sayfa daha sonra doldurulacak.</p>
    </div>
  );
}
