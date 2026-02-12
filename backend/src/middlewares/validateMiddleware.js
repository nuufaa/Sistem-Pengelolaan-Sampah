function validate(requiredFields) {
  return (req, res, next) => {
    console.log('BODY:', req.body);

    for (const field of requiredFields) {
      if (!req.body[field]) {
        return res.status(400).json({
          message: `${field} tidak boleh kosong`
        });
      }
    }

    next();
  };
}

module.exports = validate;
