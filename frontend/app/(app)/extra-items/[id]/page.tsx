import { notFound } from "next/navigation";

import { ExtraItemDetailView } from "@/components/extra-item-detail-view";
import { getExtraItem } from "@/lib/actions/extra-items";

export default async function ExtraItemDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const extraItemId = Number(id);

  if (Number.isNaN(extraItemId)) notFound();

  const extraItem = await getExtraItem(extraItemId);

  if (!extraItem) notFound();

  return <ExtraItemDetailView extraItem={extraItem} />;
}
