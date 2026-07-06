const allowedStatuses = ['draft', 'published', 'cancelled'];

export function validateEventBody(req, res, next) {
  const event = req.body;

  // [DF Comment] ถ้า API document กำหนดข้อความ response ไว้ ควรเทียบ message ให้ตรง spec อีกครั้ง
  if (!event.title) {
    return res.status(400).json({
      message: 'กรุณาส่งข้อมูล title เข้ามาด้วย',
    });
  }

  if (!event.description) {
    return res.status(400).json({
      message: 'กรุณาส่งข้อมูล description เข้ามาด้วย',
    });
  }

  if (!event.location) {
    return res.status(400).json({
      message: 'กรุณาส่งข้อมูล location เข้ามาด้วย',
    });
  }

  // [DF Comment] ตรงนี้ควร validate รูปแบบวันที่เพิ่ม เพราะตอนนี้เช็กแค่ว่าส่ง event_date มาหรือไม่
  if (!event.event_date) {
    return res.status(400).json({
      message: 'กรุณาส่งข้อมูล event_date เข้ามาด้วย',
    });
  }

  if (event.capacity === undefined) {
    return res.status(400).json({
      message: 'กรุณาส่งข้อมูล capacity เข้ามาด้วย',
    });
  }

  const isPositiveInteger =
    Number.isInteger(event.capacity) && event.capacity > 0;

  if (!isPositiveInteger) {
    return res.status(400).json({
      message: 'capacity ต้องเป็นจำนวนเต็ม และต้องมากกว่า 0',
    });
  }

  if (!event.status) {
    return res.status(400).json({
      message: 'กรุณาส่งข้อมูล status เข้ามาด้วย',
    });
  }

  if (!allowedStatuses.includes(event.status)) {
    return res.status(400).json({
      message: 'status ต้องเป็น draft, published หรือ cancelled เท่านั้น',
    });
  }

  next();
}
