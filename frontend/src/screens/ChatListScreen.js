import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, FONTS, SIZES } from '../constants/theme';
import { MOCK_CHATS } from '../constants/mockData';
import ChatItem from '../components/ChatItem';
import { ChatListIcon } from '../components/Icons';

export default function ChatListScreen() {
  const unreadCount = MOCK_CHATS.filter((c) => c.unread > 0).length;

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>Mensagens</Text>
            {unreadCount > 0 && (
              <Text style={styles.headerSub}>
                {unreadCount} conversa{unreadCount > 1 ? 's' : ''} não lida{unreadCount > 1 ? 's' : ''}
              </Text>
            )}
          </View>
          <ChatListIcon size={28} color={COLORS.primary} />
        </View>

        {/* Chat List */}
        <View style={styles.list}>
          {MOCK_CHATS.map((chat) => (
            <ChatItem key={chat.id} chat={chat} />
          ))}
        </View>

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
