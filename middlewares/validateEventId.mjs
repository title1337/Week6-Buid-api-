export function validateEventId(req, res, next) {
  // TODO: eventId มาจาก URL เป็น string ต้องแปลงเป็น number ก่อน
  // ตัวอย่าง URL: /events/1
  // TODO: ถ้า eventId ไม่ใช่ positive integer ให้ return 400
  // message: "Event id must be a positive number"
  // TODO: ถ้าผ่าน validation ให้เก็บเลขที่แปลงแล้วไว้ที่ req.eventId
  const { page, limit, status } = req.query;

  const paresdPage = page ? Number(page) : 1;
  const parsedLimit = limit ? Number(limit) : 5;

  if (Number.isNaN(paresdPage) || paresdPage < 0) {
    return res.status(400).json({
      message: 'page must be a positive number',
    });
  }

  req.validateEventId = {
    page: paresdPage,
    limit: parsedLimit,
    status: status || null,
  };
  next();
}
