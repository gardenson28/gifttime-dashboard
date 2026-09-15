import { createClient } from "@supabase/supabase-js";

// service_role 키를 쓰는 서버 전용 클라이언트. API 라우트(app/api/**)에서만 import할 것 —
// 절대 클라이언트 컴포넌트에서 이 파일을 import하면 안 된다.
export function getSupabaseServer() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY;
  if (!url || !key) {
    throw new Error("SUPABASE_URL / SUPABASE_SERVICE_KEY 환경변수가 설정되어 있지 않습니다.");
  }
  return createClient(url, key, { auth: { persistSession: false } });
}
