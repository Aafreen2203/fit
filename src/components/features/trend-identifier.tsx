'use client';

import { useState, useTransition } from 'react';
import Image from 'next/image';
import { Loader2, Upload, X, Tag } from 'lucide-react';
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
import { Badge } from '@/components/ui/badge';
import { identifyTrendingClothes } from '@/ai/flows/identify-trending-clothes';
import type { IdentifyTrendingClothesOutput } from '@/ai/flows/identify-trending-clothes';
import { useToast } from '@/hooks/use-toast';

export function TrendIdentifier() {
  const [isPending, startTransition] = useTransition();
  const [outfitDataUri, setOutfitDataUri] = useState<string | null>(null);
  const [result, setResult] = useState<IdentifyTrendingClothesOutput | null>(null);
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
        setOutfitDataUri(reader.result as string);
        setResult(null);
        setError(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleIdentifyTrends = () => {
    if (!outfitDataUri) return;
    setError(null);
    setResult(null);

    startTransition(async () => {
      try {
        const res = await identifyTrendingClothes({ photoDataUri: outfitDataUri });
        setResult(res);
      } catch (e) {
        setError('Failed to identify trends from the image. Please try another one.');
        console.error(e);
      }
    });
  };

  const handleRemoveImage = () => {
    setOutfitDataUri(null);
    setResult(null);
    setError(null);
  }

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-lg">
      <CardHeader>
        <CardTitle className="font-headline text-3xl">Trend Finder</CardTitle>
        <CardDescription>
          Upload a photo of an outfit to find out what's currently trending.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
            <div className="relative flex justify-center items-center w-full h-64 border-2 border-dashed rounded-lg">
              {outfitDataUri ? (
                <>
                  <Image
                    src={outfitDataUri}
                    alt="Uploaded outfit"
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
                  <label htmlFor="outfit-upload" className="mt-2 block text-sm font-medium text-primary hover:underline cursor-pointer">
                    Click to upload an outfit
                  </label>
                  <input id="outfit-upload" type="file" className="sr-only" onChange={handleFileChange} accept="image/png, image/jpeg, image/webp" />
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
                <p>Scanning for trends...</p>
            </div>
        )}
        {result && (
          <Card className="bg-muted/50">
            <CardHeader>
              <CardTitle className="font-headline text-2xl">Trending Items Found</CardTitle>
            </CardHeader>
            <CardContent>
              {result.trendingClothes.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {result.trendingClothes.map((item, index) => (
                    <Badge key={index} variant="default" className="text-base py-1 px-3 bg-accent text-accent-foreground">
                      <Tag className="mr-2 h-4 w-4" />
                      {item}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p>No specific trending items were identified in this outfit.</p>
              )}
            </CardContent>
          </Card>
        )}
      </CardContent>
      <CardFooter>
        <Button onClick={handleIdentifyTrends} disabled={!outfitDataUri || isPending} className="w-full">
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Identifying...
            </>
          ) : (
            'Identify Trends'
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
