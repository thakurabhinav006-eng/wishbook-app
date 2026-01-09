import { StatusBar } from 'expo-status-bar';
import { Platform, StyleSheet, TouchableOpacity, TextInput, ScrollView, Alert, ActivityIndicator, View, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { X, Wand2, Calendar as CalendarIcon, User } from 'lucide-react-native';
// import { useAuth } from '@/context/AuthContext'; // If needed for API calls

export default function ModalScreen() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [occasion, setOccasion] = useState('');
  const [recipient, setRecipient] = useState('');
  const [date, setDate] = useState(new Date());
  const [loading, setLoading] = useState(false);

  const OCCASIONS = ['Birthday', 'Anniversary', 'New Baby', 'Get Well', 'Thank You', 'Congratulations'];

  const handleCreate = async () => {
    if (!occasion || !recipient) {
      Alert.alert('Missing Info', 'Please select an occasion and recipient.');
      return;
    }

    setLoading(true);
    // Simulate API Call
    setTimeout(() => {
      setLoading(false);
      Alert.alert('Success', 'Wish scheduled successfully!', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    }, 1500);
  };

  return (
    <View className="flex-1 bg-slate-950">
      <StatusBar style={Platform.OS === 'ios' ? 'light' : 'auto'} />

      {/* Header */}
      <View className="flex-row justify-between items-center p-4 border-b border-slate-800">
        <Text className="text-white text-xl font-bold">New Wish</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <X size={24} color="#94a3b8" />
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 p-6">
        {/* Step 1: Occasion */}
        <Text className="text-gray-400 font-medium mb-3">What's the occasion?</Text>
        <View className="flex-row flex-wrap gap-2 mb-6">
          {OCCASIONS.map((occ) => (
            <TouchableOpacity
              key={occ}
              onPress={() => setOccasion(occ)}
              className={`px-4 py-3 rounded-full border ${occasion === occ ? 'bg-purple-600 border-purple-500' : 'bg-slate-900 border-slate-800'}`}
            >
              <Text className={`${occasion === occ ? 'text-white' : 'text-gray-400'} font-medium`}>{occ}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Step 2: Recipient */}
        <Text className="text-gray-400 font-medium mb-3">Who is it for?</Text>
        <View className="mb-6">
          <View className="flex-row items-center bg-slate-900 border border-slate-800 rounded-xl px-4 py-3">
            <User size={20} color="#64748b" />
            <TextInput
              className="flex-1 ml-3 text-white"
              placeholder="Recipient's Name"
              placeholderTextColor="#475569"
              value={recipient}
              onChangeText={setRecipient}
            />
          </View>
        </View>

        {/* Step 3: Date (Simplified for demo) */}
        <Text className="text-gray-400 font-medium mb-3">When should we send it?</Text>
        <View className="flex-row items-center bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 mb-8">
          <CalendarIcon size={20} color="#64748b" />
          <Text className="flex-1 ml-3 text-white">{date.toDateString()}</Text>
          {/* DatePicker would go here. For now just text. */}
        </View>

        {/* Action */}
        <TouchableOpacity
          className="bg-purple-600 rounded-xl py-4 flex-row items-center justify-center shadow-lg shadow-purple-900/40 active:bg-purple-700"
          onPress={handleCreate}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <>
              <Wand2 size={24} color="white" className="mr-2" />
              <Text className="text-white font-bold text-lg ml-2">Create with Magic</Text>
            </>
          )}
        </TouchableOpacity>

        <Text className="text-center text-gray-500 text-xs mt-4">AI will generate a personalized wish based on your choices.</Text>

      </ScrollView>
    </View>
  );
}
