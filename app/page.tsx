import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Home() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Início</CardTitle>
      </CardHeader>
      <CardContent className="text-sm text-muted-foreground">
        Em breve: visão geral das suas impressoras e perfis de impressão.
      </CardContent>
    </Card>
  );
}
