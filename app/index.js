import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import CartaoResumo from '@/components/CartaoResumo';
import EditarNome from '@/components/EditarNome';
import FormularioTarefa from '@/components/FormularioTarefa';
import ItemTarefa from '@/components/ItemTarefa';

// Formata no horário local para a data não mudar por causa do fuso.
function dataLocal(agora, diasAjuste = 0) {
  const data = new Date(agora);
  data.setDate(data.getDate() + diasAjuste);
  const ano = data.getFullYear();
  const mes = String(data.getMonth() + 1).padStart(2, '0');
  const dia = String(data.getDate()).padStart(2, '0');
  return `${ano}-${mes}-${dia}`;
}

function criarDadosIniciais() {
  const agora = new Date();
  const hoje = dataLocal(agora);
  return {
    nome: 'Pedro',
    tarefas: [
      { id: 1, titulo: 'Revisar conteúdo da aula', categoria: 'Estudos', horario: '09:00', prioridade: 'Alta', data: hoje, concluida: false },
      { id: 2, titulo: 'Organizar a lista de compras', categoria: 'Casa', horario: '14:30', prioridade: 'Média', data: hoje, concluida: false },
      { id: 3, titulo: 'Fazer uma caminhada', categoria: 'Saúde', horario: '18:00', prioridade: 'Baixa', data: hoje, concluida: true },
      { id: 4, titulo: 'Pagar a conta de internet', categoria: 'Pessoal', horario: 'Ontem', prioridade: 'Alta', data: dataLocal(agora, -1), concluida: false },
    ],
  };
}

export default function HojeScreen() {
  // As tarefas e o nome ficam em memória até o app ser reiniciado.
  const [dados, setDados] = useState(criarDadosIniciais);
  const [formulario, setFormulario] = useState(null);
  const [editarNome, setEditarNome] = useState(false);

  function alterarConclusao(id) {
    setDados((atuais) => ({
      ...atuais,
      tarefas: atuais.tarefas.map((tarefa) =>
        tarefa.id === id ? { ...tarefa, concluida: !tarefa.concluida } : tarefa
      ),
    }));
  }

  function salvarTarefa(campos, idEditado) {
    const novaTarefa = { ...campos, id: Date.now(), concluida: false };
    // Uma única lista alimenta o resumo, as atrasadas e as tarefas de outras datas.
    setDados((atuais) => ({
      ...atuais,
      tarefas: idEditado === undefined
        ? [...atuais.tarefas, novaTarefa]
        : atuais.tarefas.map((tarefa) =>
          tarefa.id === idEditado ? { ...tarefa, ...campos } : tarefa
        ),
    }));
    setFormulario(null);
  }

  function excluirTarefa(id) {
    setDados((atuais) => ({
      ...atuais,
      tarefas: atuais.tarefas.filter((tarefa) => tarefa.id !== id),
    }));
    setFormulario(null);
  }

  return (
    <>
      <PainelHoje
        tarefas={dados.tarefas}
        nome={dados.nome}
        aoAlterar={alterarConclusao}
        aoAbrirPerfil={() => setEditarNome(true)}
        aoAdicionar={(data) => setFormulario({ data })}
        aoEditar={(tarefa, reagendar) => setFormulario({ tarefa, reagendar })}
      />
      {/* Os formulários abrem sobre Hoje, sem criar rotas nem abas. */}
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
      {editarNome ? (
        <EditarNome
          nome={dados.nome}
          aoFechar={() => setEditarNome(false)}
          aoSalvar={(nome) => {
            setDados((atuais) => ({ ...atuais, nome }));
            setEditarNome(false);
          }}
        />
      ) : null}
    </>
  );
}

