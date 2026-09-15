import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabaseServer";

export async function GET(req: NextRequest) {
  const clientId = req.nextUrl.searchParams.get("clientId");
  const supabase = getSupabaseServer();
  let query = supabase
    .from("sales_activation_reports")
    .select("*")
    .order("quarter", { ascending: true });
  if (clientId) query = query.eq("client_id", clientId);
  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ reports: data });
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const {
    clientId,
    country,
    quarter,
    targetCount,
    orderCount,
    reasonUnknown,
    reasonNothingToBuy,
    reasonDistrust,
    memo,
  } = body ?? {};
  if (!clientId || !country?.trim() || !quarter?.trim() || targetCount == null || orderCount == null) {
    return NextResponse.json(
      { error: "고객사, 국가, 분기, 대상자 수, 주문자 수는 필수입니다." },
      { status: 400 }
    );
  }
  const supabase = getSupabaseServer();
  const { data, error } = await supabase
    .from("sales_activation_reports")
    .insert({
      client_id: clientId,
      country: country.trim(),
      quarter: quarter.trim(),
      target_count: targetCount,
      order_count: orderCount,
      reason_unknown: reasonUnknown || 0,
      reason_nothing_to_buy: reasonNothingToBuy || 0,
      reason_distrust: reasonDistrust || 0,
      memo: memo || null,
    })
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ report: data });
}

export async function DELETE(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id가 필요합니다." }, { status: 400 });
  const supabase = getSupabaseServer();
  const { error } = await supabase.from("sales_activation_reports").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
