export function validateEventId(req, res, next) {
  // TODO: eventId มาจาก URL เป็น string ต้องแปลงเป็น number ก่อน
  // ตัวอย่าง URL: /events/1
  // TODO: ถ้า eventId ไม่ใช่ positive integer ให้ return 400
  // message: "Event id must be a positive number"
  // TODO: ถ้าผ่าน validation ให้เก็บเลขที่แปลงแล้วไว้ที่ req.eventId
  const { eventId } = req.params;
  const parsedEventId = Number(eventId);

  if (!Number.isInteger(parsedEventId) || parsedEventId <= 0) {
    return res.status(400).json({
      message: 'Event id must be a positive number',
    });
  }

  req.eventId = parsedEventId;
  next();
}
