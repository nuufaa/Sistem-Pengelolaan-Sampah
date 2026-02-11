const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const admin = require("../model/AdminModel");
const petugas = require("../model/PetugasModel");

async function login(req, res){
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
        return res.status(401)({
            message: "Username atau password salah"
        });
    }

    const token = jwt.sign(
        { id: user.id, role: role, name: user.nama},
        process.env.JWT_SECRET,
        { expiresIn: '1d' }
    )

    res.json({
        message: "Login berhasil",
        role,
        token
    });

}

module.exports = { login };