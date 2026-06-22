import { getDictionary } from "@/dictionaries";
import Intro from "@/components/home/Intro";
import Promotion from "@/components/home/Promotion";
import Experience from "@/components/home/Experience";
import Discover from "@/components/home/Discover";
import News from "@/components/home/News";

interface HomeProps {
  params: Promise<{ locale: string }>;
}

export default async function Home({ params }: HomeProps) {
  const { locale } = await params;
  const dict = await getDictionary(locale);

  return (
    <main >
      <Intro dict={dict} />
      <Promotion dict={dict} />
      <Experience dict={dict} />
      <News dict={dict} />
      <Discover dict={dict} />
    </main>
  );
}
