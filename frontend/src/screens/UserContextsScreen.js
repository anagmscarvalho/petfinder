import { useState, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { COLORS, FONTS, SIZES, SHADOWS } from '../constants/theme';
import { ArrowLeftIcon } from '../components/Icons';
import { getConversations } from '../services/api';
import { useAuth } from '../services/auth';

function ContextItem({ chat, onPress }) {
  return (
    <TouchableOpacity style={[styles.chatItem, SHADOWS.card]} onPress={onPress} activeOpacity={0.7}>
      <View style={[styles.avatar, { backgroundColor: COLORS.primary }]}>
        <Text style={styles.avatarText}>{chat.initials}</Text>
      </View>
      <View style={styles.chatInfo}>
        <View style={styles.chatHeaderRow}>
          <Text style={styles.chatName} numberOfLines={1}>{chat.name}</Text>
          <Text style={styles.chatTime}>{chat.time}</Text>
        </View>
        <Text style={styles.chatMessage} numberOfLines={1}>{chat.lastMessage}</Text>
      </View>
      {chat.unread > 0 && (
        <View style={styles.unreadBadge}>
          <Text style={styles.unreadText}>{chat.unread}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

export default function UserContextsScreen({ navigation, route }) {
  const { userId, userName } = route.params;
  const { token } = useAuth();
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchConversations = useCallback(async () => {
    if (!token) return;
    try {
      const data = await getConversations(token);
      if (data) {
        // Filtra apenas as conversas com esse usuário
        const filtered = data.filter(c => c.outro_usuario?.id === userId);
        setChats(filtered);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [token, userId]);

  useFocusEffect(
    useCallback(() => {
      fetchConversations();
      const interval = setInterval(fetchConversations, 5000);
      return () => clearInterval(interval);
    }, [fetchConversations])
  );

  const formatChat = (c) => {
    const lastMessage = c.ultima_mensagem?.texto || 'Nova conversa...';
    
    let time = '';
    const dateStr = c.ultima_mensagem?.criado_em || c.criado_em;
    if (dateStr) {
      const date = new Date(dateStr);
      time = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    return {
      id: c.id,
      name: `Sobre ${c.pet?.nome || 'Pet'}`,
      initials: (c.pet?.nome || 'PT').slice(0, 2).toUpperCase(),
      lastMessage,
      time,
      unread: c.nao_lidas || 0,
    };
  };

  const formattedChats = chats.map(formatChat);
  const unreadCount = formattedChats.reduce((acc, c) => acc + c.unread, 0);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
              <ArrowLeftIcon size={20} color={COLORS.textTitle} />
            </TouchableOpacity>
            <View>
              <Text style={styles.headerTitle}>{userName}</Text>
            {unreadCount > 0 && (
              <Text style={styles.headerSub}>
                {unreadCount} nova{unreadCount > 1 ? 's' : ''} mensagem{unreadCount > 1 ? 'ns' : ''}
              </Text>
            )}
            </View>
          </View>
        </View>

        {/* Chat List */}
        {loading && chats.length === 0 ? (
          <View style={{ marginTop: 40, alignItems: 'center' }}>
            <ActivityIndicator size="large" color={COLORS.primary} />
          </View>
        ) : formattedChats.length > 0 ? (
          <View style={styles.list}>
            {formattedChats.map((chat) => (
              <ContextItem 
                key={chat.id} 
                chat={chat} 
                onPress={() => navigation.navigate('Chat', { conversaId: chat.id, chatName: chat.name })} 
              />
            ))}
          </View>
        ) : (
          <View style={{ marginTop: 40, alignItems: 'center', paddingHorizontal: 20 }}>
            <Text style={{ fontSize: SIZES.fontLg, color: COLORS.textGray, textAlign: 'center' }}>
              Nenhuma conversa encontrada neste contexto.
            </Text>
          </View>
        )}

        <View style={{ height: 20 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scroll: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SIZES.lg,
    paddingTop: SIZES.sm,
    paddingBottom: SIZES.md,
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
  headerTitle: {
    fontSize: SIZES.font2xl,
    color: COLORS.textTitle,
    ...FONTS.bold,
  },
  headerSub: {
    fontSize: SIZES.fontBase,
    color: COLORS.primary,
    ...FONTS.semiBold,
  },
  list: {
    paddingHorizontal: SIZES.base,
    marginTop: SIZES.md,
    gap: SIZES.base,
  },
  chatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SIZES.base,
    backgroundColor: COLORS.cardWhite,
    borderRadius: SIZES.radiusLg,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: COLORS.textWhite,
    fontSize: SIZES.fontLg,
    ...FONTS.bold,
  },
  chatInfo: {
    flex: 1,
    marginLeft: SIZES.base,
  },
  chatHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  chatName: {
    flex: 1,
    fontSize: SIZES.fontLg,
    color: COLORS.textTitle,
    ...FONTS.semiBold,
  },
  chatTime: {
    fontSize: SIZES.fontSm,
    color: COLORS.textGray,
    ...FONTS.regular,
  },
  chatMessage: {
    fontSize: SIZES.fontBase,
    color: COLORS.textGray,
    ...FONTS.regular,
  },
  unreadBadge: {
    backgroundColor: COLORS.primary,
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
    marginLeft: SIZES.sm,
  },
  unreadText: {
    color: COLORS.textWhite,
    fontSize: SIZES.fontSm,
    ...FONTS.bold,
  },
});
