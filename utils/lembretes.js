export const opcoesLembrete = [null, 5, 15, 30];

// A data e a hora da tarefa são interpretadas no fuso do aparelho.
export function horarioDaTarefa({ data, horario }) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(data) || !/^([01]\d|2[0-3]):[0-5]\d$/.test(horario)) {
    return NaN;
  }
  return new Date(`${data}T${horario}:00`).getTime();
}

export function chaveLembrete(tarefa) {
  return [tarefa.id, tarefa.data, tarefa.horario, tarefa.lembreteMinutos].join('|');
}

export function buscarAviso(tarefas, agora, dispensados) {
  return tarefas.find((tarefa) => {
    const minutos = tarefa.lembreteMinutos;
    if (tarefa.concluida || !minutos || dispensados[tarefa.id] === chaveLembrete(tarefa)) {
      return false;
    }
    const horario = horarioDaTarefa(tarefa);
    return agora >= horario - minutos * 60_000 && agora <= horario;
  });
}
