const db = require("../config/db");

// const user = {
//     findbyUsername: async (username) => {
//         const[rows] = await db.query(
//             "SELECT * FROM users WHERE username = ?", 
//             [username]
//         );
//         return rows[0] || null;
//     },
// }

async function findAdmin(username) {
    const [rows] = await db.query(
        'SELECT * FROM admin WHERE username = ?',
        [username]
    )
    return rows[0] || null
    
}

async function createAdmin({username, password, nama, noTelp}) {
    const [result] = await db.query(
        'INSERT INTO users (username, password, nama, noTelp) VALUES (?, ?, ?, ?)',
        [username, password, nama, noTelp]
    )
    return result.insertId
    
}

async function updateAdmin(idAdmin) {
    const [result] = await db.query(
        'UPDATE admin SET username=?, password=?, namaAdmin=?, noTelp',
        [username, pasword, nama, noTelp, idAdmin]
    )
    return result.affectedRows > 0

}


module.exports = {
    findAdmin,
    createAdmin,
    updateAdmin
}