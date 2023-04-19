import express from 'express'
import rotas from './src/app.js'
import bodyParser from 'body-parser'



const app = express()

const port = 3001

app.use(bodyParser.urlencoded({extended:true}))
app.use('/public', express.static('public'));


app.use('/', rotas)














app.listen(port,()=>console.log(`estamos online na ${port}`))