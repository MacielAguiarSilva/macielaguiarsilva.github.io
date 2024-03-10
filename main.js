var input = document.getElementById('input')
var conta = ''
function num(number) {
  conta += number;
  input.innerText += number;
}
function op(operador) {
  var cntLast = conta.substring(conta.length-1,conta.length);
  if (cntLast !=='*' && cntLast !=='/' && cntLast !=='-' && cntLast !=='+' && cntLast !=='') {
    conta += operador;
    switch (operador) {
      case '*':
        input.innerText += '×';
        break;
      case '/':
        input.innerText += '÷';
        break;
      default:
        input.innerText += operador;
    }
  }
}
function res() {
  if (conta !== '') {
    conta = `${eval(conta)}`;
    input.innerText = conta;
  }
}
function allDel() {
  conta = '';
  input.innerText = conta;
}
function del() {
  conta = conta.substring(0, conta.length - 1);
  input.innerText = input.innerText.substring(0, input.innerText.length - 1);
}
function por100() {
  input.innerText = conta;
  conta = `${eval(conta / 100)}`;
  input.innerText += '%';
  conta += '*';
}
var numParentes=4;
function parenteses() {
  if (numParentes % 2 == 0) {
    conta += '(';
    input.innerText += '(';
  } else {
    conta += ')';
    input.innerText += ')';
  }
  numParentes+=1;
}
