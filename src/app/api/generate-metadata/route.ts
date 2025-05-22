import { NextRequest } from 'next/server';
import { generateRedbubbleMetadata } from '@/ai/flows/generate-redbubble-metadata';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    if (!body.artworkDataUri) {
      return new Response(
        JSON.stringify({ 
          error: 'Artwork data URI is required' 
        }), 
        { 
          status: 400,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    }

    const result = await generateRedbubbleMetadata({
      artworkDataUri: body.artworkDataUri,
    });

    return new Response(
      JSON.stringify({
        status: 'success',
        data: result,
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

  } catch (error: any) {
    console.error('Error generating metadata:', error);
    
    return new Response(
      JSON.stringify({
        status: 'error',
        message: error.message || 'Failed to generate metadata',
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
}
