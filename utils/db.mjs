import * as pg from 'pg';

const { Pool } = pg;

// แก้ข้อมูล connection ให้ตรงกับ database ในเครื่อง
const connectionPool = new Pool({
  user: 'postgres',
  password: 'postgrespassword',
  host: 'localhost',
  port: 5432,
  database: 'week6',
});

export default connectionPool;
