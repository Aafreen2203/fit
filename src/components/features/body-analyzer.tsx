"use client"

import type React from "react"

import { useState, useTransition } from "react"
import Image from "next/image"
import { Loader2, Upload, X, User, Palette } from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { analyzeBodyType } from "@/ai/flows/analyze-body-type"
import type { AnalyzeBodyTypeOutput } from "@/ai/flows/analyze-body-type"
import { useToast } from "@/hooks/use-toast"

export function BodyAnalyzer() {
  const [isPending, startTransition] = useTransition()
  const [photoDataUri, setPhotoDataUri] = useState<string | null>(null)
  const [result, setResult] = useState<AnalyzeBodyTypeOutput | null>(null)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 4 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please upload an image smaller than 4MB.",
          variant: "destructive",
        })
        return
      }
      const reader = new FileReader()
      reader.onloadend = () => {
        setPhotoDataUri(reader.result as string)
        setResult(null)
        setError(null)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleAnalyze = () => {
    if (!photoDataUri) return
    setError(null)
    setResult(null)
    startTransition(async () => {
      try {
        const res = await analyzeBodyType({ photoDataUri })
        setResult(res)
      } catch (e) {
        setError("Failed to analyze the image. Please try another one.")
        console.error(e)
      }
    })
  }

  const handleRemoveImage = () => {
    setPhotoDataUri(null)
    setResult(null)
    setError(null)
  }

  return (
    <Card className="w-full max-w-3xl mx-auto shadow-2xl bg-white border-none">
      <CardHeader className="text-center pb-8">
        <CardTitle className="font-serif text-3xl md:text-4xl text-[#8B6F47] mb-4">Body & Undertone Analysis</CardTitle>
        <CardDescription className="text-lg text-[#6B5537] font-light leading-relaxed">
          Upload a full-body photo to discover your body type and skin undertone with AI precision.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-8 px-8">
        <div className="space-y-4">
          <div className="relative flex justify-center items-center w-full h-80 border-2 border-dashed border-[#D4C4B0] rounded-lg bg-[#F5F1EB]/30">
            {photoDataUri ? (
              <>
                <Image
                  src={photoDataUri || "/placeholder.svg"}
                  alt="Uploaded photo"
                  fill
                  className="object-contain rounded-lg p-4"
                />
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute top-4 right-4 z-10 bg-red-500 hover:bg-red-600"
                  onClick={handleRemoveImage}
                >
                  <X className="h-4 w-4" />
                </Button>
              </>
            ) : (
              <div className="text-center">
                <Upload className="mx-auto h-16 w-16 text-[#8B6F47]/60 mb-4" />
                <label
                  htmlFor="photo-upload"
                  className="block text-lg font-medium text-[#8B6F47] hover:text-[#6B5537] cursor-pointer transition-colors"
                >
                  Click to upload a photo
                </label>
                <input
                  id="photo-upload"
                  type="file"
                  className="sr-only"
                  onChange={handleFileChange}
                  accept="image/png, image/jpeg, image/webp"
                />
                <p className="text-sm text-[#6B5537]/70 mt-2">PNG, JPG, WEBP up to 4MB</p>
              </div>
            )}
          </div>
        </div>

        {error && (
          <Alert variant="destructive" className="border-red-200 bg-red-50">
            <AlertTitle>Analysis Failed</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {isPending && (
          <div className="flex items-center justify-center space-x-3 text-[#8B6F47] py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
            <p className="text-lg font-light">Analyzing your photo...</p>
          </div>
        )}

        {result && (
          <Card className="bg-[#F5F1EB]/50 border-[#D4C4B0]/30">
            <CardHeader>
              <CardTitle className="font-serif text-2xl text-[#8B6F47]">Analysis Results</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-center gap-4 p-6 rounded-lg bg-white shadow-sm">
                <User className="h-10 w-10 text-[#8B6F47]" />
                <div>
                  <p className="text-sm text-[#6B5537]/70 font-light">Body Type</p>
                  <p className="text-xl font-serif font-semibold text-[#8B6F47]">{result.bodyType}</p>
                </div>
              </div>
              <div className="flex items-center gap-4 p-6 rounded-lg bg-white shadow-sm">
                <Palette className="h-10 w-10 text-[#8B6F47]" />
                <div>
                  <p className="text-sm text-[#6B5537]/70 font-light">Skin Undertone</p>
                  <p className="text-xl font-serif font-semibold text-[#8B6F47]">{result.undertone}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </CardContent>
      <CardFooter className="px-8 pb-8">
        <Button
          onClick={handleAnalyze}
          disabled={!photoDataUri || isPending}
          className="w-full bg-[#8B6F47] hover:bg-[#6B5537] text-white py-3 text-lg font-light"
        >
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Analyzing...
            </>
          ) : (
            "Analyze My Body Type"
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}
