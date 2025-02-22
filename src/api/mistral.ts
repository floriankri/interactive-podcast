
import { getSecret } from "@/utils/secrets";

export const mistralApiKey = await getSecret('VITE_MISTRAL_API_KEY');
export const MistralClient = new Mistral(mistralApiKey || '');
