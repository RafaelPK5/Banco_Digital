import mysql from 'mysql2'
import env from 'dotenv'
env.config()

const conection = await mysql.createConnection({
    host:'127.0.0.1',
    user:'root',
    password:'PyKiller@2905',
    database:'banco_digital'
})

export default conection;