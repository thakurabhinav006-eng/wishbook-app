import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Agenda } from 'react-native-calendars';
import { useAuth } from '@/context/AuthContext';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Calendar as CalendarIcon, Clock, Plus } from 'lucide-react-native';

export default function CalendarScreen() {
  const { user } = useAuth();
  const [items, setItems] = useState({});
  const router = useRouter();

  useEffect(() => {
    // Determine the current date in YYYY-MM-DD format
    const today = new Date().toISOString().split('T')[0];

    // Mock data population
    // In real app, we would process `user.wishes` or fetch range
    const newItems = {};

    // Example: Add a wish for today and tomorrow
    newItems[today] = [{
      name: 'Birthday Wish for Sarah',
      time: '10:00 AM',
      status: 'Pending',
      type: 'Birthday'
    }];

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];

    newItems[tomorrowStr] = [{
      name: 'Anniversary Greeting',
      time: '09:00 AM',
      status: 'Sent',
      type: 'Anniversary'
    }];

    setItems(newItems);
  }, [user]);

  const renderItem = (item) => {
    return (
      <TouchableOpacity
        style={{ marginRight: 10, marginTop: 17 }}
        onPress={() => router.push('/modal')}
      >
        <View className="bg-white p-4 rounded-xl shadow-sm border-l-4 border-purple-500">
          <View className="flex-row justify-between items-center mb-2">
            <Text className="text-gray-500 text-xs font-bold uppercase">{item.type}</Text>
            <View className="flex-row items-center">
              <Clock size={12} color="#9ca3af" />
              <Text className="text-gray-400 text-xs ml-1">{item.time}</Text>
            </View>
          </View>
          <Text className="text-lg font-bold text-gray-800">{item.name}</Text>
          <View className="mt-2 flex-row">
            <View className={`px-2 py-1 rounded bg-${item.status === 'Sent' ? 'green' : 'yellow'}-100`}>
              <Text className={`text-${item.status === 'Sent' ? 'green' : 'yellow'}-700 text-xs font-medium`}>{item.status}</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmptyDate = () => {
    return (
      <View className="flex-1 justify-center items-center mt-10">
        <Text className="text-gray-400">No wishes scheduled</Text>
      </View>
    );
  };

  return (
    <View className="flex-1 bg-slate-950">
      <StatusBar style="light" />
      <SafeAreaView className="flex-1" edges={['top']}>
        <View className="px-5 py-4 flex-row justify-between items-center bg-slate-950">
          <Text className="text-white text-3xl font-bold">Calendar</Text>
          <TouchableOpacity onPress={() => router.push('/modal')} className="bg-purple-600 p-2 rounded-full">
            <Plus size={24} color="white" />
          </TouchableOpacity>
        </View>

        <Agenda
          items={items}
          loadItemsForMonth={(month) => { console.log('trigger items loading') }}
          selected={new Date().toISOString().split('T')[0]}
          renderItem={renderItem}
          renderEmptyDate={renderEmptyDate}
          theme={{
            calendarBackground: '#1e293b', // Slate-800
            agendaKnobColor: '#94a3b8',
            backgroundColor: '#0f172a', // Slate-900 background for list
            dayTextColor: '#fff',
            monthTextColor: '#fff',
            textSectionTitleColor: '#94a3b8',
            selectedDayBackgroundColor: '#a855f7',
            selectedDayTextColor: '#ffffff',
            todayTextColor: '#a855f7',
            dotColor: '#a855f7',
            selectedDotColor: '#ffffff',
            arrowColor: '#a855f7',
            disabledArrowColor: '#d9e1e8',
            textDayFontWeight: '300',
            textMonthFontWeight: 'bold',
            textDayHeaderFontWeight: '300',
            textDayFontSize: 16,
            textMonthFontSize: 16,
            textDayHeaderFontSize: 14
          }}
        />
      </SafeAreaView>
    </View>
  );
}
