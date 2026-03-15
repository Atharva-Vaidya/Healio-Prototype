import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://poayslnqljbucztetqmy.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBvYXlzbG5xbGpidWN6dGV0cW15Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM1MDUzMDcsImV4cCI6MjA4OTA4MTMwN30.yP3H4G9zS7ERnbwhviscdQoGqXvSCRNznXewiz_g7uM'; 

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
