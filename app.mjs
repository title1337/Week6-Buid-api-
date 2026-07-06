import express from 'express';
import connectionPool from './utils/db.mjs';
import { validateEventId } from './middlewares/validateEventId.mjs';
import { validateEventBody } from './middlewares/validateEventBody.mjs';
import { validateEventsQuery } from './middlewares/validateEventsQuery.mjs';

const app = express();
const port = 5006;

app.use(express.json());

app.get('/health', (req, res) => {
  return res.status(200).json({
    status: 'ok',
  });
});

// TODO: อ่าน API Document แล้วสร้าง routes เองในไฟล์นี้
// [Comment] ดีครับที่ route list events ใช้ validateEventsQuery แยกการ validate query string ออกจาก logic หลักของ route
app.get('/events', validateEventsQuery, async (req, res) => {
  const { page, limit, status } = req.eventsQuery;
  const offset = (page - 1) * limit;

  try {
    const whereClause = status ? 'WHERE status = $1' : '';
    const dataValues = status ? [status, limit, offset] : [limit, offset];
    const countValues = status ? [status] : [];

    // [Comment] เช็ก API document อีกครั้งว่าหน้า list ต้องคืนแค่ event_id/title หรือควรมี field อื่น เช่น event_date, location, status ด้วย
    const dataQuery = `
      SELECT event_id, title
      FROM events
      ${whereClause}
      ORDER BY event_id
      LIMIT $${status ? 2 : 1}
      OFFSET $${status ? 3 : 2}
    `;

    const countQuery = `
      SELECT COUNT(*) AS total_items
      FROM events
      ${whereClause}
    `;

    // [Comment] ดีครับ ตรงนี้ยังใช้ parameterized values อยู่ แม้ query จะมี whereClause แบบ dynamic จึงไม่เอา user input ไปต่อ SQL ตรง ๆ
    const dataResult = await connectionPool.query(dataQuery, dataValues);
    const countResult = await connectionPool.query(countQuery, countValues);

    const totalItems = Number(countResult.rows[0].total_items);
    const totalPages = Math.ceil(totalItems / limit);

    return res.status(200).json({
      message: 'Get events successfully',
      data: dataResult.rows,
      pagination: {
        page,
        limit,
        currentItems: dataResult.rows.length,
        totalItems,
        totalPages,
      },
    });
  } catch (error) {
    console.error('[GET /events] database error:', error.message);

    return res.status(500).json({
      message: 'Server could not get events',
    });
  }
});

app.get('/events/:eventId', validateEventId, async (req, res) => {
  try {
    // [Comment] ดีครับ ใช้ req.eventId ที่ผ่าน validateEventId แล้ว และ query ด้วย $1 ช่วยลดความเสี่ยง SQL injection
    const result = await connectionPool.query(
      `
        SELECT *
        FROM events
        WHERE event_id = $1
      `,
      [req.eventId],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: 'event not found',
      });
    }

    return res.status(200).json({
      message: 'Get event successfully',
      data: result.rows[0],
    });
  } catch (error) {
    console.error('[GET /events/:eventId] database error:', error.message);

    return res.status(500).json({
      message: 'Server could not get event',
    });
  }
});

app.post('/events', validateEventBody, async (req, res) => {
  const { title, description, location, event_date, capacity, status } =
    req.body;

  try {
    // [Comment] ดีครับ INSERT ใช้ placeholder ครบทุก field และ RETURNING * ทำให้รู้ว่า database สร้าง record สำเร็จจริง
    const result = await connectionPool.query(
      `
        INSERT INTO events (title, description, location, event_date, capacity, status)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *
      `,
      [title, description, location, event_date, capacity, status],
    );

    return res.status(201).json({
      message: 'Created event successfully',
      data: result.rows[0],
    });
  } catch (error) {
    console.error('[POST /events] database error:', error.message);

    return res.status(500).json({
      message: 'Server could not create event',
    });
  }
});

app.put(
  '/events/:eventId',
  validateEventId,
  validateEventBody,
  async (req, res) => {
    const { title, description, location, event_date, capacity, status } =
      req.body;

    try {
      // [Comment] ดีครับ UPDATE เช็ก result.rows.length เพื่อแยกเคส not found ออกจากเคส update สำเร็จได้ชัดเจน
      const result = await connectionPool.query(
        `
        UPDATE events
        SET
          title = $1,
          description = $2,
          location = $3,
          event_date = $4,
          capacity = $5,
          status = $6,
          updated_at = CURRENT_TIMESTAMP
        WHERE event_id = $7
        RETURNING *
      `,
        [
          title,
          description,
          location,
          event_date,
          capacity,
          status,
          req.eventId,
        ],
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          message: 'event not found',
        });
      }

      return res.status(200).json({
        message: 'Updated event successfully',
        data: result.rows[0],
      });
    } catch (error) {
      console.error('[PUT /events/:eventId] database error:', error.message);

      return res.status(500).json({
        message: 'Server could not update event',
      });
    }
  },
);

app.delete('/events/:eventId', validateEventId, async (req, res) => {
  try {
    // [Comment] ดีครับ DELETE ใช้ RETURNING * ทำให้ตอบกลับได้ว่า record ที่ลบคืออะไร และรู้ว่า id นี้มีอยู่จริงหรือไม่
    const result = await connectionPool.query(
      `
        DELETE FROM events
        WHERE event_id = $1
        RETURNING *
      `,
      [req.eventId],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: 'event not found',
      });
    }

    return res.status(200).json({
      message: 'Deleted event successfully',
      data: result.rows[0],
    });
  } catch (error) {
    console.error('[DELETE /events/:eventId] database error:', error.message);

    return res.status(500).json({
      message: 'Server could not delete event',
    });
  }
});

app.get('/events/:eventId/registrations', validateEventId, async (req, res) => {
  try {
    // [Comment] ดีครับ bonus endpoint เช็กก่อนว่า event มีอยู่จริง แล้วค่อยดึง registrations ทำให้ 404 ชัดเจนกว่า return array ว่างทันที
    const eventResult = await connectionPool.query(
      `
        SELECT event_id
        FROM events
        WHERE event_id = $1
      `,
      [req.eventId],
    );

    if (eventResult.rows.length === 0) {
      return res.status(404).json({
        message: 'event not found',
      });
    }

    const registrationsResult = await connectionPool.query(
      `
        SELECT registration_id, attendee_name, attendee_email, created_at
        FROM event_registrations
        WHERE event_id = $1
        ORDER BY registration_id
      `,
      [req.eventId],
    );

    return res.status(200).json({
      message: 'Get registrations successfully',
      data: registrationsResult.rows,
    });
  } catch (error) {
    console.error(
      '[GET /events/:eventId/registrations] database error:',
      error.message,
    );

    return res.status(500).json({
      message: 'Server could not get registrations',
    });
  }
});
// [Comment] ก่อนส่งงานจริง แนะนำลบ TODO/Hint ที่เหลือออก เพื่อให้ไฟล์ดูเป็น final submission มากขึ้น
// Hint 1: route ที่มี id ควรใช้ validateEventId จาก middlewares/validateEventId.mjs
// Hint 2: route ที่รับ body ควรใช้ validateEventBody จาก middlewares/validateEventBody.mjs
// Hint 3: pagination ใช้ page, limit, offset = (page - 1) * limit
// Hint 4: status ที่อนุญาตคือ draft, published, cancelled
// Hint 5: INSERT / UPDATE / DELETE ควรใช้ RETURNING * เพื่อรู้ว่า database ทำรายการสำเร็จจริงไหม

app.listen(port, () => {
  console.log(`Event Booking API running at http://localhost:${port}`);
});
