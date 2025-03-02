import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

// Define the structure of our dataset items
interface DestinationData {
  city: string;
  country: string;
  clues: string[];
  fun_fact: string[];
  trivia: string[];
  difficulty: string;
}

// Read the dataset file
const dataset = JSON.parse(
  fs.readFileSync(path.join(process.cwd(), 'dataset.json'), 'utf-8')
) as DestinationData[];

async function main() {
  console.log('Starting seed...');
  
  // Create a new PrismaClient instance with explicit connection management
  const prisma = new PrismaClient({
    log: ['error'],
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  });

  try {
    // Check if data already exists to avoid duplicate seeding
    const existingCount = await prisma.destination.count();
    
    if (existingCount > 0) {
      console.log(`Database already contains ${existingCount} destinations. Skipping seed.`);
      return;
    }
    
    // Process in smaller batches to avoid connection issues
    const batchSize = 50;
    const batches = Math.ceil(dataset.length / batchSize);
    
    for (let i = 0; i < batches; i++) {
      const start = i * batchSize;
      const end = Math.min(start + batchSize, dataset.length);
      const batch = dataset.slice(start, end);
      
      console.log(`Processing batch ${i + 1}/${batches} (items ${start + 1}-${end})...`);
      
      // Use createMany for more efficient batch insertion
      await prisma.destination.createMany({
        data: batch.map((dest: DestinationData) => ({
          city: dest.city,
          country: dest.country,
          clues: JSON.stringify(dest.clues),
          funFacts: JSON.stringify(dest.fun_fact),
          trivia: JSON.stringify(dest.trivia),
          difficulty: dest.difficulty
        }))
      });
    }
    
    console.log('Seed completed successfully.');
  } catch (error) {
    console.error('Error during seed:', error);
    process.exit(1);
  } finally {
    // Ensure connection is properly closed
    await prisma.$disconnect();
  }
}

main()
  .catch((e) => {
    console.error('Error during seed:', e);
    process.exit(1);
  });
