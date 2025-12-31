import React, { useState } from 'react';
import { Upload, X, FileSpreadsheet, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getApiUrl } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';

export default function BulkImportModal({ onClose, onSuccess }) {
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const { token } = useAuth();

    const handleFileChange = (e) => {
        if (e.target.files[0]) {
            setFile(e.target.files[0]);
            setResult(null);
        }
    };

    const handleUpload = async () => {
        if (!file) return;
        setLoading(true);

        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await fetch(getApiUrl('/api/contacts/import'), {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                    // Content-Type is set automatically for FormData
                },
                body: formData
            });

            const data = await res.json();
            if (res.ok) {
                setResult({ success: true, count: data.imported, errors: data.errors });
                if (data.imported > 0) onSuccess();
            } else {
                setResult({ success: false, message: data.detail || 'Upload failed' });
            }
        } catch (error) {
            setResult({ success: false, message: 'Network error' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-[#121218] border border-white/10 rounded-3xl w-full max-w-md p-6 shadow-2xl"
            >
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <FileSpreadsheet className="w-5 h-5 text-purple-400" />
                        Import Contacts
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full text-gray-400 hover:text-white">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {!result ? (
                    <div className="space-y-6">
                        <div className="border-2 border-dashed border-white/10 rounded-2xl p-8 text-center hover:border-purple-500/50 transition-colors bg-white/5">
                            <Upload className="w-8 h-8 text-gray-500 mx-auto mb-4" />
                            <p className="text-sm text-gray-300 mb-2">Upload CSV file</p>
                            <p className="text-xs text-gray-500 mb-4">Required columns: name, email</p>
                            <input
                                type="file"
                                accept=".csv"
                                onChange={handleFileChange}
                                className="block w-full text-sm text-slate-500
                                file:mr-4 file:py-2 file:px-4
                                file:rounded-full file:border-0
                                file:text-xs file:font-semibold
                                file:bg-purple-500/10 file:text-purple-400
                                hover:file:bg-purple-500/20"
                            />
                        </div>

                        <p className="text-xs text-blue-200">
                            <strong>Tip:</strong> Optional columns: phone (or whatsapp), birthday, anniversary (YYYY-MM-DD), relationship, gender, custom_occasion_name, custom_occasion_date.
                        </p>
                        <button
                            onClick={() => {
                                const headers = ['name', 'email', 'phone', 'relationship', 'birthday', 'anniversary', 'gender', 'custom_occasion_name', 'custom_occasion_date', 'notes'];
                                const sampleRow = ['John Doe', 'john@example.com', '+1234567890', 'Friend', '1990-01-01', '', 'Male', 'Graduation', '2025-06-01', 'Sample note'];
                                const csvContent = [headers.join(','), sampleRow.join(',')].join('\n');
                                const blob = new Blob([csvContent], { type: 'text/csv' });
                                const url = window.URL.createObjectURL(blob);
                                const a = document.createElement('a');
                                a.href = url;
                                a.download = 'sample_contacts.csv';
                                a.click();
                                window.URL.revokeObjectURL(url);
                            }}
                            className="text-xs text-purple-300 hover:text-purple-200 underline mt-2 inline-block cursor-pointer font-medium"
                        >
                            Download Sample Template
                        </button>

                        <button
                            onClick={handleUpload}
                            disabled={!file || loading}
                            className="w-full py-3 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl text-white font-medium transition-all flex justify-center items-center gap-2"
                        >
                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Start Import'}
                        </button>
                    </div>
                ) : (
                    <div className="text-center space-y-6">
                        {result.success ? (
                            <>
                                <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto text-green-400">
                                    <CheckCircle className="w-8 h-8" />
                                </div>
                                <div>
                                    <p className="text-lg font-medium text-white">Import Complete</p>
                                    <p className="text-gray-400">{result.count} contacts added successfully.</p>
                                    {result.errors?.length > 0 && (
                                        <div className="mt-4 text-left bg-red-500/10 p-3 rounded-lg border border-red-500/20 max-h-40 overflow-y-auto">
                                            <p className="text-xs font-bold text-red-300 mb-2">Errors:</p>
                                            {result.errors.map((e, i) => (
                                                <p key={i} className="text-xs text-red-200">{e}</p>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto text-red-400">
                                    <AlertCircle className="w-8 h-8" />
                                </div>
                                <p className="text-red-300">{result.message}</p>
                            </>
                        )}
                        <button
                            onClick={onClose}
                            className="w-full py-3 bg-white/10 hover:bg-white/20 rounded-xl text-white font-medium transition-all"
                        >
                            Close
                        </button>
                    </div>
                )}
            </motion.div>
        </div>
    );
}
