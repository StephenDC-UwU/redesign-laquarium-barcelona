import { getDictionary } from "@/dictionaries";
import { getFilteredArticlesAction, getArticlesFilterMetadataAction } from "@/actions/articleActions";
import ArticlesClientPage from "@/components/articles/ArticlesClientPage";
import { Locale } from "@/types/Locale";
import { Metadata } from "next";

interface ArticlesPageProps {
    params: Promise<{ locale: string; category: string }>;
}

export async function generateMetadata({ params }: ArticlesPageProps): Promise<Metadata> {
    const { locale, category } = await params;
    const currentLocale = locale as Locale;
    const dict = await getDictionary(currentLocale);
    
    const dbCategory = (category === "blogs" || category === "blog") ? "blog" : "news";
    const title = dbCategory === "blog" 
        ? `${dict.nav.nav_blog || "Blog"} | L'Aquàrium Barcelona` 
        : `${dict.news.news_title || "Noticias"} | L'Aquàrium Barcelona`;

    const description = dbCategory === "blog"
        ? "Descubre artículos interesantes, curiosidades y secretos del océano de la mano de nuestros acuaristas y biólogos en L'Aquàrium Barcelona."
        : "Mantente al día con las últimas noticias, eventos, programas de conservación y novedades científicas de L'Aquàrium Barcelona.";

    return {
        title,
        description,
    };
}

export default async function ArticlesPage({ params }: ArticlesPageProps) {
    const { locale, category } = await params;
    const currentLocale = locale as Locale;
    
    // Normalize category: "blogs" or "blog" -> "blog", "news" -> "news"
    const dbCategory = (category === "blogs" || category === "blog") ? "blog" : "news";

    const dict = await getDictionary(currentLocale);

    // Fetch filters metadata and initial articles
    const [filterMetadata, initialData] = await Promise.all([
        getArticlesFilterMetadataAction(dbCategory),
        getFilteredArticlesAction({
            locale: currentLocale,
            category: dbCategory,
            skip: 0,
            take: 10,
        })
    ]);

    return (
        <main className="min-h-screen bg-background pt-28 pb-16">
            <ArticlesClientPage 
                dict={dict}
                locale={currentLocale}
                category={dbCategory}
                initialArticles={initialData.articles}
                initialTotalCount={initialData.totalCount}
                availableTopics={filterMetadata.topics}
                availableYears={filterMetadata.years}
            />
        </main>
    );
}
