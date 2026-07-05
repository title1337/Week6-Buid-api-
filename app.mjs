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
app.get('/events', validateEventsQuery, async (req, res) => {
  const { page, limit, status } = req.eventsQuery;
  const offset = (page - 1) * limit;

  try {
    const whereClause = status ? 'WHERE status = $1' : '';
    const dataValues = status ? [status, limit, offset] : [limit, offset];
    const countValues = status ? [status] : [];

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

app.get('/events/:eventId', async (req, res) => {
  try {
    const eventId = req.params.eventId;

    if (!Number.isInteger(Number(eventId)) || Number(eventId) <= 0) {
      return res.status(400).json({
        message: 'Invalid event id',
      });
    }

    const result = await connectionPool.query(
      `
        SELECT *
        FROM events
        WHERE event_id = $1
      `,
      [eventId],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: 'Event not found',
      });
    }

    return res.status(200).json({
      message: 'Get Event successfully',
      data: result.rows[0],
    });
  } catch (error) {
    console.error('[GET /events/:eventId] database error:', error.message);

    return res.status(500).json({
      message: 'Server could not get Event',
    });
  }
});
// Hint 1: route ที่มี id ควรใช้ validateEventId จาก middlewares/validateEventId.mjs
// Hint 2: route ที่รับ body ควรใช้ validateEventBody จาก middlewares/validateEventBody.mjs
// Hint 3: pagination ใช้ page, limit, offset = (page - 1) * limit
// Hint 4: status ที่อนุญาตคือ draft, published, cancelled
// Hint 5: INSERT / UPDATE / DELETE ควรใช้ RETURNING * เพื่อรู้ว่า database ทำรายการสำเร็จจริงไหม

app.listen(port, () => {
  console.log(`Event Booking API running at http://localhost:${port}`);
});
