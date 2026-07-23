import { useState, useCallback, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, KeyboardAvoidingView, Platform, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { COLORS, FONTS, SIZES } from '../constants/theme';
import { ArrowLeftIcon, CheckIcon, DoubleCheckIcon, TrashIcon } from '../components/Icons';
import { getMessages, sendMessage, deleteConversation } from '../services/api';
import { useAuth } from '../services/auth';

export default function ChatScreen({ navigation, route }) {
  const { conversaId, chatName } = route.params;
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const { user, token } = useAuth();
  const flatListRef = useRef(null);

  const fetchMessages = useCallback(async () => {
    if (!token || !conversaId) return;
    try {
      const data = await getMessages(token, conversaId);
      if (data) setMessages(data);
    } catch (err) {
      console.error('Erro ao carregar mensagens:', err);
    } finally {
      setLoading(false);
    }
  }, [token, conversaId]);

  useFocusEffect(
    useCallback(() => {
      fetchMessages();
      const interval = setInterval(fetchMessages, 3000);
      return () => clearInterval(interval);
    }, [fetchMessages])
  );

  const handleSend = async () => {
    if (!text.trim() || !token || !conversaId) return;
    try {
      // Optimistic update
      const tempMsg = {
        id: Date.now(),
        texto: text,
        remetente_id: user.id,
        criado_em: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, tempMsg]);
      setText('');
      
      await sendMessage(token, conversaId, tempMsg.texto);
      fetchMessages(); // refresh with real data
    } catch (err) {
      console.error('Erro ao enviar mensagem:', err);
    }
  };

  const handleDeleteChat = () => {
    if (Platform.OS === 'web') {
      const confirmed = window.confirm('Tem certeza que deseja apagar essa conversa? Essa ação não pode ser desfeita.');
      if (confirmed) {
        deleteConversation(token, conversaId)
          .then(() => navigation.goBack())
          .catch(() => window.alert('Não foi possível apagar a conversa.'));
      }
      return;
    }
    Alert.alert(
      'Apagar Conversa',
      'Tem certeza que deseja apagar essa conversa? Essa ação não pode ser desfeita.',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Apagar', 
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteConversation(token, conversaId);
              navigation.goBack();
            } catch (err) {
              Alert.alert('Erro', 'Não foi possível apagar a conversa.');
            }
          }
        }
      ]
    );
  };

  const renderItem = ({ item }) => {
    const isMe = item.remetente_id === user.id;
    return (
      <View style={[styles.messageBubble, isMe ? styles.messageMe : styles.messageThem]}>
        <Text style={[styles.messageText, isMe ? styles.messageTextMe : styles.messageTextThem]}>
          {item.texto}
        </Text>
        {isMe && (
          <View style={styles.ticksContainer}>
            {item.lida === undefined ? (
              <CheckIcon size={14} color="rgba(255,255,255,0.6)" />
            ) : item.lida ? (
              <DoubleCheckIcon size={14} color="#FFFFFF" />
            ) : (
              <DoubleCheckIcon size={14} color="rgba(255,255,255,0.6)" />
            )}
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView 
        style={styles.keyboardView} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <ArrowLeftIcon size={20} color={COLORS.textTitle} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{chatName || 'Chat'}</Text>
          <TouchableOpacity onPress={handleDeleteChat} style={styles.deleteButton}>
            <TrashIcon size={20} color={COLORS.danger || '#FF3B30'} />
          </TouchableOpacity>
        </View>

        {/* Messages */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.primary} />
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderItem}
            contentContainerStyle={styles.listContent}
            onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
            onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
            showsVerticalScrollIndicator={false}
          />
        )}

        {/* Input */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Digite uma mensagem..."
            value={text}
            onChangeText={setText}
            multiline
          />
          <TouchableOpacity 
            style={[styles.sendButton, !text.trim() && styles.sendButtonDisabled]} 
            onPress={handleSend}
            disabled={!text.trim()}
          >
            <Text style={styles.sendButtonText}>Enviar</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SIZES.lg,
    paddingVertical: SIZES.sm,
    backgroundColor: COLORS.background,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.cardWhite,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 59, 48, 0.1)', // light red background
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: SIZES.fontXl,
    color: COLORS.textTitle,
    ...FONTS.bold,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: SIZES.base,
    gap: SIZES.sm,
  },
  messageBubble: {
    maxWidth: '80%',
    padding: SIZES.md,
    borderRadius: SIZES.radiusLg,
  },
  messageMe: {
    alignSelf: 'flex-end',
    backgroundColor: COLORS.primary,
    borderBottomRightRadius: 4,
  },
  messageThem: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.cardWhite,
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: SIZES.fontBase,
    ...FONTS.medium,
  },
  messageTextMe: {
    color: COLORS.textWhite,
  },
  messageTextThem: {
    color: COLORS.textDark,
  },
  ticksContainer: {
    alignSelf: 'flex-end',
    marginTop: 2,
    marginLeft: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SIZES.sm,
    backgroundColor: COLORS.cardWhite,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 100,
    backgroundColor: COLORS.background,
    borderRadius: SIZES.radiusLg,
    paddingHorizontal: SIZES.md,
    paddingTop: 10,
    paddingBottom: 10,
    fontSize: SIZES.fontBase,
    color: COLORS.textDark,
  },
  sendButton: {
    marginLeft: SIZES.sm,
    backgroundColor: COLORS.primary,
    paddingHorizontal: SIZES.md,
    paddingVertical: SIZES.sm,
    borderRadius: SIZES.radiusLg,
  },
  sendButtonDisabled: {
    backgroundColor: COLORS.border,
  },
  sendButtonText: {
    color: COLORS.textWhite,
    ...FONTS.bold,
  },
});
