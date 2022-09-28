const mysql = require("mysql2");
require("dotenv").config();

const connection = mysql.createConnection({
    host: "localhost",
    
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
}

);

connection.connect(function (err){
    if (err) console.log(err);
    console.log("connected as id " + connection.threadId);
    console.log(`WELCOME TO EMPLOYEE TRACKER`);
    
})

module.exports = connection;