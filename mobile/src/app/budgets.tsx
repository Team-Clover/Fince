import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { Sparkles, ShoppingBag, Utensils, Zap } from 'lucide-react-native';
import PageHeader from '@/components/PageHeader';

export default function BudgetsScreen() {
  return (
    <View className="flex-1 bg-slate-50">
      <ScrollView contentContainerStyle={{ padding: 24 }}>
        <PageHeader 
          title="Budgets" 
          subtitle="Manage and track your monthly budget limits" 
        />
        
        {/* Top Header Controls */}
        <View className="flex-row justify-between items-center mb-8 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
          <View>
            <Text className="text-2xl font-bold text-slate-900">$5,000.00</Text>
            <Text className="text-slate-500 font-medium text-xs mt-1">Total Monthly Budget</Text>
          </View>
          <View className="bg-blue-50 px-4 py-2.5 rounded-xl border border-blue-100 flex-row items-center">
            <Sparkles size={16} color="#3b82f6" />
            <Text className="text-blue-600 font-bold ml-2">AI Auto-Allocate</Text>
          </View>
        </View>

        {/* Budget List */}
        <Text className="text-sm font-bold text-slate-900 mb-4 ml-1 uppercase tracking-wider">Your Categories</Text>
        
        {/* Item 1 */}
        <View className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm mb-4">
          <View className="flex-row justify-between items-center mb-4">
            <View className="flex-row items-center">
              <View className="w-10 h-10 bg-orange-50 rounded-xl items-center justify-center mr-3">
                <ShoppingBag size={20} color="#f97316" />
              </View>
              <Text className="font-bold text-slate-900 text-base">Shopping</Text>
            </View>
            <Text className="font-bold text-slate-900">$450 / $800</Text>
          </View>
          <View className="h-2 bg-slate-100 rounded-full w-full overflow-hidden">
            <View className="h-full bg-orange-500 w-[56%] rounded-full" />
          </View>
          <Text className="text-xs font-semibold text-slate-400 mt-3 text-right">56% used</Text>
        </View>

        {/* Item 2 */}
        <View className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm mb-4">
          <View className="flex-row justify-between items-center mb-4">
            <View className="flex-row items-center">
              <View className="w-10 h-10 bg-green-50 rounded-xl items-center justify-center mr-3">
                <Utensils size={20} color="#22c55e" />
              </View>
              <Text className="font-bold text-slate-900 text-base">Dining</Text>
            </View>
            <Text className="font-bold text-slate-900">$320 / $500</Text>
          </View>
          <View className="h-2 bg-slate-100 rounded-full w-full overflow-hidden">
            <View className="h-full bg-green-500 w-[64%] rounded-full" />
          </View>
          <Text className="text-xs font-semibold text-slate-400 mt-3 text-right">64% used</Text>
        </View>

        {/* Item 3 */}
        <View className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm mb-4">
          <View className="flex-row justify-between items-center mb-4">
            <View className="flex-row items-center">
              <View className="w-10 h-10 bg-yellow-50 rounded-xl items-center justify-center mr-3">
                <Zap size={20} color="#eab308" />
              </View>
              <Text className="font-bold text-slate-900 text-base">Utilities</Text>
            </View>
            <Text className="font-bold text-slate-900">$180 / $200</Text>
          </View>
          <View className="h-2 bg-slate-100 rounded-full w-full overflow-hidden">
            <View className="h-full bg-yellow-500 w-[90%] rounded-full" />
          </View>
          <Text className="text-xs font-bold text-red-500 mt-3 text-right">90% used • Approaching Limit</Text>
        </View>

      </ScrollView>
    </View>
  );
}
