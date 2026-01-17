import { supabase } from "@/lib/supabase";
import { notFound } from "next/navigation";
import { Container } from "@/components/layout/Container";

type Props = {
  params: { slug: string };
};

export default async function Page({ params }: Props) {
  const key = `page.${params.slug}`;

  const { data, error } = await supabase
    .from("cms_blocks")
    .select("data")
    .eq("key", key)
    .single();

  if (error || !data) return notFound();

  const { title, content } = data.data ?? {};

  return (
    <div className="bg-[var(--site-bg)]">
      <Container>
        <section className="py-12 md:py-16 max-w-3xl">
          <h1 className="text-3xl font-semibold text-slate-900">{title}</h1>

          <div
            className="prose prose-slate mt-6 max-w-none"
            dangerouslySetInnerHTML={{ __html: content || "" }}
          />
        </section>
      </Container>
    </div>
  );
}
