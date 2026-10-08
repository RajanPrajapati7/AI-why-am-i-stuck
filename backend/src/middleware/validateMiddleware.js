export const validate = (schema) => (req, res, next) => {
  try {
    const validated = schema.parse(req.body);
    req.body = validated;
    next();
  } catch (error) {
    const errors = error.errors?.map((err) => ({
      field: err.path.join('.'),
      message: err.message,
    })) || [{ message: error.message }];

    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors,
    });
  }
};
