import React from 'react';

export default function WishResult({ wish }) {
    if (!wish) return null;

    const copyToClipboard = () => {
        navigator.clipboard.writeText(wish);
        alert('Copied to clipboard!');
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-md mt-6 border-l-4 border-purple-500">
            <h3 className="text-lg font-semibold mb-2 text-gray-800">Your Wish:</h3>
            <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{wish}</p>
            <div className="mt-4 flex justify-end">
                <button onClick={copyToClipboard} className="text-sm text-purple-600 hover:text-purple-800 font-medium">
                    Copy to Clipboard
                </button>
            </div>
        </div>
    );
}
