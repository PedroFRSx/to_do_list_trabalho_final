import { lerRegistro } from './dadosPlanejador';

const chave = '@trabalho-final/planejador-hoje';

export function carregarPlanejador() {
  const texto = window.localStorage.getItem(chave);
  return texto === null ? null : lerRegistro(texto);
}

export function salvarPlanejador(dados) {
  window.localStorage.setItem(chave, JSON.stringify(dados));
}
