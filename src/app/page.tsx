
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { generateRedbubbleMetadata, type GenerateRedbubbleMetadataInput, type GenerateRedbubbleMetadataOutput } from '@/ai/flows/generate-redbubble-metadata';
import { UploadCloud, Sparkles, Copy, AlertCircle, Loader2 } from 'lucide-react';

const ALL_CATEGORIES = ['Photography', 'Design & Illustration', 'Painting & Mixed Media', 'Drawing', 'Digital Art'] as const;
type Category = typeof ALL_CATEGORIES[number];

const metadataFormSchema = z.object({
  title: z.string().min(1, "Title is required.").max(100, "Title should be concise (max 100 characters)."),
  tags: z.string().min(1, "Tags are required.").refine(tags => {
    const tagArray = tags.split(',').map(tag => tag.trim());
    return tagArray.every(tag => tag.length <= 50);
  }, "Each tag must be 50 characters or less.").refine(tags => {
    const tagArray = tags.split(',').map(tag => tag.trim()).filter(Boolean);
    return tagArray.length <= 15;
  }, "Up to 15 tags allowed."),
  description: z.string().min(1, "Description is required.").max(5000, "Description too long (max 5000 characters)."),
  categories: z.array(z.enum(ALL_CATEGORIES)).min(0).max(2, "Select up to 2 categories."),
});

type MetadataFormData = z.infer<typeof metadataFormSchema>;

const fileToDataUri = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

