import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://ojoxyalztyzcxlspwijw.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9qb3h5YWx6dHl6Y3hsc3B3aWp3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ5Nzg4OTIsImV4cCI6MjA3MDU1NDg5Mn0.UUqYVnqBcO0qaqMUO8E_CwoEyaru6Hf8gtgr6rZT7SU";

export const supabase = createClient(supabaseUrl, supabaseKey);
