import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ScrollView, Alert, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { COLORS, FONTS, SIZES } from '../constants/theme';
import { PawIcon } from '../components/Icons';

export default function ForgotPasswordScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleResetPassword = () => {
    setErrorMessage('');
    setSuccessMessage('');
    
    if (!email) {
      setErrorMessage('Por favor, informe seu e-mail.');
      return;
    }
    
    setLoading(true);
    
    // Simulação da chamada da API (o backend ainda não possui a rota de envio de e-mail)
    setTimeout(() => {
      setLoading(false);
      setSuccessMessage('Se o e-mail existir na nossa base de dados, um link de recuperação será enviado em instantes.');
    }, 1500);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.keyboard}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
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
            <Text style={styles.appName}>Recuperar Senha</Text>
            <Text style={styles.subtitle}>
              Insira seu e-mail para receber as instruções de recuperação
            </Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
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

            {errorMessage ? (
              <Text style={styles.errorText}>{errorMessage}</Text>
            ) : null}

            {successMessage ? (
              <Text style={styles.successText}>{successMessage}</Text>
            ) : null}

            <TouchableOpacity style={styles.resetButton} onPress={handleResetPassword} activeOpacity={0.85} disabled={loading}>
              {loading ? (
                <ActivityIndicator color={COLORS.textWhite} />
              ) : (
                <Text style={styles.resetButtonText}>Enviar Instruções</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.backButton} 
              onPress={() => navigation.goBack()}
              activeOpacity={0.85}
            >
              <Text style={styles.backButtonText}>Voltar para o Login</Text>
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
  keyboard: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: SIZES.xl,
  },
  logoArea: {
    alignItems: 'center',
    marginBottom: SIZES.xxl,
  },
  appName: {
    fontSize: SIZES.font3xl,
    color: COLORS.primary,
    ...FONTS.bold,
    marginBottom: SIZES.sm,
  },
  subtitle: {
    fontSize: SIZES.fontBase,
    color: COLORS.textGray,
    textAlign: 'center',
    ...FONTS.medium,
    paddingHorizontal: SIZES.xl,
  },
  form: {
    gap: SIZES.md,
  },
  inputContainer: {
    backgroundColor: COLORS.cardWhite,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.divider,
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    height: 48,
    paddingHorizontal: SIZES.base,
    fontSize: SIZES.fontXl,
    color: COLORS.textDark,
    ...FONTS.regular,
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginVertical: 5,
    ...FONTS.medium,
  },
  successText: {
    color: 'green',
    textAlign: 'center',
    marginVertical: 5,
    ...FONTS.medium,
  },
  resetButton: {
    backgroundColor: COLORS.primary,
    height: 50,
    borderRadius: SIZES.radiusSm,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: SIZES.sm,
  },
  resetButtonText: {
    fontSize: SIZES.fontXxl,
    color: COLORS.textWhite,
    ...FONTS.semiBold,
  },
  backButton: {
    alignItems: 'center',
    padding: SIZES.md,
    marginTop: SIZES.sm,
  },
  backButtonText: {
    fontSize: SIZES.fontLg,
    color: COLORS.textGray,
    ...FONTS.medium,
  },
});
