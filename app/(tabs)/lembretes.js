import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { dataLocal, useTarefas } from '@/context/TarefasContext';
import { horarioDaTarefa, opcoesLembrete } from '@/utils/lembretes';

export default function LembretesScreen() {
  const { tarefas, agora, aoDefinirLembrete, aoAdicionar, aoEditar } = useTarefas();
  const hoje = dataLocal(agora);
  // Só é possível configurar lembretes de tarefas pendentes com horário futuro.
  const futuras = tarefas
    .filter((tarefa) => !tarefa.concluida && horarioDaTarefa(tarefa) > agora)
    .sort((a, b) => horarioDaTarefa(a) - horarioDaTarefa(b));

  return (
    <SafeAreaView style={styles.tela} edges={['top', 'left', 'right']}>
      <ScrollView contentContainerStyle={styles.conteudo}>
        <Text style={styles.titulo}>Lembretes</Text>
        <Text style={styles.texto}>
          Escolha quando receber um aviso enquanto o app estiver aberto.
        </Text>
        {futuras.length === 0 ? (
          <View style={styles.cartao}>
            <Text style={styles.nome}>Nenhuma tarefa futura</Text>
            <Text style={styles.texto}>
              Adicione uma tarefa com data e horário futuros para configurar um
              lembrete.
            </Text>
            <Pressable
              accessibilityRole="button"
              style={styles.nova}
              onPress={() => aoAdicionar(hoje)}>
              <Text style={styles.textoAtivo}>+ Nova tarefa</Text>
            </Pressable>
          </View>
        ) : (
          futuras.map((tarefa) => (
            <View key={tarefa.id} style={styles.cartao}>
              <Text style={styles.nome}>{tarefa.titulo}</Text>
              <View style={styles.linha}>
                <Text style={styles.texto}>
                  {tarefa.data.split('-').reverse().join('/')} às {tarefa.horario}
                </Text>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={'Reagendar ' + tarefa.titulo}
                  onPress={() => aoEditar(tarefa, true)}
                  style={styles.reagendar}>
                  <Text style={styles.link}>Reagendar</Text>
                </Pressable>
              </View>
              <View style={styles.opcoes}>
                {opcoesLembrete.map((minutos) => {
                  const rotulo =
                    minutos === null ? 'Sem aviso' : minutos + ' min';
                  const selecionado =
                    (tarefa.lembreteMinutos ?? null) === minutos;
                  return (
                    <Pressable
                      key={rotulo}
                      accessibilityRole="button"
                      accessibilityLabel={
                        minutos === null
                          ? 'Desativar lembrete'
                          : minutos + ' minutos antes'
                      }
                      accessibilityState={{ selected: selecionado }}
                      onPress={() => aoDefinirLembrete(tarefa.id, minutos)}
                      style={[styles.opcao, selecionado && styles.opcaoAtiva]}>
                      <Text
                        style={[
                          styles.opcaoTexto,
                          selecionado && styles.textoAtivo,
                        ]}>
                        {rotulo}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  tela: { flex: 1, backgroundColor: '#263542' },
  conteudo: { width: '100%', maxWidth: 700, alignSelf: 'center', padding: 20 },
  titulo: {
    color: '#F7FAFD',
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 6,
  },
  texto: { color: '#E0E8EF', fontSize: 14, lineHeight: 20 },
  cartao: { backgroundColor: '#495B6B', padding: 14, marginTop: 16 },
  nome: { color: '#F7FAFD', fontSize: 17, fontWeight: '700', marginBottom: 4 },
  linha: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center' },
  reagendar: { minHeight: 44, justifyContent: 'center' },
  link: { color: '#FFADB8', fontWeight: '700' },
  opcoes: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 12 },
  opcao: {
    minHeight: 44,
    paddingHorizontal: 9,
    justifyContent: 'center',
    backgroundColor: '#354858',
  },
  opcaoAtiva: { backgroundColor: '#FF8190' },
  opcaoTexto: { color: '#F7FAFD', fontSize: 12, fontWeight: '700' },
  textoAtivo: { color: '#263542', fontWeight: '700' },
  nova: {
    backgroundColor: '#FF8190',
    alignSelf: 'flex-start',
    padding: 12,
    marginTop: 12,
  },
});
