// src/ai/flows/analyze-body-type.ts
'use server';

/**
 * @fileOverview Analyzes user's body type and undertone from a photo.
 *
 * - analyzeBodyType - A function that handles the body type and undertone analysis process.
 * - AnalyzeBodyTypeInput - The input type for the analyzeBodyType function.
 * - AnalyzeBodyTypeOutput - The return type for the analyzeBodyType function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeBodyTypeInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of the user, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type AnalyzeBodyTypeInput = z.infer<typeof AnalyzeBodyTypeInputSchema>;

const AnalyzeBodyTypeOutputSchema = z.object({
  bodyType: z.string().describe('The user\s body type.'),
  undertone: z.string().describe('The user\s skin undertone (warm, cool, neutral).'),
});
export type AnalyzeBodyTypeOutput = z.infer<typeof AnalyzeBodyTypeOutputSchema>;

export async function analyzeBodyType(input: AnalyzeBodyTypeInput): Promise<AnalyzeBodyTypeOutput> {
  return analyzeBodyTypeFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeBodyTypePrompt',
  input: {schema: AnalyzeBodyTypeInputSchema},
  output: {schema: AnalyzeBodyTypeOutputSchema},
  prompt: `You are a fashion expert, skilled in analyzing body types and skin undertones from images.

Analyze the user's body type and skin undertone from the provided image.  The undertone should be warm, cool, or neutral.

Photo: {{media url=photoDataUri}}`,
});

const analyzeBodyTypeFlow = ai.defineFlow(
  {
    name: 'analyzeBodyTypeFlow',
    inputSchema: AnalyzeBodyTypeInputSchema,
    outputSchema: AnalyzeBodyTypeOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
