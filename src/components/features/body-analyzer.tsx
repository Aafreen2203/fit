'use client';

import { useState, useTransition } from 'react';
import Image from 'next/image';
import { Loader2, Upload, X, User, Palette } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { analyzeBodyType } from '@/ai/flows/analyze-body-type';
import type { AnalyzeBodyTypeOutput } from '@/ai/flows/analyze-body-type';
import { useToast } from '@/hooks/use-toast';

export function BodyAnalyzer() {
  const [isPending, startTransition] = useTransition();
  const [photoDataUri, setPhotoDataUri] = useState<string | null>(null);
  const [result, setResult] = useState<AnalyzeBodyTypeOutput | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 4 * 1024 * 1024) { // 4MB limit
        toast({
          title: "File too large",
          description: "Please upload an image smaller than 4MB.",
          variant: "destructive",
        });
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoDataUri(reader.result as string);
        setResult(null);
        setError(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = () => {
    if (!photoDataUri) return;
    setError(null);
    setResult(null);

    startTransition(async () => {
      try {
        const res = await analyzeBodyType({ photoDataUri });
        setResult(res);
      } catch (e) {
        setError('Failed to analyze the image. Please try another one.');
        console.error(e);
      }
    });
  };

  const handleRemoveImage = () => {
    setPhotoDataUri(null);
    setResult(null);
    setError(null);
  }

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-lg">
      <CardHeader>
        <CardTitle className="font-headline text-3xl">Body & Undertone Analysis</CardTitle>
        <CardDescription>
          Upload a full-body photo to discover your body type and skin undertone.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
            <div className="relative flex justify-center items-center w-full h-64 border-2 border-dashed rounded-lg">
              {photoDataUri ? (
                <>
                  <Image
                    src={photoDataUri}
                    alt="Uploaded photo"
                    fill
                    className="object-contain rounded-lg"
                  />
                  <Button variant="destructive" size="icon" className="absolute top-2 right-2 z-10" onClick={handleRemoveImage}>
                    <X className="h-4 w-4" />
                  </Button>
                </>
              ) : (
                <div className="text-center">
                  <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
                  <label htmlFor="photo-upload" className="mt-2 block text-sm font-medium text-primary hover:underline cursor-pointer">
                    Click to upload a photo
                  </label>
                  <input id="photo-upload" type="file" className="sr-only" onChange={handleFileChange} accept="image/png, image/jpeg, image/webp" />
                  <p className="text-xs text-muted-foreground mt-1">PNG, JPG, WEBP up to 4MB</p>
                </div>
              )}
            </div>
        </div>

        {error && (
            <Alert variant="destructive">
                <AlertTitle>Analysis Failed</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
            </Alert>
        )}

        {isPending && (
            <div className="flex items-center justify-center space-x-2 text-primary">
                <Loader2 className="h-6 w-6 animate-spin" />
                <p>Analyzing your photo...</p>
            </div>
        )}

        {result && (
          <Card className="bg-muted/50">
            <CardHeader>
              <CardTitle className="font-headline text-2xl">Analysis Results</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-4 p-4 rounded-lg bg-background">
                <User className="h-8 w-8 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Body Type</p>
                  <p className="text-lg font-semibold">{result.bodyType}</p>
                </div>
              </div>
              <div className="flex items-center gap-4 p-4 rounded-lg bg-background">
                <Palette className="h-8 w-8 text-accent" />
                <div>
                  <p className="text-sm text-muted-foreground">Skin Undertone</p>
                  <p className="text-lg font-semibold">{result.undertone}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </CardContent>
      <CardFooter>
        <Button onClick={handleAnalyze} disabled={!photoDataUri || isPending} className="w-full">
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Analyzing...
            </>
          ) : (
            'Analyze My Body Type'
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
