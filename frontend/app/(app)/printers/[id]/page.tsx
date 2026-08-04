import { notFound } from "next/navigation";

import { PrinterDetailView } from "@/components/printer-detail-view";
import { getPrinter } from "@/lib/actions/printers";

export default async function PrinterDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const printerId = Number(id);

  if (Number.isNaN(printerId)) notFound();

  const printer = await getPrinter(printerId);

  if (!printer) notFound();

  return <PrinterDetailView printer={printer} />;
}
