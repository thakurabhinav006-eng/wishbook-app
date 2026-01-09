'use client';
import React, { useState, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { getApiUrl } from '../lib/utils';
import ContactDetailsModal from './ContactDetailsModal';
import BulkImportModal from './BulkImportModal';
import ContactFormModal from './ContactFormModal';
import Toast from './Toast';
import ConfirmationModal from './ConfirmationModal';
import { Plus, Upload, User, Search, Filter, Pencil, X, AlertCircle } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';
import useSWR from 'swr';

// Enhanced fetcher that throws on error
const fetcher = async ([url, token]) => {
    const res = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.detail || 'Failed to fetch contacts');
    }

    return res.json();
};

export default function ContactsList({ onSelectContact }) {
    const [searchQuery, setSearchQuery] = useState('');
    const [relationshipFilter, setRelationshipFilter] = useState('');
    const [monthFilter, setMonthFilter] = useState('');
    const [selectedContact, setSelectedContact] = useState(null);
    const [showImportModal, setShowImportModal] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [editingContact, setEditingContact] = useState(null);
    const [toast, setToast] = useState(null);
    const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, id: null, name: '' });

    const { token } = useAuth();

    const showToast = (message, type = 'info') => {
        setToast({ message, type });
    };

    const handleCloseToast = React.useCallback(() => {
        setToast(null);
    }, []);

    // Debounce search query
    const [debouncedSearch, setDebouncedSearch] = useState('');
    React.useEffect(() => {
        if (!searchQuery) {
            setDebouncedSearch('');
            return;
        }
        const timer = setTimeout(() => setDebouncedSearch(searchQuery), 400);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    // Construct query string with useMemo to prevent unnecessary re-renders
    const queryString = useMemo(() => {
        const params = new URLSearchParams();
        if (debouncedSearch) params.append('search', debouncedSearch);
        if (relationshipFilter) params.append('relationship', relationshipFilter);
        if (monthFilter) params.append('month', monthFilter);
        return params.toString();
    }, [debouncedSearch, relationshipFilter, monthFilter]);

    const { data: contacts = [], mutate, error } = useSWR(
        token ? [getApiUrl(`/api/contacts?${queryString}`), token] : null,
        fetcher,
        {
            revalidateOnFocus: false,
            onError: (err) => console.error("SWR Error:", err)
        }
    );

    const openCreateModal = (contactToEdit = null) => {
        setSelectedContact(null); // Enforce exclusivity
        setEditingContact(contactToEdit);
        setShowCreateModal(true);
    };

    const handleSaveContact = async (formData) => {
        try {
            // ... (keep existing logic) ...
            // Prepare payload
            const payload = {
                ...formData,
                birthday: formData.birthday || null, // Only send if valid
                anniversary: formData.anniversary || null,
                custom_occasion_date: formData.custom_occasion_date || null,
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
                if (isEdit && selectedContact?.id === editingContact.id) {
                    setSelectedContact(await res.json());
                }
                showToast(isEdit ? "Contact updated successfully!" : "Contact created successfully!", "success");
            } else {
                const err = await res.json();

                // If it's a validation error (422 or 400), throw the details so the modal can handle them
                if (res.status === 422 || res.status === 400) {
                    const validationError = new Error(err.detail || "Validation failed");
                    validationError.details = err.detail;
                    validationError.status = res.status;
                    throw validationError;
                }

                let errorMessage = "Failed to save contact";
                if (err.detail) {
                    errorMessage = Array.isArray(err.detail)
                        ? err.detail.map(e => `${e.loc[e.loc.length - 1]}: ${e.msg}`).join(', ')
                        : err.detail;
                }
                throw new Error(errorMessage);
            }
        } catch (error) {
            console.error('Error saving contact:', error);
            // Only show toast if it's NOT a validation error (which the modal will handle internally)
            if (error.status !== 422 && error.status !== 400) {
                showToast(error.message, "error");
            }
            throw error;
        }
    };

    const handleDeleteClick = (contact, e) => {
        e.stopPropagation();
        setDeleteConfirm({ isOpen: true, id: contact.id, name: contact.name });
    };

    const confirmDelete = async () => {
        const id = deleteConfirm.id;
        if (!id) return;

        // Optimistic update
        const currentContacts = contacts;
        mutate(contacts.filter(c => c.id !== id), false);

        try {
            const res = await fetch(getApiUrl(`/api/contacts/${id}`), {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!res.ok) throw new Error("Failed to delete");

            mutate();
            showToast("Contact deleted successfully", "success");
        } catch (error) {
            console.error('Error deleting contact:', error);
            mutate(currentContacts, false); // Rollback
            showToast("Failed to delete contact", "error");
        } finally {
            setDeleteConfirm({ isOpen: false, id: null, name: '' });
        }
    };

    return (
        <div className="space-y-6 mt-8">
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
                        onClick={() => openCreateModal()}
                        className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl text-sm font-bold shadow-lg shadow-purple-500/20 transition-all border border-white/10"
                    >
                        <Plus className="w-4 h-4" />
                        <span>Add Contact</span>
                    </button>
                </div>
            </div>

            {/* Search and Filters Bar */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1 group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input
                        type="text"
                        placeholder="Search by name or email..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-10 pr-10 text-sm text-white focus:outline-none focus:border-purple-500/50 transition-all placeholder:text-gray-600"
                    />
                    {searchQuery && (
                        <button
                            onClick={() => setSearchQuery('')}
                            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-white/10 rounded-full text-gray-500 hover:text-white transition-all"
                        >
                            <X className="w-3.5 h-3.5" />
                        </button>
                    )}
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

                <div className="relative w-full md:w-48">
                    <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <select
                        value={monthFilter}
                        onChange={(e) => setMonthFilter(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-purple-500/50 transition-all appearance-none cursor-pointer"
                    >
                        <option value="">All Months</option>
                        <option value="1">January</option>
                        <option value="2">February</option>
                        <option value="3">March</option>
                        <option value="4">April</option>
                        <option value="5">May</option>
                        <option value="6">June</option>
                        <option value="7">July</option>
                        <option value="8">August</option>
                        <option value="9">September</option>
                        <option value="10">October</option>
                        <option value="11">November</option>
                        <option value="12">December</option>
                    </select>
                </div>
            </div>

            {/* Error State */}
            {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-center text-red-200 text-sm flex items-center justify-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    <span>Failed to load contacts. Please try again later.</span>
                </div>
            )}

            {/* Contacts List */}
            <div className="space-y-4 pb-24">
                {contacts.length === 0 && !error ? (
                    <div className="flex flex-col items-center justify-center py-16 px-4 bg-white/5 border border-white/5 rounded-2xl border-dashed">
                        <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4">
                            <User className="w-8 h-8 text-gray-400 opacity-50" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-300 mb-1">
                            {searchQuery || relationshipFilter ? "No matching contacts found" : "No contacts yet"}
                        </h3>
                        <p className="text-sm text-gray-500 max-w-sm text-center mb-6">
                            {searchQuery || relationshipFilter
                                ? "Try adjusting your filters or search terms."
                                : "Add your friends and family to start sending magical AI wishes on their special days."}
                        </p>

                        {!searchQuery && !relationshipFilter && (
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowImportModal(true)}
                                    className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-sm transition-colors border border-white/10"
                                >
                                    Import CSV
                                </button>
                                <button
                                    onClick={() => openCreateModal()}
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
                            role="button"
                            tabIndex={0}
                            onClick={() => setSelectedContact(contact)}
                            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setSelectedContact(contact); }}
                            className="flex justify-between items-center p-6 bg-white/5 border border-white/5 rounded-xl hover:bg-white/10 hover:border-white/10 transition-all cursor-pointer group focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                        >
                            <div className="flex items-center gap-5">
                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center text-purple-300 font-bold border border-white/5 text-lg">
                                    {contact.name.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <p className="font-medium text-gray-200 flex items-center gap-3 text-lg">
                                        {contact.name}
                                        <span className="text-xs px-2.5 py-1 bg-white/10 rounded-full text-gray-400 border border-white/5 font-normal">
                                            {contact.relationship}
                                        </span>
                                    </p>
                                    <p className="text-sm text-gray-500 mt-1">{contact.email}</p>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                {onSelectContact && (
                                    <button
                                        onClick={(e) => { e.stopPropagation(); onSelectContact(contact); }}
                                        className="text-sm px-3 py-1.5 bg-purple-500/10 text-purple-400 hover:bg-purple-500/20 rounded-lg transition-colors font-medium border border-purple-500/20"
                                        aria-label={`Select ${contact.name}`}
                                    >
                                        Select
                                    </button>
                                )}
                                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity focus-within:opacity-100">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            openCreateModal(contact);
                                        }}
                                        className="p-2.5 hover:bg-white/10 rounded-xl text-gray-400 hover:text-white transition-colors"
                                        aria-label={`Edit ${contact.name}`}
                                        title="Edit"
                                    >
                                        <Pencil className="w-5 h-5" />
                                    </button>
                                    <button
                                        onClick={(e) => handleDeleteClick(contact, e)}
                                        className="p-2.5 hover:bg-red-500/10 rounded-xl text-gray-400 hover:text-red-400 transition-colors"
                                        aria-label={`Delete ${contact.name}`}
                                        title="Delete"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Modals */}
            <AnimatePresence>
                {selectedContact && (
                    <ContactDetailsModal
                        contact={selectedContact}
                        onClose={() => setSelectedContact(null)}
                    />
                )}
            </AnimatePresence>

            {showImportModal && (
                <BulkImportModal
                    onClose={() => setShowImportModal(false)}
                    onSuccess={() => {
                        setShowImportModal(false);
                        mutate();
                        showToast("Contacts imported successfully!", "success");
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

            {/* Confirmation Modal */}
            <ConfirmationModal
                isOpen={deleteConfirm.isOpen}
                onClose={() => setDeleteConfirm({ ...deleteConfirm, isOpen: false })}
                onConfirm={confirmDelete}
                title="Delete Contact?"
                message={`Are you sure you want to remove ${deleteConfirm.name} from your contacts? This action cannot be undone.`}
                confirmText="Delete"
                isDangerous={true}
            />

            {/* Custom Toast Alert */}
            <Toast
                message={toast?.message}
                type={toast?.type}
                onClose={handleCloseToast}
            />
        </div>
    );
}
