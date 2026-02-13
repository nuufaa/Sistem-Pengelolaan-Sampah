const jwt = require("jsonwebtoken");

// Mengecek dan memverifikasi JWT token, Menyimpan payload ke req.user
function auth(req, res, next) {

  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({
      message: "Token tidak ditemukan"
    });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();

  } catch (error) {
    return res.status(401).json({
      message: "Token tidak valid"
    });
  }
}

function isAdmin(allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        message: "User tidak terautentikasi"
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        message: "Akses ditolak"
      });
    }

    next();
  };
}


module.exports = { auth, isAdmin };
