import { getDictionary } from "@/dictionaries";
import { getArticleBySlugAction } from "@/actions/newsActions";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Locale } from "@/types/Locale";
import { Metadata } from "next";

interface ArticleDetailPageProps {
    params: Promise<{ locale: string; category: string; slug: string }>;
}

export async function generateMetadata({ params }: ArticleDetailPageProps): Promise<Metadata> {
    const { locale, slug } = await params;
    const currentLocale = locale as Locale;
    const article = await getArticleBySlugAction(slug, currentLocale);

    if (!article) {
        return {
            title: "Artículo no encontrado | L'Aquàrium Barcelona"
        };
    }

    return {
        title: `${article.title} | L'Aquàrium Barcelona`,
        description: article.content.substring(0, 155) + "...",
    };
}

export default async function ArticleDetailPage({ params }: ArticleDetailPageProps) {
    const { locale, category, slug } = await params;
    const currentLocale = locale as Locale;

    const dict = await getDictionary(currentLocale);
    const article = await getArticleBySlugAction(slug, currentLocale);

    if (!article) {
        notFound();
    }

    const isBlog = category === "blog" || article.category === "blog";
    const categoryName = isBlog ? (dict.nav.nav_blog || "Blog") : (dict.news.news_title || "Noticias");

    return (
        <main className="min-h-screen bg-background pt-32 pb-24 font-switzer text-black dark:text-white transition-colors duration-300">
            <div className="max-w-5xl mx-auto px-4 md:px-8">
                
                {/* Back Link */}
                <Link 
                    href={`/${currentLocale}/articles/${category}`}
                    className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-primary mb-8 transition-colors group cursor-pointer"
                >
                    <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                    <span>Volver a {categoryName}</span>
                </Link>

                {/* Top Section: Title and Share icons */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start mb-10">
                    <div className="md:col-span-8 space-y-4">
                        <h1 className="text-3xl md:text-5xl font-bold font-outfit leading-tight text-slate-850 dark:text-white">
                            {article.title}
                        </h1>
                        <div className="text-slate-400 dark:text-slate-500 text-sm font-semibold flex items-center gap-2">
                            <span>{article.date}</span>
                            <span>•</span>
                            <span>{categoryName} de L&apos;Aquàrium</span>
                        </div>
                    </div>

                    <div className="md:col-span-4 flex flex-col md:items-end gap-3 md:mt-2">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                            ¿Where you can Share?
                        </span>
                        <div className="flex items-center gap-3">
                            <a href="#" className="w-9 h-9 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-850 hover:bg-primary transition-all p-2 shadow-sm group">
                                <Image src="/socials/facebook.svg" alt="Facebook" width={16} height={16} className="dark:invert group-hover:invert group-hover:brightness-200" />
                            </a>
                            <a href="#" className="w-9 h-9 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-850 hover:bg-primary transition-all p-2 shadow-sm group">
                                <Image src="/socials/instagram.svg" alt="Instagram" width={16} height={16} className="dark:invert group-hover:invert group-hover:brightness-200" />
                            </a>
                            <a href="#" className="w-9 h-9 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-850 hover:bg-primary transition-all p-2 shadow-sm group">
                                <Image src="/socials/youtube.svg" alt="Youtube" width={16} height={16} className="dark:invert group-hover:invert group-hover:brightness-200" />
                            </a>
                        </div>
                    </div>
                </div>

                {/* Main Hero Image */}
                <div className="relative w-full aspect-[16/9] md:aspect-[21/9] rounded-[24px] md:rounded-[32px] overflow-hidden shadow-2xl border border-white/10 mb-12">
                    <Image
                        src={article.image}
                        alt={article.title}
                        fill
                        priority
                        className="object-cover"
                    />
                </div>

                {/* Article Body Content */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
                    <div className="md:col-span-3">
                        {/* Author metadata card */}
                        <div className="border-l-4 border-primary pl-4 py-2 space-y-1">
                            <h3 className="text-base font-bold font-outfit text-slate-850 dark:text-white">
                                Natalia Kachienska
                            </h3>
                            <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">
                                Redactora Aquarium
                            </p>
                        </div>
                    </div>

                    <div className="md:col-span-9 space-y-8 text-slate-700 dark:text-slate-300 text-base md:text-lg leading-relaxed font-light">
                        <p className="first-letter:text-5xl first-letter:font-bold first-letter:font-outfit first-letter:text-primary first-letter:mr-3 first-letter:float-left">
                            {article.content}
                        </p>
                        
                        <p>
                            Westworld is resurrecting a character not seen for some time in its fourth season. James Marsden made a surprise appearance at the end of the HBO show&apos;s ATX TV Festival panel on Saturday. His character, Teddy Flood, will return to the show in its fourth season, which is set to premiere June 26.
                        </p>

                        <ul className="list-disc pl-6 space-y-3 font-light text-base text-slate-650 dark:text-slate-400">
                            <li>
                                Westworld is resurrecting a character not seen for some time in its fourth season. James Marsden made a surprise appearance at the end of the HBO show&apos;s ATX TV Festival panel on Saturday. His character, Teddy Flood, will return to the show.
                            </li>
                            <li>
                                His character, Teddy Flood, will return to the show in its fourth season, which is set to premiere June 26.
                            </li>
                            <li>
                                James Marsden made a surprise appearance at the end of the HBO show&apos;s ATX TV Festival panel on Saturday.
                            </li>
                        </ul>
                    </div>
                </div>

            </div>
        </main>
    );
}
