import express from 'express';
import connectionPool from './utils/db.mjs';
import { validateEventId } from './middlewares/validateEventId.mjs';
import { validateEventBody } from './middlewares/validateEventBody.mjs';

const app = express();
const port = 5006;

app.use(express.json());

app.get('/health', (req, res) => {
  return res.status(200).json({
    status: 'ok',
  });
});

// TODO: อ่าน API Document แล้วสร้าง routes เองในไฟล์นี้
app.get('/events', async (req, res) => {
  let results;
  try {
    results = await connectionPool.query('select * from events');
  } catch {
    return res.status(500).json({
      message: 'Server could not read assignment because database issue',
    });
  }
  return res.status(200).json({
    data: results.rows,
  });
});

// Hint 1: route ที่มี id ควรใช้ validateEventId จาก middlewares/validateEventId.mjs
// Hint 2: route ที่รับ body ควรใช้ validateEventBody จาก middlewares/validateEventBody.mjs
// Hint 3: pagination ใช้ page, limit, offset = (page - 1) * limit
// Hint 4: status ที่อนุญาตคือ draft, published, cancelled
// Hint 5: INSERT / UPDATE / DELETE ควรใช้ RETURNING * เพื่อรู้ว่า database ทำรายการสำเร็จจริงไหม

app.listen(port, () => {
  console.log(`Event Booking API running at http://localhost:${port}`);
});
