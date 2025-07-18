'use client';

import { useState, useTransition } from 'react';
import Image from 'next/image';
import { Loader2, Upload, Plus, X, Shirt, Sparkles } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { pairWardrobeOutfits } from '@/ai/flows/pair-wardrobe-outfits';
import type { PairWardrobeOutfitsOutput } from '@/ai/flows/pair-wardrobe-outfits';
import { useToast } from '@/hooks/use-toast';

interface ClothingItem {
  id: number;
  photoDataUri: string;
  description: string;
  type: string;
  color: string;
}

const initialNewItemState = {
  photoDataUri: '',
  description: '',
  type: '',
  color: '',
};

export function WardrobePairer() {
  const [isPending, startTransition] = useTransition();
  const [clothingItems, setClothingItems] = useState<ClothingItem[]>([]);
  const [newItem, setNewItem] = useState(initialNewItemState);
  const [result, setResult] = useState<PairWardrobeOutfitsOutput | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 4 * 1024 * 1024) { // 4MB limit
        toast({ title: "File too large", description: "Image must be smaller than 4MB.", variant: "destructive" });
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => setNewItem(prev => ({ ...prev, photoDataUri: reader.result as string }));
      reader.readAsDataURL(file);
    }
  };

  const handleAddItem = () => {
    if (!newItem.photoDataUri || !newItem.description || !newItem.type || !newItem.color) {
      toast({ title: "Incomplete Item", description: "Please fill all fields and upload a photo.", variant: "destructive" });
      return;
    }
    setClothingItems(prev => [...prev, { ...newItem, id: Date.now() }]);
    setNewItem(initialNewItemState);
    const fileInput = document.getElementById('item-upload') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  };
  
  const handleRemoveItem = (id: number) => {
    setClothingItems(prev => prev.filter(item => item.id !== id));
  };

  const handleGenerateOutfits = () => {
    if (clothingItems.length < 2) {
      toast({ title: "Not enough items", description: "Please add at least two items to your wardrobe.", variant: "destructive" });
      return;
    }
    setError(null);
    setResult(null);

    startTransition(async () => {
      try {
        const res = await pairWardrobeOutfits({ 
          clothingItems: clothingItems.map(({id, ...rest}) => rest) // AI flow doesn't need ID
        });
        setResult(res);
      } catch (e) {
        setError('Failed to generate outfits. Please try again.');
        console.error(e);
      }
    });
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-8">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="font-headline text-3xl">Add to Your Wardrobe</CardTitle>
          <CardDescription>Upload photos of your clothes and add some details.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            <div className="space-y-4">
                 <div className="relative flex justify-center items-center w-full h-48 border-2 border-dashed rounded-lg">
                    {newItem.photoDataUri ? (
                        <Image src={newItem.photoDataUri} alt="New item" fill className="object-contain rounded-lg p-2" />
                    ) : (
                        <div className="text-center">
                            <Upload className="mx-auto h-10 w-10 text-muted-foreground" />
                            <Label htmlFor="item-upload" className="mt-2 block text-sm font-medium text-primary hover:underline cursor-pointer">
                                Upload a photo
                            </Label>
                            <input id="item-upload" type="file" className="sr-only" onChange={handleFileChange} accept="image/png, image/jpeg, image/webp" />
                        </div>
                    )}
                 </div>
            </div>
            <div className="space-y-4">
                 <div>
                    <Label htmlFor="type">Clothing Type (e.g., shirt, pants)</Label>
                    <Input id="type" value={newItem.type} onChange={e => setNewItem(p => ({...p, type: e.target.value}))} placeholder="e.g. Casual T-shirt" />
                </div>
                <div>
                    <Label htmlFor="description">Description</Label>
                    <Input id="description" value={newItem.description} onChange={e => setNewItem(p => ({...p, description: e.target.value}))} placeholder="e.g. White cotton tee" />
                </div>
                <div>
                    <Label htmlFor="color">Color</Label>
                    <Input id="color" value={newItem.color} onChange={e => setNewItem(p => ({...p, color: e.target.value}))} placeholder="e.g. White" />
                </div>
                <Button onClick={handleAddItem} className="w-full">
                    <Plus className="mr-2 h-4 w-4" /> Add to Wardrobe
                </Button>
            </div>
        </CardContent>
      </Card>

      <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="font-headline text-3xl">Your Digital Wardrobe</CardTitle>
            <CardDescription>You have {clothingItems.length} item(s). Add at least two to generate outfits.</CardDescription>
          </CardHeader>
          <CardContent>
              {clothingItems.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {clothingItems.map(item => (
                        <Card key={item.id} className="group relative overflow-hidden">
                            <Image src={item.photoDataUri} alt={item.description} width={150} height={150} className="w-full aspect-square object-cover" />
                            <div className="absolute inset-0 bg-black/60 flex flex-col justify-end p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <p className="text-white text-xs font-bold truncate">{item.type}</p>
                                <p className="text-white text-xs truncate">{item.color}</p>
                            </div>
                            <Button variant="destructive" size="icon" className="absolute top-1 right-1 h-6 w-6 z-10 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => handleRemoveItem(item.id)}>
                                <X className="h-3 w-3" />
                            </Button>
                        </Card>
                    ))}
                </div>
              ) : (
                <div className="text-center py-10 border-2 border-dashed rounded-lg">
                    <Shirt className="mx-auto h-12 w-12 text-muted-foreground" />
                    <p className="mt-4 text-muted-foreground">Your wardrobe is empty.</p>
                    <p className="text-sm text-muted-foreground">Add some clothes to get started!</p>
                </div>
              )}
          </CardContent>
          <CardFooter>
            <Button onClick={handleGenerateOutfits} disabled={isPending || clothingItems.length < 2} className="w-full">
              {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
              {isPending ? 'Generating Outfits...' : 'Generate Outfits'}
            </Button>
          </CardFooter>
      </Card>
      
      {error && <Alert variant="destructive"><AlertTitle>Error</AlertTitle><AlertDescription>{error}</AlertDescription></Alert>}

      {result && (
        <Card className="shadow-lg">
            <CardHeader>
                <CardTitle className="font-headline text-3xl">AI Outfit Suggestions</CardTitle>
                <CardDescription>Here are some outfit ideas from your wardrobe.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {result.suggestedOutfits.map((outfit, index) => (
                    <Card key={index} className="bg-muted/50">
                        <CardHeader>
                            <CardTitle className="text-xl font-headline">{`Outfit Suggestion ${index + 1}`}</CardTitle>
                            <CardDescription>{outfit.description}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ul className="list-disc list-inside space-y-1">
                                {outfit.items.map((item, itemIndex) => (
                                    <li key={itemIndex}><strong>{item.type}:</strong> {item.description}</li>
                                ))}
                            </ul>
                        </CardContent>
                    </Card>
                ))}
            </CardContent>
        </Card>
      )}
    </div>
  );
}
