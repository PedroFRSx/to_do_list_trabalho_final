import { Pressable, StyleSheet, Text, View } from 'react-native';

export default function ItemTarefa({
  tarefa,
  aoAlterar,
  aoEditar,
  mostrarData = false,
  rotuloEditar = 'Editar',
}) {
  return (
    <View style={styles.itemTarefa}>
      {/* O toque na tarefa alterna a conclusão. A edição tem um botão separado. */}
      <Pressable
        style={styles.dadosTarefa}
        onPress={aoAlterar}
        accessibilityRole="checkbox"
        accessibilityState={{ checked: tarefa.concluida }}>
        <View
          style={[
            styles.checkbox,
            tarefa.concluida && styles.checkboxConcluido,
          ]}>
          {tarefa.concluida && <Text style={styles.check}>✓</Text>}
        </View>

        <View style={styles.detalhesTarefa}>
          <Text
            style={[
              styles.nomeTarefa,
              tarefa.concluida && styles.textoConcluido,
            ]}>
            {tarefa.titulo}
          </Text>
          <Text style={styles.categoriaTarefa}>
            {mostrarData
              ? tarefa.data.split('-').reverse().join('/') + ' · '
              : ''}
            {tarefa.categoria ? tarefa.categoria + ' · ' : ''}
            {tarefa.horario}
          </Text>
        </View>

        <View
          style={[
            styles.etiquetaPrioridade,
            tarefa.prioridade === 'Alta' && styles.prioridadeAlta,
            tarefa.prioridade === 'Média' && styles.prioridadeMedia,
          ]}>
          <Text
            style={[
              styles.textoPrioridade,
              tarefa.prioridade === 'Alta' && styles.textoPrioridadeAlta,
              tarefa.prioridade === 'Média' && styles.textoPrioridadeMedia,
            ]}>
            {tarefa.prioridade}
          </Text>
        </View>
      </Pressable>
      {aoEditar ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={rotuloEditar + ' ' + tarefa.titulo}
          onPress={aoEditar}
          style={styles.editar}>
          <Text style={styles.editarTexto}>{rotuloEditar}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  itemTarefa: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#718492',
  },
  dadosTarefa: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 44,
  },
  editar: { paddingLeft: 8, minHeight: 44, justifyContent: 'center' },
  editarTexto: { color: '#FFADB8', fontSize: 12, fontWeight: '700' },
  checkbox: {
    width: 22,
    height: 22,
    borderWidth: 1.5,
    borderColor: '#C8D3DD',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  checkboxConcluido: {
    backgroundColor: '#9BE0C6',
    borderColor: '#9BE0C6',
  },
  check: {
    color: '#263542',
    fontSize: 14,
    fontWeight: '700',
  },
  detalhesTarefa: {
    flex: 1,
  },
  nomeTarefa: {
    color: '#F7FAFD',
    fontSize: 14,
    fontWeight: '600',
  },
  textoConcluido: {
    color: '#DAE3EB',
    textDecorationLine: 'line-through',
  },
  categoriaTarefa: {
    color: '#E0E8EF',
    fontSize: 12,
    marginTop: 5,
  },
  etiquetaPrioridade: {
    backgroundColor: '#354858',
    paddingHorizontal: 9,
    paddingVertical: 5,
  },
  prioridadeAlta: {
    backgroundColor: '#533E4B',
  },
  prioridadeMedia: {
    backgroundColor: '#514634',
  },
  textoPrioridade: {
    color: '#D4E6F7',
    fontSize: 11,
    fontWeight: '600',
  },
  textoPrioridadeAlta: {
    color: '#FFADBA',
  },
  textoPrioridadeMedia: {
    color: '#FFDAA2',
  },
});
