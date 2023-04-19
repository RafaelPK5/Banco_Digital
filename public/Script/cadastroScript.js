// Captura o formulário de login
const form = document.querySelector('form');

function submit(event){
    console.log('Estamos aqui')
  // Impede o comportamento padrão do formulário de recarregar a página
  event.preventDefault();

  // Captura os valores dos campos de usuário e senha
  const cpf = form.elements.cpf.value;
  const nome = form.elements.cpf.value;
  const email = form.elements.email.value;
  const senha = form.elements.senha.value;
  const telefone = form.elements.telefone.value;
  const endereco = form.elements.endereco.value;

  // Cria uma instância do objeto XMLHttpRequest
  const xhr = new XMLHttpRequest();

  // Define a URL e o método da requisição
  xhr.open('POST', 'http://localhost:3001/cadastro');

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
  xhr.send(JSON.stringify({ cpf, nome, email, senha, telefone, endereco}));
}
// Adiciona um listener para o evento submit do formulário
form.addEventListener('submit', submit()
);
