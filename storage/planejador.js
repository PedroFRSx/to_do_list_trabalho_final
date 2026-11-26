import { File, Paths } from 'expo-file-system';

import { lerRegistro } from './dadosPlanejador';

const nomesArquivos = ['planejador-hoje.json', 'planejador-reserva.json'];

export function carregarPlanejador() {
  let ultimoRegistro = null;
  let erroDeLeitura;

  for (const nome of nomesArquivos) {
    try {
      const arquivo = new File(Paths.document, nome);
      if (!arquivo.exists) continue;
      const registro = lerRegistro(arquivo.textSync());
      if (!ultimoRegistro || registro.revisao > ultimoRegistro.revisao) {
        ultimoRegistro = registro;
      }
    } catch (erro) {
      erroDeLeitura = erro;
    }
  }

  if (!ultimoRegistro && erroDeLeitura) throw erroDeLeitura;
  return ultimoRegistro;
}

export function salvarPlanejador(dados) {
  // Alterna os arquivos para preservar a última cópia se a gravação for interrompida.
  const destino = new File(Paths.document, nomesArquivos[dados.revisao % 2]);
  const temporario = new File(Paths.document, 'planejador-temporario.json');
  const conteudo = JSON.stringify(dados);
  temporario.create({ overwrite: true });
  temporario.writeSync(conteudo);
  temporario.moveSync(destino, { overwrite: true });
}
