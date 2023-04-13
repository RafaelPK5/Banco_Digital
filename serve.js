import express from 'express'
import rotas from './src/app.js'

const port = 3000

const app = express()

app.use('/', rotas)


















app.listen(port,()=>console.log(`estamos online na ${port}`))