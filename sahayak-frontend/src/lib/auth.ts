/**
 * Sahayak AI — Supabase Auth Helpers
 * Replaces Firebase Auth entirely.
 */
import { createClient } from "@supabase/supabase-js"

const FALLBACK_SUPABASE_URL = "https://placeholder.supabase.co"
const FALLBACK_SUPABASE_ANON = "placeholder-anon-key"

function safeSupabaseUrl(value: unknown): string {
  const url = String(value ?? "").trim()
  try {
    const parsed = new URL(url)
    if (parsed.protocol === "http:" || parsed.protocol === "https:") return url
  } catch {
    // Keep the public app renderable even when deployment env vars are missing.
  }
  return FALLBACK_SUPABASE_URL
}

const SUPABASE_URL = safeSupabaseUrl(import.meta.env.VITE_SUPABASE_URL)
const SUPABASE_ANON =
  String(import.meta.env.VITE_SUPABASE_ANON_KEY ?? "").trim() || FALLBACK_SUPABASE_ANON

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON)

// ── Email/Password Auth ───────────────────────────────────────────────────────

export async function signUpWithEmail(email: string, password: string, fullName: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: fullName } },
  })
  if (error) throw new Error(error.message)
  return data
}

export async function signInWithEmail(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw new Error(error.message)
  return data
}

// ── Google OAuth ──────────────────────────────────────────────────────────────

export async function signInWithGoogle() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
    },
  })
  if (error) throw new Error(error.message)
  return data
}

// ── Sign Out ──────────────────────────────────────────────────────────────────

export async function signOut() {
  await supabase.auth.signOut()
  clearSession()
}

// ── Session Storage ───────────────────────────────────────────────────────────

export function storeSession(token: string, role: string, user: { name: string; id: string | number }) {
  localStorage.setItem("sahayak_token", token)
  localStorage.setItem("sahayak_role", role)
  localStorage.setItem("sahayak_user", JSON.stringify(user))
}

export function clearSession() {
  localStorage.removeItem("sahayak_token")
  localStorage.removeItem("sahayak_role")
  localStorage.removeItem("sahayak_user")
  sessionStorage.removeItem("sahayak_patient_id")
}

export function getStoredToken(): string | null {
  return localStorage.getItem("sahayak_token")
}
