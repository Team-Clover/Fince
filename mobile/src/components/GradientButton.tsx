import React from 'react';
import { TouchableOpacity, Text, ViewStyle, TextStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface GradientButtonProps {
  title: string;
  onPress: () => void;
  style?: ViewStyle;
  textStyle?: TextStyle;
  icon?: React.ReactNode;
}

export default function GradientButton({ title, onPress, style, textStyle, icon }: GradientButtonProps) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8} style={style}>
      <LinearGradient
        colors={['#2563eb', '#9333ea']} // from-blue-600 to-purple-600
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="flex-row items-center justify-center py-3.5 px-6 rounded-xl shadow-sm"
      >
        {icon && <React.Fragment>{icon}</React.Fragment>}
        <Text className="text-white font-bold text-sm" style={[{ marginLeft: icon ? 8 : 0 }, textStyle]}>
          {title}
        </Text>
      </LinearGradient>
    </TouchableOpacity>
  );
}
