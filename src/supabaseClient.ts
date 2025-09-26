import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://zbkcfsrccbpexygfmild.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpia2Nmc3JjY2JwZXh5Z2ZtaWxkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg0NDIwNjgsImV4cCI6MjA3NDAxODA2OH0.5DfXNeDYxJvadDMQGXq7mpSAYAPuG0w92NaHCiXB-gY'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)