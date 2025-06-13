const { ApiError } = require("./errorHandler");

const validate = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const errors = error.details.reduce((acc, detail) => {
        const field = detail.path.join(".");
        if (!acc[field]) {
          acc[field] = [];
        }
        acc[field].push(detail.message);
        return acc;
      }, {});

      throw new ApiError(400, "Validation failed", errors);
    }

    // Replace request body with validated and sanitized data
    req.body = value;
    next();
  };
};

module.exports = validate;
