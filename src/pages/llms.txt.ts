import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { isPublished } from '../lib/blog';
import { llmsTxt } from '../lib/llms';

export const GET: APIRoute = async () => {
  const posts = await getCollection('blog', (e) => isPublished(e));
  return new Response(llmsTxt(posts), { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
