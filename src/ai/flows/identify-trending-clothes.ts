'use server';

/**
 * @fileOverview This flow identifies trending clothes from an image of an outfit.
 *
 * - identifyTrendingClothes - A function that takes an image of an outfit and returns a list of trending clothes.
 * - IdentifyTrendingClothesInput - The input type for the identifyTrendingClothes function.
 * - IdentifyTrendingClothesOutput - The return type for the identifyTrendingClothes function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const IdentifyTrendingClothesInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of an outfit, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type IdentifyTrendingClothesInput = z.infer<typeof IdentifyTrendingClothesInputSchema>;

const IdentifyTrendingClothesOutputSchema = z.object({
  trendingClothes: z
    .array(z.string())
    .describe('A list of trending clothes identified in the outfit.'),
});
export type IdentifyTrendingClothesOutput = z.infer<typeof IdentifyTrendingClothesOutputSchema>;

export async function identifyTrendingClothes(
  input: IdentifyTrendingClothesInput
): Promise<IdentifyTrendingClothesOutput> {
  return identifyTrendingClothesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'identifyTrendingClothesPrompt',
  input: {schema: IdentifyTrendingClothesInputSchema},
  output: {schema: IdentifyTrendingClothesOutputSchema},
  prompt: `You are a fashion expert. Analyze the outfit in the image and identify the trending clothes.

Image: {{media url=photoDataUri}}

Return a list of trending clothes identified in the outfit.
`,
});

const identifyTrendingClothesFlow = ai.defineFlow(
  {
    name: 'identifyTrendingClothesFlow',
    inputSchema: IdentifyTrendingClothesInputSchema,
    outputSchema: IdentifyTrendingClothesOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);