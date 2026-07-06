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

  if (!Number.isInteger(parsedLimit <= 0) || parsedLimit > 10) {
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
