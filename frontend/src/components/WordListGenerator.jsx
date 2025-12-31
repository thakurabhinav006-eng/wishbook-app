import React, { useState } from 'react';

export default function WordListGenerator({ onGenerate, loading }) {
    const [words, setWords] = useState('');
    const [mode, setMode] = useState('creative');

    const handleSubmit = (e) => {
        e.preventDefault();
        const wordList = words.split(',').map(w => w.trim()).filter(w => w);
        if (wordList.length > 0) {
            onGenerate(wordList, mode);
        }
    };

    return (
        <div className="space-y-4">
            <h2 className="text-xl font-semibold mb-4 text-indigo-400">Wish from Words</h2>
            <p className="text-sm text-gray-400 mb-4">Enter a list of words (comma separated) to generate creative variants.</p>

            <textarea
                value={words}
                onChange={(e) => setWords(e.target.value)}
                placeholder="love, joy, celebration, cake..."
                className="w-full p-2 border border-white/10 rounded-md focus:ring-indigo-500 focus:border-indigo-500 bg-white/5 text-white placeholder-gray-500"
                rows="3"
            />

            <div className="flex items-center space-x-4">
                <select value={mode} onChange={(e) => setMode(e.target.value)} className="p-2 border border-white/10 rounded-md bg-white/5 text-gray-200">
                    <option className="bg-[#16162c] text-white" value="creative">Creative Expansion</option>
                    <option className="bg-[#16162c] text-white" value="template">Template Fill</option>
                    <option className="bg-[#16162c] text-white" value="synonym">Synonym Mode</option>
                </select>

                <button onClick={handleSubmit} disabled={loading} className="flex-1 bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-500 disabled:opacity-50 shadow-lg hover:shadow-indigo-500/30 transition-all">
                    {loading ? 'Processing...' : 'Generate Variants'}
                </button>
            </div>
        </div>
    );
}
