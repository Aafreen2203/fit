"use client"

import type React from "react"

import { useState, useTransition, useEffect, useRef } from "react"
import Image from "next/image"
import { Loader2, Upload, X, Tag, Heart, ShoppingBag, Search, Plus } from "lucide-react"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { identifyTrendingClothes } from "@/ai/flows/identify-trending-clothes"
import type { IdentifyTrendingClothesOutput } from "@/ai/flows/identify-trending-clothes"
import { useToast } from "@/hooks/use-toast"

gsap.registerPlugin(ScrollTrigger)

interface TrendingItem {
  id: string
  name: string
  brand: string
  price: number
  originalPrice?: number
  platform: "myntra" | "nykaa" | "ajio" | "flipkart" | "amazon"
  image: string
  category: "tops" | "bottoms" | "dresses" | "accessories" | "footwear"
  tags: string[]
  rating: number
  link: string
}

// Mock trending data - in real app, this would come from APIs
const mockTrendingItems: TrendingItem[] = [
  {
    id: "1",
    name: "Oversized Blazer",
    brand: "Zara",
    price: 2999,
    originalPrice: 3999,
    platform: "myntra",
    image: "/placeholder.svg?height=400&width=300",
    category: "tops",
    tags: ["blazer", "oversized", "formal", "trending"],
    rating: 4.5,
    link: "#",
  },
  {
    id: "2",
    name: "High-Waisted Mom Jeans",
    brand: "H&M",
    price: 1999,
    platform: "nykaa",
    image: "/placeholder.svg?height=400&width=300",
    category: "bottoms",
    tags: ["jeans", "high-waisted", "mom-jeans", "casual"],
    rating: 4.3,
    link: "#",
  },
  {
    id: "3",
    name: "Silk Slip Dress",
    brand: "Mango",
    price: 3499,
    originalPrice: 4999,
    platform: "ajio",
    image: "/placeholder.svg?height=400&width=300",
    category: "dresses",
    tags: ["silk", "slip-dress", "elegant", "party"],
    rating: 4.7,
    link: "#",
  },
  {
    id: "4",
    name: "Chunky Gold Chain",
    brand: "Accessorize",
    price: 899,
    platform: "flipkart",
    image: "/placeholder.svg?height=400&width=300",
    category: "accessories",
    tags: ["jewelry", "chain", "gold", "statement"],
    rating: 4.2,
    link: "#",
  },
  {
    id: "5",
    name: "Platform Sneakers",
    brand: "Nike",
    price: 7999,
    platform: "amazon",
    image: "/placeholder.svg?height=400&width=300",
    category: "footwear",
    tags: ["sneakers", "platform", "sporty", "trendy"],
    rating: 4.6,
    link: "#",
  },
  {
    id: "6",
    name: "Cropped Cardigan",
    brand: "Urban Outfitters",
    price: 2499,
    platform: "myntra",
    image: "/placeholder.svg?height=400&width=300",
    category: "tops",
    tags: ["cardigan", "cropped", "cozy", "layering"],
    rating: 4.4,
    link: "#",
  },
  {
    id: "7",
    name: "Wide Leg Trousers",
    brand: "COS",
    price: 3999,
    platform: "nykaa",
    image: "/placeholder.svg?height=400&width=300",
    category: "bottoms",
    tags: ["trousers", "wide-leg", "formal", "chic"],
    rating: 4.5,
    link: "#",
  },
  {
    id: "8",
    name: "Midi Wrap Dress",
    brand: "& Other Stories",
    price: 2799,
    originalPrice: 3499,
    platform: "ajio",
    image: "/placeholder.svg?height=400&width=300",
    category: "dresses",
    tags: ["wrap-dress", "midi", "floral", "feminine"],
    rating: 4.3,
    link: "#",
  },
]

const platformColors = {
  myntra: "#FF3F6C",
  nykaa: "#FC2779",
  ajio: "#1B4D3E",
  flipkart: "#047BD6",
  amazon: "#FF9900",
}

const platformNames = {
  myntra: "Myntra",
  nykaa: "Nykaa Fashion",
  ajio: "AJIO",
  flipkart: "Flipkart",
  amazon: "Amazon Fashion",
}

