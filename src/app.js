import exp from 'express'
import front from 'express-handlebars'
import db from '../db/conect.js'
import bodyParser from 'body-parser'

const app = exp()

app.use(bodyParser.urlencoded({extended:false}))
app.use(bodyParser.json())

const handlebars = front.create({ 
    defaultLayout: 'main',
    extname: '.handlebars' // define a extensão dos arquivos handlebars
});

app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');

app.get('/', (req,res)=>{
    res.render('login')
})

app.post('/login', async (req,res)=>{
    console.log("cheguei aqui")
    const cpf = req.body.cpf
    const senha = req.body.password
    console.log(cpf, senha)
    const query = db.execute(`select cpf, senha from usuarios where cpf = ? and senha = ?`,[cpf,senha],(err, result)=>{
        if(err) throw err
        console.log(result)
        if(!result.length == 0) {
            if (result[0].cpf == cpf) {
                if(result[0].senha == senha){
                    console.log('logado!')
                    res.render('dashboard', {cssPath:'/public/CSS/dashboard.css'})
                }
            }
        }else{ 
            console.log("Credenciais inválidas!")
            res.redirect('/')
        }
        console.log(result)
    })
})

app.get('/test',(req,res)=>{
    db.execute(`select * from usuarios`,(err,result)=>{
        console.log(result)
    })
})

export default app