import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { DollarSign, TrendingUp, PieChart as PieChartIcon } from 'lucide-react-native';
import PageHeader from '@/components/PageHeader';

export default function DashboardScreen() {
  return (
    <View className="flex-1 bg-slate-50">
      <ScrollView contentContainerStyle={{ padding: 24 }}>
        <PageHeader 
          title="Overview" 
          subtitle="AI-powered insights and financial snapshot" 
        />
        
        {/* Banner */}
        <View className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-6 mb-8 shadow-sm">
          <View className="flex-row items-center mb-4">
            <View className="w-12 h-12 bg-white/20 rounded-2xl items-center justify-center mr-4">
              <Text className="text-2xl">✨</Text>
            </View>
            <View>
              <Text className="text-blue-100 font-medium text-sm">Welcome back</Text>
              <Text className="text-white font-bold text-xl">Your AI copilot is active</Text>
            </View>
          </View>
          <Text className="text-blue-50 font-medium leading-relaxed">
            FINCE AI has automatically audited 3 new transactions and found a potential tax saving opportunity.
          </Text>
        </View>

        {/* Stats Grid */}
        <View className="flex-row flex-wrap justify-between">
          <View className="w-[48%] bg-white p-5 rounded-3xl border border-slate-100 shadow-sm mb-4">
            <View className="w-10 h-10 rounded-xl bg-blue-50 items-center justify-center mb-3">
              <DollarSign size={20} color="#2563eb" />
            </View>
            <Text className="text-slate-500 font-semibold text-xs uppercase tracking-wider mb-1">Total Balance</Text>
            <Text className="text-xl font-bold text-slate-900">$24,500.00</Text>
            <Text className="text-green-500 font-bold text-xs mt-2">+2.4%</Text>
          </View>

          <View className="w-[48%] bg-white p-5 rounded-3xl border border-slate-100 shadow-sm mb-4">
            <View className="w-10 h-10 rounded-xl bg-purple-50 items-center justify-center mb-3">
              <TrendingUp size={20} color="#9333ea" />
            </View>
            <Text className="text-slate-500 font-semibold text-xs uppercase tracking-wider mb-1">Monthly Spend</Text>
            <Text className="text-xl font-bold text-slate-900">$3,240.50</Text>
            <Text className="text-red-500 font-bold text-xs mt-2">+5.1%</Text>
          </View>
        </View>

        {/* Chart Area Placeholder */}
        <View className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm mb-6 mt-2">
          <View className="flex-row justify-between items-center mb-6">
            <Text className="text-lg font-bold text-slate-900">Expense Projections</Text>
            <PieChartIcon size={20} color="#64748b" />
          </View>
          <View className="h-48 items-center justify-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
            <Text className="text-slate-400 font-medium text-sm">AI Radar Chart Placeholder</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
