import { seedDatabase } from '../src/lib/server/db/seed.js';

console.log('Seeding database...');
await seedDatabase();
console.log('Database seeded successfully!');