export default function RedbubbleReadyPage() {
  const [artworkImageFile, setArtworkImageFile] = useState<File | null>(null);
  const [artworkPreview, setArtworkPreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const form = useForm<MetadataFormData>({
    resolver: zodResolver(metadataFormSchema),
    defaultValues: {
      title: '',
      tags: '',
      description: '',
      categories: [],
    },
  });

  const handleImageChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setArtworkImageFile(file);
      setError(null); // Clear previous errors
      try {
        const dataUri = await fileToDataUri(file);
        setArtworkPreview(dataUri);
      } catch (e) {
        setError("Failed to load image preview.");
        setArtworkPreview(null);
        setArtworkImageFile(null);
      }
    }
  };

  const handleGenerateMetadata = async () => {
    if (!artworkPreview) {
      setError("Please upload an artwork image first.");
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const input: GenerateRedbubbleMetadataInput = { artworkDataUri: artworkPreview };
      const result = await generateRedbubbleMetadata(input);
      
      form.reset({
        title: result.title,
        tags: result.tags,
        description: result.description,
        // Ensure categories are valid and within the defined set
        categories: result.categories.filter(cat => ALL_CATEGORIES.includes(cat as Category)) as Category[],
      });
      toast({
        title: "Metadata Generated",
        description: "Review and refine the generated metadata.",
      });
    } catch (e: any) {
      console.error("Error generating metadata:", e);
      setError(`Failed to generate metadata: ${e.message || 'Unknown error'}`);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not generate metadata. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyToClipboard = () => {
    const values = form.getValues();
    const metadataString = `Title: ${values.title}\n\nTags: ${values.tags}\n\nDescription: ${values.description}\n\nCategories: ${values.categories.join(', ')}`;
    navigator.clipboard.writeText(metadataString)
      .then(() => {
        toast({
          title: "Copied to Clipboard!",
          description: "Metadata is ready to be pasted into Redbubble.",
        });
      })
      .catch(err => {
        console.error("Failed to copy:", err);
        toast({
          variant: "destructive",
          title: "Copy Failed",
          description: "Could not copy metadata to clipboard.",
        });
      });
  };

  // Effect to clear form if image is removed
  useEffect(() => {
    if (!artworkImageFile) {
      setArtworkPreview(null);
      form.reset({ title: '', tags: '', description: '', categories: [] });
    }
  }, [artworkImageFile, form]);


  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="py-8 text-center border-b border-border">
        <h1 className="text-4xl font-bold text-primary">Redbubble Ready</h1>
        <p className="text-muted-foreground mt-2 text-lg">Optimize your artwork metadata for Redbubble effortlessly.</p>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-6xl">
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="grid md:grid-cols-2 gap-8">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <UploadCloud className="text-primary" />
                Upload Your Artwork
              </CardTitle>
              <CardDescription>Select an image file to generate metadata for.</CardDescription>
            </CardHeader>
            <CardContent>
              <Input
                id="artworkUpload"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="mb-4 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
              />
              {artworkPreview && (
                <div className="mt-4 border border-border rounded-md p-2 aspect-square relative overflow-hidden bg-muted/50">
                   <Image src={artworkPreview} alt="Artwork Preview" layout="fill" objectFit="contain" data-ai-hint="artwork abstract" />
                </div>
              )}
            </CardContent>
             <CardFooter>
                <Button
                    onClick={handleGenerateMetadata}
                    disabled={!artworkPreview || isLoading}
                    className="w-full"
                    size="lg"
                >
                    {isLoading ? (
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    ) : (
                    <Sparkles className="mr-2 h-5 w-5" />
                    )}
                    {isLoading ? 'Generating...' : 'Generate Metadata'}
                </Button>
            </CardFooter>
          </Card>

          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl">Generated Metadata</CardTitle>
              <CardDescription>Review and edit the AI-generated metadata below.</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form className="space-y-6">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base">Title</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Mystic Forest Landscape" {...field} className="text-base" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="tags"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base">Tags (comma-separated)</FormLabel>
                        <FormControl>
                          <Textarea placeholder="e.g., forest, nature, abstract, vibrant" {...field} rows={3} className="text-base" />
                        </FormControl>
                         <FormDescription>Up to 15 tags, max 50 characters each.</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base">Description</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Tell a story about your artwork..." {...field} rows={5} className="text-base"/>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="categories"
                    render={() => (
                      <FormItem>
                        <div className="mb-2">
                          <FormLabel className="text-base">Media Categories</FormLabel>
                          <FormDescription>Select up to 2 categories.</FormDescription>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2">
                          {ALL_CATEGORIES.map((category) => (
                            <FormField
                              key={category}
                              control={form.control}
                              name="categories"
                              render={({ field }) => {
                                const isChecked = field.value?.includes(category);
                                const canCheckMore = field.value ? field.value.length < 2 : true;
                                return (
                                  <FormItem
                                    className="flex flex-row items-center space-x-3 space-y-0 p-2 rounded-md hover:bg-accent/10 transition-colors"
                                  >
                                    <FormControl>
                                      <Checkbox
                                        checked={isChecked}
                                        onCheckedChange={(checked) => {
                                          const currentCategories = field.value || [];
                                          if (checked) {
                                            if (canCheckMore) {
                                              return field.onChange([...currentCategories, category]);
                                            }
                                          } else {
                                            return field.onChange(
                                              currentCategories?.filter(
                                                (value) => value !== category
                                              )
                                            );
                                          }
                                        }}
                                        disabled={!isChecked && !canCheckMore && !form.formState.isSubmitting}
                                      />
                                    </FormControl>
                                    <FormLabel className="font-normal text-sm cursor-pointer">
                                      {category}
                                    </FormLabel>
                                  </FormItem>
                                )
                              }}
                            />
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </form>
              </Form>
            </CardContent>
            <CardFooter>
              <Button onClick={handleCopyToClipboard} variant="outline" className="w-full" size="lg" disabled={!form.formState.isValid && !form.formState.isDirty}>
                <Copy className="mr-2 h-5 w-5" />
                Copy Metadata to Clipboard
              </Button>
            </CardFooter>
          </Card>
        </div>
      </main>
      <footer className="text-center py-6 mt-8 border-t border-border">
        <p className="text-sm text-muted-foreground">&copy; {new Date().getFullYear()} Redbubble Ready. Powered by AI.</p>
      </footer>
    </div>
  );
}
