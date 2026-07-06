const allowedStatuses = ['draft', 'published', 'cancelled'];

export function validateEventsQuery(req, res, next) {
  const { page, limit, status } = req.query;

  const parsedPage = page ? Number(page) : 1;
  const parsedLimit = limit ? Number(limit) : 5;

  if (!Number.isInteger(parsedPage) || parsedPage <= 0) {
    return res.status(400).json({
      message: 'page must be a positive number',
    });
  }

  // [DF Comment] ตรงนี้ควรเช็ก parsedLimit <= 0 เพิ่มด้วย เพื่อไม่ให้ limit=0 หรือค่าติดลบผ่าน validation
  if (!Number.isInteger(parsedLimit) || parsedLimit > 10) {
    return res.status(400).json({
      message: 'limit must not be more than 10',
    });
  }

  if (status && !allowedStatuses.includes(status)) {
    return res.status(400).json({
      message: 'status must be draft, published or cancelled',
    });
  }

  req.eventsQuery = {
    page: parsedPage,
    limit: parsedLimit,
    status: status || null,
  };
  next();
}
