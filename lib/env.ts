// Lightweight env access — validates required values exist, with a friendly
// dev-time error if not. Zero deps so it's safe to import anywhere.

type EnvShape = {
  NEXT_PUBLIC_SUPABASE_URL: string;
  NEXT_PUBLIC_SUPABASE_ANON_KEY: string;
};

function read(name: keyof EnvShape): string | undefined {
  let v: string | undefined;
  if (name === 'NEXT_PUBLIC_SUPABASE_URL') {
    v = process.env.NEXT_PUBLIC_SUPABASE_URL;
  } else if (name === 'NEXT_PUBLIC_SUPABASE_ANON_KEY') {
    v = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  }
  return v && v.length > 0 ? v : undefined;
}

export function getPublicEnv(): EnvShape | null {
  const url = read('NEXT_PUBLIC_SUPABASE_URL');
  const anon = read('NEXT_PUBLIC_SUPABASE_ANON_KEY');
  if (!url || !anon) return null;
  return { NEXT_PUBLIC_SUPABASE_URL: url, NEXT_PUBLIC_SUPABASE_ANON_KEY: anon };
}

export function requirePublicEnv(): EnvShape {
  const env = getPublicEnv();
  if (!env) {
    throw new Error(
      'LEF: Supabase env not set. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local',
    );
  }
  return env;
}

export function hasSupabaseConfig(): boolean {
  return getPublicEnv() !== null;
}
