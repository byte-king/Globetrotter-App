import { PrismaClient } from './generated/sqlite-client';
import * as fs from 'fs';
import * as path from 'path';

interface DestinationData {
  city: string;
  country: string;
  clues: string[];
  fun_fact: string[];
  trivia: string[];
  difficulty: string;
}

async function main() {
  console.log('Starting SQLite seed...');
  
  // Verify dataset file exists
  const datasetPath = path.join(process.cwd(), 'dataset.json');
  if (!fs.existsSync(datasetPath)) {
    throw new Error(`Dataset file not found at: ${datasetPath}`);
  }

  // Read and parse dataset
  console.log('Reading dataset file...');
  const rawData = fs.readFileSync(datasetPath, 'utf-8');
  const dataset = JSON.parse(rawData) as DestinationData[];
  console.log(`Found ${dataset.length} destinations in dataset`);

  const prisma = new PrismaClient({
    log: ['query', 'info', 'warn', 'error'],
    datasources: {
      db: {
        url: process.env.SQLITE_URL,
      },
    },
  });

  try {
    // Verify database connection
    await prisma.$connect();
    console.log('Connected to database successfully');

    // Check if data already exists
    const existingCount = await prisma.destination.count();
    console.log(`Current destination count in database: ${existingCount}`);
    
    if (existingCount > 0) {
      console.log('Clearing existing data...');
      await prisma.destination.deleteMany();
    }
    
    // Process in smaller batches
    const batchSize = 10;
    const batches = Math.ceil(dataset.length / batchSize);
    
    for (let i = 0; i < batches; i++) {
      const start = i * batchSize;
      const end = Math.min(start + batchSize, dataset.length);
      const batch = dataset.slice(start, end);
      
      console.log(`Processing batch ${i + 1}/${batches} (items ${start + 1}-${end})...`);
      
      for (const dest of batch) {
        try {
          await prisma.destination.create({
            data: {
              city: dest.city,
              country: dest.country,
              clues: JSON.stringify(dest.clues),
              funFacts: JSON.stringify(dest.fun_fact),
              trivia: JSON.stringify(dest.trivia),
              difficulty: dest.difficulty
            }
          });
          console.log(`Created destination: ${dest.city}, ${dest.country}`);
        } catch (error) {
          console.error(`Error creating destination ${dest.city}:`, error);
        }
      }
    }
    
    // Verify final count
    const finalCount = await prisma.destination.count();
    console.log(`Seeding completed. Final destination count: ${finalCount}`);

  } catch (error) {
    console.error('Error during seed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .then(() => {
    console.log('Seeding completed successfully');
    process.exit(0);
  })
  .catch((e) => {
    console.error('Seeding failed:', e);
    process.exit(1);
  });
