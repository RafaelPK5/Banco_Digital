export default function validarCPF(cpf) {
    cpf = cpf.replace(/[^\d]+/g,''); // remove caracteres não numéricos
    if (cpf.length !== 11) return false; // CPF deve ter 11 dígitos
  
    // Verifica se todos os dígitos são iguais (ex. 111.111.111-11)
    var todosIguais = true;
    for (var i = 0; i < cpf.length - 1; i++) {
      if (cpf[i] !== cpf[i+1]) {
        todosIguais = false;
        break;
      }
    }
    if (todosIguais) return false;
  
    // Calcula os dígitos verificadores
    var soma1 = 0, soma2 = 0;
    for (var i = 0; i < 9; i++) {
      soma1 += parseInt(cpf[i]) * (10 - i);
      soma2 += parseInt(cpf[i]) * (11 - i);
    }
    soma2 += parseInt(cpf[9]) * 2;
    var digito1 = 11 - soma1 % 11;
    if (digito1 > 9) digito1 = 0;
    var digito2 = 11 - soma2 % 11;
    if (digito2 > 9) digito2 = 0;
  
    // Verifica se os dígitos calculados são iguais aos informados
    if (digito1 === parseInt(cpf[9]) && digito2 === parseInt(cpf[10])) {
      return true;
    } else {
      return false;
    }
  }