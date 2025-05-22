'use server';

/**
 * @fileOverview Generates Redbubble-optimized metadata (title, tags, description, categories) for artwork.
 *
 * - generateRedbubbleMetadata - A function that handles the metadata generation process.
 * - GenerateRedbubbleMetadataInput - The input type for the generateRedbubbleMetadata function.
 * - GenerateRedbubbleMetadataOutput - The return type for the generateRedbubbleMetadata function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateRedbubbleMetadataInputSchema = z.object({
  artworkDataUri: z
    .string()
    .describe(
      "A photo of the artwork, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type GenerateRedbubbleMetadataInput = z.infer<typeof GenerateRedbubbleMetadataInputSchema>;

const GenerateRedbubbleMetadataOutputSchema = z.object({
  title: z
    .string()
    .describe('A descriptive title (4-8 words) that clearly explains the artwork'),
  tags: z
    .string()
    .describe('Up to 15 relevant tags (maximum 50 characters per tag), separated by commas'),
  description: z
    .string()
    .describe('An engaging description that tells the story or meaning behind the artwork'),
  categories: z
    .array(z.enum(['Photography', 'Design & Illustration', 'Painting & Mixed Media', 'Drawing', 'Digital Art']))
    .max(2)
    .describe('Up to 2 media categories that best match the artwork'),
});
export type GenerateRedbubbleMetadataOutput = z.infer<typeof GenerateRedbubbleMetadataOutputSchema>;

export async function generateRedbubbleMetadata(
  input: GenerateRedbubbleMetadataInput
): Promise<GenerateRedbubbleMetadataOutput> {
  return generateRedbubbleMetadataFlow(input);
}

const generateRedbubbleMetadataPrompt = ai.definePrompt({
  name: 'generateRedbubbleMetadataPrompt',
  input: {schema: GenerateRedbubbleMetadataInputSchema},
  output: {schema: GenerateRedbubbleMetadataOutputSchema},
  prompt: `You are an AI assistant specialized in analyzing visual artwork and generating marketplace-ready metadata for Redbubble.

Analyze the uploaded image and generate the following metadata elements:
1. A descriptive title (4-8 words) that clearly explains the artwork
2. Up to 15 relevant tags (maximum 50 characters per tag), separated by commas
3. An engaging description that tells the story or meaning behind the artwork
4. Identify which of the following media categories best match the artwork (select up to 2): Photography, Design & Illustration, Painting & Mixed Media, Drawing, Digital Art


Consider these guidlines:
- Redbubble is a print-on-demand marketplace where artists upload designs that can be printed on various products
- Effective metadata significantly impacts discoverability through search algorithms
- Titles should be descriptive yet concise (4-8 words)
- Tags should include relevant keywords that potential buyers might search for
- Descriptions should engage potential buyers by telling a story or explaining the meaning
- Media categories help Redbubble properly categorize the artwork
- Metadata should be unique and avoid generic terms that could apply to any artwork
- Your analysis must be based solely on visual elements present in the image
- Avoid making assumptions about the artist's intent unless visually evident


Here is the artwork to be analyzed: {{media url=artworkDataUri}}

Output the title, tags, description, and categories as a JSON object.

{
  "title": "",
  "tags": "",
  "description": "",
  "categories": []
}
`,
});

const generateRedbubbleMetadataFlow = ai.defineFlow(
  {
    name: 'generateRedbubbleMetadataFlow',
    inputSchema: GenerateRedbubbleMetadataInputSchema,
    outputSchema: GenerateRedbubbleMetadataOutputSchema,
  },
  async input => {
    const {output} = await generateRedbubbleMetadataPrompt(input);
    return output!;
  }
);
