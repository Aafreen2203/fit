"use client"

import { useState, useTransition } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Loader2, Sparkles, Wand2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { suggestClothingPairings } from "@/ai/flows/suggest-clothing-pairings"
import type { SuggestClothingPairingsOutput } from "@/ai/flows/suggest-clothing-pairings"

const formSchema = z.object({
  bodyType: z.string().min(1, "Please select your body type."),
  bodyShape: z.string().min(1, "Please select your body shape."),
  colorPalette: z.string().min(1, "Please select your color palette."),
})

const bodyTypes = ["Hourglass", "Pear", "Apple", "Rectangle", "Inverted Triangle"]
const bodyShapes = ["Triangle", "Inverted Triangle", "Rectangle", "Hourglass", "Oval", "Diamond"]
const colorPalettes = ["Spring", "Summer", "Autumn", "Winter"]

export function OutfitRecommender() {
  const [isPending, startTransition] = useTransition()
  const [result, setResult] = useState<SuggestClothingPairingsOutput | null>(null)
  const [error, setError] = useState<string | null>(null)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      bodyType: "",
      bodyShape: "",
      colorPalette: "",
    },
  })

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    setError(null)
    setResult(null)
    startTransition(async () => {
      try {
        const res = await suggestClothingPairings(values)
        setResult(res)
      } catch (e) {
        setError("Failed to get recommendations. Please try again.")
        console.error(e)
      }
    })
  }

  return (
    <Card className="w-full max-w-3xl mx-auto shadow-2xl bg-white border-none">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardHeader className="text-center pb-8">
            <CardTitle className="font-serif text-3xl md:text-4xl text-[#8B6F47] mb-4">AI Outfit Recommender</CardTitle>
            <CardDescription className="text-lg text-[#6B5537] font-light leading-relaxed">
              Tell us about yourself, and our AI will suggest the perfect outfit tailored just for you.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-8 px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <FormField
                control={form.control}
                name="bodyType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[#8B6F47] font-medium">Body Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="border-[#D4C4B0] focus:border-[#8B6F47] focus:ring-[#8B6F47]/20">
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {bodyTypes.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
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
                    <FormLabel className="text-[#8B6F47] font-medium">Body Shape</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="border-[#D4C4B0] focus:border-[#8B6F47] focus:ring-[#8B6F47]/20">
                          <SelectValue placeholder="Select shape" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {bodyShapes.map((shape) => (
                          <SelectItem key={shape} value={shape}>
                            {shape}
                          </SelectItem>
                        ))}
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
                    <FormLabel className="text-[#8B6F47] font-medium">Color Palette</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="border-[#D4C4B0] focus:border-[#8B6F47] focus:ring-[#8B6F47]/20">
                          <SelectValue placeholder="Select palette" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {colorPalettes.map((palette) => (
                          <SelectItem key={palette} value={palette}>
                            {palette}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {error && (
              <Alert variant="destructive" className="border-red-200 bg-red-50">
                <AlertTitle>Recommendation Failed</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {result && (
              <Card className="bg-[#F5F1EB]/50 border-[#D4C4B0]/30">
                <CardHeader>
                  <CardTitle className="font-serif text-2xl flex items-center gap-3 text-[#8B6F47]">
                    <Wand2 className="text-[#8B6F47]" />
                    Your AI-Curated Outfit
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h3 className="font-serif text-lg font-semibold text-[#8B6F47] mb-3">Suggested Outfit:</h3>
                    <ul className="space-y-2">
                      {result.suggestedOutfit.map((item, index) => (
                        <li key={index} className="flex items-center gap-3 text-[#6B5537]">
                          <div className="w-2 h-2 bg-[#8B6F47] rounded-full"></div>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-serif text-lg font-semibold text-[#8B6F47] mb-3">Stylist's Reasoning:</h3>
                    <p className="text-[#6B5537] font-light leading-relaxed">{result.reasoning}</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </CardContent>
          <CardFooter className="px-8 pb-8">
            <Button
              type="submit"
              disabled={isPending}
              className="w-full bg-[#8B6F47] hover:bg-[#6B5537] text-white py-3 text-lg font-light"
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-5 w-5" />
                  Get My Recommendation
                </>
              )}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  )
}
