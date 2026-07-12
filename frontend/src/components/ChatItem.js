import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS, FONTS, SIZES, SHADOWS } from '../constants/theme';

export default function ChatItem({ chat, onPress }) {
  const hasUnread = chat.unread > 0;

  return (
    <TouchableOpacity
      style={[styles.card, SHADOWS.cardLight]}
      onPress={() => onPress?.(chat)}
      activeOpacity={0.85}
    >
      {/* Avatar */}
      <View style={[styles.avatar, { backgroundColor: chat.initialsColor + '18' }]}>
        <Text style={[styles.avatarText, { color: chat.initialsColor }]}>{chat.initials}</Text>
      </View>

      {/* Content */}
      <View style={styles.content}>
        <Text style={[styles.name, hasUnread && styles.nameBold]}>{chat.name}</Text>
        <Text style={styles.message} numberOfLines={1}>{chat.lastMessage}</Text>
      </View>

      {/* Time + Badge */}
      <View style={styles.meta}>
        <Text style={styles.time}>{chat.time}</Text>
        {hasUnread && (
          <View style={styles.unreadBadge}>
            <Text style={styles.unreadText}>{chat.unread}</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.cardWhite,
    borderRadius: SIZES.radiusLg,
    flexDirection: 'row',
    alignItems: 'center',
    padding: SIZES.base,
    marginBottom: SIZES.sm,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: SIZES.fontXxl,
    ...FONTS.bold,
  },
  content: {
    flex: 1,
    marginLeft: SIZES.md,
  },
  name: {
    fontSize: SIZES.fontXl,
    color: COLORS.textDark,
    ...FONTS.medium,
  },
  nameBold: {
    ...FONTS.bold,
  },
  message: {
    fontSize: SIZES.fontBase,
    color: COLORS.textGray,
    marginTop: 4,
  },
  meta: {
    alignItems: 'flex-end',
    gap: 8,
  },
  time: {
    fontSize: SIZES.fontSm,
    color: COLORS.textGray,
  },
  unreadBadge: {
    backgroundColor: COLORS.primary,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  unreadText: {
    fontSize: 10,
    color: COLORS.textWhite,
    ...FONTS.bold,
  },
});
