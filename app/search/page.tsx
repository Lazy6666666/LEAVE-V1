'use client';

import { useState, useEffect } from 'react';
import { Search, ArrowLeft, Download, ExternalLink } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { AdvancedFilters, SearchFilters } from '@/components/search/AdvancedFilters';
import { SearchPresets } from '@/components/search/SearchPresets';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

interface SearchResult {
  id: string;
  type: 'leave' | 'document' | 'user' | 'calendar';
  title: string;
  description: string;
  url: string;
  metadata?: Record<string, any>;
}

export default function SearchPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [filters, setFilters] = useState<SearchFilters>({});
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [totalResults, setTotalResults] = useState(0);

  useEffect(() => {
    const initialQuery = searchParams.get('q');
    if (initialQuery) {
      setQuery(initialQuery);
      performSearch(initialQuery, filters);
    }
  }, [searchParams]);

  const performSearch = async (searchQuery: string, searchFilters: SearchFilters) => {
    if (!searchQuery.trim() && Object.keys(searchFilters).length === 0) {
      setResults([]);
      return;
    }

    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.append('q', searchQuery);
      if (searchFilters.type?.length) params.append('type', searchFilters.type.join(','));
      if (searchFilters.status?.length) params.append('status', searchFilters.status.join(','));
      if (searchFilters.category?.length) params.append('category', searchFilters.category.join(','));
      if (searchFilters.dateFrom) params.append('dateFrom', searchFilters.dateFrom);
      if (searchFilters.dateTo) params.append('dateTo', searchFilters.dateTo);

      const response = await fetch(`/api/search?${params.toString()}`);
      const data = await response.json();
      setResults(data.results || []);
      setTotalResults(data.total || 0);
    } catch (error) {
      console.error('Search error:', error);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = () => {
    performSearch(query, filters);
    if (query) {
      router.push(`/search?q=${encodeURIComponent(query)}`);
    }
  };

  const handleFiltersChange = (newFilters: SearchFilters) => {
    setFilters(newFilters);
    performSearch(query, newFilters);
  };

  const handleClearFilters = () => {
    setFilters({});
    performSearch(query, {});
  };

  const handlePresetSelect = (presetFilters: SearchFilters) => {
    setFilters(presetFilters);
    performSearch(query, presetFilters);
  };

  const getTypeColor = (type: string) => {
    const colors = {
      leave: 'bg-blue-500/10 text-blue-500',
      document: 'bg-purple-500/10 text-purple-500',
      user: 'bg-green-500/10 text-green-500',
      calendar: 'bg-orange-500/10 text-orange-500',
    };
    return colors[type as keyof typeof colors] || 'bg-gray-500/10 text-gray-500';
  };

  const exportResults = () => {
    const csv = [
      ['Type', 'Title', 'Description', 'URL'],
      ...results.map(r => [r.type, r.title, r.description, r.url]),
    ]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `search-results-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card/50 backdrop-blur sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.back()}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex-1 flex gap-3">
              <div className="relative flex-1 max-w-2xl">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search leaves, documents, users..."
                  className="pl-9"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
              </div>
              <Button onClick={handleSearch}>Search</Button>
              <AdvancedFilters
                filters={filters}
                onFiltersChange={handleFiltersChange}
                onClear={handleClearFilters}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Search Presets */}
        {!query && results.length === 0 && (
          <SearchPresets onPresetSelect={handlePresetSelect} />
        )}

        {/* Results Header */}
        {(query || results.length > 0) && (
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Search Results</h2>
              <p className="text-muted-foreground">
                {isLoading ? (
                  'Searching...'
                ) : (
                  <>
                    Found {totalResults} result{totalResults !== 1 ? 's' : ''}
                    {query && ` for "${query}"`}
                  </>
                )}
              </p>
            </div>
            {results.length > 0 && (
              <Button variant="outline" onClick={exportResults}>
                <Download className="h-4 w-4 mr-2" />
                Export Results
              </Button>
            )}
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <Skeleton className="h-12 w-12 rounded" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-5 w-1/3" />
                      <Skeleton className="h-4 w-2/3" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Results */}
        {!isLoading && results.length > 0 && (
          <div className="space-y-3">
            {results.map((result) => (
              <Card
                key={result.id}
                className="hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => router.push(result.url)}
              >
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <Badge className={getTypeColor(result.type)} variant="outline">
                      {result.type}
                    </Badge>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-lg mb-1">{result.title}</h3>
                      <p className="text-muted-foreground mb-3">{result.description}</p>
                      {result.metadata && (
                        <div className="flex flex-wrap gap-2">
                          {Object.entries(result.metadata).map(([key, value]) => (
                            <Badge key={key} variant="secondary" className="text-xs">
                              {key}: {value}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                    <Button variant="ghost" size="icon" asChild>
                      <Link href={result.url}>
                        <ExternalLink className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* No Results */}
        {!isLoading && query && results.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <div className="mx-auto w-24 h-24 rounded-full bg-muted flex items-center justify-center mb-4">
                <Search className="h-12 w-12 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-2">No results found</h3>
              <p className="text-muted-foreground mb-6">
                We couldn't find anything matching "{query}". Try adjusting your search or filters.
              </p>
              <div className="flex gap-3 justify-center">
                <Button variant="outline" onClick={handleClearFilters}>
                  Clear Filters
                </Button>
                <Button onClick={() => setQuery('')}>
                  New Search
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
