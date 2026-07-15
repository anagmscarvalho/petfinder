import { View, Text, StyleSheet } from 'react-native';
import { COLORS, FONTS, SIZES, SHADOWS } from '../constants/theme';

export default function InfoGrid({ pet }) {
  const rows = [
    [
      { label: 'ESPÉCIE', value: pet.species },
      { label: 'RAÇA', value: pet.breed },
    ],
    [
      { label: 'PORTE', value: pet.size },
      { label: 'COR', value: pet.color },
    ],
    [
      { label: 'BAIRRO', value: pet.location, full: true },
    ],
  ];

  return (
    <View style={[styles.card, SHADOWS.card]}>
      {rows.map((row, rowIdx) => (
        <View key={rowIdx} style={[styles.row, rowIdx > 0 && styles.rowSpaced]}>
          {row.map((item, idx) => (
            <View key={idx} style={item.full ? styles.cellFull : styles.cell}>
              <Text style={styles.label}>{item.label}</Text>
              <Text style={styles.value}>{item.value}</Text>
            </View>
          ))}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.cardWhite,
    borderRadius: SIZES.radiusLg,
    padding: SIZES.base,
    marginHorizontal: SIZES.base,
  },
  row: {
    flexDirection: 'row',
  },
  rowSpaced: {
    marginTop: SIZES.base,
  },
  cell: {
    flex: 1,
  },
  cellFull: {
    flex: 1,
  },
  label: {
    fontSize: SIZES.fontSm,
    color: COLORS.textGray,
    letterSpacing: 0.5,
    ...FONTS.semiBold,
  },
  value: {
    fontSize: SIZES.fontXl,
    color: COLORS.textDark,
    marginTop: 4,
    ...FONTS.medium,
  },
});
