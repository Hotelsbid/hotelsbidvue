import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY;

export const supabase = createClient(supabaseUrl, supabaseKey);

// export const supabaseLogin = async (email, password) => {
//   console.log('Logging in user:', email, supabaseUrl, supabaseKey);
//   const { user, error } = await supabase.auth.signIn({
//     email: email,
//     password: password,
//   });
  
//   if (error) {
//     console.error('Authentication error:', error);
//   } else {
//     console.log('Logged in user:', user);
//   }
// }      