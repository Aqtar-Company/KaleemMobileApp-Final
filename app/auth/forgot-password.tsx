import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { Button } from "@/components/UI";
import { forgotPasswordApi } from "@/services/auth";

export default function ForgotPasswordScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async () => {
    if (!email.trim()) {
      Alert.alert("خطأ", "يرجى إدخال البريد الإلكتروني");
      return;
    }
    setLoading(true);
    try {
      await forgotPasswordApi(email.trim());
      setSent(true);
    } catch (e) {
      const message = e instanceof Error && e.message ? e.message : "تعذر إرسال رابط الاستعادة";
      Alert.alert("خطأ", message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <LinearGradient
        colors={["#007A68", "#004D40"]}
        style={[styles.header, { paddingTop: insets.top + 20 }]}
      >
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-right" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>استعادة كلمة المرور</Text>
        <Text style={styles.headerSubtitle}>سنرسل لك رابط لإعادة تعيين كلمة المرور</Text>
      </LinearGradient>

      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={[styles.form, { paddingBottom: insets.bottom + 32 }]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {sent ? (
            <View style={styles.sentBox}>
              <View style={[styles.sentIcon, { backgroundColor: colors.primary + "18" }]}>
                <Feather name="mail" size={36} color={colors.primary} />
              </View>
              <Text style={[styles.sentTitle, { color: colors.foreground }]}>
                تم إرسال الرابط
              </Text>
              <Text style={[styles.sentBody, { color: colors.mutedForeground }]}>
                اتبع التعليمات في بريدك الإلكتروني {email} لإعادة تعيين كلمة المرور.
              </Text>
              <Button title="عودة لتسجيل الدخول" onPress={() => router.replace("/auth/login")} style={{ marginTop: 20 }} />
            </View>
          ) : (
            <>
              <View style={styles.inputWrapper}>
                <Text style={[styles.label, { color: colors.mutedForeground }]}>البريد الإلكتروني</Text>
                <View style={[styles.inputContainer, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius }]}>
                  <Feather name="mail" size={18} color={colors.mutedForeground} style={styles.inputIcon} />
                  <TextInput
                    style={[styles.input, { color: colors.foreground }]}
                    value={email}
                    onChangeText={setEmail}
                    placeholder="example@email.com"
                    placeholderTextColor={colors.mutedForeground}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    textAlign="right"
                  />
                </View>
              </View>

              <Button title="إرسال رابط الاستعادة" onPress={handleSubmit} loading={loading} style={{ marginTop: 8 }} />

              <TouchableOpacity style={styles.loginLink} onPress={() => router.back()}>
                <Text style={[styles.loginText, { color: colors.primary }]}>العودة لتسجيل الدخول</Text>
              </TouchableOpacity>
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: 24,
    paddingBottom: 32,
    alignItems: "center",
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  backBtn: { position: "absolute", right: 24, top: 40 },
  headerTitle: { fontSize: 22, fontWeight: "700", color: "#fff", fontFamily: "Inter_700Bold", marginBottom: 4 },
  headerSubtitle: { fontSize: 13, color: "rgba(255,255,255,0.85)", fontFamily: "Inter_400Regular", textAlign: "center" },
  form: { paddingHorizontal: 24, paddingTop: 32 },
  inputWrapper: { marginBottom: 16 },
  label: { fontSize: 13, fontWeight: "500", fontFamily: "Inter_500Medium", textAlign: "right", marginBottom: 8 },
  inputContainer: { flexDirection: "row", alignItems: "center", borderWidth: 1.5 },
  inputIcon: { paddingHorizontal: 14 },
  input: { flex: 1, fontSize: 15, fontFamily: "Inter_400Regular", paddingVertical: 14, paddingEnd: 14, textAlign: "right" },
  loginLink: { alignItems: "center", marginTop: 20 },
  loginText: { fontSize: 14, fontFamily: "Inter_500Medium" },
  sentBox: { alignItems: "center", paddingTop: 20, gap: 10 },
  sentIcon: { width: 80, height: 80, borderRadius: 40, alignItems: "center", justifyContent: "center" },
  sentTitle: { fontSize: 20, fontWeight: "700", fontFamily: "Inter_700Bold" },
  sentBody: { fontSize: 14, fontFamily: "Inter_400Regular", textAlign: "center", lineHeight: 22, paddingHorizontal: 8 },
});