export function TrendIdentifier() {
  const [isPending, startTransition] = useTransition()
  const [outfitDataUri, setOutfitDataUri] = useState<string | null>(null)
  const [result, setResult] = useState<IdentifyTrendingClothesOutput | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [selectedPlatform, setSelectedPlatform] = useState<string>("all")
  const [favorites, setFavorites] = useState<Set<string>>(new Set())
  const [activeTab, setActiveTab] = useState("upload")
  const { toast } = useToast()
  const galleryRef = useRef(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Animate trending items on scroll
      gsap.fromTo(
        ".trending-item",
        { y: 50, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.6,
          ease: "power3.out",
          stagger: 0.1,
          scrollTrigger: {
            trigger: ".trending-grid",
            start: "top 80%",
            toggleActions: "play none none reverse",
          },
        },
      )
    }, galleryRef)

    return () => ctx.revert()
  }, [activeTab])

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
        setOutfitDataUri(reader.result as string)
        setResult(null)
        setError(null)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleIdentifyTrends = () => {
    if (!outfitDataUri) return
    setError(null)
    setResult(null)
    startTransition(async () => {
      try {
        const res = await identifyTrendingClothes({ photoDataUri: outfitDataUri })
        setResult(res)
      } catch (e) {
        setError("Failed to identify trends from the image. Please try another one.")
        console.error(e)
      }
    })
  }

  const handleRemoveImage = () => {
    setOutfitDataUri(null)
    setResult(null)
    setError(null)
  }

  const toggleFavorite = (itemId: string) => {
    const newFavorites = new Set(favorites)
    if (newFavorites.has(itemId)) {
      newFavorites.delete(itemId)
    } else {
      newFavorites.add(itemId)
    }
    setFavorites(newFavorites)
  }

  const addToWardrobe = (item: TrendingItem) => {
    toast({
      title: "Added to Wardrobe!",
      description: `${item.name} has been added to your digital wardrobe.`,
    })
  }

  const filteredItems = mockTrendingItems.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    const matchesCategory = selectedCategory === "all" || item.category === selectedCategory
    const matchesPlatform = selectedPlatform === "all" || item.platform === selectedPlatform
    return matchesSearch && matchesCategory && matchesPlatform
  })

  return (
    <div className="w-full max-w-7xl mx-auto" ref={galleryRef}>
      <Card className="shadow-2xl bg-white border-none mb-8">
        <CardHeader className="text-center pb-8">
          <CardTitle className="font-serif text-3xl md:text-4xl text-[#8B6F47] mb-4">Trend Finder</CardTitle>
          <CardDescription className="text-lg text-[#6B5537] font-light leading-relaxed">
            Discover what's trending or upload a photo to identify trends in your outfit.
          </CardDescription>
        </CardHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mx-8 mb-8 bg-[#F5F1EB] border border-[#D4C4B0]/30">
            <TabsTrigger
              value="upload"
              className="data-[state=active]:bg-[#8B6F47] data-[state=active]:text-white text-[#8B6F47] font-light"
            >
              Upload & Analyze
            </TabsTrigger>
            <TabsTrigger
              value="browse"
              className="data-[state=active]:bg-[#8B6F47] data-[state=active]:text-white text-[#8B6F47] font-light"
            >
              Browse Trending
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upload" className="px-8 pb-8">
            <div className="space-y-8">
              <div className="relative flex justify-center items-center w-full h-80 border-2 border-dashed border-[#D4C4B0] rounded-lg bg-[#F5F1EB]/30">
                {outfitDataUri ? (
                  <>
                    <Image
                      src={outfitDataUri || "/placeholder.svg"}
                      alt="Uploaded outfit"
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
                      htmlFor="outfit-upload"
                      className="block text-lg font-medium text-[#8B6F47] hover:text-[#6B5537] cursor-pointer transition-colors"
                    >
                      Click to upload an outfit
                    </label>
                    <input
                      id="outfit-upload"
                      type="file"
                      className="sr-only"
                      onChange={handleFileChange}
                      accept="image/png, image/jpeg, image/webp"
                    />
                    <p className="text-sm text-[#6B5537]/70 mt-2">PNG, JPG, WEBP up to 4MB</p>
                  </div>
                )}
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
                  <p className="text-lg font-light">Scanning for trends...</p>
                </div>
              )}

              {result && (
                <Card className="bg-[#F5F1EB]/50 border-[#D4C4B0]/30">
                  <CardHeader>
                    <CardTitle className="font-serif text-2xl text-[#8B6F47]">Trending Items Found</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {result.trendingClothes.length > 0 ? (
                      <div className="flex flex-wrap gap-3">
                        {result.trendingClothes.map((item, index) => (
                          <Badge
                            key={index}
                            variant="default"
                            className="text-base py-2 px-4 bg-[#8B6F47] text-white hover:bg-[#6B5537] transition-colors"
                          >
                            <Tag className="mr-2 h-4 w-4" />
                            {item}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <p className="text-[#6B5537] font-light text-center py-8">
                        No specific trending items were identified in this outfit.
                      </p>
                    )}
                  </CardContent>
                </Card>
              )}

              <Button
                onClick={handleIdentifyTrends}
                disabled={!outfitDataUri || isPending}
                className="w-full bg-[#8B6F47] hover:bg-[#6B5537] text-white py-3 text-lg font-light"
              >
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Identifying...
                  </>
                ) : (
                  "Identify Trends"
                )}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="browse" className="px-8 pb-8">
            <div className="space-y-8">
              {/* Filters */}
              <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-[#F5F1EB]/50 p-6 rounded-lg">
                <div className="flex flex-col md:flex-row gap-4 items-center flex-1">
                  <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#8B6F47]/60 h-4 w-4" />
                    <Input
                      placeholder="Search trends..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 border-[#D4C4B0] focus:border-[#8B6F47] focus:ring-[#8B6F47]/20"
                    />
                  </div>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="w-full md:w-40 border-[#D4C4B0] focus:border-[#8B6F47]">
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      <SelectItem value="tops">Tops</SelectItem>
                      <SelectItem value="bottoms">Bottoms</SelectItem>
                      <SelectItem value="dresses">Dresses</SelectItem>
                      <SelectItem value="accessories">Accessories</SelectItem>
                      <SelectItem value="footwear">Footwear</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={selectedPlatform} onValueChange={setSelectedPlatform}>
                    <SelectTrigger className="w-full md:w-40 border-[#D4C4B0] focus:border-[#8B6F47]">
                      <SelectValue placeholder="Platform" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Platforms</SelectItem>
                      <SelectItem value="myntra">Myntra</SelectItem>
                      <SelectItem value="nykaa">Nykaa Fashion</SelectItem>
                      <SelectItem value="ajio">AJIO</SelectItem>
                      <SelectItem value="flipkart">Flipkart</SelectItem>
                      <SelectItem value="amazon">Amazon Fashion</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="text-sm text-[#6B5537] font-light">{filteredItems.length} trending items</div>
              </div>

              {/* Trending Items Grid */}
              <div className="trending-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredItems.map((item) => (
                  <Card
                    key={item.id}
                    className="trending-item group overflow-hidden border-[#D4C4B0]/30 hover:shadow-xl transition-all duration-300"
                  >
                    <div className="relative">
                      <Image
                        src={item.image || "/placeholder.svg"}
                        alt={item.name}
                        width={300}
                        height={400}
                        className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-3 left-3">
                        <Badge
                          style={{ backgroundColor: platformColors[item.platform] }}
                          className="text-white text-xs"
                        >
                          {platformNames[item.platform]}
                        </Badge>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-3 right-3 bg-white/80 hover:bg-white"
                        onClick={() => toggleFavorite(item.id)}
                      >
                        <Heart
                          className={`h-4 w-4 ${
                            favorites.has(item.id) ? "fill-red-500 text-red-500" : "text-gray-600"
                          }`}
                        />
                      </Button>
                      {item.originalPrice && (
                        <div className="absolute top-3 right-14 bg-red-500 text-white text-xs px-2 py-1 rounded">
                          {Math.round(((item.originalPrice - item.price) / item.originalPrice) * 100)}% OFF
                        </div>
                      )}
                    </div>
                    <CardContent className="p-4">
                      <div className="space-y-2">
                        <h3 className="font-serif text-lg font-semibold text-[#8B6F47] line-clamp-1">{item.name}</h3>
                        <p className="text-sm text-[#6B5537]/70 font-light">{item.brand}</p>
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-bold text-[#8B6F47]">₹{item.price.toLocaleString()}</span>
                          {item.originalPrice && (
                            <span className="text-sm text-gray-500 line-through">
                              ₹{item.originalPrice.toLocaleString()}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1">
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              <span
                                key={i}
                                className={`text-xs ${
                                  i < Math.floor(item.rating) ? "text-yellow-400" : "text-gray-300"
                                }`}
                              >
                                ★
                              </span>
                            ))}
                          </div>
                          <span className="text-xs text-[#6B5537]/70">({item.rating})</span>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {item.tags.slice(0, 2).map((tag) => (
                            <Badge key={tag} variant="secondary" className="text-xs bg-[#F5F1EB] text-[#8B6F47]">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="p-4 pt-0 space-y-2">
                      <div className="flex gap-2 w-full">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 border-[#8B6F47] text-[#8B6F47] hover:bg-[#8B6F47] hover:text-white bg-transparent"
                          onClick={() => addToWardrobe(item)}
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Add to Wardrobe
                        </Button>
                        <Button
                          size="sm"
                          className="flex-1 bg-[#8B6F47] hover:bg-[#6B5537] text-white"
                          onClick={() => window.open(item.link, "_blank")}
                        >
                          <ShoppingBag className="h-4 w-4 mr-1" />
                          Shop Now
                        </Button>
                      </div>
                    </CardFooter>
                  </Card>
                ))}
              </div>

              {filteredItems.length === 0 && (
                <div className="text-center py-16">
                  <Tag className="mx-auto h-16 w-16 text-[#8B6F47]/60 mb-4" />
                  <p className="text-xl font-serif text-[#8B6F47] mb-2">No trending items found</p>
                  <p className="text-[#6B5537] font-light">Try adjusting your search or filters</p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  )
}
