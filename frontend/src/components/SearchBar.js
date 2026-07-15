import { View, TextInput, StyleSheet } from 'react-native';
import { COLORS, FONTS, SIZES } from '../constants/theme';
import { SearchIcon } from './Icons';

export default function SearchBar({ placeholder = 'Buscar...', value, onChangeText }) {
  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <SearchIcon size={20} color={COLORS.textGray} />
      </View>
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor={COLORS.textGray}
        value={value}
        onChangeText={onChangeText}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.cardWhite,
    borderRadius: SIZES.radiusMd,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: SIZES.base,
    height: 44,
    marginHorizontal: SIZES.base,
  },
  iconContainer: {
    marginRight: SIZES.sm,
  },
  input: {
    flex: 1,
    fontSize: SIZES.fontXl,
    color: COLORS.textDark,
    ...FONTS.regular,
    paddingVertical: 0,
  },
});
