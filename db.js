/** Database setup for BizTime. */

const {Client} = require('pg');

let DB_URI;


/*** SPRINGBOARD METHOD ***/


if (process.env.NODE_ENV === "test") {
  DB_URI = "postgresql:///test_biztime";
} else {
  DB_URI = "postgresql:///biztime";
}

let db = new Client({
    connectionString: DB_URI
});


/*** END SPRINGBOARD METHOD ***/



/*** MY METHOD ***/


// DB_URI = {
//     host: "localhost",
//     user: "", // your username 
//     password: "", // your password
//     database: "" // LEAVE BLANK
// }

// DB_URI.database = (process.env.NODE_ENV === 'test') ? "test_biztime" : "biztime";

// let db = new Client(DB_URI);


/*** END MY METHOD ***/


db.connect()

module.exports = db;