import React, { useState } from 'react';
import { View, Text, ScrollView, Switch, TouchableOpacity } from 'react-native';
import { User, Shield, CreditCard, Bell, ChevronRight, LogOut } from 'lucide-react-native';
import PageHeader from '@/components/PageHeader';

export default function SettingsScreen() {
  const [notifications, setNotifications] = useState(true);
  const [biometrics, setBiometrics] = useState(false);
  const [aiInsights, setAiInsights] = useState(true);

  return (
    <View className="flex-1 bg-slate-50">
      <ScrollView contentContainerStyle={{ padding: 24 }}>
        <PageHeader 
          title="Workspace Settings" 
          subtitle="Configure profile details and app preferences" 
        />

        {/* Profile Card */}
        <View className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm mb-6 flex-row items-center">
          <View className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 items-center justify-center mr-4">
            <Text className="text-white font-bold text-xl">JD</Text>
          </View>
          <View className="flex-1">
            <Text className="text-lg font-bold text-slate-900">John Doe</Text>
            <Text className="text-slate-500 font-medium text-sm">john.doe@example.com</Text>
          </View>
          <TouchableOpacity className="bg-slate-50 p-2 rounded-xl border border-slate-200">
            <User size={20} color="#64748b" />
          </TouchableOpacity>
        </View>

        {/* Preferences Section */}
        <Text className="text-sm font-bold text-slate-900 mb-4 ml-1 uppercase tracking-wider">Preferences</Text>
        
        <View className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden mb-8">
          
          <View className="flex-row items-center justify-between p-5 border-b border-slate-50">
            <View className="flex-row items-center">
              <View className="w-10 h-10 bg-blue-50 rounded-xl items-center justify-center mr-3">
                <Bell size={20} color="#3b82f6" />
              </View>
              <Text className="font-semibold text-slate-900 text-base">Push Notifications</Text>
            </View>
            <Switch 
              value={notifications} 
              onValueChange={setNotifications} 
              trackColor={{ false: '#e2e8f0', true: '#3b82f6' }}
            />
          </View>

          <View className="flex-row items-center justify-between p-5 border-b border-slate-50">
            <View className="flex-row items-center">
              <View className="w-10 h-10 bg-purple-50 rounded-xl items-center justify-center mr-3">
                <Shield size={20} color="#9333ea" />
              </View>
              <Text className="font-semibold text-slate-900 text-base">Biometric Login</Text>
            </View>
            <Switch 
              value={biometrics} 
              onValueChange={setBiometrics}
              trackColor={{ false: '#e2e8f0', true: '#3b82f6' }}
            />
          </View>

          <View className="flex-row items-center justify-between p-5">
            <View className="flex-row items-center">
              <View className="w-10 h-10 bg-pink-50 rounded-xl items-center justify-center mr-3">
                <CreditCard size={20} color="#ec4899" />
              </View>
              <Text className="font-semibold text-slate-900 text-base">FINCE AI Insights</Text>
            </View>
            <Switch 
              value={aiInsights} 
              onValueChange={setAiInsights}
              trackColor={{ false: '#e2e8f0', true: '#3b82f6' }}
            />
          </View>
        </View>

        {/* Danger Zone */}
        <TouchableOpacity className="bg-white p-5 rounded-3xl border border-red-100 shadow-sm flex-row items-center justify-between">
          <View className="flex-row items-center">
            <View className="w-10 h-10 bg-red-50 rounded-xl items-center justify-center mr-3">
              <LogOut size={20} color="#ef4444" />
            </View>
            <Text className="font-bold text-red-500 text-base">Sign Out</Text>
          </View>
          <ChevronRight size={20} color="#ef4444" />
        </TouchableOpacity>

      </ScrollView>
    </View>
  );
}
