/**
 * Portada PNG de cada artículo publicado: /og/blog/<lang>/<slug>.png.
 * Se prerenderiza en el build (el sitio es estático); el diseño vive en
 * src/lib/og-cover.ts.
 */
import type { APIRoute, GetStaticPaths } from 'astro';
import { getCollection, type CollectionEntry } from 'astro:content';
import type { BlogLang } from '../../../../i18n/ui';
import { isPublished, pillarTitle } from '../../../../lib/blog';
import { renderBlogCover } from '../../../../lib/og-cover';

export const getStaticPaths: GetStaticPaths = async () => {
  const posts = await getCollection('blog', (e) => isPublished(e));
  return posts.map((post) => {
    const [lang, ...rest] = post.slug.split('/');
    return { params: { lang, slug: rest.join('/') }, props: { post } };
  });
};

export const GET: APIRoute = async ({ props, params }) => {
  const { post } = props as { post: CollectionEntry<'blog'> };
  const lang = params.lang as BlogLang;
  const png = await renderBlogCover({
    title: post.data.title,
    pillar: post.data.pillar,
    pillarLabel: pillarTitle(post.data.pillar, lang),
    lang,
  });
  return new Response(png, { headers: { 'Content-Type': 'image/png' } });
};
