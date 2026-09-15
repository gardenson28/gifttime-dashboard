import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabaseServer";

export async function GET(req: NextRequest) {
  const clientId = req.nextUrl.searchParams.get("clientId");
  const supabase = getSupabaseServer();
  let query = supabase.from("sales_affiliates").select("*").order("updated_at", { ascending: false });
  if (clientId) query = query.eq("client_id", clientId);
  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ affiliates: data });
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const { clientId, name, status, expectedRevenue, memo } = body ?? {};
  if (!clientId || !name?.trim()) {
    return NextResponse.json({ error: "고객사와 계열사명을 입력해주세요." }, { status: 400 });
  }
  const supabase = getSupabaseServer();
  const { data, error } = await supabase
    .from("sales_affiliates")
    .insert({
      client_id: clientId,
      name: name.trim(),
      status: status || "미접촉",
      expected_revenue: expectedRevenue || null,
      memo: memo || null,
    })
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ affiliate: data });
}

export async function PATCH(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const { id, name, status, expectedRevenue, memo } = body ?? {};
  if (!id) return NextResponse.json({ error: "id가 필요합니다." }, { status: 400 });
  const supabase = getSupabaseServer();
  const update: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (name !== undefined) update.name = name;
  if (status !== undefined) update.status = status;
  if (expectedRevenue !== undefined) update.expected_revenue = expectedRevenue || null;
  if (memo !== undefined) update.memo = memo;
  const { data, error } = await supabase.from("sales_affiliates").update(update).eq("id", id).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ affiliate: data });
}

export async function DELETE(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id가 필요합니다." }, { status: 400 });
  const supabase = getSupabaseServer();
  const { error } = await supabase.from("sales_affiliates").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
