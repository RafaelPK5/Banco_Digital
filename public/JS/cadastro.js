const form = document.getElementById('cadastro-form');
const alertMessage = document.getElementById('alert-message');

form.addEventListener('submit', async (event) => {
  event.preventDefault();

  const cpf = document.getElementById('cpf').value;
  const nome = document.getElementById('nome').value;
  const email = document.getElementById('email').value;
  const senha = document.getElementById('senha').value;
  const telefone = document.getElementById('telefone').value;
  const endereco = document.getElementById('endereco').value;

  try {
    const response = await axios.post('/registro', {
      CPF: cpf,
      Nome: nome,
      Email: email,
      Senha: senha,
      Telefone: telefone,
      Endereco: endereco
    });

    alertMessage.innerHTML = '';
    alertMessage.classList.add('hidden');

    window.location.href = '/';
  } catch (error) {
    alertMessage.innerHTML = error.response.data.alertMessage;
    alertMessage.classList.remove('hidden');
  }
});
