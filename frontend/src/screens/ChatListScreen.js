import { useState, useCallback, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { COLORS, FONTS, SIZES } from '../constants/theme';
import ChatItem from '../components/ChatItem';
import { ChatListIcon, ArrowLeftIcon } from '../components/Icons';
import { getConversations } from '../services/api';
import { useAuth } from '../services/auth';

export default function ChatListScreen({ navigation }) {
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const { token } = useAuth();

  const fetchConversations = useCallback(async () => {
    if (!token) return;
    try {
      const data = await getConversations(token);
      if (data) setChats(data);
    } catch (err) {
      console.error('Erro ao carregar conversas:', err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useFocusEffect(
    useCallback(() => {
      fetchConversations();
      const interval = setInterval(fetchConversations, 5000);
      return () => clearInterval(interval);
    }, [fetchConversations])
  );

  const groupChatsByUser = (conversations) => {
    const groups = {};
    conversations.forEach(c => {
      const otherUserId = c.outro_usuario?.id;
      if (!otherUserId) return;

      if (!groups[otherUserId]) {
        groups[otherUserId] = {
          userId: otherUserId,
          user: c.outro_usuario,
          contexts: [],
          totalUnread: 0,
          latestMessage: null,
          latestDate: null,
        };
      }
      
      groups[otherUserId].contexts.push(c);
      groups[otherUserId].totalUnread += c.nao_lidas || 0;

      const dateStr = c.ultima_mensagem?.criado_em || c.criado_em;
      const cDate = dateStr ? new Date(dateStr) : new Date(0);
      
      if (!groups[otherUserId].latestDate || cDate > groups[otherUserId].latestDate) {
        groups[otherUserId].latestDate = cDate;
        groups[otherUserId].latestMessage = c.ultima_mensagem;
      }
    });

    return Object.values(groups).sort((a, b) => b.latestDate - a.latestDate);
  };

  const formatUserGroup = (group) => {
    const name = group.user?.nome_completo || 'Usuário';
    const initials = name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
    const lastMessage = group.latestMessage?.texto || 'Nova conversa...';
    
    let time = '';
    if (group.latestDate && group.latestDate.getTime() > 0) {
      time = group.latestDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    return {
      id: group.userId.toString(),
      userId: group.userId,
      name,
      initials,
      initialsColor: COLORS.primary,
      lastMessage,
      time,
      unread: group.totalUnread,
    };
  };

  const userGroups = groupChatsByUser(chats);
  const formattedChats = userGroups.map(formatUserGroup);
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
              <Text style={styles.headerTitle}>Mensagens</Text>
            {unreadCount > 0 && (
              <Text style={styles.headerSub}>
                {unreadCount} conversa{unreadCount > 1 ? 's' : ''} com novas mensagens
              </Text>
            )}
            </View>
          </View>
          <ChatListIcon size={28} color={COLORS.primary} />
        </View>

        {/* Chat List */}
        {loading && chats.length === 0 ? (
          <View style={{ marginTop: 40, alignItems: 'center' }}>
            <ActivityIndicator size="large" color={COLORS.primary} />
          </View>
        ) : formattedChats.length > 0 ? (
          <View style={styles.list}>
            {formattedChats.map((chat) => (
              <ChatItem 
                key={chat.id} 
                chat={chat} 
                onPress={() => navigation.navigate('UserContexts', { userId: chat.userId, userName: chat.name })} 
              />
            ))}
          </View>
        ) : (
          <View style={{ marginTop: 40, alignItems: 'center', paddingHorizontal: 20 }}>
            <Text style={{ fontSize: SIZES.fontLg, color: COLORS.textGray, textAlign: 'center' }}>
              Você ainda não tem nenhuma conversa.
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
    fontSize: SIZES.font3xl,
    color: COLORS.textTitle,
    ...FONTS.bold,
  },
  headerSub: {
    fontSize: SIZES.fontBase,
    color: COLORS.primary,
    marginTop: 2,
    ...FONTS.medium,
  },
  list: {
    paddingHorizontal: SIZES.base,
  },
});
