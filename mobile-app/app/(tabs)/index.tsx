import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/context/AuthContext';
import { Plus, Users, Calendar, MessageSquare, ArrowRight, Wand2 } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function DashboardScreen() {
  const { user, token, refreshUser } = useAuth();
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    total_contacts: 0,
    upcoming_events: 0,
    messages_scheduled: 0,
    messages_sent: 0
  });

  const loadStats = async () => {
    // Mock logic or fetch from API
    // const res = await fetch(getApiUrl('/dashboard/stats')...)
    // For now, we simulate or use dummy data until backend connected
    setStats({
      total_contacts: user?.contacts_count || 12,
      upcoming_events: 3,
      messages_scheduled: user?.wishes_count || 5,
      messages_sent: 24
    });
  };

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await refreshUser();
    await loadStats();
    setRefreshing(false);
  }, []);

  useEffect(() => {
    loadStats();
  }, [user]);

  const StatCard = ({ title, value, icon: Icon, color, bg }) => (
    <View className="flex-1 bg-slate-900 border border-slate-800 rounded-2xl p-4 mr-2 mb-4">
      <View className={`w-10 h-10 rounded-full items-center justify-center mb-3 ${bg}`}>
        <Icon size={20} color={color} />
      </View>
      <Text className="text-gray-400 text-xs font-medium uppercase">{title}</Text>
      <Text className="text-white text-2xl font-bold mt-1">{value}</Text>
    </View>
  );

  return (
    <View className="flex-1 bg-slate-950">
      <StatusBar style="light" />
      <SafeAreaView edges={['top']} className="flex-1">
        <ScrollView
          contentContainerStyle={{ paddingBottom: 100 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#fff" />}
        >
          {/* Header */}
          <View className="px-6 py-6 flex-row justify-between items-center">
            <View>
              <Text className="text-gray-400 text-sm">Welcome back,</Text>
              <Text className="text-white text-2xl font-bold">{user?.full_name || 'Creator'}</Text>
            </View>
            <TouchableOpacity className="w-10 h-10 bg-slate-800 rounded-full items-center justify-center border border-slate-700">
              <Users size={20} color="#94a3b8" />
            </TouchableOpacity>
          </View>

          {/* Quick Actions */}
          <View className="px-6 mb-8">
            <TouchableOpacity
              className="bg-purple-600 rounded-2xl p-5 flex-row items-center justify-between shadow-lg shadow-purple-900/40 active:bg-purple-700"
              onPress={() => router.push('/modal')} // Placeholder for Wizard
            >
              <View className="flex-row items-center space-x-4">
                <View className="w-12 h-12 bg-white/20 rounded-full items-center justify-center">
                  <Wand2 size={24} color="white" />
                </View>
                <View>
                  <Text className="text-white font-bold text-lg">Create New Wish</Text>
                  <Text className="text-purple-100 text-sm">AI-powered magic</Text>
                </View>
              </View>
              <ArrowRight size={20} color="white" />
            </TouchableOpacity>
          </View>

          {/* Stats Grid */}
          <View className="px-6">
            <Text className="text-white font-bold text-lg mb-4">Overview</Text>
            <View className="flex-row">
              <StatCard
                title="Contacts"
                value={stats.total_contacts}
                icon={Users}
                color="#3b82f6"
                bg="bg-blue-500/10"
              />
              <StatCard
                title="Scheduled"
                value={stats.messages_scheduled}
                icon={Calendar}
                color="#a855f7"
                bg="bg-purple-500/10"
              />
            </View>
            <View className="flex-row">
              <StatCard
                title="Sent"
                value={stats.messages_sent}
                icon={MessageSquare}
                color="#22c55e"
                bg="bg-green-500/10"
              />
              <View className="flex-1 mr-2" />
            </View>
          </View>

          {/* Recent Activity */}
          <View className="px-6 mt-6">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-white font-bold text-lg">Recent Wishes</Text>
              <TouchableOpacity onPress={() => router.push('/(tabs)/explore')}>
                <Text className="text-purple-400 text-sm">View All</Text>
              </TouchableOpacity>
            </View>

            {/* Placeholder Items */}
            {[1, 2, 3].map((i) => (
              <View key={i} className="bg-slate-900 border border-slate-800 rounded-xl p-4 mb-3 flex-row items-center">
                <View className="w-10 h-10 bg-slate-800 rounded-full items-center justify-center mr-3">
                  <Calendar size={18} color="#94a3b8" />
                </View>
                <View className="flex-1">
                  <Text className="text-white font-semibold">Birthday Wish for Sarah</Text>
                  <Text className="text-gray-500 text-xs">Scheduled for Mar {i + 10}, 2026</Text>
                </View>
                <View className="bg-yellow-500/10 px-2 py-1 rounded-md">
                  <Text className="text-yellow-500 text-xs font-medium">Pending</Text>
                </View>
              </View>
            ))}
          </View>

        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
