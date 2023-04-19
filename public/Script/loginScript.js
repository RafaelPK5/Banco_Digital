// Captura o formulário de login
const form = document.querySelector('#form');
const cadastro = document.querySelector('#cadastre')

function submit(event){
  // Impede o comportamento padrão do formulário de recarregar a página
  event.preventDefault();
  // Captura os valores dos campos de usuário e senha
  const cpf = form.elements.username.value;
  const password = form.elements.password.value;

  // Cria uma instância do objeto XMLHttpRequest
  const xhr = new XMLHttpRequest();

  // Define a URL e o método da requisição
  xhr.open('POST', `http://localhost:3001/?cpf=${cpf}&password=${password}`);

  // Define o cabeçalho da requisição para enviar dados JSON
  xhr.setRequestHeader('Content-Type', 'application/json');
  // Define o callback para a resposta da requisição
  xhr.onreadystatechange = function() {
    if (xhr.readyState === XMLHttpRequest.DONE) {
      if (xhr.status === 200) {
        console.log(xhr.responseText);
      } else {
        console.log('Erro ao realizar login.');
      }
    }
  }

  // Envia a requisição com os dados de usuário e senha no corpo
  xhr.send(JSON.stringify({ cpf, password }));
}
// Adiciona um listener para o evento submit do formulário
// form.addEventListener('submit', submit()
// );

var verifica = false
function cadastre(){
  const request = new XMLHttpRequest();
  request.setRequestHeader('Content-Type', 'application/json');
  xhr.onreadystatechange = function() {
    if (xhr.readyState === XMLHttpRequest.DONE) {
      if (xhr.status === 200) {
        console.log(xhr.responseText);
      } else {
        console.log('Erro ao realizar login.');
      }
    }
  }
  verifica = true
  request.send(JSON.stringify({verifica:'true'}))
}