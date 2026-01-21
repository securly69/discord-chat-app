import { createClient } from '@supabase/supabase-js'

// Note: You need to create a Supabase project at https://app.supabase.com
// and get your project URL and API keys. Then update these env vars in your Vercel project:
// NEXT_PUBLIC_SUPABASE_URL (your project URL)
// NEXT_PUBLIC_SUPABASE_ANON_KEY (public/anon key)
// SUPABASE_SERVICE_ROLE_KEY (service role key - server-side only)

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET

// Client for use in the browser/client-side components
// Uses the anonymous key which is safe to expose
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Admin client for use in API routes / server actions ONLY
// This will be undefined on the client-side because the secret key isn't exposed
export const supabaseAdmin = supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey)
  : (null as any) // Cast to any to avoid type errors on client, but will fail if used


export type User = {
  id: string
  clerk_id: string
  username: string
  email: string
  avatar_url: string | null
  status: 'online' | 'offline' | 'idle' | 'do_not_disturb'
  status_message: string | null
  created_at: string
  updated_at: string
}

export type Server = {
  id: string
  name: string
  description: string | null
  icon_url: string | null
  owner_id: string
  created_at: string
  updated_at: string
}

export type Channel = {
  id: string
  server_id: string
  name: string
  description: string | null
  type: 'text' | 'voice' | 'video'
  is_private: boolean
  created_by: string
  created_at: string
  updated_at: string
}

export type Message = {
  id: string
  channel_id: string
  user_id: string
  content: string
  edited_at: string | null
  deleted_at: string | null
  created_at: string
}

export type DirectMessage = {
  id: string
  sender_id: string
  recipient_id: string
  content: string
  read_at: string | null
  created_at: string
}

export type VoiceSession = {
  id: string
  channel_id: string
  user_id: string
  session_token: string
  started_at: string
  ended_at: string | null
}

export type VideoSession = {
  id: string
  channel_id: string
  initiator_id: string
  session_token: string
  started_at: string
  ended_at: string | null
}

export type VideoParticipant = {
  id: string
  video_session_id: string
  user_id: string
  joined_at: string
  left_at: string | null
}
