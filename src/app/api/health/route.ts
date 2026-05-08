export async function GET() {
  return Response.json({
    ok: true,
    service: "codecruise",
    time: new Date().toISOString(),
  });
}
