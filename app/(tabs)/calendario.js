import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ItemTarefa from '@/components/ItemTarefa';
import { dataLocal, useTarefas } from '@/context/TarefasContext';

const diasSemana = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];

const nomesFeriadosFixos = {
  '01-01': 'Confraternização Universal',
  '04-21': 'Tiradentes',
  '05-01': 'Dia do Trabalhador',
  '09-07': 'Independência do Brasil',
  '10-12': 'Nossa Senhora Aparecida',
  '11-02': 'Finados',
  '11-15': 'Proclamação da República',
  '11-20': 'Dia da Consciência Negra',
  '12-25': 'Natal',
};

const nomesFeriadosMoveis = new Map([
  ['carnival', 'Carnaval'],
  ['carnival monday', 'Segunda-feira de Carnaval'],
  ['carnival tuesday', 'Terça-feira de Carnaval'],
  ['good friday', 'Sexta-feira Santa'],
  ['easter sunday', 'Páscoa'],
  ['corpus christi', 'Corpus Christi'],
]);

// A API devolve uma lista para o ano consultado. A grade só marca feriados públicos nacionais.
async function buscarFeriadosNacionais(ano) {
  const resposta = await fetch(
    'https://nagerholidays.com/api/v4/Holidays/BR/' + ano
  );
  if (!resposta.ok) throw new Error('Falha ao buscar feriados');
  const lista = await resposta.json();
  return lista
    .filter((feriado) => feriado.nationalHoliday && feriado.holidayTypes.includes('Public'))
    .map(({ date, name }) => ({
      date,
      // A API determina quais dias são feriados. Aqui só localizamos o nome exibido.
      nome: nomesFeriadosMoveis.get(name.trim().toLowerCase()) ?? nomesFeriadosFixos[date.slice(5)] ?? name,
    }));
}

function encontrarProximo(feriados, hoje) {
  return (
    feriados
      .filter((feriado) => feriado.date > hoje)
      .sort((a, b) => a.date.localeCompare(b.date))[0] ?? null
  );
}

