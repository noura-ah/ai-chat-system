'use client'

import { Message } from '@/types/chat'
import { User, Bot, Search } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

interface MessageBubbleProps {
  message: Message
}

export default function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === 'user'
  const isSearchMode = message.mode === 'search'

  return (
    <div
      className={`flex gap-3 ${
        isUser ? 'flex-row-reverse' : 'flex-row'
      }`}
    >
      <div
        className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
          isUser
            ? 'bg-blue-500 text-white'
            : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
        }`}
      >
        {isUser ? (
          <User className="w-5 h-5" />
        ) : isSearchMode ? (
          <Search className="w-5 h-5" />
        ) : (
          <Bot className="w-5 h-5" />
        )}
      </div>
      <div
        className={`flex-1 ${
          isUser ? 'items-end' : 'items-start'
        } flex flex-col`}
      >
        {message.content && (
        <div
          className={`rounded-2xl px-4 py-3 max-w-[60%] ${
            isUser
              ? 'bg-blue-500 text-white rounded-br-sm'
              : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-bl-sm border border-gray-200 dark:border-gray-700'
          }`}
        >
          {isUser ? (
            <p className="break-words whitespace-pre-wrap">{message.content}</p>
          ) : (
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              className="break-words"
              components={{
                // Style tables
                table: ({ children }) => (
                  <div className="overflow-x-auto my-2">
                    <table className="min-w-full border-collapse border border-gray-300 dark:border-gray-600">
                      {children}
                    </table>
                  </div>
                ),
                thead: ({ children }) => (
                  <thead className="bg-gray-100 dark:bg-gray-700">{children}</thead>
                ),
                tbody: ({ children }) => (
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
                    {children}
                  </tbody>
                ),
                tr: ({ children }) => (
                  <tr className="border-b border-gray-200 dark:border-gray-600">
                    {children}
                  </tr>
                ),
                th: ({ children }) => (
                  <th className="px-4 py-2 text-left font-semibold border border-gray-300 dark:border-gray-600">
                    {children}
                  </th>
                ),
                td: ({ children }) => (
                  <td className="px-4 py-2 border border-gray-300 dark:border-gray-600">
                    {children}
                  </td>
                ),
                // Style code blocks
                code: ({ className, children, ...props }) => {
                  const isInline = !className
                  return isInline ? (
                    <code
                      className={`px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-700 text-sm font-mono ${
                        isUser ? 'bg-blue-400/30 text-white' : ''
                      }`}
                      {...props}
                    >
                      {children}
                    </code>
                  ) : (
                    <code className={className} {...props}>
                      {children}
                    </code>
                  )
                },
                pre: ({ children }) => (
                  <pre className="overflow-x-auto p-3 rounded-lg bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 my-2">
                    {children}
                  </pre>
                ),
                // Style headers
                h1: ({ children }) => (
                  <h1 className="text-2xl font-bold mt-4 mb-2">{children}</h1>
                ),
                h2: ({ children }) => (
                  <h2 className="text-xl font-bold mt-3 mb-2">{children}</h2>
                ),
                h3: ({ children }) => (
                  <h3 className="text-lg font-semibold mt-2 mb-1">{children}</h3>
                ),
                // Style lists
                ul: ({ children }) => (
                  <ul className="list-disc list-inside my-2 space-y-1">{children}</ul>
                ),
                ol: ({ children }) => (
                  <ol className="list-decimal list-inside my-2 space-y-1">{children}</ol>
                ),
                li: ({ children }) => <li className="ml-2">{children}</li>,
                // Style paragraphs
                p: ({ children }) => <p className="my-2">{children}</p>,
                // Style blockquotes
                blockquote: ({ children }) => (
                  <blockquote className="border-l-4 border-gray-300 dark:border-gray-600 pl-4 italic my-2">
                    {children}
                  </blockquote>
                ),
                // Style links
                a: ({ children, href }) => (
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`underline ${
                      isUser
                        ? 'text-blue-100 hover:text-white'
                        : 'text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300'
                    }`}
                  >
                    {children}
                  </a>
                ),
                // Style horizontal rules
                hr: () => <hr className="my-4 border-gray-300 dark:border-gray-600" />,
              }}
            >
              {message.content}
            </ReactMarkdown>
          )}
        </div>
        )}
        <span className="text-xs text-gray-500 dark:text-gray-400 mt-1 px-1">
          {message.timestamp?.toLocaleTimeString()}
        </span>
      </div>
    </div>
  )
}

