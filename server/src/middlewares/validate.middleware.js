const AppError = require("../utils/AppError");

const validate = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body);

    if (error) {
      return next(new AppError(error.details[0].message, 400));
    }
    return next();
  };
};

module.exports = validate;
