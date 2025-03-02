import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

// Read the dataset file
const dataset = JSON.parse(
  fs.readFileSync(path.join(process.cwd(), 'dataset.json'), 'utf-8')
);

async function main() {
  console.log('Starting seed...');
  for (const dest of dataset) {
    await prisma.destination.create({
      data: {
        city: dest.city,
        country: dest.country,
        clues: JSON.stringify(dest.clues),
        funFacts: JSON.stringify(dest.fun_fact),
        trivia: JSON.stringify(dest.trivia),
        difficulty: dest.difficulty
      },
    });
  }
  console.log('Seed completed.');
}

main()
  .catch((e) => {
    console.error('Error during seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
