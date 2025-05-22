"use client";

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input'; // Still needed for hidden file input
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { generateRedbubbleMetadata, type GenerateRedbubbleMetadataInput, type GenerateRedbubbleMetadataOutput } from '@/ai/flows/generate-redbubble-metadata';
import { UploadCloud, Sparkles, Copy, AlertCircle, Loader2, Tags, FileText, Type, GalleryVerticalEnd, Info } from 'lucide-react';

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
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      if (file.size > 5 * 1024 * 1024) { // Max 5MB
        setError("File size exceeds 5MB. Please choose a smaller file.");
        setArtworkImageFile(null);
        setArtworkPreview(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = ""; // Reset file input
        }
        return;
      }
      setArtworkImageFile(file);
      setError(null);
      try {
        const dataUri = await fileToDataUri(file);
        setArtworkPreview(dataUri);
        form.reset({ title: '', tags: '', description: '', categories: [] }); // Clear form on new image
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
        categories: result.categories.filter(cat => ALL_CATEGORIES.includes(cat as Category)) as Category[],
      });
      toast({
        title: "Metadata Generated!",
        description: "Review and refine the generated metadata below.",
      });
    } catch (e: any) {
      console.error("Error generating metadata:", e);
      setError(`Failed to generate metadata: ${e.message || 'Unknown error'}`);
      toast({
        variant: "destructive",
        title: "Error Generating Metadata",
        description: "Could not generate metadata. Please check the console for more details or try a different image.",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleCopyField = (fieldName: keyof MetadataFormData | 'tags-display', fieldLabel: string) => {
    let valueToCopy: string;
    if (fieldName === 'categories') {
      valueToCopy = (form.getValues(fieldName) as Category[]).join(', ');
    } else if (fieldName === 'tags-display') {
      valueToCopy = form.getValues('tags');
    } 
    else {
      valueToCopy = form.getValues(fieldName as keyof MetadataFormData) as string;
    }

    if (!valueToCopy && fieldName !== 'categories') { // Allow copying empty categories string
        toast({
            variant: "destructive",
            title: `${fieldLabel} is Empty`,
            description: `There's no content to copy for ${fieldLabel}.`,
        });
        return;
    }

    navigator.clipboard.writeText(valueToCopy)
      .then(() => {
        toast({
          title: `${fieldLabel} Copied!`,
          description: `${fieldLabel} copied to clipboard.`,
        });
      })
      .catch(err => {
        console.error(`Failed to copy ${fieldLabel}:`, err);
        toast({
          variant: "destructive",
          title: "Copy Failed",
          description: `Could not copy ${fieldLabel}.`,
        });
      });
  };

  useEffect(() => {
    if (!artworkImageFile) {
      setArtworkPreview(null);
      form.reset({ title: '', tags: '', description: '', categories: [] });
    }
  }, [artworkImageFile, form]);

  const watchedTags = form.watch('tags');
  const displayTags = watchedTags ? watchedTags.split(',').map(tag => tag.trim()).filter(Boolean) : [];

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center py-10 px-4 sm:px-6 lg:px-8">
      <header className="text-center mb-10 w-full max-w-4xl">
        <h1 className="text-4xl sm:text-5xl font-bold text-primary flex items-center justify-center">
          <Sparkles className="mr-3 h-8 w-8 sm:h-10 sm:w-10" />
          Redbubble Ready
        </h1>
        <p className="text-muted-foreground mt-3 text-lg">
          Upload your artwork to get Redbubble-optimized titles, tags, descriptions, and media categories in seconds.
        </p>
      </header>

      {error && (
        <Alert variant="destructive" className="mb-6 w-full max-w-3xl">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <main className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-8">
        {/* Left Column: Artwork Upload */}
        <div className="md:col-span-1 flex flex-col items-center space-y-6">
          <div 
            className="w-full max-w-md mx-auto aspect-square bg-muted/10 rounded-lg border-2 border-dashed border-border hover:border-primary transition-colors flex flex-col items-center justify-center cursor-pointer relative overflow-hidden group"
            onClick={() => fileInputRef.current?.click()}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') fileInputRef.current?.click();}}
            aria-label="Upload artwork image"
          >
            {artworkPreview ? (
              <Image 
                src={artworkPreview} 
                alt="Artwork Preview" 
                fill 
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 300px" 
                style={{ objectFit: 'contain' }} 
                className="rounded-md"
                data-ai-hint="artwork owl" 
              />
            ) : (
              <div className="text-center p-4">
                <UploadCloud className="h-16 w-16 text-muted-foreground/70 mx-auto mb-3 group-hover:text-primary transition-colors" />
                <p className="font-semibold text-foreground/90 group-hover:text-primary transition-colors">Click to upload artwork</p>
                <p className="text-xs text-muted-foreground mt-1">(Max 5MB)</p>
              </div>
            )}
          </div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageChange}
            accept="image/jpeg,image/png,image/gif,image/webp"
            className="hidden"
            id="artworkUpload"
          />
          <Button
              onClick={handleGenerateMetadata}
              disabled={!artworkPreview || isLoading}
              className="w-full max-w-md mx-auto"
              size="lg"
          >
              {isLoading ? (
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              ) : (
              <Sparkles className="mr-2 h-5 w-5" />
              )}
              {isLoading ? 'Generating...' : 'Generate Metadata'}
          </Button>
        </div>

        {/* Right Column: Metadata Form */}
        <div className="md:col-span-2">
          <Card className="bg-card text-card-foreground shadow-xl p-6 rounded-lg">
            <Form {...form}>
              <form className="space-y-8">
                {/* Title */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <FormLabel className="text-lg font-semibold flex items-center text-foreground/90">
                      <Type className="mr-2 h-5 w-5 text-primary" />
                      Title
                    </FormLabel>
                    <Button variant="ghost" size="icon" type="button" onClick={() => handleCopyField('title', 'Title')} aria-label="Copy title">
                      <Copy className="h-4 w-4 text-muted-foreground hover:text-primary" />
                    </Button>
                  </div>
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input placeholder="AI-generated title will appear here..." {...field} className="text-base bg-input border-border focus:bg-background" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Tags */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <FormLabel className="text-lg font-semibold flex items-center text-foreground/90">
                      <Tags className="mr-2 h-5 w-5 text-primary" />
                      Tags
                    </FormLabel>
                     <Button variant="ghost" size="icon" type="button" onClick={() => handleCopyField('tags-display', 'Tags')} aria-label="Copy tags">
                      <Copy className="h-4 w-4 text-muted-foreground hover:text-primary" />
                    </Button>
                  </div>
                  <FormField
                    control={form.control}
                    name="tags"
                    render={() => ( // field is not directly used for input element
                      <FormItem>
                        <FormControl>
                           <div className="min-h-[60px] p-3 rounded-md bg-input border border-border flex flex-wrap gap-2">
                            {displayTags.length > 0 ? displayTags.map((tag, index) => (
                              <Badge key={index} variant="secondary" className="text-sm py-1 px-3">{tag}</Badge>
                            )) : <span className="text-muted-foreground text-sm">AI-generated tags will appear here...</span>}
                          </div>
                        </FormControl>
                        <FormDescription>Up to 15 tags, max 50 characters each.</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                {/* Description */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <FormLabel className="text-lg font-semibold flex items-center text-foreground/90">
                      <FileText className="mr-2 h-5 w-5 text-primary" />
                      Description
                    </FormLabel>
                    <Button variant="ghost" size="icon" type="button" onClick={() => handleCopyField('description', 'Description')} aria-label="Copy description">
                      <Copy className="h-4 w-4 text-muted-foreground hover:text-primary" />
                    </Button>
                  </div>
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Textarea placeholder="AI-generated description will appear here..." {...field} rows={5} className="text-base bg-input border-border focus:bg-background" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Media Categories */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                     <FormLabel className="text-lg font-semibold flex items-center text-foreground/90">
                      <GalleryVerticalEnd className="mr-2 h-5 w-5 text-primary" />
                      Media Categories
                    </FormLabel>
                    <Button variant="ghost" size="icon" type="button" onClick={() => handleCopyField('categories', 'Categories')} aria-label="Copy categories">
                      <Copy className="h-4 w-4 text-muted-foreground hover:text-primary" />
                    </Button>
                  </div>
                  <FormField
                    control={form.control}
                    name="categories"
                    render={() => (
                      <FormItem>
                        <div className="space-y-2">
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
                                    className="flex flex-row items-center space-x-3 space-y-0 p-2.5 rounded-md hover:bg-muted/20 transition-colors bg-input border border-transparent hover:border-border"
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
                                        className="data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
                                      />
                                    </FormControl>
                                    <FormLabel className="font-normal text-sm cursor-pointer text-foreground/90">
                                      {category}
                                    </FormLabel>
                                  </FormItem>
                                )
                              }}
                            />
                          ))}
                        </div>
                        <FormDescription>Select up to 2 categories.</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                {/* Informational note about manual review */}
                 <Alert variant="default" className="bg-muted/10 border-primary/30">
                    <Info className="h-4 w-4 text-primary" />
                    <AlertTitle className="text-primary/90">Review Recommended</AlertTitle>
                    <AlertDescription className="text-muted-foreground">
                        AI-generated metadata is a great starting point. Always review and refine it to best suit your artwork and audience before publishing.
                    </AlertDescription>
                </Alert>
              </form>
            </Form>
          </Card>
        </div>
      </main>
    </div>
  );
}
