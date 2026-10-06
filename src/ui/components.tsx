import type { ReactNode } from 'react';
import { Platform, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from './theme';

export function Screen({ children }: { children: ReactNode }) {
  const t = useTheme();
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: t.bg }} edges={['top', 'left', 'right']}>
      <ScrollView
        contentContainerStyle={{
          padding: 24,
          paddingBottom: 48,
          gap: 16,
          maxWidth: 680,
          width: '100%',
          alignSelf: 'center',
        }}
        keyboardShouldPersistTaps="handled"
      >
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}

export function Title({
  children,
  size = 32,
  style,
}: {
  children: ReactNode;
  size?: number;
  style?: any;
}) {
  const t = useTheme();
  return (
    <Text
      style={[
        {
          fontFamily: t.fonts.title,
          fontSize: size,
          lineHeight: size * 1.18,
          color: t.text,
          letterSpacing: -0.5,
        },
        style,
      ]}
    >
      {children}
    </Text>
  );
}

export function Body({
  children,
  muted,
  style,
}: {
  children: ReactNode;
  muted?: boolean;
  style?: any;
}) {
  const t = useTheme();
  return (
    <Text
      style={[
        {
          fontFamily: t.fonts.body,
          fontSize: 16,
          lineHeight: 23,
          color: muted ? t.muted : t.text,
        },
        style,
      ]}
    >
      {children}
    </Text>
  );
}

export function Label({ children }: { children: ReactNode }) {
  const t = useTheme();
  return (
    <Text
      style={{
        fontFamily: t.fonts.bodyBold,
        fontSize: 12,
        letterSpacing: 1.5,
        textTransform: 'uppercase',
        color: t.muted,
      }}
    >
      {children}
    </Text>
  );
}

export function Card({ children, onPress }: { children: ReactNode; onPress?: () => void }) {
  const t = useTheme();
  const baseStyle = {
    backgroundColor: t.surface,
    borderRadius: 20,
    padding: 20,
    gap: 10,
    borderWidth: 1,
    borderColor: t.border,
    ...(Platform.OS === 'web'
      ? ({
          cursor: onPress ? 'pointer' : 'default',
          boxShadow: '0 2px 12px rgba(0,0,0,0.03)',
          transition: 'all 0.2s ease',
        } as any)
      : {}),
  };

  if (!onPress) return <View style={baseStyle}>{children}</View>;

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        baseStyle,
        {
          opacity: pressed ? 0.85 : 1,
          transform: [{ scale: pressed ? 0.995 : 1 }],
        },
      ]}
    >
      {children}
    </Pressable>
  );
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  disabled,
}: {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'ghost';
  disabled?: boolean;
}) {
  const t = useTheme();
  const primary = variant === 'primary';
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => ({
        backgroundColor: primary ? t.accent : 'transparent',
        borderWidth: primary ? 0 : 1,
        borderColor: t.border,
        borderRadius: 999,
        paddingVertical: 15,
        paddingHorizontal: 24,
        alignItems: 'center',
        justifyContent: 'center',
        opacity: disabled ? 0.4 : pressed ? 0.85 : 1,
        ...(Platform.OS === 'web'
          ? ({
              cursor: disabled ? 'not-allowed' : 'pointer',
              userSelect: 'none',
              transition: 'all 0.15s ease',
            } as any)
          : {}),
      })}
    >
      <Text
        style={{
          fontFamily: t.fonts.bodyBold,
          fontSize: 16,
          color: primary ? '#FFFFFF' : t.text,
          letterSpacing: 0.2,
        }}
      >
        {title}
      </Text>
    </Pressable>
  );
}

export function Chip({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected?: boolean;
  onPress: () => void;
}) {
  const t = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={({ pressed }) => ({
        borderRadius: 999,
        paddingHorizontal: 16,
        paddingVertical: 9,
        borderWidth: 1,
        borderColor: selected ? t.accent : t.border,
        backgroundColor: selected ? t.accent : 'transparent',
        opacity: pressed ? 0.8 : 1,
        alignItems: 'center',
        justifyContent: 'center',
        ...(Platform.OS === 'web' ? ({ cursor: 'pointer', userSelect: 'none' } as any) : {}),
      })}
    >
      <Text
        style={{
          fontFamily: t.fonts.bodyBold,
          fontSize: 14,
          color: selected ? '#FFFFFF' : t.text,
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}

export function LoadStepper({
  value,
  step,
  onChange,
}: {
  value: number | null;
  step: number;
  onChange: (v: number) => void;
}) {
  const current = value ?? 0;
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
      <Chip label="−" onPress={() => onChange(Math.max(0, current - step))} />
      <Body>{value === null ? '— kg' : `${value} kg`}</Body>
      <Chip label="+" onPress={() => onChange(current + step)} />
    </View>
  );
}

export function TextInputField({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry,
  keyboardType = 'default',
  autoCapitalize = 'none',
  error,
}: {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  error?: string;
}) {
  const t = useTheme();
  return (
    <View style={{ gap: 6, width: '100%' }}>
      <Label>{label}</Label>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={t.muted}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        style={{
          backgroundColor: t.surface,
          borderWidth: 1,
          borderColor: error ? '#E11D48' : t.border,
          borderRadius: 14,
          paddingHorizontal: 16,
          paddingVertical: 13,
          fontSize: 16,
          color: t.text,
          fontFamily: t.fonts.body,
        }}
      />
      {error ? (
        <Text style={{ color: '#E11D48', fontSize: 13, fontFamily: t.fonts.body }}>{error}</Text>
      ) : null}
    </View>
  );
}

