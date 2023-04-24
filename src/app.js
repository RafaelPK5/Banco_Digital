import exp from 'express'
import front from 'express-handlebars'
import db from '../db/conect.js'
import bodyParser from 'body-parser'
import { LocalStorage } from 'node-localstorage';
const localStorage = new LocalStorage('./localStorage');

const app = exp()

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

const handlebars = front.create({
  defaultLayout: 'main',
  extname: '.handlebars',
  partialsDir: 'views/partials' // define a extensão dos arquivos handlebars
});

app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');

app.get('/', (req, res) => {
  res.render('login')
})

app.get('/dashboard', async (req, res)=>{
  const conta = localStorage.getItem('cpf')
  var valorTela
  await db.execute('SELECT saldo from contas WHERE usuario_id = (SELECT id FROM usuarios WHERE cpf = ?)', [conta], (err, result)=>{
    valorTela = result[0].saldo
    res.render('dashboard', { cssPath: '/public/CSS/dashboard.css', saldo:valorTela})
  })
})

app.get('/cadastro', (req, res) => {
  console.log(req.body)
  console.log(req.query)
  res.render('cadastro')
})

app.post('/login', async (req, res) => {
  const cpf = req.body.cpf
  const senha = req.body.password
  const query = db.execute(`select cpf, senha from usuarios where cpf = ? and senha = ?`, [cpf, senha], (err, result) => {
    if (err) throw err
    if (!result.length == 0) {
      if (result[0].cpf == cpf) {
        if (result[0].senha == senha) {
          console.log('logado!')
          localStorage.setItem('cpf', cpf)
          res.redirect('/dashboard')
        }
      }
    } else {
      console.log("Credenciais inválidas!")
      res.redirect('/')
    }
    // console.log(result)
  })
  console.log("cheguei aqui")
})


app.post('/registro', async (req, res) => {
  if (req.body.CPF.length == 11) {
    try {
      const params = [null, req.body.CPF, req.body.Nome, req.body.Email, req.body.Senha, req.body.Telefone, req.body.Endereco];
      if (params.some(param => param === undefined)) {
        throw new Error('Um ou mais parâmetros de ligação são undefined');
      }
      const result = await db.promise().execute('INSERT INTO usuarios(id,cpf, nome, email, senha, telefone, endereco) values(?,?,?,?,?,?,?)', params);
      const id_usuario = result[0].insertId;
      const num_conta = Math.floor(Math.random() * 900000) + 100000;
      const params2 = [id_usuario, 'Corrente', 0.0, num_conta];
      if (params2.some(param => param === undefined)) {
        throw new Error('Um ou mais parâmetros de ligação são undefined');
      }
      const resultado = await db.promise().execute("INSERT INTO contas(usuario_id,tipo,saldo,num_conta) VALUES (?,?,?,?)", params2);
      console.log(resultado);
      res.redirect('/');
    } catch (err) {
      console.error(err);
      res.redirect('/cadastro');
    }
  } else {
    res.redirect('/cadastro');
  }
});

app.get('/test', (req, res) => {
  db.query('select * from usuarios', (err, result) => {
    console.log(result)
    res.send(result)
  })
})

export default app