function PainelHoje({
  tarefas,
  aoAlterar,
  aoEditar,
  aoAdicionar,
  nome,
  aoAbrirPerfil,
}) {
  // Este estado controla apenas se a lista de atrasadas está visível.
  const [mostrarAtrasadas, setMostrarAtrasadas] = useState(false);
  const [agora, setAgora] = useState(() => new Date());

  // Atualiza os avisos de horário enquanto a tela está aberta e limpa o timer ao sair.
  useEffect(() => {
    const intervalo = setInterval(() => setAgora(new Date()), 15_000);
    return () => clearInterval(intervalo);
  }, []);

  const hoje = dataLocal(agora);
  const hora = String(agora.getHours()).padStart(2, '0');
  const minuto = String(agora.getMinutes()).padStart(2, '0');
  const horarioAtual = hora + ':' + minuto;
  // Os cartões e listas são calculados a partir das tarefas recebidas da rota.
  const tarefasDeHoje = tarefas.filter((tarefa) => tarefa.data === hoje);
  const outrasTarefas = tarefas
    .filter((tarefa) => tarefa.data !== hoje)
    .sort((primeira, segunda) => primeira.data.localeCompare(segunda.data));
  const concluidas = tarefasDeHoje.filter((tarefa) => tarefa.concluida).length;
  const tarefasPendentes = tarefasDeHoje.filter((tarefa) => !tarefa.concluida);
  const pendentes = tarefasPendentes.length;
  const horariosValidos = /^([01]\d|2[0-3]):[0-5]\d$/;
  const tarefasComHorario = tarefasPendentes
    .filter((tarefa) => horariosValidos.test(tarefa.horario))
    .sort((primeira, segunda) =>
      primeira.horario.localeCompare(segunda.horario)
    );
  // Prioriza o próximo horário de hoje. Se todos passaram, destaca a última pendência.
  const proximoHorario = tarefasComHorario.find(
    (tarefa) => tarefa.horario >= horarioAtual
  );
  const ultimaPendencia = tarefasComHorario[tarefasComHorario.length - 1];
  const proximaTarefa =
    proximoHorario || ultimaPendencia || tarefasPendentes[0];
  const horarioPassou = !proximoHorario && Boolean(ultimaPendencia);
  // Uma tarefa pendente está atrasada se a data passou ou se o horário de hoje passou.
  const tarefasAtrasadas = tarefas
    .filter(
      (tarefa) =>
        !tarefa.concluida &&
        (tarefa.data < hoje ||
          (tarefa.data === hoje &&
            horariosValidos.test(tarefa.horario) &&
            tarefa.horario < horarioAtual))
    )
    .sort((primeira, segunda) => {
      const porData = primeira.data.localeCompare(segunda.data);
      if (porData !== 0) return porData;
      const primeiraHora = horariosValidos.test(primeira.horario)
        ? primeira.horario
        : '24:00';
      const segundaHora = horariosValidos.test(segunda.horario)
        ? segunda.horario
        : '24:00';
      return primeiraHora.localeCompare(segundaHora);
    });

  // Usa o mesmo componente para tarefas de hoje, atrasadas e de outras datas.
  function renderizarTarefa(
    tarefa,
    mostrarData = false,
    rotuloEditar = 'Editar'
  ) {
    return (
      <ItemTarefa
        key={tarefa.id}
        tarefa={tarefa}
        mostrarData={mostrarData}
        rotuloEditar={rotuloEditar}
        aoAlterar={() => aoAlterar(tarefa.id)}
        aoEditar={() => aoEditar(tarefa, rotuloEditar === 'Reagendar')}
      />
    );
  }

  const dataFormatada = agora.toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

  return (
    <SafeAreaView style={styles.areaSegura} edges={['top', 'bottom', 'left', 'right']}>
      <ScrollView contentContainerStyle={styles.conteudo}>
        <View style={styles.cabecalho}>
          <View style={styles.saudacao}>
            <Text style={styles.data}>{dataFormatada}</Text>
            <Text style={styles.titulo}>Olá, {nome} 👋</Text>
            <Text style={styles.subtitulo}>Vamos organizar seu dia?</Text>
          </View>

          <Pressable
            style={styles.avatar}
            accessibilityRole="button"
            accessibilityLabel="Abrir perfil"
            onPress={aoAbrirPerfil}>
            <Text style={styles.letraAvatar}>
              {Array.from(nome)[0]?.toLocaleUpperCase('pt-BR')}
            </Text>
          </Pressable>
        </View>

        <View style={styles.cartaoProximaTarefa}>
          <Text style={styles.rotuloProximaTarefa}>
            {horarioPassou ? 'Tarefa pendente' : 'Próxima tarefa'}
          </Text>
          <Text style={styles.tituloProximaTarefa}>
            {proximaTarefa ? proximaTarefa.titulo : 'Tudo em dia!'}
          </Text>
          <Text style={styles.detalheProximaTarefa}>
            {proximaTarefa
              ? horarioPassou
                ? proximaTarefa.horario + ' · Horário passou'
                : proximaTarefa.horario || 'Sem horário'
              : 'Nenhuma tarefa pendente para hoje.'}
          </Text>
        </View>

        <View style={styles.gradeResumo}>
          <CartaoResumo
            titulo="Pendentes"
            valor={pendentes}
            detalhe="para hoje"
            cor="#BCD1E4"
          />
          <CartaoResumo
            titulo="Concluídas"
            valor={concluidas}
            detalhe="finalizadas hoje"
            cor="#9BE0C6"
          />
          <CartaoResumo
            titulo="Atrasadas"
            valor={tarefasAtrasadas.length}
            acao={mostrarAtrasadas ? 'Ocultar' : 'Ver'}
            expandido={mostrarAtrasadas}
            aoPressionar={() => setMostrarAtrasadas((anterior) => !anterior)}
            detalhe="precisam de atenção"
            cor="#FF8190"
          />
          <CartaoResumo
            titulo="Total de hoje"
            valor={tarefasDeHoje.length}
            detalhe="tarefas agendadas"
            cor="#FFCF93"
          />
        </View>

        <Pressable
          accessibilityRole="button"
          style={styles.botaoNovaTarefa}
          onPress={() => aoAdicionar(hoje)}>
          <Text style={styles.textoBotaoNovaTarefa}>+ Nova tarefa</Text>
        </Pressable>

        {mostrarAtrasadas ? (
          <View style={styles.secaoAtrasadas}>
            <Text style={styles.tituloSecao}>Tarefas atrasadas</Text>
            <View style={styles.listaTarefas}>
              {tarefasAtrasadas.length > 0 ? (
                tarefasAtrasadas.map((tarefa) =>
                  renderizarTarefa(tarefa, true, 'Reagendar')
                )
              ) : (
                <Text style={styles.listaVazia}>Nenhuma tarefa atrasada.</Text>
              )}
            </View>
          </View>
        ) : null}
        <View style={styles.tituloLista}>
          <Text style={styles.tituloSecao}>Tarefas de hoje</Text>
          <Text style={styles.contador}>{tarefasDeHoje.length} tarefas</Text>
        </View>

        <View style={styles.listaTarefas}>
          {tarefasDeHoje.length > 0 ? (
            tarefasDeHoje.map((tarefa) => renderizarTarefa(tarefa))
          ) : (
            <Text style={styles.listaVazia}>Nenhuma tarefa para hoje.</Text>
          )}
        </View>

        {outrasTarefas.length > 0 ? (
          <View style={styles.outrasDatas}>
            <Text style={styles.tituloSecao}>Outras datas</Text>
            <View style={styles.listaTarefas}>
              {outrasTarefas.map((tarefa) => renderizarTarefa(tarefa, true))}
            </View>
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  areaSegura: {
    flex: 1,
    backgroundColor: '#263542',
  },
  conteudo: {
    padding: 20,
    paddingBottom: 36,
    maxWidth: 700,
    width: '100%',
    alignSelf: 'center',
  },
  cabecalho: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 24,
  },
  data: {
    color: '#C8D3DD',
    fontSize: 14,
    textTransform: 'capitalize',
    marginBottom: 7,
  },
  titulo: {
    color: '#F7FAFD',
    fontSize: 28,
    fontWeight: '700',
  },
  subtitulo: {
    color: '#C8D3DD',
    fontSize: 15,
    marginTop: 5,
  },
  saudacao: { flex: 1, marginRight: 12 },
  avatar: {
    width: 52,
    height: 52,
    backgroundColor: '#FF8190',
    justifyContent: 'center',
    alignItems: 'center',
  },
  letraAvatar: {
    color: '#263542',
    fontSize: 21,
    fontWeight: '700',
  },
  cartaoProximaTarefa: {
    borderLeftWidth: 4,
    borderLeftColor: '#FF8190',
    backgroundColor: '#495B6B',
    padding: 20,
    marginBottom: 18,
  },
  rotuloProximaTarefa: {
    color: '#E0E8EF',
    fontSize: 13,
    fontWeight: '600',
  },
  tituloProximaTarefa: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
    marginTop: 6,
  },
  detalheProximaTarefa: {
    color: '#E0E8EF',
    fontSize: 13,
    marginTop: 5,
  },
  gradeResumo: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
  },

  botaoNovaTarefa: {
    padding: 14,
    alignItems: 'center',
    backgroundColor: '#FF8190',
    marginBottom: 18,
  },
  textoBotaoNovaTarefa: { color: '#263542', fontSize: 15, fontWeight: '700' },
  secaoAtrasadas: { gap: 10, marginBottom: 20 },
  outrasDatas: { marginTop: 20, gap: 10 },
  listaVazia: { color: '#E0E8EF', paddingVertical: 14 },
  tituloLista: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  tituloSecao: {
    color: '#F7FAFD',
    fontSize: 19,
    fontWeight: '700',
  },
  contador: {
    color: '#C8D3DD',
    fontSize: 13,
  },
  listaTarefas: {
    backgroundColor: '#495B6B',
    paddingHorizontal: 14,
  },
});
