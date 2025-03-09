import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing required environment variables');
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function clearDestinations() {
  console.log('Clearing existing destinations...');
  const { error } = await supabase
    .from('Destination')
    .delete()
    .neq('id', 0); // Delete all records

  if (error) {
    throw new Error(`Error clearing destinations: ${error.message}`);
  }
  console.log('Existing destinations cleared');
}

async function seedDestinations() {
  try {
    // Read the dataset file
    const datasetPath = path.join(process.cwd(), 'dataset.json');
    const rawData = fs.readFileSync(datasetPath, 'utf8');
    const { destinations } = JSON.parse(rawData);

    // Clear existing data
    await clearDestinations();

    console.log('Starting to seed destinations...');
    
    // Prepare the destinations data
    const formattedDestinations = destinations.map((dest: any) => ({
      city: dest.city,
      country: dest.country,
      clues: dest.clues,
      fun_facts: dest.fun_facts,
      trivia: dest.trivia,
      difficulty: dest.difficulty.toLowerCase(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }));

    // Insert destinations in batches
    const batchSize = 50;
    for (let i = 0; i < formattedDestinations.length; i += batchSize) {
      const batch = formattedDestinations.slice(i, i + batchSize);
      
      const { error } = await supabase
        .from('Destination')
        .insert(batch);

      if (error) {
        throw new Error(`Error inserting batch: ${error.message}`);
      }

      console.log(`Seeded batch ${Math.floor(i / batchSize) + 1} of ${Math.ceil(formattedDestinations.length / batchSize)}`);
    }

    // Verify seeding
    const { data: count, error: countError } = await supabase
      .from('Destination')
      .select('*', { count: 'exact' });

    if (countError) {
      throw new Error(`Error verifying seed: ${countError.message}`);
    }

    console.log(`Seeding completed. Total destinations: ${count?.length}`);

  } catch (error) {
    console.error('Error during seeding:', error);
    process.exit(1);
  }
}

// Run the seed
seedDestinations()
  .then(() => {
    console.log('Seeding completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Seeding failed:', error);
    process.exit(1);
  });