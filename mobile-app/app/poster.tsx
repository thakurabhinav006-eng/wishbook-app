import React, { useRef, useState } from 'react';
import { View, Text, TouchableOpacity, Alert, Image, ScrollView, Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import ViewShot from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, Download, Share, Wand2 } from 'lucide-react-native';

export default function PosterStudioScreen() {
    const viewShotRef = useRef(null);
    const router = useRouter();
    const { message = "Happy Birthday! Wishing you a day filled with joy." } = useLocalSearchParams();
    const [loading, setLoading] = useState(false);

    // Mock themes/backgrounds
    // In real app, these would come from AI generation or API
    const GRADIENTS = [
        'bg-slate-900',
        'bg-purple-900',
        'bg-blue-900',
        'bg-rose-900'
    ];
    const [selectedGradient, setSelectedGradient] = useState(GRADIENTS[1]);

    const handleShare = async () => {
        setLoading(true);
        try {
            const uri = await viewShotRef.current.capture();
            if (!(await Sharing.isAvailableAsync())) {
                Alert.alert("Error", "Sharing is not available on this platform");
                return;
            }
            await Sharing.shareAsync(uri);
        } catch (e) {
            console.error(e);
            Alert.alert("Error", "Failed to capture poster");
        } finally {
            setLoading(false);
        }
    };

    return (
        <View className="flex-1 bg-slate-950">
            <StatusBar style="light" />
            <SafeAreaView className="flex-1" edges={['top']}>

                {/* Header */}
                <View className="flex-row items-center justify-between px-4 py-4 z-10">
                    <TouchableOpacity onPress={() => router.back()} className="p-2 bg-slate-900 rounded-full">
                        <ArrowLeft size={24} color="white" />
                    </TouchableOpacity>
                    <Text className="text-white font-bold text-lg">Poster Studio</Text>
                    <TouchableOpacity
                        onPress={handleShare}
                        disabled={loading}
                        className="p-2 bg-purple-600 rounded-full"
                    >
                        <Share size={20} color="white" />
                    </TouchableOpacity>
                </View>

                {/* Canvas Area */}
                <View className="flex-1 items-center justify-center p-6">
                    <ViewShot
                        ref={viewShotRef}
                        options={{ format: "jpg", quality: 0.9 }}
                        style={{ width: '100%', aspectRatio: 3 / 4 }}
                    >
                        <View className={`w-full h-full rounded-2xl items-center justify-center p-8 border border-white/10 shadow-2xl ${selectedGradient}`}>
                            {/* Watermark or Top Badge */}
                            <View className="absolute top-8 w-12 h-1 bg-white/20 rounded-full" />

                            {/* Content */}
                            <View className="items-center">
                                <View className="w-16 h-16 bg-white/10 rounded-full items-center justify-center mb-6 backdrop-blur-sm">
                                    <Wand2 size={32} color="#e2e8f0" />
                                </View>
                                <Text className="text-white text-3xl font-serif font-bold text-center leading-relaxed">
                                    {message}
                                </Text>
                                <View className="mt-8 px-4 py-1 bg-white/10 rounded-full border border-white/5">
                                    <Text className="text-gray-300 text-xs tracking-widest uppercase">Sent with Wishbook</Text>
                                </View>
                            </View>

                            {/* Decorative Elements */}
                            <View className="absolute bottom-0 right-0 w-32 h-32 bg-white/5 rounded-full -mb-10 -mr-10 blur-2xl" />
                            <View className="absolute top-0 left-0 w-24 h-24 bg-purple-500/20 rounded-full -mt-8 -ml-8 blur-3xl" />
                        </View>
                    </ViewShot>
                </View>

                {/* Controls */}
                <View className="px-6 pb-8 h-32">
                    <Text className="text-gray-400 font-medium mb-3">Background Theme</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        {GRADIENTS.map((bg, idx) => (
                            <TouchableOpacity
                                key={idx}
                                onPress={() => setSelectedGradient(bg)}
                                className={`w-14 h-14 rounded-full mr-4 border-2 ${selectedGradient === bg ? 'border-purple-500' : 'border-transparent'} ${bg}`}
                            />
                        ))}
                    </ScrollView>
                </View>

            </SafeAreaView>
        </View>
    );
}
