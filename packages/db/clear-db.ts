import postgres from "postgres";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env" });

async function clearAllData() {
  console.log("Connecting to database to clear all data...");
  const sql = postgres(process.env.DATABASE_URL!);
  try {
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
        AND table_type = 'BASE TABLE'
        AND table_name NOT LIKE '__drizzle%';
    `;

    console.log("Found tables to clear:", tables.map(t => t.table_name));

    if (tables.length > 0) {
      const tableNames = tables.map(t => `"${t.table_name}"`).join(", ");
      console.log(`Truncating tables: ${tableNames}`);
      await sql.unsafe(`TRUNCATE TABLE ${tableNames} CASCADE;`);
      console.log("✅ All application tables truncated successfully with CASCADE.");
    } else {
      console.log("No tables found to truncate.");
    }
  } catch (error) {
    console.error("❌ Error clearing database:", error);
  } finally {
    await sql.end();
    process.exit(0);
  }
}

clearAllData();
