import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabaseServer";

export async function GET() {
  const supabase = getSupabaseServer();
  const { data, error } = await supabase.from("sales_clients").select("*").order("name");
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ clients: data });
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const name: string | undefined = body?.name?.trim();
  const feeType: string | undefined = body?.feeType?.trim() || null;
  if (!name) {
    return NextResponse.json({ error: "고객사명을 입력해주세요." }, { status: 400 });
  }
  const supabase = getSupabaseServer();
  const { data, error } = await supabase
    .from("sales_clients")
    .insert({ name, fee_type: feeType })
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ client: data });
}
