import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, FONTS, SIZES } from '../constants/theme';
import { PawIcon } from '../components/Icons';

export default function SignUpScreen({ navigation }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSignUp = () => {
    // Navegação simulada — sem autenticação real
    navigation.replace('MainTabs');
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Logo Area */}
          <View style={styles.logoArea}>
            <View style={{ marginBottom: SIZES.md }}>
              <PawIcon size={48} color={COLORS.primary} />
            </View>
            <Text style={styles.appName}>Criar Conta</Text>
            <Text style={styles.subtitle}>
              Preencha seus dados para começar a usar o PetFinder
            </Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Nome completo"
                placeholderTextColor={COLORS.textGray}
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
              />
            </View>

            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="email@mail.com"
                placeholderTextColor={COLORS.textGray}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Senha"
                placeholderTextColor={COLORS.textGray}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
            </View>

            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Confirmar senha"
                placeholderTextColor={COLORS.textGray}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
              />
            </View>

            <TouchableOpacity style={styles.signupButton} onPress={handleSignUp} activeOpacity={0.85}>
              <Text style={styles.signupButtonText}>Criar Conta</Text>
            </TouchableOpacity>

            {/* Terms */}
            <Text style={styles.terms}>
              Ao criar uma conta, você concorda com os{' '}
              <Text style={styles.termsLink}>Termos de Uso</Text> e a{' '}
              <Text style={styles.termsLink}>Política de Privacidade</Text>.
            </Text>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Já tem uma conta? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.footerLink}>Fazer Login</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: SIZES.xl,
    justifyContent: 'center',
  },
  logoArea: {
    alignItems: 'center',
    marginBottom: SIZES.xxl,
  },
  appName: {
    fontSize: SIZES.font3xl,
    color: COLORS.primary,
    ...FONTS.bold,
  },
  subtitle: {
    fontSize: SIZES.fontBase,
    color: COLORS.textGray,
    textAlign: 'center',
    marginTop: SIZES.sm,
    lineHeight: 20,
    paddingHorizontal: SIZES.lg,
  },
  form: {
    gap: SIZES.md,
  },
  inputContainer: {
    backgroundColor: COLORS.cardWhite,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.divider,
  },
  input: {
    height: 48,
    paddingHorizontal: SIZES.base,
    fontSize: SIZES.fontXl,
    color: COLORS.textDark,
    ...FONTS.regular,
  },
  signupButton: {
    backgroundColor: COLORS.primary,
    height: 50,
    borderRadius: SIZES.radiusSm,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: SIZES.sm,
  },
  signupButtonText: {
    fontSize: SIZES.fontXxl,
    color: COLORS.textWhite,
    ...FONTS.semiBold,
  },
  terms: {
    fontSize: SIZES.fontMd,
    color: COLORS.textGray,
    textAlign: 'center',
    lineHeight: 18,
  },
  termsLink: {
    color: COLORS.primary,
    ...FONTS.medium,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: SIZES.xxl,
    paddingBottom: SIZES.lg,
  },
  footerText: {
    fontSize: SIZES.fontLg,
    color: COLORS.textGray,
  },
  footerLink: {
    fontSize: SIZES.fontLg,
    color: COLORS.primary,
    ...FONTS.semiBold,
  },
});
