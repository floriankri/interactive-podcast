
import { supabase } from "@/integrations/supabase/client";

export async function getSecret(name: string): Promise<string | null> {
  try {
    const { data, error } = await supabase
      .from('secrets')
      .select('value')
      .eq('name', name)
      .single();

    if (error) {
      console.error('Error fetching secret:', error);
      return null;
    }

    return data?.value || null;
  } catch (error) {
    console.error('Error fetching secret:', error);
    return null;
  }
}
