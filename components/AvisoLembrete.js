import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useTarefas } from '@/context/TarefasContext';
import { buscarAviso, chaveLembrete } from '@/utils/lembretes';

export default function AvisoLembrete() {
  const { tarefas, agora } = useTarefas();
  const [dispensados, setDispensados] = useState({});
  const aviso = buscarAviso(tarefas, agora, dispensados);
  if (!aviso) return null;

  return (
    <SafeAreaView style={styles.area} edges={['left', 'right']}>
      <View style={styles.cartao} accessibilityLiveRegion="polite">
        <View style={styles.conteudo}>
          <Text style={styles.titulo}>Lembrete</Text>
          <Text style={styles.texto}>{aviso.titulo} · {aviso.horario}</Text>
        </View>
        <Pressable
          accessibilityRole="button"
          style={styles.botao}
          onPress={() => {
            // A data, a hora ou a antecedência nova podem gerar outro aviso.
            setDispensados((atuais) => ({ ...atuais, [aviso.id]: chaveLembrete(aviso) }));
          }}>
          <Text style={styles.titulo}>Dispensar</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  area: { backgroundColor: '#495B6B' },
  cartao: {
    borderLeftWidth: 4,
    borderLeftColor: '#FF8190',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  conteudo: { flex: 1, minWidth: 0, paddingVertical: 8 },
  titulo: { color: '#FFADB8', fontWeight: '700' },
  texto: { color: '#F7FAFD', marginTop: 3 },
  botao: { minHeight: 44, paddingHorizontal: 8, justifyContent: 'center' },
});
