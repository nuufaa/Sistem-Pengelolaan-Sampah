const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const admin = require("../model/adminModel");
const petugas = require("../model/petugasModel");

async function loginUser(req, res){
    const { username, password} = req.body

    let user = await admin.findAdmin(username);
    let role = "admin";

    if(!user){
        user = await petugas.findPetugas(username);
        role = "petugas";
    }

    if(!user){
        return res.status(401).json({
            message: "Username atau password salah"
        });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        return res.status(401).json({
            message: "Username atau password salah"
        });
    }

    let userId;

    if (role === "admin") {
        userId = user.id_admin;
    } else {
        userId = user.id_petugas;
    }

    const token = jwt.sign(
        { id: userId, role: role, name: user.nama},
        process.env.JWT_SECRET,
        { expiresIn: '1d' }
    )

    res.json({
        message: "Login berhasil",
        role,
        token
    });

}

module.exports = { loginUser };