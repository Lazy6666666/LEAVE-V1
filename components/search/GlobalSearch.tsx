"use client";

import { useState, useEffect, useCallback } from "react";
// Optimized lucide-react imports for tree-shaking
import {
  Search,
  X,
  Filter,
  Clock,
  TrendingUp,
} from "@/lib/utils/icons";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useRouter } from "next/navigation";
import { debounce } from "lodash";

interface SearchResult {
  id: string;
  type: "leave" | "document" | "user" | "calendar";
  title: string;
  description: string;
  url: string;
  metadata?: Record<string, any>;
}

interface GlobalSearchProps {
  placeholder?: string;
  showFilters?: boolean;
}

export function GlobalSearch({
  placeholder = "Search...",
  showFilters = true,
}: GlobalSearchProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // Load recent searches from localStorage
  useEffect(() => {
    const stored = localStorage.getItem("recentSearches");
    if (stored) {
      setRecentSearches(JSON.parse(stored));
    }
  }, []);

  // Debounced search function
  const performSearch = useCallback(
    debounce(async (searchQuery: string) => {
      if (!searchQuery.trim()) {
        setResults([]);
        return;
      }

      setIsLoading(true);
      try {
        const response = await fetch(
          `/api/search?q=${encodeURIComponent(searchQuery)}`
        );
        const data = await response.json();
        setResults(data.results || []);
      } catch (error) {
        console.error("Search error:", error);
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    }, 300),
    []
  );

  useEffect(() => {
    performSearch(query);
  }, [query, performSearch]);

  const handleSelect = (result: SearchResult) => {
    // Add to recent searches
    const updated = [query, ...recentSearches.filter((s) => s !== query)].slice(
      0,
      5
    );
    setRecentSearches(updated);
    localStorage.setItem("recentSearches", JSON.stringify(updated));

    // Navigate to result
    router.push(result.url);
    setIsOpen(false);
    setQuery("");
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem("recentSearches");
  };

  const getTypeColor = (type: string) => {
    const colors = {
      leave: "bg-blue-500/10 text-blue-500",
      document: "bg-purple-500/10 text-purple-500",
      user: "bg-green-500/10 text-green-500",
      calendar: "bg-orange-500/10 text-orange-500",
    };
    return (
      colors[type as keyof typeof colors] || "bg-gray-500/10 text-gray-500"
    );
  };

  return (
    <>
      <div className="relative w-full max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder={placeholder}
          className="pl-9 pr-9"
          onClick={() => setIsOpen(true)}
          readOnly
        />
        {showFilters && (
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
            onClick={() => router.push("/search")}
          >
            <Filter className="h-4 w-4" />
          </Button>
        )}
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Search</DialogTitle>
          </DialogHeader>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search leaves, documents, users..."
              className="pl-9 pr-9"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              autoFocus
            />
            {query && (
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
                onClick={() => setQuery("")}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>

          <ScrollArea className="h-96">
            {!query && recentSearches.length > 0 && (
              <div className="space-y-2 p-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Recent Searches
                  </h4>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearRecentSearches}
                  >
                    Clear
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {recentSearches.map((search, index) => (
                    <Badge
                      key={index}
                      variant="outline"
                      className="cursor-pointer"
                      onClick={() => setQuery(search)}
                    >
                      {search}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {isLoading && (
              <div className="text-center py-8 text-muted-foreground">
                Searching...
              </div>
            )}

            {!isLoading && query && results.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No results found for "{query}"
              </div>
            )}

            {!isLoading && results.length > 0 && (
              <div className="space-y-1 p-2">
                {results.map((result) => (
                  <button
                    key={result.id}
                    className="w-full text-left p-3 rounded-lg hover:bg-accent transition-colors"
                    onClick={() => handleSelect(result)}
                  >
                    <div className="flex items-start gap-3">
                      <Badge
                        className={getTypeColor(result.type)}
                        variant="outline"
                      >
                        {result.type}
                      </Badge>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium truncate">{result.title}</h4>
                        <p className="text-sm text-muted-foreground truncate">
                          {result.description}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </ScrollArea>

          <div className="border-t pt-3">
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start"
              onClick={() => {
                router.push(`/search?q=${encodeURIComponent(query)}`);
                setIsOpen(false);
              }}
            >
              <TrendingUp className="h-4 w-4 mr-2" />
              Advanced search
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
