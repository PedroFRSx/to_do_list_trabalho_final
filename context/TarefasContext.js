import { createContext, useContext, useState } from 'react';

import FormularioTarefa from '@/components/FormularioTarefa';

const TarefasContext = createContext(null);

// Formata no horário local para a data não mudar por causa do fuso.
export function dataLocal(agora, diasAjuste = 0) {
  const data = new Date(agora);
  data.setDate(data.getDate() + diasAjuste);
  const ano = data.getFullYear();
  const mes = String(data.getMonth() + 1).padStart(2, '0');
  const dia = String(data.getDate()).padStart(2, '0');
  return `${ano}-${mes}-${dia}`;
}

function criarTarefasIniciais() {
  const agora = new Date();
  const hoje = dataLocal(agora);
  return [
    { id: 1, titulo: 'Revisar conteúdo da aula', categoria: 'Estudos', horario: '09:00', prioridade: 'Alta', data: hoje, concluida: false },
    { id: 2, titulo: 'Organizar a lista de compras', categoria: 'Casa', horario: '14:30', prioridade: 'Média', data: hoje, concluida: false },
    { id: 3, titulo: 'Fazer uma caminhada', categoria: 'Saúde', horario: '18:00', prioridade: 'Baixa', data: hoje, concluida: true },
    { id: 4, titulo: 'Pagar a conta de internet', categoria: 'Pessoal', horario: 'Ontem', prioridade: 'Alta', data: dataLocal(agora, -1), concluida: false },
  ];
}

export function TarefasProvider({ children }) {
  // As abas consultam e atualizam a mesma lista em memória.
  const [tarefas, setTarefas] = useState(criarTarefasIniciais);
  const [formulario, setFormulario] = useState(null);

  function alterarConclusao(id) {
    setTarefas((atuais) =>
      atuais.map((tarefa) =>
        tarefa.id === id ? { ...tarefa, concluida: !tarefa.concluida } : tarefa
      )
    );
  }

  function salvarTarefa(campos, idEditado) {
    const novaTarefa = { ...campos, id: Date.now(), concluida: false };
    setTarefas((atuais) =>
      idEditado === undefined
        ? [...atuais, novaTarefa]
        : atuais.map((tarefa) =>
            tarefa.id === idEditado ? { ...tarefa, ...campos } : tarefa
          )
    );
    setFormulario(null);
  }

  function excluirTarefa(id) {
    setTarefas((atuais) => atuais.filter((tarefa) => tarefa.id !== id));
    setFormulario(null);
  }

  return (
    <TarefasContext
      value={{
        tarefas,
        aoAlterar: alterarConclusao,
        aoAdicionar: (data) => setFormulario({ data }),
        aoEditar: (tarefa, reagendar) => setFormulario({ tarefa, reagendar }),
      }}>
      {children}
      {/* O mesmo formulário é usado para criar ou editar tarefas pelas abas. */}
      {formulario ? (
        <FormularioTarefa
          tarefa={formulario.tarefa}
          hoje={formulario.data ?? formulario.tarefa?.data}
          reagendar={formulario.reagendar}
          aoSalvar={salvarTarefa}
          aoExcluir={excluirTarefa}
          aoFechar={() => setFormulario(null)}
        />
      ) : null}
    </TarefasContext>
  );
}

export function useTarefas() {
  const contexto = useContext(TarefasContext);
  if (!contexto) throw new Error('A lista precisa do contexto de tarefas.');
  return contexto;
}
