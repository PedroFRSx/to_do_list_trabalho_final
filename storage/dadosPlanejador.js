export function lerRegistro(texto) {
  const dados = JSON.parse(texto);
  // Os dados da primeira versão já usam nome e tarefas, mas ainda não têm revisão.
  const revisao = dados?.revisao ?? 0;
  if (
    !Number.isSafeInteger(revisao) || revisao < 0 ||
    typeof dados?.nome !== 'string' || !Array.isArray(dados.tarefas) ||
    !dados.tarefas.every((tarefa) =>
      Number.isSafeInteger(tarefa?.id) && typeof tarefa.titulo === 'string' &&
      typeof tarefa.data === 'string' && typeof tarefa.horario === 'string' &&
      typeof tarefa.concluida === 'boolean'
    )
  ) {
    throw new Error('Dados salvos inválidos.');
  }
  return { nome: dados.nome, tarefas: dados.tarefas, revisao };
}
