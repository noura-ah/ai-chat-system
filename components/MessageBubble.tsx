'use client'

import { Message } from '@/types/chat'
import { User, Bot, Search } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { materialDark } from "react-syntax-highlighter/dist/esm/styles/prism";

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
            ? 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
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
          className={`rounded-2xl px-4 py-3 max-w-[80%] truncate break-words whitespace-normal ${
            isUser
              ? 'bg-gray-800 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-br-sm'
              : 'text-gray-900 dark:text-gray-100 rounded-bl-sm'
          }`}
        >
          {isUser ? (
            <p className="break-words whitespace-pre-wrap">{message.content}</p>
          ) : (
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              className="truncate break-words whitespace-normal"
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
                  <thead className="bg-gray-100 dark:bg-gray-800">{children}</thead>
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
                code: ({ className, children, ...props }: any) => {
                  const isInline = !className
                  const match = /language-(\w+)/.exec(className || "");
                  return !isInline && match ? (
                    <SyntaxHighlighter
                      className="overflow-x-auto p-3 !text-sm rounded-lg my-2 !bg-gray-100 dark:!bg-gray-800 border border-gray-200 dark:border-gray-700" 
                      style={materialDark}    
                      language={match[1]}
                      PreTag="div"
                      customStyle={{ background: "#1f2937" }}
                      codeTagProps={{ style: { background: "transparent" } }}
                      {...props}
                    >
                      {String(children).replace(/\n$/, "")}
                    </SyntaxHighlighter>
                  ) : (
                    <code
                      className="px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-700 text-sm font-mono"
                      {...props}
                    >
                      {children}
                    </code>
                  )
                },
                pre: ({ children }) => (
                  <pre className="overflow-x-auto p-3 rounded-lg  my-2">
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
                    className="underline text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-300"
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

