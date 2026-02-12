import { getCollection } from 'astro:content';

export async function getPublishedPosts() {
    const posts = await getCollection('blog', ({ data }) => {
        // Show all posts in dev mode, filter out drafts in production
        return import.meta.env.DEV || !data.draft;
    });
    return posts.sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());
}
