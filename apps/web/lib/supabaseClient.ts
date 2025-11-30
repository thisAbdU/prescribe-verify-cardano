/**
 * Supabase Client
 * 
 * Client for interacting with Supabase (database and auth).
 * 
 * TODO: Install Supabase client
 *   npm install @supabase/supabase-js
 */

import { createClient } from "@supabase/supabase-js";

// TODO: Initialize Supabase client
// 
// const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
// const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
// 
// export const supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
// 
// // Server-side client with service role key (for admin operations)
// export const supabaseAdmin = createClient(
//   supabaseUrl,
//   process.env.SUPABASE_SERVICE_ROLE_KEY!,
//   {
//     auth: {
//       autoRefreshToken: false,
//       persistSession: false,
//     },
//   }
// );

// Placeholder export
export const supabaseClient = null as any;
export const supabaseAdmin = null as any;

