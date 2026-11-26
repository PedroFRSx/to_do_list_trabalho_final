import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const prioridades = ['Baixa', 'Média', 'Alta'];

// Valida o dia, o mês e o ano antes de gravar uma data.
function lerData(texto) {
  const partes = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(texto.trim());
  if (!partes) return null;
  const [, dia, mes, ano] = partes;
  const data = new Date(Number(ano), Number(mes) - 1, Number(dia));
  if (
    data.getFullYear() !== Number(ano) ||
    data.getMonth() + 1 !== Number(mes) ||
    data.getDate() !== Number(dia)
  )
    return null;
  return [ano, mes, dia].join('-');
}

export default function FormularioTarefa({
  tarefa,
  hoje,
  reagendar,
  aoSalvar,
  aoFechar,
  aoExcluir,
}) {
  const [titulo, setTitulo] = useState(tarefa?.titulo ?? '');
  const [prioridade, setPrioridade] = useState(tarefa?.prioridade ?? 'Média');
  const [data, setData] = useState(
    (tarefa?.data ?? hoje).split('-').reverse().join('/')
  );
  const [horario, setHorario] = useState(
    /^\d{2}:\d{2}$/.test(tarefa?.horario) ? tarefa.horario : ''
  );
  const [erro, setErro] = useState('');

  // O ID acompanha os campos na edição. No cadastro, o painel cria um ID novo.
  function salvar() {
    const dataValida = lerData(data);
    const hora = horario.trim();
    if (!titulo.trim()) return setErro('Digite o título da tarefa.');
    if (!dataValida)
      return setErro('Digite uma data válida no formato DD/MM/AAAA.');
    if (!hora) return setErro('Informe o horário da tarefa.');
    if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(hora))
      return setErro('Digite um horário válido no formato HH:MM.');
    aoSalvar(
      { titulo: titulo.trim(), prioridade, data: dataValida, horario: hora },
      tarefa?.id
    );
  }

  return (
    <Modal animationType="slide" onRequestClose={aoFechar}>
      <SafeAreaView style={styles.tela}>
        <KeyboardAvoidingView
          style={styles.tela}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <ScrollView
            contentContainerStyle={styles.conteudo}
            keyboardShouldPersistTaps="handled">
            <View style={styles.cabecalho}>
              <Text style={styles.titulo}>
                {reagendar ? 'Reagendar tarefa' : tarefa ? 'Editar tarefa' : 'Nova tarefa'}
              </Text>
              <Pressable
                accessibilityRole="button"
                onPress={aoFechar}
                style={styles.cancelar}>
                <Text style={styles.cancelarTexto}>Cancelar</Text>
              </Pressable>
            </View>
            <Text style={styles.rotulo}>Título</Text>
            <TextInput
              accessibilityLabel="Título"
              style={styles.campo}
              value={titulo}
              onChangeText={setTitulo}
              placeholder="Ex.: Revisar a aula"
              placeholderTextColor="#B9C7D2"
              maxLength={100}
            />
            <Text style={styles.rotulo}>Prioridade</Text>
            <View style={styles.opcoes}>
              {prioridades.map((opcao) => (
                <Pressable
                  key={opcao}
                  accessibilityRole="button"
                  accessibilityState={{ selected: prioridade === opcao }}
                  onPress={() => setPrioridade(opcao)}
                  style={[
                    styles.opcao,
                    prioridade === opcao && styles.opcaoAtiva,
                  ]}>
                  <Text
                    style={[
                      styles.opcaoTexto,
                      prioridade === opcao && styles.textoEscuro,
                    ]}>
                    {opcao}
                  </Text>
                </Pressable>
              ))}
            </View>
            <Text style={styles.rotulo}>Data</Text>
            <TextInput
              accessibilityLabel="Data"
              style={styles.campo}
              value={data}
              onChangeText={setData}
              placeholder="DD/MM/AAAA"
              placeholderTextColor="#B9C7D2"
              maxLength={10}
            />
            <Text style={styles.rotulo}>Horário</Text>
            <TextInput
              accessibilityLabel="Horário"
              style={styles.campo}
              value={horario}
              onChangeText={setHorario}
              placeholder="HH:MM"
              placeholderTextColor="#B9C7D2"
              maxLength={5}
            />
            {erro ? (
              <Text accessibilityRole="alert" style={styles.erro}>
                {erro}
              </Text>
            ) : null}
            <Pressable
              accessibilityRole="button"
              onPress={salvar}
              style={styles.salvar}>
              <Text style={styles.salvarTexto}>Salvar tarefa</Text>
            </Pressable>
            {tarefa ? (
              <Pressable
                accessibilityRole="button"
                style={styles.excluir}
                onPress={() => aoExcluir(tarefa.id)}>
                <Text style={styles.cancelarTexto}>Excluir tarefa</Text>
              </Pressable>
            ) : null}
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  tela: { flex: 1, backgroundColor: '#263542' },
  conteudo: {
    width: '100%',
    maxWidth: 560,
    alignSelf: 'center',
    padding: 20,
    paddingBottom: 36,
  },
  cabecalho: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  titulo: { color: '#F7FAFD', fontSize: 26, fontWeight: '700' },
  cancelar: { paddingVertical: 12, paddingLeft: 12 },
  cancelarTexto: { color: '#FFADB8', fontWeight: '700' },
  rotulo: {
    color: '#F1F5F8',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  campo: {
    minHeight: 46,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#495B6B',
    color: '#F7FAFD',
    fontSize: 16,
    marginBottom: 16,
  },
  opcoes: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  opcao: {
    flex: 1,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#495B6B',
  },
  opcaoAtiva: { backgroundColor: '#FF8190' },
  opcaoTexto: { color: '#F7FAFD', fontWeight: '600' },
  textoEscuro: { color: '#263542' },
  erro: { color: '#FFADB8', marginBottom: 12 },
  salvar: { padding: 14, alignItems: 'center', backgroundColor: '#FF8190' },
  excluir: {
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  salvarTexto: { color: '#263542', fontWeight: '700', fontSize: 16 },
});
