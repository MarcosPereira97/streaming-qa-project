const { ApiError } = require("./errorHandler");

const validate = (schema, property = "body") => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[property], {
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

    // Replace request property with validated and sanitized data
    req[property] = value;
    next();
  };
};

module.exports = validate;
