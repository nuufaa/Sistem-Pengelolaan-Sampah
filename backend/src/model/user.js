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

async function createUser({username, password, role, status=1}) {
    const [result] = await db.query(
        'INSERT INTO users (username, password, role, status) VALUES (?, ?, ?, ?)',
        [username, password, role, status]
    )
    return result.insertId
    
}


module.exports = {
    createUser
}