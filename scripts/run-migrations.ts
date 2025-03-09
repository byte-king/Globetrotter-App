// import { createClient } from '@supabase/supabase-js';
// import * as fs from 'fs';
// import * as path from 'path';
// import { fileURLToPath } from 'url';
// import dotenv from 'dotenv';
// import { dirname } from 'path';

// dotenv.config();

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = dirname(__filename);

// // Add debug logging for environment variables
// console.log('Supabase URL exists:', !!process.env.NEXT_PUBLIC_SUPABASE_URL);
// console.log('Supabase Service Key exists:', !!process.env.SUPABASE_SERVICE_ROLE_KEY);

// const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
// const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// if (!supabaseUrl || !supabaseServiceKey) {
//   throw new Error('Missing Supabase environment variables');
// }

// const supabase = createClient(supabaseUrl, supabaseServiceKey, {
//   auth: {
//     autoRefreshToken: false,
//     persistSession: false
//   }
// });

// async function runMigrations() {
//   try {
//     const migrationsDir = path.join(dirname(__dirname), 'supabase', 'migrations');
//     console.log('\nMigrations directory:', migrationsDir);
    
//     if (!fs.existsSync(migrationsDir)) {
//       throw new Error(`Migrations directory not found at: ${migrationsDir}`);
//     }

//     const files = fs.readdirSync(migrationsDir);
//     console.log('\nAll files in directory:', files);
    
//     const migrationFiles = files.filter(file => file.endsWith('.sql')).sort();
//     console.log('\nSQL files found:', migrationFiles);

//     if (migrationFiles.length === 0) {
//       throw new Error('No SQL migration files found');
//     }

//     for (const file of migrationFiles) {
//       console.log(`\n=== Processing migration: ${file} ===`);
//       const filePath = path.join(migrationsDir, file);
      
//       try {
//         const sql = fs.readFileSync(filePath, 'utf8');
//         console.log('SQL content preview:', sql.substring(0, 200));
        
//         console.log('\nExecuting SQL...');
//         const result = await supabase.sql(sql);
//         console.log('Raw result:', JSON.stringify(result, null, 2));
        
//         if (result.error) {
//           throw new Error(`SQL Error in ${file}: ${result.error.message}`);
//         }
        
//         console.log(`✓ Successfully executed ${file}`);
//       } catch (error) {
//         console.error(`\n✗ Error processing ${file}:`, error);
//         throw error;
//       }
//     }

//     console.log('\n✓ All migrations completed successfully');
//   } catch (error) {
//     console.error('\n✗ Migration error:', error);
//     process.exit(1);
//   }
// }

// console.log('Starting migration process...');
// runMigrations()
//   .then(() => {
//     console.log('Migration process completed');
//     process.exit(0);
//   })
//   .catch(error => {
//     console.error('Migration process failed:', error);
//     process.exit(1);
//   });
