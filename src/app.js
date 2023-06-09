import exp from 'express'
import validarCPF from '../controller/valida.js'
import front from 'express-handlebars'
import db from '../db/conect.js'
import bodyParser from 'body-parser'
import { LocalStorage } from 'node-localstorage';
import moment from 'moment'
import fs from 'fs'
import PDFDocument from 'pdfkit'
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

// Inicio
app.get('/', (req, res) => {
  res.render('login')
})

// Rota de Login
app.post('/login', async (req, res) => {
  localStorage.clear();
  const usuario = req.body.cpf;
  const cpf = usuario.replace(/[^\d]/g, "")
  const senha = req.body.password;

  const query = db.execute(`select u.cpf, u.senha, c.num_conta from usuarios u, contas c where cpf = ? and senha = ?`, [cpf, senha], (err, result) => {
    if (err) throw err;
    console.log(result);
    if (!result.length == 0) {
      if (result[0].cpf == cpf) {
        if (result[0].senha == senha) {
          console.log('logado!');
          localStorage.setItem('cpf', cpf);
          res.redirect('/dashboard');
        }
      }
    } else {
      console.log("Credenciais inválidas!");
      const errorMessage = "Credenciais inválidas!";
      const errorPopup = `<div id="errorPopup" class="popup">
                              <h3>${errorMessage}</h3>
                          </div>`;
      res.render('login', { errorPopup });
    }
  });
});

// Rota do dashboard
app.get('/dashboard', async (req, res) => {
  const conta = localStorage.getItem('cpf')
  var valorTela
  await db.execute('SELECT saldo from contas WHERE usuario_id = (SELECT id FROM usuarios WHERE cpf = ?)', [conta], (err, result) => {
    valorTela = result[0].saldo
    res.render('dashboard', { cssPath: '/public/CSS/dashboard.css', saldo: valorTela })
  })
})

// rota de deposito
app.get('/deposito', (req, res) => {
  res.render('deposito')
})

// Logica de Deposito
app.post('/logDeposito', async (req, res) => {
  const data = moment().format('DD/MM/YYYY HH:mm:ss')
  const body = req.body.valor
  const cpf = localStorage.getItem('cpf')
  var [rows, fields] = await db.promise().query('select saldo from contas where usuario_id = (select id from usuarios where cpf = ?)', [cpf])
  const saldo = rows[0].saldo
  const valor = parseInt(saldo) + parseInt(body)
  await db.execute('update contas set saldo = ? where usuario_id = (select id from usuarios where cpf = ?)', [valor, cpf])
  await db.execute('Insert into transferencia(conta_origem, conta_destino, valor, data, tipo)values(?,?,?,?,?)', [cpf, null, body, data, "Depósito"])
  res.redirect('/dashboard')
})

//  Rota de Saque
app.get('/saque', (req, res) => {
  res.render('saque')
})

// Logica de Saque
app.post('/logSaque', async (req, res) => {
  const errorMessage = "Senha inválida!";
  const errorPopup = `<div id="errorPopup" class="popup">
                              <h3>${errorMessage}</h3>
                          </div>`;
  const data = moment().format('DD/MM/YYYY HH:mm:ss')
  try {
    const body = req.body.valor
    const senha = req.body.senha
    const cpf = localStorage.getItem('cpf')
    var [rows, fields] = await db.promise().query('select saldo from contas where usuario_id = (select id from usuarios where cpf = ? and senha = ?)', [cpf, senha])
    const saldo = rows[0].saldo
    const valor = parseInt(saldo) - parseInt(body)
    await db.execute('update contas set saldo = ? where usuario_id = (select id from usuarios where cpf = ?)', [valor, cpf])
    await db.execute('Insert into transferencia(conta_origem, conta_destino, valor, data, tipo)values(?,?,?,?,?)', [cpf, null, body, data, "Saque"])
    res.redirect('/dashboard')
  } catch (error) {
    res.render('saque', { errorPopup })
  }
})

// Rota de Cadastro
app.get('/cadastro', (req, res) => {
  res.render('cadastro')
})

