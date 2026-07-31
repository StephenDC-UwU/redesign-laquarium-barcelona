import { getDictionary } from "@/dictionaries";
import Hero from "@/components/home/Hero";
import Intro from "@/components/home/Intro";
import Experience from "@/components/home/Experience";
import Discover from "@/components/home/Discover";
import News from "@/components/home/News";
import FloatingTickets from "@/components/home/components/FloatingTickets";
import { Metadata } from "next";
import Promotion from "@/components/home/Promotion";



interface HomeProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: HomeProps): Promise<Metadata> {
  const { locale } = await params;
  const dict = await getDictionary(locale);
  return {
    title: `L'Aquàrium Barcelona - Acuario del Mediterráneo`,
    description: "Visita L'Aquàrium Barcelona. Sumérgete en el Oceanario paseando bajo los tiburones, descubre los arrecifes tropicales y aprende sobre la conservación del mar mediterráneo.",
  };
}

export default async function Home({ params }: HomeProps) {
  const { locale } = await params;
  const dict = await getDictionary(locale);

  return (
    <main >
      <Hero dict={dict} />
      <Intro dict={dict} />
      <Promotion dict={dict} />
      <Experience dict={dict} />
      <News dict={dict} locale={locale} />
      <Discover dict={dict} />
      <FloatingTickets dict={dict} locale={locale} />
    </main>
  );
}
