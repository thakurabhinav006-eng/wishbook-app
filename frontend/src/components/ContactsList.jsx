import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getApiUrl } from '../lib/utils';
import { Plus, Upload, User, Search, Filter } from 'lucide-react';
import ContactDetailsModal from './ContactDetailsModal';
import BulkImportModal from './BulkImportModal';
import ContactFormModal from './ContactFormModal';
import { Pencil } from 'lucide-react';

import useSWR from 'swr';

const fetcher = ([url, token]) => fetch(url, { headers: { 'Authorization': `Bearer ${token}` } }).then(res => res.json());

export default function ContactsList({ onSelectContact }) {
    // const [contacts, setContacts] = useState([]); // Removed
    // const [contacts, setContacts] = useState([]); // Removed
    const [loading, setLoading] = useState(false);
    const [filter, setFilter] = useState('');
    const [relationshipFilter, setRelationshipFilter] = useState('');
    const [selectedContact, setSelectedContact] = useState(null);
    const [showImportModal, setShowImportModal] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [editingContact, setEditingContact] = useState(null);

    const { token } = useAuth();

    // Fetch with query params
    const searchParams = new URLSearchParams();
    if (filter) searchParams.append('search', filter);
    if (relationshipFilter) searchParams.append('relationship', relationshipFilter);
    const queryString = searchParams.toString();

    const { data: contacts = [], mutate, error } = useSWR(
        token ? [getApiUrl(`/api/contacts?${queryString}`), token] : null,
        fetcher
    );

    const handleSaveContact = async (formData) => {
        try {
            // Prepare payload
            const payload = {
                ...formData,
                birthday: formData.birthday ? new Date(formData.birthday).toISOString() : null,
                anniversary: formData.anniversary ? new Date(formData.anniversary).toISOString() : null,
                custom_occasion_date: formData.custom_occasion_date ? new Date(formData.custom_occasion_date).toISOString() : null,
                // Ensure empty strings are null
                phone: formData.phone || null,
                custom_occasion_name: formData.custom_occasion_name || null,
                gender: formData.gender || null,
                notes: formData.notes || null,
                email: formData.email || null
            };

            const isEdit = !!editingContact;
            const url = isEdit
                ? getApiUrl(`/api/contacts/${editingContact.id}`)
                : getApiUrl('/api/contacts');

            const method = isEdit ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload),
            });

            if (res.ok) {
                setShowCreateModal(false);
                setEditingContact(null);
                mutate();
                if (isEdit && selectedContact && selectedContact.id === editingContact.id) {
                    setSelectedContact(await res.json()); // Update details view if open
                }
            } else {
                const err = await res.json();
                alert(err.detail || "Failed to save contact");
            }
        } catch (error) {
            console.error('Error saving contact:', error);
            alert("Error saving contact");
        }
    };

    const handleDelete = async (id, e) => {
        e.stopPropagation(); // Prevent opening modal
        try {
            await fetch(getApiUrl(`/api/contacts/${id}`), {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            mutate();
        } catch (error) {
            console.error('Error deleting contact:', error);
        }
    };

    // Client-side filtering removed as we use backend search now
    const filteredContacts = contacts;

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div>
                    <h2 className="text-xl font-semibold text-gray-200">My Contacts</h2>
                    <p className="text-sm text-gray-400">Manage your friends & family list</p>
                </div>

                <div className="flex gap-3">
                    <button
                        onClick={() => setShowImportModal(true)}
                        className="flex items-center gap-2 px-4 py-2.5 bg-white/5 hover:bg-white/10 text-gray-300 rounded-xl text-sm font-medium transition-colors border border-white/10"
                    >
                        <Upload className="w-4 h-4" />
                        <span>Import CSV</span>
                    </button>
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl text-sm font-bold shadow-lg shadow-purple-500/20 transition-all border border-white/10"
                    >
                        <Plus className="w-4 h-4" />
                        <span>Add Contact</span>
                    </button>
                </div>
            </div>

            {/* Search and Filters Bar */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input
                        type="text"
                        placeholder="Search by name or email..."
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-purple-500/50 transition-all placeholder:text-gray-600"
                    />
                </div>

                <div className="relative w-full md:w-48">
                    <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <select
                        value={relationshipFilter}
                        onChange={(e) => setRelationshipFilter(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-purple-500/50 transition-all appearance-none cursor-pointer"
                    >
                        <option value="">All Relationships</option>
                        <option value="Friend">Friend</option>
                        <option value="Family">Family</option>
                        <option value="Colleague">Colleague</option>
                        <option value="Work">Work</option>
                        <option value="Other">Other</option>
                    </select>
                </div>
            </div>

            {/* Contacts List */}
            <div className="space-y-3">
                {contacts.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 px-4 bg-white/5 border border-white/5 rounded-2xl border-dashed">
                        <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4">
                            <User className="w-8 h-8 text-gray-400 opacity-50" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-300 mb-1">
                            {filter || relationshipFilter ? "No matching contacts found" : "No contacts yet"}
                        </h3>
                        <p className="text-sm text-gray-500 max-w-sm text-center mb-6">
                            {filter || relationshipFilter
                                ? "Try adjusting your filters or search terms."
                                : "Add your friends and family to start sending magical AI wishes on their special days."}
                        </p>

                        {!filter && !relationshipFilter && (
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowImportModal(true)}
                                    className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-sm transition-colors border border-white/10"
                                >
                                    Import CSV
                                </button>
                                <button
                                    onClick={() => setShowCreateModal(true)}
                                    className="px-4 py-2 bg-purple-600 hover:bg-purple-500 rounded-lg text-sm font-medium transition-colors"
                                >
                                    Add First Contact
                                </button>
                            </div>
                        )}
                    </div>
                ) : (
                    contacts.map((contact) => (
                        <div
                            key={contact.id}
                            onClick={() => setSelectedContact(contact)}
                            className="flex justify-between items-center p-4 bg-white/5 border border-white/5 rounded-xl hover:bg-white/10 hover:border-white/10 transition-all cursor-pointer group"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center text-purple-300 font-bold border border-white/5">
                                    {contact.name.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <p className="font-medium text-gray-200 flex items-center gap-2">
                                        {contact.name}
                                        <span className="text-[10px] px-2 py-0.5 bg-white/10 rounded-full text-gray-400 border border-white/5">
                                            {contact.relationship}
                                        </span>
                                    </p>
                                    <p className="text-sm text-gray-500">{contact.email}</p>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                {onSelectContact && (
                                    <button
                                        onClick={(e) => { e.stopPropagation(); onSelectContact(contact); }}
                                        className="text-sm px-3 py-1.5 bg-purple-500/10 text-purple-400 hover:bg-purple-500/20 rounded-lg transition-colors font-medium border border-purple-500/20"
                                    >
                                        Select
                                    </button>
                                )}
                                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setEditingContact(contact);
                                            setShowCreateModal(true);
                                        }}
                                        className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors"
                                        title="Edit"
                                    >
                                        <Pencil className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={(e) => handleDelete(contact.id, e)}
                                        className="p-2 hover:bg-red-500/10 rounded-lg text-gray-400 hover:text-red-400 transition-colors"
                                        title="Delete"
                                    >
                                        <X className="w-4 h-4" /> {/* Changed to X icon or Trash icon if available, assumed X is imported */}
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Modals */}
            <ContactDetailsModal
                contact={selectedContact}
                onClose={() => setSelectedContact(null)}
            />
            {showImportModal && (
                <BulkImportModal
                    onClose={() => setShowImportModal(false)}
                    onSuccess={() => {
                        setShowImportModal(false);
                        mutate();
                    }}
                />
            )}

            {/* Create/Edit Modal */}
            <ContactFormModal
                isOpen={showCreateModal}
                onClose={() => { setShowCreateModal(false); setEditingContact(null); }}
                onSubmit={handleSaveContact}
                initialData={editingContact}
                title={editingContact ? "Edit Contact" : "Add New Contact"}
            />
        </div >
    );
}
