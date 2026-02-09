import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ajpmeyptgqdubcfzxcgz.supabase.co';
const supabaseKey = 'sb_publishable_Zr-Hc_ZGpMtht9yCi6YFpQ_NRRZ4r_f';

export const supabase = createClient(supabaseUrl, supabaseKey);