"use client"

import type React from "react"

import { useState, useTransition } from "react"
import Image from "next/image"
import { Loader2, Upload, Plus, X, Shirt, Sparkles } from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { pairWardrobeOutfits } from "@/ai/flows/pair-wardrobe-outfits"
import type { PairWardrobeOutfitsOutput } from "@/ai/flows/pair-wardrobe-outfits"
import { useToast } from "@/hooks/use-toast"

interface ClothingItem {
  id: number
  photoDataUri: string
  description: string
  type: string
  color: string
}

const initialNewItemState = {
  photoDataUri: "",
  description: "",
  type: "",
  color: "",
}

export function WardrobePairer() {
  const [isPending, startTransition] = useTransition()
  const [clothingItems, setClothingItems] = useState<ClothingItem[]>([])
  const [newItem, setNewItem] = useState(initialNewItemState)
  const [result, setResult] = useState<PairWardrobeOutfitsOutput | null>(null)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 4 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Image must be smaller than 4MB.",
          variant: "destructive",
        })
        return
      }
      const reader = new FileReader()
      reader.onloadend = () => setNewItem((prev) => ({ ...prev, photoDataUri: reader.result as string }))
      reader.readAsDataURL(file)
    }
  }

  const handleAddItem = () => {
    if (!newItem.photoDataUri || !newItem.description || !newItem.type || !newItem.color) {
      toast({
        title: "Incomplete Item",
        description: "Please fill all fields and upload a photo.",
        variant: "destructive",
      })
      return
    }
    setClothingItems((prev) => [...prev, { ...newItem, id: Date.now() }])
    setNewItem(initialNewItemState)
    const fileInput = document.getElementById("item-upload") as HTMLInputElement
    if (fileInput) fileInput.value = ""
  }

  const handleRemoveItem = (id: number) => {
    setClothingItems((prev) => prev.filter((item) => item.id !== id))
  }

  const handleGenerateOutfits = () => {
    if (clothingItems.length < 2) {
      toast({
        title: "Not enough items",
        description: "Please add at least two items to your wardrobe.",
        variant: "destructive",
      })
      return
    }
    setError(null)
    setResult(null)
    startTransition(async () => {
      try {
        const res = await pairWardrobeOutfits({
          clothingItems: clothingItems.map(({ id, ...rest }) => rest), // AI flow doesn't need ID
        })
        setResult(res)
      } catch (e) {
        setError("Failed to generate outfits. Please try again.")
        console.error(e)
      }
    })
  }

  return (
    <div className="w-full max-w-6xl mx-auto space-y-8">
      <Card className="shadow-2xl bg-white border-none">
        <CardHeader className="text-center pb-8">
          <CardTitle className="font-serif text-3xl md:text-4xl text-[#8B6F47] mb-4">Add to Your Wardrobe</CardTitle>
          <CardDescription className="text-lg text-[#6B5537] font-light leading-relaxed">
            Upload photos of your clothes and add some details to build your digital wardrobe.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start px-8">
          <div className="space-y-4">
            <div className="relative flex justify-center items-center w-full h-64 border-2 border-dashed border-[#D4C4B0] rounded-lg bg-[#F5F1EB]/30">
              {newItem.photoDataUri ? (
                <Image
                  src={newItem.photoDataUri || "/placeholder.svg"}
                  alt="New item"
                  fill
                  className="object-contain rounded-lg p-4"
                />
              ) : (
                <div className="text-center">
                  <Upload className="mx-auto h-12 w-12 text-[#8B6F47]/60 mb-4" />
                  <Label
                    htmlFor="item-upload"
                    className="block text-lg font-medium text-[#8B6F47] hover:text-[#6B5537] cursor-pointer transition-colors"
                  >
                    Upload a photo
                  </Label>
                  <input
                    id="item-upload"
                    type="file"
                    className="sr-only"
                    onChange={handleFileChange}
                    accept="image/png, image/jpeg, image/webp"
                  />
                </div>
              )}
            </div>
          </div>
          <div className="space-y-6">
            <div>
              <Label htmlFor="type" className="text-[#8B6F47] font-medium">
                Clothing Type
              </Label>
              <Input
                id="type"
                value={newItem.type}
                onChange={(e) => setNewItem((p) => ({ ...p, type: e.target.value }))}
                placeholder="e.g. Casual T-shirt"
                className="mt-2 border-[#D4C4B0] focus:border-[#8B6F47] focus:ring-[#8B6F47]/20"
              />
            </div>
            <div>
              <Label htmlFor="description" className="text-[#8B6F47] font-medium">
                Description
              </Label>
              <Input
                id="description"
                value={newItem.description}
                onChange={(e) => setNewItem((p) => ({ ...p, description: e.target.value }))}
                placeholder="e.g. White cotton tee"
                className="mt-2 border-[#D4C4B0] focus:border-[#8B6F47] focus:ring-[#8B6F47]/20"
              />
            </div>
            <div>
              <Label htmlFor="color" className="text-[#8B6F47] font-medium">
                Color
              </Label>
              <Input
                id="color"
                value={newItem.color}
                onChange={(e) => setNewItem((p) => ({ ...p, color: e.target.value }))}
                placeholder="e.g. White"
                className="mt-2 border-[#D4C4B0] focus:border-[#8B6F47] focus:ring-[#8B6F47]/20"
              />
            </div>
            <Button
              onClick={handleAddItem}
              className="w-full bg-[#8B6F47] hover:bg-[#6B5537] text-white py-3 font-light"
            >
              <Plus className="mr-2 h-5 w-5" /> Add to Wardrobe
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-2xl bg-white border-none">
        <CardHeader className="text-center">
          <CardTitle className="font-serif text-3xl md:text-4xl text-[#8B6F47] mb-4">Your Digital Wardrobe</CardTitle>
          <CardDescription className="text-lg text-[#6B5537] font-light">
            You have {clothingItems.length} item(s). Add at least two to generate outfits.
          </CardDescription>
        </CardHeader>
        <CardContent className="px-8">
          {clothingItems.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
              {clothingItems.map((item) => (
                <Card key={item.id} className="group relative overflow-hidden border-[#D4C4B0]/30">
                  <Image
                    src={item.photoDataUri || "/placeholder.svg"}
                    alt={item.description}
                    width={150}
                    height={150}
                    className="w-full aspect-square object-cover"
                  />
                  <div className="absolute inset-0 bg-black/60 flex flex-col justify-end p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <p className="text-white text-sm font-medium truncate">{item.type}</p>
                    <p className="text-white text-xs truncate">{item.color}</p>
                  </div>
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2 h-8 w-8 z-10 opacity-0 group-hover:opacity-100 transition-opacity bg-red-500 hover:bg-red-600"
                    onClick={() => handleRemoveItem(item.id)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 border-2 border-dashed border-[#D4C4B0] rounded-lg bg-[#F5F1EB]/30">
              <Shirt className="mx-auto h-16 w-16 text-[#8B6F47]/60 mb-4" />
              <p className="text-xl font-serif text-[#8B6F47] mb-2">Your wardrobe is empty.</p>
              <p className="text-[#6B5537] font-light">Add some clothes to get started!</p>
            </div>
          )}
        </CardContent>
        <CardFooter className="px-8 pb-8">
          <Button
            onClick={handleGenerateOutfits}
            disabled={isPending || clothingItems.length < 2}
            className="w-full bg-[#8B6F47] hover:bg-[#6B5537] text-white py-3 text-lg font-light"
          >
            {isPending ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Sparkles className="mr-2 h-5 w-5" />}
            {isPending ? "Generating Outfits..." : "Generate Outfits"}
          </Button>
        </CardFooter>
      </Card>

      {error && (
        <Alert variant="destructive" className="border-red-200 bg-red-50">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {result && (
        <Card className="shadow-2xl bg-white border-none">
          <CardHeader className="text-center">
            <CardTitle className="font-serif text-3xl md:text-4xl text-[#8B6F47] mb-4">AI Outfit Suggestions</CardTitle>
            <CardDescription className="text-lg text-[#6B5537] font-light">
              Here are some outfit ideas curated from your wardrobe.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 px-8">
            {result.suggestedOutfits.map((outfit, index) => (
              <Card key={index} className="bg-[#F5F1EB]/50 border-[#D4C4B0]/30">
                <CardHeader>
                  <CardTitle className="text-xl font-serif text-[#8B6F47]">{`Outfit Suggestion ${
                    index + 1
                  }`}</CardTitle>
                  <CardDescription className="text-[#6B5537] font-light">{outfit.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {outfit.items.map((item, itemIndex) => (
                      <li key={itemIndex} className="flex items-center gap-3 text-[#6B5537]">
                        <div className="w-2 h-2 bg-[#8B6F47] rounded-full"></div>
                        <strong className="text-[#8B6F47]">{item.type}:</strong> {item.description}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
