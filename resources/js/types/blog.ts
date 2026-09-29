export type PostLocale = 'km' | 'en';

export type PostSummary = {
    id: number;
    title: string;
    slug: string;
    excerpt: string | null;
    cover_url: string | null;
    locale: PostLocale;
    published_at: string | null;
};

export type PostDetail = PostSummary & {
    views: number;
    author: string | null;
    html: string;
    reading_minutes: number;
    is_published: boolean;
};

export type AdminPost = Omit<PostSummary, 'excerpt'> & {
    views: number;
    updated_at: string;
};

export type EditablePost = PostSummary & {
    body: string;
    meta_title: string | null;
    meta_description: string | null;
    views: number;
};
