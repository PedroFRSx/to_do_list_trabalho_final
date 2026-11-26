import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, AppState, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import FormularioTarefa from '@/components/FormularioTarefa';
import { carregarPlanejador, salvarPlanejador } from '@/storage/planejador';

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
  // Todas as telas consultam e atualizam a mesma lista.
  const [tarefas, setTarefas] = useState(criarTarefasIniciais);
  const [nome, setNome] = useState('Pedro');
  const [formulario, setFormulario] = useState(null);
  const [agora, setAgora] = useState(() => Date.now());
  const [estadoLeitura, setEstadoLeitura] = useState('carregando');
  const [tentativaLeitura, setTentativaLeitura] = useState(0);
  const [erroAoSalvar, setErroAoSalvar] = useState(false);
  const [tentativaGravacao, setTentativaGravacao] = useState(0);
  const ultimaRevisao = useRef(0);

  useEffect(() => {
    try {
      const registro = carregarPlanejador();
      if (registro) {
        setNome(registro.nome);
        setTarefas(registro.tarefas);
        ultimaRevisao.current = registro.revisao;
      }
      setEstadoLeitura('pronto');
    } catch {
      setEstadoLeitura('erro');
    }
  }, [tentativaLeitura]);

  useEffect(() => {
    // Só grava depois da leitura inicial, para manter os dados das sessões anteriores.
    if (estadoLeitura !== 'pronto') return;
    try {
      const revisao = ultimaRevisao.current + 1;
      salvarPlanejador({ nome, tarefas, revisao });
      ultimaRevisao.current = revisao;
      setErroAoSalvar(false);
    } catch {
      setErroAoSalvar(true);
    }
  }, [estadoLeitura, nome, tarefas, tentativaGravacao]);

  useEffect(() => {
    // Atualiza a janela dos lembretes inclusive ao voltar para o app.
    const intervalo = setInterval(() => setAgora(Date.now()), 10_000);
    const assinatura = AppState.addEventListener('change', (estado) => {
      if (estado === 'active') setAgora(Date.now());
    });
    return () => {
      clearInterval(intervalo);
      assinatura.remove();
    };
  }, []);

  function definirLembrete(id, minutos) {
    setAgora(Date.now());
    setTarefas((atuais) =>
      atuais.map((tarefa) =>
        tarefa.id === id ? { ...tarefa, lembreteMinutos: minutos } : tarefa
      )
    );
  }

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

  if (estadoLeitura !== 'pronto') {
    return (
      <SafeAreaView style={styles.carregando}>
        {estadoLeitura === 'carregando' ? (
          <ActivityIndicator color="#FF8190" accessibilityLabel="Carregando dados salvos" />
        ) : (
          <>
            <Text style={styles.erro} accessibilityRole="alert">
              Não foi possível carregar os dados salvos.
            </Text>
            <Pressable
              accessibilityRole="button"
              style={styles.botao}
              onPress={() => {
                setEstadoLeitura('carregando');
                setTentativaLeitura((atual) => atual + 1);
              }}>
              <Text style={styles.link}>Tentar novamente</Text>
            </Pressable>
          </>
        )}
      </SafeAreaView>
    );
  }

  return (
    <TarefasContext
      value={{
        tarefas,
        nome,
        setNome,
        agora,
        aoDefinirLembrete: definirLembrete,
        aoAlterar: alterarConclusao,
        aoAdicionar: (data) => setFormulario({ data }),
        aoEditar: (tarefa, reagendar) => setFormulario({ tarefa, reagendar }),
      }}>
      {children}
      {erroAoSalvar ? (
        <SafeAreaView edges={['left', 'right', 'bottom']} style={styles.aviso}>
          <View style={styles.linha}>
            <Text style={styles.erro} accessibilityRole="alert">
              Não foi possível salvar as alterações.
            </Text>
            <Pressable
              accessibilityRole="button"
              style={styles.botao}
              onPress={() => setTentativaGravacao((atual) => atual + 1)}>
              <Text style={styles.link}>Tentar novamente</Text>
            </Pressable>
          </View>
        </SafeAreaView>
      ) : null}
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

const styles = StyleSheet.create({
  carregando: {
    flex: 1, backgroundColor: '#263542', justifyContent: 'center', alignItems: 'center', padding: 20,
  },
  aviso: { backgroundColor: '#354858' },
  linha: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', paddingHorizontal: 12 },
  erro: { color: '#F7FAFD' },
  botao: { minHeight: 44, justifyContent: 'center', paddingHorizontal: 8 },
  link: { color: '#FFADB8', fontWeight: '700' },
});

export function useTarefas() {
  const contexto = useContext(TarefasContext);
  if (!contexto) throw new Error('A lista precisa do contexto de tarefas.');
  return contexto;
}
