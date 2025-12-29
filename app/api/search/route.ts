import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import axios from 'axios'
import { openRouterChatCompletion } from '@/lib/openrouter'

interface SerpApiResult {
  organic_results?: Array<{
    title: string
    link: string
    snippet: string
  }>
  images_results?: Array<{
    thumbnail: string
    original: string
    title: string
  }>
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return new Response('Unauthorized', { status: 401 })
    }

    const { query } = await req.json()

    if (!query || typeof query !== 'string') {
      return new Response('Query is required', { status: 400 })
    }

    // Use SerpAPI for web search (you can replace with other search APIs)
    const serpApiKey = process.env.SERPAPI_KEY

    if (!serpApiKey) {
      // Fallback: return mock data if API key is not configured
      return new Response(
        JSON.stringify({
          results: [
            {
              title: 'Example Search Result',
              link: 'https://example.com',
              snippet: 'This is a placeholder result. Please configure SERPAPI_KEY in your environment variables.',
            },
          ],
          images: [],
          summary: 'Search functionality requires SERPAPI_KEY to be configured.',
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    }

    // Perform web search
    const searchResponse = await axios.get<SerpApiResult>(
      'https://serpapi.com/search.json',
      {
        params: {
          api_key: serpApiKey,
          q: query,
          engine: 'google',
        },
      }
    )
    const imgSearchResponse = await axios.get<SerpApiResult>("https://serpapi.com/search.json", {
      params: {
        q: query,
        engine: "google",
        tbm: "isch", // image search
        api_key: serpApiKey,
      },
    });

    const searchData = searchResponse.data
    const imgSearchData = imgSearchResponse.data
    // Extract text results
    const results =
      searchData.organic_results?.map((result) => ({
        title: result.title,
        link: result.link,
        snippet: result.snippet,
      })) || []

    // Extract images
    const images =
      imgSearchData.images_results?.map((img: { original: string; thumbnail: string; title: string }) => ({
        url: img.original || img.thumbnail,
        title: img.title,
      })) || []

    // Generate summary using AI
    let summary = 'Here are the search results:'
    if (results.length > 0) {
      const resultsText = results
        .slice(0, 5)
        .map((r, i) => `${i + 1}. ${r.title}: ${r.snippet}`)
        .join('\n\n')

      try {
        const completion = await openRouterChatCompletion(
          [
            {
              role: 'system',
              content:
                'You are a helpful assistant that summarizes search results concisely.',
            },
            {
              role: 'user',
              content: `Based on these search results for "${query}", provide a brief summary:\n\n${resultsText}`,
            },
          ],
          {
            max_tokens: 200,
            temperature: 0.7,
          }
        )

        summary = completion.choices[0]?.message?.content || summary
      } catch (error) {
        console.error('AI summary error:', error)
        // Use default summary if AI fails
      }
    } else {
      summary = 'No search results found for your query.'
    }

    return new Response(
      JSON.stringify({
        results,
        images: images?.slice(0, 10),
        summary,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  } catch (error) {
    console.error('Search API error:', error)
    return new Response(
      JSON.stringify({
        error: 'Search failed',
        results: [],
        images: [],
        summary: 'Sorry, I encountered an error while searching. Please try again.',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  }
}

