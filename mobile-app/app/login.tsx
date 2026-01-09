import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ImageBackground, ActivityIndicator, Alert } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { Link, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function LoginScreen() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { login } = useAuth();
    const router = useRouter();

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert('Error', 'Please enter email and password');
            return;
        }

        setIsSubmitting(true);
        try {
            // Since login logic is complex (token exchange), checking against backend.
            // For now, we simulate the fetch call here or rely on AuthContext if updated to handle raw fetch.
            // The current AuthContext `login` takes `accessToken`.
            // So we need to perform the fetch here first.

            // However, looking at web AuthContext, `register` does `fetch`, but `login` just sets token.
            // Wait, web context has `login(accessToken)`. The actual API call is usually done in the component or context handles it.
            // In web AuthContext snippet: `register` calls the API. `googleLogin` calls the API.
            // But `login` (manual) isn't shown in the snippet? 
            // Ah, typically there's a `manualLogin` function or the Login page calls `fetch('/token')` then calls `login(token)`.

            // I'll implement the fetch here.
            import('../lib/utils').then(async ({ getApiUrl }) => {
                const formData = new URLSearchParams();
                formData.append('username', email);
                formData.append('password', password);

                const res = await fetch(getApiUrl('/api/token'), {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                    body: formData.toString(),
                });

                if (res.ok) {
                    const data = await res.json();
                    await login(data.access_token);
                    // Router replace handled in context
                } else {
                    Alert.alert('Login Failed', 'Invalid email or password');
                }
                setIsSubmitting(false);
            });

        } catch (e) {
            console.error(e);
            Alert.alert('Error', 'Network request failed');
            setIsSubmitting(false);
        }
    };

    return (
        <View className="flex-1 bg-slate-950">
            <StatusBar style="light" />
            <View className="flex-1 justify-center px-8">
                {/* Header */}
                <View className="mb-12">
                    <Text className="text-4xl font-bold text-white mb-2">Welcome Back</Text>
                    <Text className="text-gray-400 text-lg">Sign in to your account</Text>
                </View>

                {/* Form */}
                <View className="space-y-4">
                    <View>
                        <Text className="text-gray-400 mb-2 ml-1">Email</Text>
                        <TextInput
                            className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-4 text-white placeholder-gray-600 focus:border-purple-500"
                            placeholder="Enter your email"
                            placeholderTextColor="#475569"
                            value={email}
                            onChangeText={setEmail}
                            autoCapitalize="none"
                            keyboardType="email-address"
                        />
                    </View>

                    <View>
                        <Text className="text-gray-400 mb-2 ml-1">Password</Text>
                        <TextInput
                            className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-4 text-white placeholder-gray-600 focus:border-purple-500"
                            placeholder="Enter your password"
                            placeholderTextColor="#475569"
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry
                        />
                    </View>

                    <TouchableOpacity
                        onPress={handleLogin}
                        disabled={isSubmitting}
                        className="w-full bg-purple-600 rounded-xl py-4 items-center mt-6 active:bg-purple-700"
                    >
                        {isSubmitting ? (
                            <ActivityIndicator color="white" />
                        ) : (
                            <Text className="text-white font-bold text-lg">Sign In</Text>
                        )}
                    </TouchableOpacity>

                    <View className="flex-row justify-center mt-6">
                        <Text className="text-gray-400">Don't have an account? </Text>
                        <Link href="/register" asChild>
                            <TouchableOpacity>
                                <Text className="text-purple-400 font-bold">Sign Up</Text>
                            </TouchableOpacity>
                        </Link>
                    </View>
                </View>
            </View>
        </View>
    );
}
