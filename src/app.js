import exp from 'express'
import front from 'express-handlebars'
import db from '../db/conect.js'
import bodyParser from 'body-parser'
import { LocalStorage } from 'node-localstorage';
import comprovante from './appComp.js'
import moment from 'moment'
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

app.get('/transferencia', (req, res) => {
  res.render('transferencia')
})

app.get('/deposito', (req, res) => {
  res.render('deposito')
})

app.get('/saque', (req, res) => {
  res.render('saque')
})

app.get('/dashboard', async (req, res) => {
  const conta = localStorage.getItem('cpf')
  var valorTela
  await db.execute('SELECT saldo from contas WHERE usuario_id = (SELECT id FROM usuarios WHERE cpf = ?)', [conta], (err, result) => {
    valorTela = result[0].saldo
    res.render('dashboard', { cssPath: '/public/CSS/dashboard.css', saldo: valorTela })
  })
})

app.get('/cadastro', (req, res) => {
  res.render('cadastro')
})

app.post('/logDeposito', async (req, res) => {
  const body = req.body.valor
  const cpf = localStorage.getItem('cpf')
  var [rows, fields] = await db.promise().query('select saldo from contas where usuario_id = (select id from usuarios where cpf = ?)', [cpf])
  const saldo = rows[0].saldo
  const valor = parseInt(saldo) + parseInt(body)
  await db.execute('update contas set saldo = ? where usuario_id = (select id from usuarios where cpf = ?)', [valor, cpf])
  res.redirect('/dashboard')
})

app.post('/logSaque', async (req, res) => {
  const body = req.body.valor
  const cpf = localStorage.getItem('cpf')
  var [rows, fields] = await db.promise().query('select saldo from contas where usuario_id = (select id from usuarios where cpf = ?)', [cpf])
  const saldo = rows[0].saldo
  const valor = parseInt(saldo) - parseInt(body)
  await db.execute('update contas set saldo = ? where usuario_id = (select id from usuarios where cpf = ?)', [valor, cpf])
  res.redirect('/dashboard')
})

app.post('/login', async (req, res) => {
  localStorage.clear()
  const cpf = req.body.cpf
  const senha = req.body.password

  const query = db.execute(`select u.cpf, u.senha, c.num_conta from usuarios u, contas c where cpf = ? and senha = ?`, [cpf, senha], (err, result) => {
    if (err) throw err
    console.log(result)
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
      res.redirect('/cadastro');
    }
  } else {
    res.redirect('/cadastro');
  }
});

app.post('/logTransferencia', async (req, res) => {
  console.log(req.body)
  const cpf = localStorage.getItem('cpf')
  const cpfDest = req.body.cpfDest;
  const valorT = req.body.valor;
  const data = moment().format('DD/MM/YYYY HH:mm:ss')
  console.log(data)
  let [rows, fileds] = await db.promise().query('select saldo from contas where usuario_id = (select id from usuarios where cpf = ?)', [cpf])
  let [row, field] = await db.promise().query('select saldo from contas where usuario_id = (select id from usuarios where cpf = ?)', [cpfDest])
  let valor1 = parseInt(rows[0].saldo) - parseInt(valorT);
  let valorDest = parseInt(row[0].saldo) + parseInt(valorT);
  await db.execute('update contas set saldo = ? where usuario_id = (select id from usuarios where cpf = ?)', [valor1, cpf])
  await db.execute('update contas set saldo = ? where usuario_id = (select id from usuarios where cpf = ?)', [valorDest, cpfDest])
  await db.execute('Insert into transferencia(conta_origem,conta_destino, valor, data)values(?,?,?,?)',[cpf,cpfDest,valorT,data])
  setTimeout(() => {
    res.redirect('/dashboard')
  },2000)
})

export default app;