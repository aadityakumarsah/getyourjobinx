"use client";

import React, { useState, useEffect, useCallback } from "react";
import { 
  Search, 
  Briefcase, 
  MapPin, 
  Clock, 
  ExternalLink, 
  ChevronDown, 
  Filter,
  Sparkles,
  ArrowRight,
  Loader2,
  TrendingUp,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

// Define categories and their subcategories
const CATEGORIES: Record<string, string[]> = {
  "Tech": ["Frontend", "Backend", "Fullstack", "Cybersecurity", "DevOps", "Mobile", "AI/ML", "Data Science"],
  "Marketing": ["SEO", "Social Media", "Content Writer", "Growth", "Email Marketing", "PPC"],
  "Accounting": ["Audit", "Taxation", "Bookkeeping", "Financial Analysis"],
  "Design": ["UI/UX", "Graphic Design", "Motion Graphics", "Product Design"],
  "Sales": ["BDR/SDR", "Account Executive", "Sales Manager"]
};

interface Job {
  id: string;
  text: string;
  author: string;
  authorHandle: string;
  authorAvatar: string;
  createdAt: string;
  url: string;
}

export default function JobSearchApp() {
  const [selectedField, setSelectedField] = useState<string>("Tech");
  const [selectedSubField, setSelectedSubField] = useState<string>("Frontend");
  const [searchQuery, setSearchQuery] = useState("");
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [nextToken, setNextToken] = useState<string | null>(null);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const fetchJobs = useCallback(async (isLoadMore = false) => {
    if (isLoadMore) setIsLoadingMore(true);
    else {
      setIsLoading(true);
      setJobs([]);
      setNextToken(null);
    }

    try {
      const params = new URLSearchParams({
        field: selectedField,
        subfield: selectedSubField,
        query: searchQuery,
      });
      
      if (isLoadMore && nextToken) {
        params.append("nextToken", nextToken);
      }

      const response = await fetch(`/api/jobs?${params.toString()}`);
      if (!response.ok) throw new Error("Failed to fetch");
      
      const result = await response.json();
      
      if (result.isMock) setIsDemoMode(true);
      else setIsDemoMode(false);

      if (isLoadMore) {
        setJobs(prev => [...prev, ...result.data]);
      } else {
        setJobs(result.data);
      }
      
      setNextToken(result.meta?.next_token || null);
      setHasMore(!!result.meta?.next_token || (result.isMock && page < 3));
      setPage(prev => prev + 1);

    } catch (error) {
      toast.error("Failed to fetch jobs from X.com. Please try again later.");
      console.error(error);
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  }, [selectedField, selectedSubField, searchQuery, nextToken, page]);

  useEffect(() => {
    // Initial fetch
    fetchJobs();
  }, []);

  const handleSearch = () => {
    setPage(1);
    setHasMore(true);
    fetchJobs(false);
  };

  return (
    <div className="min-h-screen bg-[#070708] text-zinc-100 selection:bg-blue-500/30">
      {/* Background decoration */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/10 blur-[120px] rounded-full" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-6 py-12 lg:py-20">
        {/* Header Section */}
        <header className="flex flex-col items-center text-center mb-16 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-medium animate-in fade-in slide-in-from-bottom-3 duration-1000">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Discover your next career move on X</span>
          </div>
          
          <h1 className="text-5xl lg:text-7xl font-bold tracking-tight bg-gradient-to-b from-white to-zinc-500 bg-clip-text text-transparent animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-200">
            Find Jobs Instantly.
          </h1>
          
          <p className="max-w-2xl text-lg text-zinc-400 animate-in fade-in slide-in-from-bottom-5 duration-1000 delay-300">
            The most real-time job board on the internet. We scan X.com for hiring opportunities posted minutes ago, so you can be the first to apply.
          </p>
        </header>

        {/* Search & Filter Section */}
        <div className="mb-12 sticky top-6 z-50">
          <div className="p-2 rounded-2xl bg-zinc-900/50 backdrop-blur-xl border border-zinc-800 shadow-2xl scale-in duration-500">
            <div className="flex flex-col md:flex-row gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <Input 
                  placeholder="Search specifically (e.g. 'React', 'Remote')..." 
                  className="pl-11 h-12 bg-transparent border-none focus-visible:ring-0 focus-visible:ring-offset-0 text-base"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3">
                <Select value={selectedField} onValueChange={(val) => {
                  setSelectedField(val);
                  setSelectedSubField(CATEGORIES[val][0]);
                }}>
                  <SelectTrigger className="w-full sm:w-[160px] h-12 bg-zinc-800/50 border-zinc-700/50 text-zinc-300">
                    <SelectValue placeholder="Industry" />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-900 border-zinc-800">
                    {Object.keys(CATEGORIES).map(cat => (
                      <SelectItem key={cat} value={cat} className="text-zinc-300 focus:bg-zinc-800 focus:text-white cursor-pointer">
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={selectedSubField} onValueChange={setSelectedSubField}>
                  <SelectTrigger className="w-full sm:w-[160px] h-12 bg-zinc-800/50 border-zinc-700/50 text-zinc-300">
                    <SelectValue placeholder="Role" />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-900 border-zinc-800">
                    {CATEGORIES[selectedField].map(sub => (
                      <SelectItem key={sub} value={sub} className="text-zinc-300 focus:bg-zinc-800 focus:text-white cursor-pointer">
                        {sub}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Button 
                  onClick={handleSearch}
                  className="h-12 px-8 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl transition-all shadow-lg shadow-blue-600/20 active:scale-95"
                  disabled={isLoading}
                >
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Search X"}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Demo Mode Alert */}
        {isDemoMode && (
          <div className="mb-8 p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 flex flex-col sm:flex-row items-center justify-between gap-4 animate-in fade-in zoom-in duration-500">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/20 text-blue-400">
                <Sparkles className="w-5 h-5" />
              </div>
              <div className="text-left">
                <h3 className="text-sm font-semibold text-blue-400">Running in Demo Mode</h3>
                <p className="text-xs text-blue-500/80">Configure TWITTER_BEARER_TOKEN in your .env to fetch real-time data from X.com</p>
              </div>
            </div>
            <Button size="sm" variant="outline" className="h-8 border-blue-500/30 text-blue-400 hover:bg-blue-500/10" asChild>
               <a href="https://developer.x.com/en/docs/twitter-api/getting-started/about-twitter-api" target="_blank">Get API Key</a>
            </Button>
          </div>
        )}

        {/* Results Info */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-green-400" />
            <span className="text-sm font-medium text-zinc-400">
              {isLoading ? "Searching live posts..." : `Found recent opportunities for ${selectedSubField}`}
            </span>
          </div>
          
          <div className="flex items-center gap-4">
             <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-xs text-zinc-500">
               <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
               Live
             </div>
          </div>
        </div>

        {/* Job Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
          {isLoading 
            ? Array.from({ length: 4 }).map((_, i) => (
                <Card key={i} className="bg-zinc-900/40 border-zinc-800/50 overflow-hidden">
                  <CardHeader className="flex flex-row items-center gap-4 space-y-0">
                    <Skeleton className="w-12 h-12 rounded-full bg-zinc-800" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-24 bg-zinc-800" />
                      <Skeleton className="h-3 w-16 bg-zinc-800" />
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Skeleton className="h-4 w-full bg-zinc-800" />
                    <Skeleton className="h-4 w-[80%] bg-zinc-800" />
                    <Skeleton className="h-4 w-[60%] bg-zinc-800" />
                  </CardContent>
                </Card>
              ))
            : jobs.map((job, idx) => (
              <Card 
                key={job.id} 
                className="group bg-zinc-900/40 hover:bg-zinc-900/60 border-zinc-800/50 hover:border-blue-500/30 transition-all duration-300 animate-in fade-in slide-in-from-bottom-4"
                style={{ animationDelay: `${idx * 50}ms` }}
              >
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <img 
                        src={job.authorAvatar} 
                        alt={job.author} 
                        className="w-10 h-10 rounded-full border border-zinc-800"
                      />
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-black border border-zinc-800 rounded-full flex items-center justify-center">
                         <X className="w-2.5 h-2.5 text-zinc-400" />
                      </div>
                    </div>
                    <div>
                      <CardTitle className="text-base font-semibold text-zinc-200 line-clamp-1">{job.author}</CardTitle>
                      <p className="text-xs text-zinc-500">{job.authorHandle}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-zinc-500 bg-zinc-800/50 px-2 py-1 rounded-md">
                    <Clock className="w-3 h-3" />
                    {job.createdAt}
                  </div>
                </CardHeader>
                <CardContent className="pb-6">
                  <p className="text-sm leading-relaxed text-zinc-300 whitespace-pre-wrap">
                    {job.text}
                  </p>
                </CardContent>
                <CardFooter className="pt-0 flex justify-between items-center group/footer">
                  <div className="flex gap-2">
                    <Badge variant="outline" className="bg-zinc-800/10 border-zinc-800 text-zinc-400 capitalize">
                      {selectedSubField}
                    </Badge>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-zinc-400 hover:text-white hover:bg-blue-600/20 gap-2 transition-all"
                    asChild
                  >
                    <a href={job.url} target="_blank" rel="noopener noreferrer">
                      View Post
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </Button>
                </CardFooter>
              </Card>
            ))
          }
        </div>

        {/* Load More */}
        {hasMore && jobs.length > 0 && !isLoading && (
          <div className="mt-16 flex justify-center">
            <Button 
              variant="outline" 
              className="px-10 h-12 bg-transparent border-zinc-800 hover:bg-zinc-900 text-zinc-400 hover:text-white rounded-xl transition-all"
              onClick={() => fetchJobs(true)}
              disabled={isLoadingMore}
            >
              {isLoadingMore ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Fetching more...
                </>
              ) : (
                "Load More Opportunities"
              )}
            </Button>
          </div>
        )}

        {!hasMore && (
          <div className="mt-16 text-center text-zinc-500">
            <p>You've caught up with the latest posts. Check back in a few minutes!</p>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="border-t border-zinc-900 bg-[#070708] py-12">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-lg tracking-tight">GetJob</span>
          </div>
          <div className="text-zinc-500 text-sm">
            © 2024 GetJob. Scan the world for opportunities.
          </div>
        </div>
      </footer>
    </div>
  );
}
