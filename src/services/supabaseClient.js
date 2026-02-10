import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://agqpwdkamysmtfiiowtr.supabase.co/";
const supabaseAnonKey =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFncXB3ZGthbXlzbXRmaWlvd3RyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA2NDc5MDEsImV4cCI6MjA4NjIyMzkwMX0.DdnrVeTm06jYChis4MkCjnBH5bsh8PhtazAMQCn0mSU";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
