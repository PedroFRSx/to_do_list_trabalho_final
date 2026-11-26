import { Pressable, StyleSheet, Text, View } from 'react-native';

export default function CartaoResumo({
  titulo,
  valor,
  detalhe,
  cor,
  acao,
  aoPressionar,
  expandido,
}) {
  // Quando recebe uma ação, o cartão vira um botão. Os demais só exibem valores.
  const Container = aoPressionar ? Pressable : View;
  const interacao = aoPressionar
    ? {
      onPress: aoPressionar,
      accessibilityRole: 'button',
      accessibilityLabel: acao + ' tarefas atrasadas, ' + valor,
      accessibilityState: { expanded: expandido },
    }
    : {};

  return (
    <Container style={styles.cartaoResumo} {...interacao}>
      <View style={[styles.marcadorResumo, { backgroundColor: cor }]} />
      <Text style={styles.valorResumo}>{valor}</Text>
      <Text style={styles.tituloResumo}>{titulo}</Text>
      <Text style={styles.detalheResumo}>{detalhe}</Text>
      {acao ? <Text style={styles.acao}>{acao}</Text> : null}
    </Container>
  );
}

const styles = StyleSheet.create({
  cartaoResumo: {
    width: '48%',
    backgroundColor: '#495B6B',
    padding: 12,
    marginBottom: 12,
  },
  acao: { color: '#FFADB8', fontSize: 13, fontWeight: '700', marginTop: 6 },
  marcadorResumo: {
    width: 9,
    height: 9,
    marginBottom: 6,
  },
  valorResumo: {
    color: '#F7FAFD',
    fontSize: 24,
    fontWeight: '700',
  },
  tituloResumo: {
    color: '#F1F5F8',
    fontSize: 14,
    fontWeight: '600',
    marginTop: 3,
  },
  detalheResumo: {
    color: '#E0E8EF',
    fontSize: 12,
    marginTop: 4,
  },
});
