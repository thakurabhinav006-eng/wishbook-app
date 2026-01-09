import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Modal, Alert, ActivityIndicator, FlatList, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useAuth } from '@/context/AuthContext';
import { getApiUrl } from '@/lib/utils';
import { Search, Plus, X, User, Phone, Mail, Calendar, Heart } from 'lucide-react-native';

export default function ContactsScreen() {
    const { token } = useAuth();
    const [contacts, setContacts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [isModalVisible, setIsModalVisible] = useState(false);

    // New Contact Form State
    const [newContact, setNewContact] = useState({
        name: '', email: '', phone: '', relationship: 'Friend', birthday: ''
    });
    const [saving, setSaving] = useState(false);

    // Fetch Contacts
    const fetchContacts = async () => {
        try {
            const res = await fetch(getApiUrl('/api/contacts'), {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setContacts(data);
            }
        } catch (error) {
            console.error("Failed to fetch contacts", error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchContacts();
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        fetchContacts();
    };

    // Add Contact
    const handleAddContact = async () => {
        if (!newContact.name || !newContact.phone) {
            Alert.alert('Error', 'Name and Phone are required');
            return;
        }

        setSaving(true);
        try {
            const res = await fetch(getApiUrl('/api/contacts'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(newContact)
            });

            if (res.ok) {
                await fetchContacts();
                setIsModalVisible(false);
                setNewContact({ name: '', email: '', phone: '', relationship: 'Friend', birthday: '' });
                Alert.alert('Success', 'Contact added successfully');
            } else {
                const err = await res.json();
                Alert.alert('Error', err.detail || 'Failed to add contact');
            }
        } catch (e) {
            Alert.alert('Error', 'Network error');
        } finally {
            setSaving(false);
        }
    };

    // Filter Contacts
    const filteredContacts = contacts.filter(c =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.relationship.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const ContactItem = ({ item }) => (
        <View className="bg-slate-900 border border-slate-800 rounded-xl p-4 mb-3 flex-row items-center">
            <View className="w-12 h-12 bg-slate-800 rounded-full items-center justify-center mr-4 border border-slate-700">
                <Text className="text-xl font-bold text-white">{item.name.charAt(0)}</Text>
            </View>
            <View className="flex-1">
                <Text className="text-white font-bold text-lg">{item.name}</Text>
                <Text className="text-purple-400 text-xs font-medium uppercase mb-1">{item.relationship}</Text>
                <View className="flex-row items-center space-x-3">
                    {item.phone && (
                        <View className="flex-row items-center mr-3">
                            <Phone size={12} color="#94a3b8" />
                            <Text className="text-gray-500 text-xs ml-1">{item.phone}</Text>
                        </View>
                    )}
                </View>
            </View>
        </View>
    );

    return (
        <View className="flex-1 bg-slate-950">
            <StatusBar style="light" />
            <SafeAreaView className="flex-1" edges={['top']}>

                {/* Header */}
                <View className="px-5 py-4 flex-row justify-between items-center">
                    <Text className="text-white text-3xl font-bold">Contacts</Text>
                    <TouchableOpacity
                        className="bg-purple-600 p-2 rounded-full shadow-lg shadow-purple-900/50"
                        onPress={() => setIsModalVisible(true)}
                    >
                        <Plus size={24} color="white" />
                    </TouchableOpacity>
                </View>

                {/* Search */}
                <View className="px-5 mb-4">
                    <View className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 flex-row items-center">
                        <Search size={20} color="#64748b" />
                        <TextInput
                            className="flex-1 ml-3 text-white"
                            placeholder="Search contacts..."
                            placeholderTextColor="#475569"
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                        />
                    </View>
                </View>

                {/* List */}
                {loading ? (
                    <View className="flex-1 justify-center items-center">
                        <ActivityIndicator size="large" color="#a855f7" />
                    </View>
                ) : (
                    <FlatList
                        data={filteredContacts}
                        keyExtractor={(item) => item.id.toString()}
                        renderItem={({ item }) => <ContactItem item={item} />}
                        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 100 }}
                        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#fff" />}
                        ListEmptyComponent={
                            <View className="items-center mt-20">
                                <User size={48} color="#334155" />
                                <Text className="text-gray-500 mt-4">No contacts found</Text>
                            </View>
                        }
                    />
                )}

                {/* Add Contact Modal */}
                <Modal
                    visible={isModalVisible}
                    animationType="slide"
                    presentationStyle="pageSheet"
                >
                    <View className="flex-1 bg-slate-950 p-6">
                        <View className="flex-row justify-between items-center mb-8">
                            <Text className="text-white text-2xl font-bold">New Contact</Text>
                            <TouchableOpacity onPress={() => setIsModalVisible(false)}>
                                <X size={24} color="#94a3b8" />
                            </TouchableOpacity>
                        </View>

                        <ScrollView>
                            <View className="space-y-4">
                                <View>
                                    <Text className="text-gray-400 mb-2 ml-1">Full Name</Text>
                                    <TextInput
                                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-4 text-white focus:border-purple-500"
                                        placeholder="Jane Doe"
                                        placeholderTextColor="#475569"
                                        value={newContact.name}
                                        onChangeText={(text) => setNewContact({ ...newContact, name: text })}
                                    />
                                </View>
                                <View>
                                    <Text className="text-gray-400 mb-2 ml-1">Phone Number</Text>
                                    <TextInput
                                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-4 text-white focus:border-purple-500"
                                        placeholder="+1 234 567 890"
                                        placeholderTextColor="#475569"
                                        keyboardType="phone-pad"
                                        value={newContact.phone}
                                        onChangeText={(text) => setNewContact({ ...newContact, phone: text })}
                                    />
                                </View>
                                <View>
                                    <Text className="text-gray-400 mb-2 ml-1">Relationship</Text>
                                    <TextInput
                                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-4 text-white focus:border-purple-500"
                                        placeholder="Friend, Family, Work..."
                                        placeholderTextColor="#475569"
                                        value={newContact.relationship}
                                        onChangeText={(text) => setNewContact({ ...newContact, relationship: text })}
                                    />
                                </View>

                                <TouchableOpacity
                                    className="w-full bg-purple-600 rounded-xl py-4 items-center mt-8 active:bg-purple-700"
                                    onPress={handleAddContact}
                                    disabled={saving}
                                >
                                    {saving ? (
                                        <ActivityIndicator color="white" />
                                    ) : (
                                        <Text className="text-white font-bold text-lg">Save Contact</Text>
                                    )}
                                </TouchableOpacity>
                            </View>
                        </ScrollView>
                    </View>
                </Modal>

            </SafeAreaView>
        </View>
    );
}