// Rota de Registro
app.post('/registro', async (req, res) => {
  const errorMessage = "Credenciais inválidas!";
  const errorPopup = `<div id="errorPopup" class="popup">
                              <h3>${errorMessage}</h3>
                          </div>`;
  if (validarCPF(req.body.CPF)) {
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
      res.redirect('/');
    } catch (err) {
      res.render('/cadastro');
    }
  } else {
    var alertMessage = "O CPF informado não é válido.";
    res.render('cadastro', { errorPopup });
  }
});

// rota de tranferencia
app.get('/transferencia', (req, res) => {
  res.render('transferencia')
})

// Logica de Transferencia 
app.post('/logTransferencia', async (req, res) => {
  console.log(req.body)
  const cpf = localStorage.getItem('cpf')
  const senha = req.body.senha
  let [lista, campos] = await db.promise().query('select senha from usuarios where cpf = ?', [cpf])
  console.log(lista)
  if (lista[0].senha == senha) {
    const cpfDest = req.body.cpfDest;
    const valorT = req.body.valor;
    const data = moment().format('DD/MM/YYYY HH:mm:ss')
    let [rows, fileds] = await db.promise().query('select saldo from contas where usuario_id = (select id from usuarios where cpf = ?)', [cpf])
    let [row, field] = await db.promise().query('select saldo from contas where usuario_id = (select id from usuarios where cpf = ?)', [cpfDest])
    let valor1 = parseInt(rows[0].saldo) - parseInt(valorT);
    let valorDest = parseInt(row[0].saldo) + parseInt(valorT);
    await db.execute('update contas set saldo = ? where usuario_id = (select id from usuarios where cpf = ?)', [valor1, cpf])
    await db.execute('update contas set saldo = ? where usuario_id = (select id from usuarios where cpf = ?)', [valorDest, cpfDest])
    await db.execute('Insert into transferencia(conta_origem,conta_destino, valor, data, tipo)values(?,?,?,?,?)', [cpf, cpfDest, valorT, data, "PIX"])
    let [r, f] = await db.promise().query('select nome from usuarios where cpf = ?', [cpf])
    let [ro, fi] = await db.promise().query('select nome from usuarios where cpf = ?', [cpfDest])
    try {
      // Criar o comprovante em PDF
      const doc = new PDFDocument();
      const writeStream = fs.createWriteStream('comprovante.pdf');

      doc.pipe(writeStream);
      doc.image('public/Imagens/4KBank.png', {
        width: 100,
        height: 100,
        x: doc.page.width / 2 - 50,
        y: 50,
        align: 'center'
      });
      doc.moveDown();
      doc.moveDown();
      doc.moveDown();
      doc.moveDown();
      doc.moveDown();
      doc.moveDown();
      doc.moveDown();
      doc.fontSize(17)

      doc.text('COMPROVANTE DE TRANSFERÊNCIA', { align: 'center' });
      doc.moveDown();
      doc.moveDown();
      doc.text(`CPF de origem: ${cpf}`, { indent: 20 });
      doc.text(`Nome: ${r[0].nome}`, { indent: 20 })
      doc.moveDown();
      doc.moveDown();
      doc.text(`CPF de destino: ${cpfDest}`, { indent: 20 });
      doc.text(`Nome: ${ro[0].nome}`, { indent: 20 })
      doc.moveDown();
      doc.moveDown();
      doc.text(`Valor transferido: R$ ${valorT}`, { indent: 20 });
      doc.text(`Data da Tranferencia: ${data}`, { indent: 20 })
      doc.moveDown();

      doc.end();
      // Enviar o comprovante em PDF como resposta da requisição
      writeStream.on('finish', () => {
        res.setHeader('Content-Disposition', 'attachment; filename=comprovante.pdf');
        res.contentType('application/pdf');
        fs.createReadStream('comprovante.pdf').pipe(res);
      });
    } catch (error) {
      console.log(error);
    }
  } else {
    const errorMessage = "Senha inválida!";
    const errorPopup = `<div id="errorPopup" class="popup">
                              <h3>${errorMessage}</h3>
                          </div>`;
    res.render('transferencia', { errorPopup })
  }

})

app.get('/extrato', async (req, res) => {
  const cpf = localStorage.getItem('cpf')
  const [rows, fields] = await db.promise().query('SELECT valor, data, tipo from transferencia where conta_origem = ? or conta_destino = ?', [cpf, cpf])
  res.render('extrato', { rows })
})
export default app;