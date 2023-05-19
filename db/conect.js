import mysql from 'mysql2'
import env from 'dotenv'
env.config()

const conection = mysql.createConnection({
    host:process.env.IP,
    user:'root',
    password:process.env.PASSWORD,
    database:'banco_digital'
})

export default conection;