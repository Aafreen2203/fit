import { Wand2 } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export function Header() {
  return (
    <header className="border-b border-[#D4C4B0]/30 bg-[#F5F1EB]/90 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto flex h-20 items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-3">
          <Wand2 className="h-8 w-8 text-[#8B6F47]" />
          <span className="text-2xl font-bold font-serif text-[#8B6F47]">Style AI</span>
        </Link>
        <nav className="flex items-center gap-2">
          <Link href="/">
            <Button variant="ghost" className="text-[#8B6F47] hover:text-[#6B5537] hover:bg-[#8B6F47]/10 font-light">
              Back to Home
            </Button>
          </Link>
        </nav>
      </div>
    </header>
  )
}
