import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabaseServer";

export async function GET(req: NextRequest) {
  const clientId = req.nextUrl.searchParams.get("clientId");
  const supabase = getSupabaseServer();
  let query = supabase.from("sales_employees").select("*").order("employee_code");
  if (clientId) query = query.eq("client_id", clientId);
  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ employees: data });
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const { clientId, employeeCode, department, quarter, usageAmount } = body ?? {};
  if (!clientId || !employeeCode?.trim() || !quarter?.trim()) {
    return NextResponse.json({ error: "고객사, 사번, 분기는 필수입니다." }, { status: 400 });
  }
  const supabase = getSupabaseServer();
  const { data, error } = await supabase
    .from("sales_employees")
    .insert({
      client_id: clientId,
      employee_code: employeeCode.trim(),
      department: department || null,
      quarter: quarter.trim(),
      usage_amount: usageAmount || 0,
    })
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ employee: data });
}

export async function DELETE(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id가 필요합니다." }, { status: 400 });
  const supabase = getSupabaseServer();
  const { error } = await supabase.from("sales_employees").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
