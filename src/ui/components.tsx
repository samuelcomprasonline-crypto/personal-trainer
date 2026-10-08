import type { ReactNode } from 'react';
import { Platform, Pressable, ScrollView, Text, TextInput, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle } from 'react-native-svg';
import { useTheme } from './theme';
import { WebDashboardLayout } from './WebDashboardLayout';

export function Screen({
  children,
  hideNav = false,
}: {
  children: ReactNode;
  hideNav?: boolean;
}) {
  const t = useTheme();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;

  const content = (
    <SafeAreaView style={{ flex: 1, backgroundColor: t.bg }} edges={['top', 'left', 'right']}>
      <ScrollView
        contentContainerStyle={{
          padding: isDesktop ? (hideNav ? 40 : 32) : 16,
          paddingBottom: isDesktop ? (hideNav ? 40 : 32) : 110,
          gap: isDesktop ? 18 : 14,
          maxWidth: isDesktop ? (hideNav ? 560 : 1320) : 640,
          width: '100%',
          alignSelf: 'center',
          justifyContent: hideNav ? 'center' : 'flex-start',
        }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {children}
      </ScrollView>
    </SafeAreaView>
  );

  if (hideNav) {
    return content;
  }

  return <WebDashboardLayout>{content}</WebDashboardLayout>;
}

export function Title({
  children,
  size = 26,
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
          fontSize: size,
          fontWeight: '700',
          lineHeight: size * 1.2,
          color: t.text,
          letterSpacing: -0.4,
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
          fontSize: 15,
          lineHeight: 22,
          color: muted ? t.muted : t.text,
        },
        style,
      ]}
    >
      {children}
    </Text>
  );
}

export function Label({
  children,
  style,
}: {
  children: ReactNode;
  style?: any;
}) {
  const t = useTheme();
  return (
    <Text
      style={[
        {
          fontSize: 11.5,
          fontWeight: '600',
          letterSpacing: 1.0,
          textTransform: 'uppercase',
          color: t.muted,
        },
        style,
      ]}
    >
      {children}
    </Text>
  );
}

export function Card({
  children,
  onPress,
  style,
}: {
  children: ReactNode;
  onPress?: () => void;
  style?: any;
}) {
  const t = useTheme();
  const baseStyle = {
    backgroundColor: t.surface,
    borderRadius: t.cardRadius,
    padding: 18,
    gap: 12,
    borderWidth: 1,
    borderColor: t.border,
    ...(Platform.OS === 'web'
      ? ({
          cursor: onPress ? 'pointer' : 'default',
          boxShadow: '0 2px 10px rgba(0,0,0,0.18)',
          transition: 'all 0.18s ease',
        } as any)
      : {}),
  };

  if (!onPress) return <View style={[baseStyle, style]}>{children}</View>;

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        baseStyle,
        style,
        {
          opacity: pressed ? 0.88 : 1,
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
  icon,
}: {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'ghost' | 'neonOutline';
  disabled?: boolean;
  icon?: string;
}) {
  const t = useTheme();
  const isPrimary = variant === 'primary';
  const isOutline = variant === 'neonOutline';

  let bgColor = 'transparent';
  let textColor = t.text;
  let borderColor = t.border;

  if (isPrimary) {
    bgColor = t.accent;
    textColor = '#FFFFFF';
    borderColor = t.accent;
  } else if (isOutline) {
    bgColor = t.accentSubtle;
    textColor = t.accent;
    borderColor = t.accent;
  }

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => ({
        backgroundColor: bgColor,
        borderWidth: isPrimary ? 0 : 1,
        borderColor: borderColor,
        borderRadius: 10,
        paddingVertical: 10,
        paddingHorizontal: 16,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        gap: 6,
        opacity: disabled ? 0.45 : pressed ? 0.88 : 1,
        ...(Platform.OS === 'web'
          ? ({
              cursor: disabled ? 'not-allowed' : 'pointer',
              userSelect: 'none',
              transition: 'all 0.15s ease',
              boxShadow: isPrimary ? `0 2px 12px ${t.accentGlow}` : 'none',
            } as any)
          : {}),
      })}
    >
      {icon ? <Text style={{ fontSize: 14 }}>{icon}</Text> : null}
      <Text
        style={{
          fontSize: 13.5,
          fontWeight: '600',
          color: textColor,
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
  icon,
}: {
  label: string;
  selected?: boolean;
  onPress: () => void;
  icon?: string;
}) {
  const t = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={({ pressed }) => ({
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderWidth: 1,
        borderColor: selected ? t.accent : t.border,
        backgroundColor: selected ? t.accent : t.surfaceElevated,
        opacity: pressed ? 0.8 : 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        ...(Platform.OS === 'web' ? ({ cursor: 'pointer', userSelect: 'none' } as any) : {}),
      })}
    >
      {icon ? <Text style={{ fontSize: 12 }}>{icon}</Text> : null}
      <Text
        style={{
          fontSize: 12.5,
          fontWeight: selected ? '600' : '400',
          color: selected ? '#FFFFFF' : t.text,
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}

export function ArrowCircleButton({ onPress }: { onPress: () => void }) {
  const t = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: t.accent,
        alignItems: 'center',
        justifyContent: 'center',
        opacity: pressed ? 0.8 : 1,
        ...(Platform.OS === 'web' ? ({ cursor: 'pointer' } as any) : {}),
      })}
    >
      <Text style={{ color: t.accentText, fontSize: 16, fontWeight: 'bold' }}>→</Text>
    </Pressable>
  );
}

export function CircularProgress({
  percentage,
  size = 72,
  strokeWidth = 7,
  label = 'Progresso',
}: {
  percentage: number;
  size?: number;
  strokeWidth?: number;
  label?: string;
}) {
  const t = useTheme();
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (circumference * Math.min(100, Math.max(0, percentage))) / 100;

  return (
    <View style={{ alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size}>
        {/* Círculo de fundo */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={t.border}
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Círculo de progresso em verde neon */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={t.accent}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          fill="none"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      <View style={{ position: 'absolute', alignItems: 'center' }}>
        <Text style={{ color: t.text, fontSize: 15, fontWeight: '800' }}>{Math.round(percentage)}%</Text>
      </View>
    </View>
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
      <Body style={{ fontSize: 17, fontWeight: '700' } as any}>{value === null ? '— kg' : `${value} kg`}</Body>
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
          backgroundColor: t.surfaceElevated,
          borderWidth: 1,
          borderColor: error ? t.fatColor : t.border,
          borderRadius: 14,
          paddingHorizontal: 16,
          paddingVertical: 14,
          fontSize: 16,
          color: t.text,
        }}
      />
      {error ? (
        <Text style={{ color: t.fatColor, fontSize: 13, fontWeight: '500' }}>{error}</Text>
      ) : null}
    </View>
  );
}
