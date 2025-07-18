'use client';

import { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Loader2, Sparkles, Wand2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { suggestClothingPairings } from '@/ai/flows/suggest-clothing-pairings';
import type { SuggestClothingPairingsOutput } from '@/ai/flows/suggest-clothing-pairings';

const formSchema = z.object({
  bodyType: z.string().min(1, 'Please select your body type.'),
  bodyShape: z.string().min(1, 'Please select your body shape.'),
  colorPalette: z.string().min(1, 'Please select your color palette.'),
});

const bodyTypes = ['Hourglass', 'Pear', 'Apple', 'Rectangle', 'Inverted Triangle'];
const bodyShapes = ['Triangle', 'Inverted Triangle', 'Rectangle', 'Hourglass', 'Oval', 'Diamond'];
const colorPalettes = ['Spring', 'Summer', 'Autumn', 'Winter'];

export function OutfitRecommender() {
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<SuggestClothingPairingsOutput | null>(null);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      bodyType: '',
      bodyShape: '',
      colorPalette: '',
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    setError(null);
    setResult(null);
    startTransition(async () => {
      try {
        const res = await suggestClothingPairings(values);
        setResult(res);
      } catch (e) {
        setError('Failed to get recommendations. Please try again.');
        console.error(e);
      }
    });
  };

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-lg">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardHeader>
            <CardTitle className="font-headline text-3xl">AI Outfit Recommender</CardTitle>
            <CardDescription>
              Tell us about yourself, and our AI will suggest the perfect outfit.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <FormField
                control={form.control}
                name="bodyType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Body Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {bodyTypes.map(type => <SelectItem key={type} value={type}>{type}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="bodyShape"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Body Shape</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select shape" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {bodyShapes.map(shape => <SelectItem key={shape} value={shape}>{shape}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="colorPalette"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Color Palette</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select palette" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {colorPalettes.map(palette => <SelectItem key={palette} value={palette}>{palette}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            {error && (
                <Alert variant="destructive">
                    <AlertTitle>Recommendation Failed</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}
            {result && (
              <Card className="bg-muted/50">
                 <CardHeader>
                    <CardTitle className="font-headline text-2xl flex items-center gap-2">
                      <Wand2 className="text-primary"/> Your AI-Curated Outfit
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-lg">Suggested Outfit:</h3>
                    <ul className="list-disc list-inside mt-2 space-y-1">
                      {result.suggestedOutfit.map((item, index) => (
                        <li key={index}>{item}</li>
                      ))}
                    </ul>
                  </div>
                   <div>
                    <h3 className="font-semibold text-lg">Stylist's Reasoning:</h3>
                    <p className="text-muted-foreground mt-2">{result.reasoning}</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isPending} className="w-full">
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                 <Sparkles className="mr-2 h-4 w-4" />
                  Get My Recommendation
                </>
              )}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
