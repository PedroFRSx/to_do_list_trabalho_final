import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import ItemTarefa from '@/components/ItemTarefa';
import { dataLocal, useTarefas } from '@/context/TarefasContext';

const filtros = ['Esta semana', 'Este mês', 'Todo o período'];

export default function ProgressoScreen() {
  const { tarefas, aoAlterar, aoEditar } = useTarefas();
  const hoje = dataLocal(new Date());
  const [periodo, setPeriodo] = useState('Todo o período');
  const [ano, mes, dia] = hoje.split('-').map(Number);
  // A semana abrange segunda a domingo no fuso do aparelho.
  const inicioSemana = new Date(ano, mes - 1, dia);
  const diasDesdeSegunda = (inicioSemana.getDay() + 6) % 7;
  inicioSemana.setDate(inicioSemana.getDate() - diasDesdeSegunda);
  const fimSemana = new Date(inicioSemana);
  fimSemana.setDate(fimSemana.getDate() + 6);
  const primeiraData = dataLocal(inicioSemana);
  const ultimaData = dataLocal(fimSemana);

  // O filtro usa a data agendada da tarefa.
  const tarefasDoPeriodo = tarefas.filter((tarefa) => {
    if (periodo === 'Esta semana') {
      return tarefa.data >= primeiraData && tarefa.data <= ultimaData;
    }
    if (periodo === 'Este mês')
      return tarefa.data.slice(0, 7) === hoje.slice(0, 7);
    return true;
  });

  const total = tarefasDoPeriodo.length;
  const tarefasConcluidas = tarefasDoPeriodo
    .filter((tarefa) => tarefa.concluida)
    .sort((a, b) => b.data.localeCompare(a.data) || a.horario.localeCompare(b.horario));
  const concluidas = tarefasConcluidas.length;
  const pendentes = total - concluidas;
  const porcentagem = total > 0 ? Math.round((concluidas / total) * 100) : null;
  const indicadores = [
    { rotulo: 'Total', valor: total, cor: '#F7FAFD' },
    { rotulo: 'Concluídas', valor: concluidas, cor: '#9BE0C6' },
    { rotulo: 'Pendentes', valor: pendentes, cor: '#FFADB8' },
  ];

  return (
    <SafeAreaView style={styles.tela} edges={['top', 'left', 'right']}>
      <ScrollView contentContainerStyle={styles.conteudo}>
        <Text style={styles.titulo}>Progresso</Text>
        <Text style={styles.subtitulo}>
          Acompanhe a conclusão das tarefas pela data agendada.
        </Text>
        <View style={styles.filtros}>
          {filtros.map((filtro) => {
            const ativo = periodo === filtro;
            return (
              <Pressable
                key={filtro}
                accessibilityRole="button"
                accessibilityState={{ selected: ativo }}
                onPress={() => setPeriodo(filtro)}
                style={[styles.filtro, ativo && styles.filtroAtivo]}>
                <Text
                  style={[
                    styles.filtroTexto,
                    ativo && styles.filtroTextoAtivo,
                  ]}>
                  {filtro}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <View style={styles.painel}>
          <Text style={styles.rotulo}>Taxa de conclusão</Text>
          {porcentagem === null ? (
            <Text style={styles.feedback}>
              Nenhuma tarefa agendada neste período.
            </Text>
          ) : (
            <>
              <Text style={styles.porcentagem}>{porcentagem}%</Text>
              <Text style={styles.feedback}>
                {concluidas} de {total} tarefas concluídas
              </Text>
            </>
          )}
        </View>

        <View style={styles.indicadores}>
          {indicadores.map(({ rotulo, valor, cor }) => (
            <View key={rotulo} style={styles.indicador}>
              <Text style={[styles.numero, { color: cor }]}>{valor}</Text>
              <Text style={styles.indicadorRotulo}>{rotulo}</Text>
            </View>
          ))}
        </View>

        <View style={styles.secaoConcluidas}>
          <Text style={styles.rotulo}>Tarefas concluídas</Text>
          <View style={styles.lista}>
            {concluidas === 0 ? (
              <Text style={styles.vazio}>Nenhuma tarefa concluída neste período.</Text>
            ) : (
              tarefasConcluidas.map((tarefa) => (
                <ItemTarefa
                  key={tarefa.id}
                  tarefa={tarefa}
                  mostrarData
                  aoAlterar={() => aoAlterar(tarefa.id)}
                  aoEditar={() => aoEditar(tarefa)}
                />
              ))
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  tela: { flex: 1, backgroundColor: '#263542' },
  conteudo: { width: '100%', maxWidth: 700, alignSelf: 'center', padding: 20 },
  titulo: { color: '#F7FAFD', fontSize: 28, fontWeight: '700' },
  subtitulo: { color: '#C8D3DD', fontSize: 14, marginTop: 5 },
  filtros: { flexDirection: 'row', gap: 6, marginTop: 20, marginBottom: 16 },
  filtro: {
    flex: 1,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    paddingVertical: 8,
    backgroundColor: '#495B6B',
  },
  filtroAtivo: { backgroundColor: '#FF8190' },
  filtroTexto: {
    color: '#F7FAFD',
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
  },
  filtroTextoAtivo: { color: '#263542' },
  painel: {
    backgroundColor: '#495B6B',
    borderLeftWidth: 4,
    borderLeftColor: '#FF8190',
    padding: 16,
    marginBottom: 12,
  },
  rotulo: { color: '#F7FAFD', fontWeight: '700', fontSize: 15 },
  porcentagem: {
    color: '#F7FAFD',
    fontWeight: '700',
    fontSize: 38,
    marginTop: 4,
  },
  feedback: { color: '#E0E8EF', marginTop: 4, fontSize: 14 },
  indicadores: { flexDirection: 'row', gap: 6 },
  indicador: {
    flex: 1,
    backgroundColor: '#495B6B',
    alignItems: 'center',
    paddingHorizontal: 4,
    paddingVertical: 12,
  },
  numero: { fontSize: 23, fontWeight: '700' },
  secaoConcluidas: { marginTop: 20, gap: 8 },
  lista: { backgroundColor: '#495B6B', paddingHorizontal: 12 },
  vazio: { color: '#E0E8EF', paddingVertical: 14 },
  indicadorRotulo: {
    color: '#E0E8EF',
    fontSize: 12,
    marginTop: 4,
    textAlign: 'center',
  },
});
