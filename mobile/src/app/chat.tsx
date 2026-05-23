import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { Send, Paperclip, Sparkles } from 'lucide-react-native';
import PageHeader from '@/components/PageHeader';

export default function ChatScreen() {
  const [inputText, setInputText] = useState('');
  
  return (
    <KeyboardAvoidingView 
      className="flex-1 bg-slate-50"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={90}
    >
      <View className="flex-1 px-6 pt-6">
        <PageHeader 
          title="FINCE AI Copilot" 
          subtitle="Autonomous scenario simulation" 
        />

        <View className="flex-1 bg-white border border-slate-100 rounded-3xl mb-6 shadow-sm overflow-hidden">
          {/* Header */}
          <View className="px-6 py-4 border-b border-slate-100 flex-row items-center bg-white z-10">
            <View className="w-10 h-10 rounded-xl bg-blue-500 items-center justify-center mr-3">
              <Sparkles size={18} color="white" />
            </View>
            <View>
              <Text className="text-sm font-bold text-slate-900">New Conversation</Text>
              <View className="flex-row items-center mt-1">
                <View className="w-1.5 h-1.5 rounded-full bg-green-500 mr-1.5" />
                <Text className="text-[10px] font-bold text-slate-500">ACTIVE COGNITIVE ENGINE</Text>
              </View>
            </View>
          </View>

          {/* Chat Area */}
          <ScrollView className="flex-1 bg-slate-50/50 p-6">
            <View className="h-full flex-col justify-center items-center text-center mt-20">
              <View className="w-14 h-14 rounded-2xl bg-white border border-slate-100 items-center justify-center shadow-sm mb-4">
                <Sparkles size={24} color="#3b82f6" />
              </View>
              <Text className="font-bold text-sm text-slate-800">Ask FINCE AI anything</Text>
              <Text className="text-xs text-slate-500 mt-2 text-center max-w-[250px] leading-relaxed">
                "Analyze my latest grocery spends" or "Am I on track with my monthly budget limit?"
              </Text>
            </View>
          </ScrollView>

          {/* Input Area */}
          <View className="p-4 bg-white border-t border-slate-100">
            <View className="flex-row items-center bg-slate-50 border border-slate-200 rounded-2xl p-1.5">
              <TouchableOpacity className="p-2.5">
                <Paperclip size={18} color="#94a3b8" />
              </TouchableOpacity>
              
              <TextInput 
                className="flex-1 py-2.5 px-3 text-sm text-slate-700 font-medium"
                placeholder="Ask FINCE AI..."
                placeholderTextColor="#94a3b8"
                value={inputText}
                onChangeText={setInputText}
              />
              
              <TouchableOpacity className="w-10 h-10 items-center justify-center rounded-xl bg-blue-600 ml-1">
                <Send size={16} color="white" className="ml-1" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
