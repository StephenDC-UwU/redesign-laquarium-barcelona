const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const pg = require('pg');

const pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL,
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const articlesData = [
    {
      listDate: "2026-06-14",
      image: "https://images.unsplash.com/photo-1582967788606-a171c1080cb0?q=80&w=1000&auto=format&fit=crop",
      thumbnail: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?q=80&w=300&auto=format&fit=crop",
      link: "#",
      translations: [
        { locale: "es", title: "Encontrando Una Nueva Especie", date: "Sábado 14 Junio 2026" },
        { locale: "ca", title: "Trobant Una Nova Espècie", date: "Dissabte 14 Juny 2026" },
        { locale: "en", title: "Finding A New Species", date: "Saturday 14 June 2026" }
      ]
    },
    {
      listDate: "2026-06-15",
      image: "https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=1000&auto=format&fit=crop",
      thumbnail: "https://images.unsplash.com/photo-1524704796725-9fc3044a58b2?q=80&w=300&auto=format&fit=crop",
      link: "#",
      translations: [
        { locale: "es", title: "Nuevos Horarios de Verano", date: "Domingo 15 Junio 2026" },
        { locale: "ca", title: "Nous Horaris d'Estiu", date: "Diumenge 15 Juny 2026" },
        { locale: "en", title: "New Summer Hours", date: "Sunday 15 June 2026" }
      ]
    },
    {
      listDate: "2026-06-16",
      image: "https://images.unsplash.com/photo-1580974928064-f0aeef70895a?q=80&w=1000&auto=format&fit=crop",
      thumbnail: "https://images.unsplash.com/photo-1522069169874-c58ec4b76be5?q=80&w=300&auto=format&fit=crop",
      link: "#",
      translations: [
        { locale: "es", title: "Programa de Conservación Marina", date: "Lunes 16 Junio 2026" },
        { locale: "ca", title: "Programa de Conservació Marina", date: "Dilluns 16 Juny 2026" },
        { locale: "en", title: "Marine Conservation Program", date: "Monday 16 June 2026" }
      ]
    },
    {
      listDate: "2026-06-17",
      image: "https://images.unsplash.com/photo-1580974928064-f0aeef70895a?q=80&w=1000&auto=format&fit=crop",
      thumbnail: "https://images.unsplash.com/photo-1522069169874-c58ec4b76be5?q=80&w=300&auto=format&fit=crop",
      link: "#",
      translations: [
        { locale: "es", title: "Visita de Expertos Biólogos", date: "Martes 17 Junio 2026" },
        { locale: "ca", title: "Visita d'Experts Biòlegs", date: "Dimarts 17 Juny 2026" },
        { locale: "en", title: "Marine Biologists Visit", date: "Tuesday 17 June 2026" }
      ]
    }
  ];

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

  const articleCount = await prisma.article.count();
  if (articleCount > 0) {
    console.log("Los artículos ya existen en la base de datos. Saltando seed de artículos...");
  } else {
    console.log("Seeding articles...");
    for (const article of articlesData) {
      await prisma.article.create({
        data: {
          listDate: article.listDate,
          image: article.image,
          thumbnail: article.thumbnail,
          link: article.link,
          translations: {
            create: article.translations
          }
        },
      });
    }
  }

  const productCount = await prisma.product.count();
  if (productCount > 0) {
    console.log("Los productos ya existen en la base de datos. Saltando seed de productos...");
  } else {
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
