import type { NextApiRequest, NextApiResponse } from 'next';

const NEWS_API_KEY = '3016ca3883da42cf9ddd14bef149de6a';
const BASE_URL = 'https://newsapi.org/v2/everything';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const query = req.query.q as string;
  console.log('Received query:', query); // Debugging

  if (!query) {
    return res.status(400).json({ error: 'Missing query parameter' });
  }

  try {
    const apiUrl = `${BASE_URL}?q=${encodeURIComponent(query)}&language=en&pageSize=10&apiKey=${NEWS_API_KEY}`;
    const response = await fetch(apiUrl);
    console.log('API Response:', response); // Debugging
    const data = await response.json();
    
    if (!data.articles) {
      return res.status(500).json({ error: 'No news articles found' });
    }

    return res.status(200).json(data);
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ error: 'Failed to fetch news. Please try again later.' });
  }
}
