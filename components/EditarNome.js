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

export default function EditarNome({ nome, aoSalvar, aoFechar }) {
  // O nome digitado vira a saudação de Hoje somente quando o usuário salva.
  const [nomeDigitado, setNomeDigitado] = useState(nome);
  const [erro, setErro] = useState('');
  const inicial =
    Array.from(nomeDigitado.trim())[0]?.toLocaleUpperCase('pt-BR') ?? '?';

  function salvar() {
    const nomeLimpo = nomeDigitado.trim();
    if (!nomeLimpo) {
      setErro('Digite seu nome.');
      return;
    }
    aoSalvar(nomeLimpo);
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
              <Text style={styles.titulo}>Perfil</Text>
              <Pressable
                accessibilityRole="button"
                onPress={aoFechar}
                style={styles.voltar}>
                <Text style={styles.link}>Voltar</Text>
              </Pressable>
            </View>
            <View style={styles.cartao}>
              <View style={styles.avatar}>
                <Text style={styles.inicial}>{inicial}</Text>
              </View>
              <Text style={styles.rotulo}>Nome</Text>
              <TextInput
                accessibilityLabel="Nome"
                value={nomeDigitado}
                onChangeText={(texto) => {
                  setNomeDigitado(texto);
                  setErro('');
                }}
                onSubmitEditing={salvar}
                returnKeyType="done"
                autoCapitalize="words"
                maxLength={40}
                style={styles.campo}
                placeholder="Seu nome"
                placeholderTextColor="#C8D3DD"
              />
              {erro ? (
                <Text accessibilityRole="alert" style={styles.erro}>
                  {erro}
                </Text>
              ) : null}
              <Pressable
                accessibilityRole="button"
                style={styles.salvar}
                onPress={salvar}>
                <Text style={styles.salvarTexto}>Salvar nome</Text>
              </Pressable>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  tela: { flex: 1, backgroundColor: '#263542' },
  conteudo: { width: '100%', maxWidth: 560, alignSelf: 'center', padding: 20 },
  cabecalho: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  titulo: { color: '#F7FAFD', fontSize: 28, fontWeight: '700' },
  voltar: { minHeight: 44, justifyContent: 'center', paddingHorizontal: 8 },
  link: { color: '#FFADB8', fontWeight: '700' },
  cartao: { backgroundColor: '#495B6B', padding: 16 },
  avatar: {
    width: 60,
    height: 60,
    backgroundColor: '#FF8190',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
  },
  inicial: { color: '#263542', fontSize: 26, fontWeight: '700' },
  rotulo: { color: '#F7FAFD', fontWeight: '700', marginBottom: 8 },
  campo: {
    minHeight: 46,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#354858',
    color: '#F7FAFD',
    fontSize: 16,
  },
  erro: { color: '#FFADB8', marginTop: 8 },
  salvar: {
    backgroundColor: '#FF8190',
    alignItems: 'center',
    marginTop: 16,
    padding: 14,
  },
  salvarTexto: { color: '#263542', fontWeight: '700', fontSize: 16 },
});
