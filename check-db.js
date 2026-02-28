const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function check() {
  try {
    const res = await pool.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'Patient';");
    console.log(res.rows.map(r => r.column_name));
  } catch(e) {
    console.error(e);
  } finally {
    pool.end();
  }
}

check();
