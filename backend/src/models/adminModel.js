const {db} = require("../config/db");

async function findAdmin(username) {
    const [rows] = await db.query(
        'SELECT * FROM admin WHERE username = ?',
        [username]
    )
    return rows[0] || null
}

async function createAdmin({ username, password, nama, noTelp, role = 'admin' }) {
    const [result] = await db.query(
        'INSERT INTO admin (username, password, nama, noTelp, role) VALUES (?, ?, ?, ?, ?)',
        [username, password, nama, noTelp, role]
    );
    return result.insertId;
}

async function updateAdmin({ id_admin, username, password, nama, noTelp, role }) {
    const [result] = await db.query(
        `UPDATE admin
            SET username = ?,
                password = COALESCE(?, password),
                nama = ?,
                noTelp = COALESCE(?, noTelp),
                role = COALESCE(?, role)
            WHERE id_admin = ?`,
        [username, password, nama, noTelp, role, id_admin]
    );
    return result.affectedRows > 0;
}

module.exports = {
    findAdmin,
    createAdmin,
    updateAdmin
}