type Props = { params: { id: string } };

export default function VistoriaDetailPage({ params }: Props) {
  const { id } = params;
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Vistoria #{id}</h1>
      <p className="text-sm text-muted-foreground">PDF Viewer com Signed URL e Realtime do campo pdf_url — placeholder.</p>
    </div>
  );
}