export default function CalendarioScreen() {
  const { tarefas, aoAlterar, aoEditar, aoAdicionar } = useTarefas();
  const hoje = dataLocal(new Date());
  const [data, setData] = useState(hoje);
  const [ano, mes, diaSelecionado] = data.split('-').map(Number);
  const [consulta, setConsulta] = useState({
    ano: 0,
    estado: 'carregando',
    feriados: [],
  });
  const [tentativa, setTentativa] = useState(0);
  const [proximo, setProximo] = useState({
    estado: 'carregando',
    feriado: null,
  });
  const [tentativaProximo, setTentativaProximo] = useState(0);

  useEffect(() => {
    let ativo = true;
    async function buscarFeriados() {
      setConsulta({ ano, estado: 'carregando', feriados: [] });
      try {
        const feriados = await buscarFeriadosNacionais(ano);
        if (ativo) setConsulta({ ano, estado: 'pronto', feriados });
      } catch {
        if (ativo) setConsulta({ ano, estado: 'erro', feriados: [] });
      }
    }
    buscarFeriados();
    return () => {
      ativo = false;
    };
  }, [ano, tentativa]);

  useEffect(() => {
    let ativo = true;
    async function carregarProximoFeriado() {
      setProximo({ estado: 'carregando', feriado: null });
      try {
        const anoAtual = Number(hoje.slice(0, 4));
        let feriado = encontrarProximo(
          await buscarFeriadosNacionais(anoAtual),
          hoje
        );
        if (!feriado && ativo) {
          feriado = encontrarProximo(
            await buscarFeriadosNacionais(anoAtual + 1),
            hoje
          );
        }
        if (ativo) setProximo({ estado: 'pronto', feriado });
      } catch {
        if (ativo) setProximo({ estado: 'erro', feriado: null });
      }
    }
    carregarProximoFeriado();
    return () => {
      ativo = false;
    };
  }, [hoje, tentativaProximo]);

  // As células vazias alinham o primeiro dia do mês ao dia certo da semana.
  const primeiroDia = new Date(ano, mes - 1, 1);
  const totalDias = new Date(ano, mes, 0).getDate();
  const inicioSemana = primeiroDia.getDay();
  const totalCelulas = Math.ceil((inicioSemana + totalDias) / 7) * 7;
  const estado = consulta.ano === ano ? consulta.estado : 'carregando';
  const feriados = consulta.ano === ano ? consulta.feriados : [];
  const feriadosDoDia = feriados.filter((feriado) => feriado.date === data);
  const tarefasDoDia = tarefas
    .filter((tarefa) => tarefa.data === data)
    .sort((primeira, segunda) =>
      primeira.horario.localeCompare(segunda.horario)
    );

  function mudarMes(ajuste) {
    const destino = new Date(ano, mes - 1 + ajuste, 1);
    setData(
      [
        destino.getFullYear(),
        String(destino.getMonth() + 1).padStart(2, '0'),
        '01',
      ].join('-')
    );
  }

  function renderizarDia(_, indice) {
    const dia = indice - inicioSemana + 1;
    if (dia < 1 || dia > totalDias)
      return <View key={indice} style={styles.celula} />;
    const dataDoDia = data.slice(0, 8) + String(dia).padStart(2, '0');
    const feriado = feriados.some((registro) => registro.date === dataDoDia);
    const temTarefa = tarefas.some((tarefa) => tarefa.data === dataDoDia);
    const selecionado = dia === diaSelecionado;
    return (
      <View key={indice} style={styles.celula}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={
            dataDoDia.split('-').reverse().join('/') +
            (feriado ? ', feriado' : '') +
            (temTarefa ? ', com tarefas' : '')
          }
          accessibilityState={{ selected: selecionado }}
          onPress={() => setData(dataDoDia)}
          style={[
            styles.dia,
            selecionado && styles.diaAtivo,
            !selecionado && dataDoDia === hoje && styles.diaHoje,
          ]}>
          <Text style={[styles.texto, selecionado && styles.textoEscuro]}>
            {dia}
          </Text>
          <View style={styles.marcadores}>
            {temTarefa ? (
              <View style={[styles.marca, styles.marcaTarefa]} />
            ) : null}
            {feriado ? (
              <View
                style={[
                  styles.marca,
                  selecionado ? styles.marcaEscura : styles.marcaFeriado,
                ]}
              />
            ) : null}
          </View>
        </Pressable>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.tela} edges={['top', 'left', 'right']}>
      <ScrollView contentContainerStyle={styles.conteudo}>
        <View style={styles.linha}>
          <Text style={styles.titulo}>Calendário</Text>
          <Pressable
            accessibilityRole="button"
            style={styles.controle}
            onPress={() => setData(dataLocal(new Date()))}>
            <Text style={styles.link}>Ir para hoje</Text>
          </Pressable>
        </View>
        <View style={styles.cartaoProximo}>
          <Text style={styles.link}>Próximo feriado nacional</Text>
          {proximo.estado === 'carregando' ? (
            <View style={styles.feedback}>
              <ActivityIndicator color="#FF8190" />
              <Text style={styles.texto}>Buscando próximo feriado…</Text>
            </View>
          ) : proximo.estado === 'erro' ? (
            <View style={styles.feedback}>
              <Text style={styles.texto}>
                Não foi possível buscar o próximo feriado.
              </Text>
              <Pressable
                accessibilityRole="button"
                onPress={() => setTentativaProximo((anterior) => anterior + 1)}>
                <Text style={styles.link}>Tentar buscar o próximo feriado</Text>
              </Pressable>
            </View>
          ) : proximo.feriado ? (
            <>
              <Text style={styles.nomeFeriado}>
                {proximo.feriado.nome}
              </Text>
              <Text style={styles.texto}>
                {proximo.feriado.date.split('-').reverse().join('/')}
              </Text>
            </>
          ) : (
            <Text style={styles.texto}>Nenhum próximo feriado encontrado.</Text>
          )}
          <Text style={styles.fonteFeriado}>Fonte: Nager.Date</Text>
        </View>
        <View style={styles.painel}>
          <View style={styles.linha}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Mês anterior"
              style={styles.controle}
              onPress={() => mudarMes(-1)}>
              <Text style={styles.seta}>‹</Text>
            </Pressable>
            <Text style={styles.mes}>
              {primeiroDia.toLocaleDateString('pt-BR', {
                month: 'long',
                year: 'numeric',
              })}
            </Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Próximo mês"
              style={styles.controle}
              onPress={() => mudarMes(1)}>
              <Text style={styles.seta}>›</Text>
            </Pressable>
          </View>
          <View style={styles.grade}>
            {diasSemana.map((dia, indice) => (
              <Text key={indice} style={[styles.celula, styles.semana]}>
                {dia}
              </Text>
            ))}
            {Array.from({ length: totalCelulas }, renderizarDia)}
          </View>
          <View style={styles.legenda}>
            <View style={[styles.marca, styles.marcaTarefa]} />
            <Text style={styles.texto}>Tarefa</Text>
            <View style={[styles.marca, styles.marcaFeriado]} />
            <Text style={styles.texto}>Feriado nacional</Text>
          </View>
        </View>
        {estado === 'carregando' ? (
          <View style={styles.feedback}>
            <ActivityIndicator color="#FF8190" />
            <Text style={styles.texto}>Carregando feriados…</Text>
          </View>
        ) : null}
        {estado === 'erro' ? (
          <View style={styles.feedback}>
            <Text style={styles.texto}>
              Não foi possível carregar os feriados.
            </Text>
            <Pressable
              accessibilityRole="button"
              onPress={() => setTentativa((atual) => atual + 1)}>
              <Text style={styles.link}>Tentar novamente</Text>
            </Pressable>
          </View>
        ) : null}
        <View style={styles.linha}>
          <Text style={styles.subtitulo}>
            {data.split('-').reverse().join('/')}
          </Text>
          <Pressable
            accessibilityRole="button"
            style={styles.controle}
            onPress={() => aoAdicionar(data)}>
            <Text style={styles.link}>+ Nova tarefa</Text>
          </Pressable>
        </View>
        {feriadosDoDia.map((feriado, indice) => (
          <Text key={indice} style={styles.feriado}>
            {feriado.nome} · Feriado nacional
          </Text>
        ))}
        <View style={styles.lista}>
          {tarefasDoDia.length === 0 ? (
            <Text style={styles.vazio}>Nenhuma tarefa nesta data.</Text>
          ) : (
            tarefasDoDia.map((tarefa) => (
              <ItemTarefa
                key={tarefa.id}
                tarefa={tarefa}
                aoAlterar={() => aoAlterar(tarefa.id)}
                aoEditar={() => aoEditar(tarefa)}
              />
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  tela: { flex: 1, backgroundColor: '#263542' },
  conteudo: {
    width: '100%',
    maxWidth: 700,
    alignSelf: 'center',
    padding: 20,
    paddingBottom: 30,
  },
  linha: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  titulo: { color: '#F7FAFD', fontSize: 28, fontWeight: '700' },
  subtitulo: { color: '#F7FAFD', fontSize: 18, fontWeight: '700' },
  texto: { color: '#F7FAFD' },
  textoEscuro: { color: '#263542', fontWeight: '700' },
  link: { color: '#FFADB8', fontWeight: '700' },
  controle: {
    minWidth: 44,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  seta: { color: '#FFADB8', fontSize: 25 },
  mes: { color: '#F7FAFD', fontWeight: '700', textTransform: 'capitalize' },
  cartaoProximo: {
    backgroundColor: '#495B6B',
    borderLeftWidth: 4,
    borderLeftColor: '#FF8190',
    padding: 14,
    marginTop: 12,
  },
  nomeFeriado: {
    color: '#F7FAFD',
    fontSize: 19,
    fontWeight: '700',
    marginTop: 4,
    marginBottom: 3,
  },
  fonteFeriado: { color: '#E0E8EF', fontSize: 11, marginTop: 8 },
  painel: {
    marginTop: 14,
    marginBottom: 10,
    backgroundColor: '#495B6B',
    paddingHorizontal: 8,
    paddingBottom: 14,
  },
  grade: { flexDirection: 'row', flexWrap: 'wrap' },
  celula: { width: '14.28%', padding: 2 },
  semana: {
    textAlign: 'center',
    color: '#E0E8EF',
    paddingVertical: 8,
    fontWeight: '600',
  },
  dia: { minHeight: 40, alignItems: 'center', justifyContent: 'center' },
  diaAtivo: { backgroundColor: '#FF8190' },
  diaHoje: { backgroundColor: '#354858' },
  marcadores: { flexDirection: 'row', gap: 3, height: 5, marginTop: 3 },
  marca: { width: 5, height: 5 },
  marcaTarefa: { backgroundColor: '#B6F1D8' },
  marcaFeriado: { backgroundColor: '#FFADB8' },
  marcaEscura: { backgroundColor: '#263542' },
  legenda: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    alignItems: 'center',
    padding: 6,
  },
  feedback: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
    marginVertical: 8,
  },
  feriado: {
    color: '#FFADB8',
    padding: 12,
    backgroundColor: '#354858',
    marginBottom: 8,
  },
  lista: { backgroundColor: '#495B6B', paddingHorizontal: 12 },
  vazio: { color: '#E0E8EF', paddingVertical: 14 },
});
