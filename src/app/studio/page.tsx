import { Header } from '@/components/layout/header';
import { OutfitRecommender } from '@/components/features/outfit-recommender';
import { BodyAnalyzer } from '@/components/features/body-analyzer';
import { TrendIdentifier } from '@/components/features/trend-identifier';
import { WardrobePairer } from '@/components/features/wardrobe-pairer';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8 md:py-12">
        <div className="mb-12 text-center">
          <h1 className="mb-4 text-5xl font-bold font-headline text-primary md:text-7xl">
            Style AI
          </h1>
          <p className="mx-auto max-w-3xl text-lg text-muted-foreground font-body md:text-xl">
            Your personal AI-powered fashion assistant. Discover your unique
            style, get personalized recommendations, and stay on top of the
            latest trends.
          </p>
        </div>

        <Tabs defaultValue="recommender" className="w-full">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 h-auto">
            <TabsTrigger value="recommender" className="py-2">Outfit Recommender</TabsTrigger>
            <TabsTrigger value="analyzer" className="py-2">Body Analysis</TabsTrigger>
            <TabsTrigger value="trends" className="py-2">Trend Finder</TabsTrigger>
            <TabsTrigger value="wardrobe" className="py-2">Wardrobe Wizard</TabsTrigger>
          </TabsList>
          <TabsContent value="recommender" className="mt-6">
            <OutfitRecommender />
          </TabsContent>
          <TabsContent value="analyzer" className="mt-6">
            <BodyAnalyzer />
          </TabsContent>
          <TabsContent value="trends" className="mt-6">
            <TrendIdentifier />
          </TabsContent>
          <TabsContent value="wardrobe" className="mt-6">
            <WardrobePairer />
          </TabsContent>
        </Tabs>
      </main>
      <footer className="py-6 text-center text-sm text-muted-foreground">
        <p>Powered by Style AI</p>
      </footer>
    </div>
  );
}
