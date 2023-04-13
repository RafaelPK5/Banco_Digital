import express from 'express'
import db from '../db/conect.js'
import path from 'path'

const app = express()

app.get('/', (req,res)=>{
    const filePath = path.resolve('./public/login.html')
    res.sendFile(path.join(filePath))
})

export default app;