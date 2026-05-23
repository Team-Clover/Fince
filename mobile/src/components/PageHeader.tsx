import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Bell } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface PageHeaderProps {
  title: string;
  subtitle: string;
  spaceName?: string;
}

export default function PageHeader({ title, subtitle, spaceName = "Personal Space" }: PageHeaderProps) {
  const insets = useSafeAreaInsets();

  return (
    <View className="flex-row justify-between items-center mb-6" style={{ marginTop: Math.max(insets.top, 24) }}>
      <View className="flex-1 mr-4">
        <Text className="text-2xl font-bold text-slate-900">{title}</Text>
        <Text className="text-slate-500 text-sm mt-1">{subtitle}</Text>
      </View>
      
      <View className="flex-row items-center space-x-3">
        <View className="flex-row items-center px-4 py-2 bg-pink-50 border border-pink-100 rounded-full mr-2">
          <View className="w-2 h-2 rounded-full bg-pink-500 mr-2" />
          <Text className="text-pink-600 font-bold text-sm">{spaceName}</Text>
        </View>
        <TouchableOpacity className="p-2.5 bg-white border border-gray-200 rounded-xl shadow-sm">
          <Bell size={20} color="#334155" />
        </TouchableOpacity>
      </View>
    </View>
  );
}
