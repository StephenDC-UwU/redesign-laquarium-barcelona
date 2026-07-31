const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const pg = require('pg');

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\--+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

async function main() {
  // Clean database
  console.log("Cleaning up old articles...");
  await prisma.articleTranslation.deleteMany({});
  await prisma.article.deleteMany({});

  console.log("Cleaning up products...");
  await prisma.productTranslation.deleteMany({});
  await prisma.product.deleteMany({});

  console.log("Cleaning up orders...");
  await prisma.order.deleteMany({});

  console.log("Cleaning up subscribers...");
  await prisma.newsletterSubscriber.deleteMany({});

  const topics = ["Actualidad", "Acuario", "Promociones"];
  const years = [2024, 2025, 2026];
  const months = ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12"];

  const articlesData = [];

  // Generate 25 News Articles
  for (let i = 1; i <= 25; i++) {
    const topic = topics[(i - 1) % topics.length];
    const year = years[(i - 1) % years.length];
    const month = months[(i - 1) % months.length];
    const day = String((i % 28) + 1).padStart(2, '0');
    const listDate = `${year}-${month}-${day}`; z

    // Choose an image
    const imageId = 1500 + i;
    const image = `https://images.unsplash.com/photo-${imageId === 1501 ? '1582967788606-a171c1080cb0' : '1544551763-46a013bb70d5'}?q=80&w=1000&auto=format&fit=crop`;
    const thumbnail = `https://images.unsplash.com/photo-${imageId === 1501 ? '1582967788606-a171c1080cb0' : '1544551763-46a013bb70d5'}?q=80&w=300&auto=format&fit=crop`;

    const titleEs = `Noticia Aquarium ${i}: Encontrando Una Nueva Especie`;
    const slug = slugify(`noticia-aquarium-${i}-encontrando-una-nueva-especie`);

    articlesData.push({
      listDate,
      category: "news",
      topic,
      slug,
      featured: i === 1, // First item is featured
      image,
      thumbnail,
      link: "#",
      translations: [
        {
          locale: "es",
          title: titleEs,
          date: `Día ${day}/${month}/${year}`,
          content: `Contenido extenso de la noticia número ${i}. Descubre todo sobre las especies del acuario, las novedades científicas y los programas de conservación que desarrollamos día a día.`
        },
        {
          locale: "ca",
          title: `Notícia Aquarium ${i}: Trobant Una Nova Espècie`,
          date: `Dia ${day}/${month}/${year}`,
          content: `Contingut extens de la notícia número ${i}. Descobreix tot sobre les espècies de l'aquari, les novetats científiques i els programes de conservació que desenvolupem dia a dia.`
        },
        {
          locale: "en",
          title: `Aquarium News ${i}: Finding A New Species`,
          date: `Day ${day}/${month}/${year}`,
          content: `Extensive content of news number ${i}. Discover everything about the species of the aquarium, scientific news and the conservation programs we develop day by day.`
        }
      ]
    });
  }

  // Generate 25 Blog Articles
  for (let i = 1; i <= 25; i++) {
    const topic = topics[(i - 1) % topics.length];
    const year = years[(i - 1) % years.length];
    const month = months[(i - 1) % months.length];
    const day = String((i % 28) + 1).padStart(2, '0');
    const listDate = `${year}-${month}-${day}`;

    // Choose an image
    const image = `https://images.unsplash.com/photo-1522069169874-c58ec4b76be5?q=80&w=1000&auto=format&fit=crop`;
    const thumbnail = `https://images.unsplash.com/photo-1522069169874-c58ec4b76be5?q=80&w=300&auto=format&fit=crop`;

    const titleEs = `Blog Aquarium ${i}: Secretos del Océano`;
    const slug = slugify(`blog-aquarium-${i}-secretos-del-oceano`);

    articlesData.push({
      listDate,
      category: "blog",
      topic,
      slug,
      featured: i === 1, // First item is featured
      image,
      thumbnail,
      link: "#",
      translations: [
        {
          locale: "es",
          title: titleEs,
          date: `Día ${day}/${month}/${year}`,
          content: `Entrada del blog número ${i} sobre curiosidades de los tiburones, cuidados del ecosistema de arrecifes de coral y el trabajo de nuestros cuidadores marinos.`
        },
        {
          locale: "ca",
          title: `Blog Aquarium ${i}: Secrets de l'Oceà`,
          date: `Dia ${day}/${month}/${year}`,
          content: `Entrada del blog número ${i} sobre curiositats dels taurons, cures de l'ecosistema de coralls i el treball dels nostres cuidadors marins.`
        },
        {
          locale: "en",
          title: `Aquarium Blog ${i}: Secrets of the Ocean`,
          date: `Day ${day}/${month}/${year}`,
          content: `Blog post number ${i} about shark facts, caring for the coral reef ecosystem, and the daily work of our marine aquarists.`
        }
      ]
    });
  }

  console.log("Seeding articles...");
  for (const article of articlesData) {
    await prisma.article.create({
      data: {
        listDate: article.listDate,
        category: article.category,
        topic: article.topic,
        slug: article.slug,
        featured: article.featured,
        image: article.image,
        thumbnail: article.thumbnail,
        link: article.link,
        translations: {
          create: article.translations
        }
      },
    });
  }

  const productsData = [
    {
      price: 25.00,
      translations: [
        { locale: "es", name: "Entrada General (Adulto)", description: "Acceso general para mayores de 12 años.", tag: "Popular" },
        { locale: "ca", name: "Entrada General (Adult)", description: "Accés general per a majors de 12 anys.", tag: "Popular" },
        { locale: "en", name: "General Admission (Adult)", description: "General admission for ages 12 and above.", tag: "Popular" }
      ]
    },
    {
      price: 18.00,
      translations: [
        { locale: "es", name: "Entrada Infantil (3-10 años)", description: "Acceso para niños pequeños.", tag: "Niño" },
        { locale: "ca", name: "Entrada Infantil (3-10 anys)", description: "Accés per a nens petits.", tag: "Nen" },
        { locale: "en", name: "Child Ticket (3-10 years)", description: "Access for young children.", tag: "Child" }
      ]
    }
  ];

  console.log("Seeding products/tickets...");
  for (const prod of productsData) {
    await prisma.product.create({
      data: {
        price: prod.price,
        translations: {
          create: prod.translations
        }
      }
    });
  }

  // Aforo setting
  const capacitySetting = await prisma.systemSetting.findUnique({
    where: { key: "hourlyCapacity" }
  });
  if (!capacitySetting) {
    console.log("Seeding hourly capacity config...");
    await prisma.systemSetting.create({
      data: {
        key: "hourlyCapacity",
        value: "50"
      }
    });
  }

  console.log("Seeding finished.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
