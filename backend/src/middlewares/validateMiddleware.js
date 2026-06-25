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

// sanitasi apabila mau nambah login/registrasi
// const { body, validationResult } = require('express-validator');

// const validatePetugas = [
//   body('nama')
//     .trim()
//     .notEmpty().withMessage('Nama tidak boleh kosong')
//     .isLength({ max: 100 }).withMessage('Nama max 100 karakter')
//     .escape(), // Escape HTML
    
//   body('no_telp')
//     .trim()
//     .matches(/^[0-9\+\-\s]+$/).withMessage('No telp tidak valid')
//     .isLength({ min: 10, max: 15 }),
    
//   body('email')
//     .isEmail().withMessage('Email tidak valid')
//     .normalizeEmail(),
    
//   body('password')
//     .isLength({ min: 8 }).withMessage('Password min 8 karakter')
//     .matches(/[A-Z]/).withMessage('Password harus mengandung huruf besar')
//     .matches(/[0-9]/).withMessage('Password harus mengandung angka'),
    
//   (req, res, next) => {
//     const errors = validationResult(req);
//     if (!errors.isEmpty()) {
//       return res.status(400).json({ errors: errors.array() });
//     }
//     next();
//   }
// ];

// module.exports = { validatePetugas };
