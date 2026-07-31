export function backendUrl(path: string) {
  const base = process.env.BACKEND_API_URL;
  if (!base) {
    throw new Error("BACKEND_API_URL não está configurada");
  }
  return `${base.replace(/\/$/, "")}${path}`;
}
