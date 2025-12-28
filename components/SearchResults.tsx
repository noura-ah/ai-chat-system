'use client'

import Image from 'next/image'
import { ExternalLink } from 'lucide-react'

interface SearchResult {
  title: string
  link: string
  snippet: string
}

interface SearchResultsProps {
  results?: SearchResult[]
  images?: Array<{ url: string; title?: string }>
}

export default function SearchResults({ results, images }: SearchResultsProps) {
  return (
    <div className="mt-4 ml-11 space-y-4">
      {/* Image Results */}
      {images && images.length > 0 && (
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 ">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
            Images
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {images.slice(0, 8).map((image, index) => (
              <div
                key={index}
                className="relative aspect-square rounded-lg overflow-hidden bg-gray-200 dark:bg-gray-700 group cursor-pointer"
              >
                <Image
                  src={image.url}
                  alt={image.title || `Search result ${index + 1}`}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform"
                  sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
                  unoptimized
                />
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Text Results */}
      {results && results.length > 0 && (
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
            Search Results
          </h3>
          <div className="space-y-3">
            {results.slice(0, 5).map((result, index) => (
              <a
                key={index}
                href={result.link}
                target="_blank"
                rel="noopener noreferrer"
                className="block p-3 bg-white dark:bg-gray-700 rounded-lg hover:shadow-md transition-shadow border border-gray-200 dark:border-gray-600"
              >
                <div className="flex items-start gap-2">
                  <ExternalLink className="w-4 h-4 text-gray-400 mt-1 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-blue-600 dark:text-blue-400 truncate">
                      {result.title}
                    </h4>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                      {result.snippet}
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 truncate">
                      {result.link}
                    </p>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>
      )}

    </div>
  )
}

