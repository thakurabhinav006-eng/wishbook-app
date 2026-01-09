'use client';
import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom'; // Added import
import { Upload, X, FileSpreadsheet, CheckCircle, AlertCircle, Loader2, FileText, Trash2, Download } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getApiUrl } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';

export default function BulkImportModal({ onClose, onSuccess }) {
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [isDragging, setIsDragging] = useState(false);
    const [mounted, setMounted] = useState(false); // Added mounted state
    const fileInputRef = useRef(null);
    const { token } = useAuth();

    useEffect(() => {
        setMounted(true);
        return () => setMounted(false);
    }, []);

    const handleFileChange = (e) => {
        if (e.target.files[0]) {
            validateAndSetFile(e.target.files[0]);
        }
    };

    const validateAndSetFile = (selectedFile) => {
        if (selectedFile && selectedFile.type === "text/csv" || selectedFile.name.endsWith('.csv')) {
            setFile(selectedFile);
            setResult(null);
        } else {
            setResult({ success: false, message: "Please upload a valid CSV file." });
        }
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            validateAndSetFile(e.dataTransfer.files[0]);
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
                },
                body: formData
            });

            const data = await res.json();
            if (res.ok) {
                setResult({ success: true, count: data.imported, errors: data.errors });
                if (data.imported > 0) setTimeout(onSuccess, 1500); // Auto close/refresh after success
            } else {
                setResult({ success: false, message: data.detail || 'Upload failed' });
            }
        } catch (error) {
            setResult({ success: false, message: 'Network error' });
        } finally {
            setLoading(false);
        }
    };

    const downloadTemplate = () => {
        const headers = ['name', 'email', 'phone', 'relationship', 'birthday', 'anniversary', 'gender', 'custom_occasion_name', 'custom_occasion_date', 'notes'];
        const sampleRow = ['John Doe', 'john@example.com', '+1234567890', 'Friend', '1990-01-01', '', 'Male', 'Graduation', '2025-06-01', 'Sample note'];
        const csvContent = [headers.join(','), sampleRow.join(',')].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'wishme_contacts_template.csv';
        a.click();
        window.URL.revokeObjectURL(url);
    };

    if (!mounted) return null;

    return createPortal(
        <div
            className="fixed inset-0 !z-[99999] flex items-center justify-center p-4 isolation-auto"
            style={{ zIndex: 99999 }}
        >
            <div className="fixed inset-0 bg-black/90 backdrop-blur-md" style={{ zIndex: -1 }} onClick={onClose} />
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-[#181820] border border-white/10 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh] text-white font-sans"
            >
                {/* Header */}
                <div className="p-6 border-b border-white/10 flex justify-between items-center bg-[#181820]">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-xl border border-green-500/20">
                            <FileSpreadsheet className="w-5 h-5 text-green-400" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-white">Import Contacts</h2>
                            <p className="text-xs text-gray-400">Add contacts in bulk via CSV</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full text-gray-400 hover:text-white transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto custom-scrollbar">
                    {!result || !result.success ? (
                        <div className="space-y-6">
                            {/* Dropzone */}
                            <div
                                onClick={() => fileInputRef.current?.click()}
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onDrop={handleDrop}
                                className={`
                                    relative group border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer
                                    ${isDragging
                                        ? 'border-purple-500 bg-purple-500/10'
                                        : 'border-white/10 bg-white/5 hover:border-purple-500/50 hover:bg-white/10'
                                    }
                                `}
                            >
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleFileChange}
                                    accept=".csv"
                                    className="hidden"
                                />

                                <div className="flex flex-col items-center gap-3 pointer-events-none">
                                    <div className={`
                                        w-12 h-12 rounded-full flex items-center justify-center transition-transform group-hover:scale-110
                                        ${isDragging ? 'bg-purple-500 text-white' : 'bg-white/10 text-gray-400'}
                                    `}>
                                        <Upload className="w-6 h-6" />
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-sm font-medium text-white">
                                            {isDragging ? 'Drop file here' : 'Click or drag to upload'}
                                        </p>
                                        <p className="text-xs text-gray-500">CSV files only (max 5MB)</p>
                                    </div>
                                </div>
                            </div>

                            {/* Selected File */}
                            <AnimatePresence>
                                {file && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="overflow-hidden"
                                    >
                                        <div className="flex items-center justify-between p-3 bg-purple-500/10 border border-purple-500/20 rounded-xl">
                                            <div className="flex items-center gap-3 overflow-hidden">
                                                <div className="p-2 bg-purple-500/20 rounded-lg">
                                                    <FileText className="w-4 h-4 text-purple-300" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium text-purple-100 truncate">{file.name}</p>
                                                    <p className="text-xs text-purple-300/60">{(file.size / 1024).toFixed(1)} KB</p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); setFile(null); setResult(null); }}
                                                className="p-1.5 hover:bg-red-500/10 text-gray-400 hover:text-red-400 rounded-lg transition-colors"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Error Message */}
                            {result?.success === false && (
                                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-2 text-red-200 text-sm">
                                    <AlertCircle className="w-4 h-4 shrink-0" />
                                    {result.message}
                                </div>
                            )}

                            {/* Guidelines */}
                            <div className="space-y-3">
                                <h4 className="text-xs font-bold uppercase text-gray-500 tracking-wider">CSV Requirements</h4>
                                <div className="flex flex-wrap gap-2">
                                    {['name', 'email'].map(col => (
                                        <span key={col} className="px-2.5 py-1 bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs rounded-lg font-mono">
                                            {col}*
                                        </span>
                                    ))}
                                    {['phone', 'birthday', 'relationship'].map(col => (
                                        <span key={col} className="px-2.5 py-1 bg-white/5 border border-white/10 text-gray-400 text-xs rounded-lg font-mono">
                                            {col}
                                        </span>
                                    ))}
                                    <span className="text-xs text-gray-500 px-1 py-1">+ others</span>
                                </div>
                            </div>
                        </div>
                    ) : (
                        /* Result State (Success or Warning/Error) */
                        <div className="py-8 text-center space-y-4">
                            <motion.div
                                initial={{ scale: 0.5, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                className={`w-16 h-16 ${result.count > 0 ? 'bg-green-500/20 text-green-400' : 'bg-orange-500/20 text-orange-400'} rounded-full flex items-center justify-center mx-auto`}
                            >
                                {result.count > 0 ? <CheckCircle className="w-8 h-8" /> : <AlertCircle className="w-8 h-8" />}
                            </motion.div>
                            <div>
                                <h3 className="text-xl font-bold text-white mb-1">
                                    {result.count > 0 ? 'Import Complete!' : 'Import Failed'}
                                </h3>
                                <p className="text-gray-400">
                                    {result.count > 0
                                        ? `Added ${result.count} contacts to your list.`
                                        : 'No contacts were added to your list.'}
                                </p>
                            </div>
                            {result.errors?.length > 0 && (
                                <div className="mt-4 text-left bg-orange-500/10 p-4 rounded-xl border border-orange-500/20 max-h-40 overflow-y-auto custom-scrollbar">
                                    <p className="text-xs font-bold text-orange-300 mb-2 flex items-center gap-2">
                                        <AlertCircle className="w-3 h-3" />
                                        {result.count > 0 ? 'Warnings' : 'Reasons for skip'} ({result.errors.length})
                                    </p>
                                    <ul className="space-y-1">
                                        {result.errors.map((e, i) => (
                                            <li key={i} className="text-xs text-orange-200/80">• {e}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-white/10 bg-[#181820] flex justify-between items-center gap-4">
                    {!result?.success ? (
                        <>
                            <button
                                onClick={downloadTemplate}
                                className="text-xs text-gray-400 hover:text-white flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/5 transition-colors"
                            >
                                <Download className="w-3.5 h-3.5" />
                                Download Template
                            </button>
                            <button
                                onClick={handleUpload}
                                disabled={!file || loading}
                                className="flex-1 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-purple-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex justify-center items-center gap-2"
                            >
                                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                                {loading ? 'Importing...' : 'Import Contacts'}
                            </button>
                        </>
                    ) : (
                        <button
                            onClick={onClose}
                            className="w-full py-2.5 bg-white/10 hover:bg-white/20 text-white font-medium rounded-xl transition-colors"
                        >
                            Close
                        </button>
                    )}
                </div>
            </motion.div>
        </div>,
        document.body
    );
}
