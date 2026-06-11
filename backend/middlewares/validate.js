/**
 * Validation Middleware
 * Wraps Zod schema validations for request components: body, query, and params.
 * 
 * If validation fails, returns a formatted 400 response.
 * Otherwise, populates `req.validated` with parsed values and passes execution to next handler.
 */
export const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse({
    body: req.body,
    query: req.query,
    params: req.params
  });

  if (!result.success) {
    const errorDetails = result.error.errors.map((err) => ({
      location: err.path[0],
      field: err.path.slice(1).join('.'),
      message: err.message
    }));

    return res.status(400).json({
      status: 'fail',
      message: 'Validation failed',
      errors: errorDetails
    });
  }

  // Save the validated data back to req context
  req.validated = result.data;
  next();
};
