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
    <div className="mt-2 space-y-4 w-full min-w-0">
      {/* Image Results */}
      {images && images.length > 0 && (
        <div className="px-4 py-3 break-words whitespace-normal text-gray-900 dark:text-gray-100 w-full">
          <div className="overflow-x-auto -mx-4 px-4">
            <div className="flex gap-3" style={{ width: 'max-content', minWidth: '100%' }}>
              {images.map((image, index) => (
                <div
                  key={index}
                  className="relative flex-shrink-0 w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 rounded-lg overflow-hidden bg-gray-200 dark:bg-gray-700 group cursor-pointer"
                >
                  <Image
                    src={image.url}
                    alt={image.title || `Search result ${index + 1}`}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform"
                    sizes="128px"
                    unoptimized
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      
      {/* Text Results */}
      {results && results.length > 0 && (
        <div className="px-4 py-3 break-words whitespace-normal text-gray-900 dark:text-gray-100 w-full">
          <div className="space-y-3">
            {results.slice(0, 5).map((result, index) => (
              <a
                key={index}
                href={result.link}
                target="_blank"
                rel="noopener noreferrer"
                className="block p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:shadow-md transition-shadow border border-gray-200 dark:border-gray-600"
              >
                <div className="flex items-start gap-2">
                  <ExternalLink className="w-4 h-4 text-gray-400 mt-1 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-slate-600 dark:text-slate-400 truncate">
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

