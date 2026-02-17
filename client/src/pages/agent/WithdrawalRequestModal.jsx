import { useState } from 'react';
import { FiX } from 'react-icons/fi';
import api from '../../services/api';
import toast from 'react-hot-toast';

const WithdrawalRequestModal = ({ isOpen, onClose, onSuccess, balance }) => {
    const [formData, setFormData] = useState({
        amount: '',
        paymentMethod: 'bank_transfer',
        paymentDetails: '',
    });
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (parseFloat(formData.amount) > balance) {
            toast.error('Insufficient balance');
            return;
        }

        setLoading(true);
        try {
            await api.post('/agent/withdrawals', formData);
            toast.success('Withdrawal requested successfully');
            onSuccess();
            onClose();
        } catch (error) {
            // Error handled by interceptor
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900 bg-opacity-50">
            <div className="bg-white dark:bg-dark-card rounded-xl shadow-xl border border-gray-100 dark:border-dark-border w-full max-w-md transform transition-all">
                <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-dark-border">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Request Withdrawal</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-500 transition-colors">
                        <FiX className="w-5 h-5" />
                    </button>
                </div>

                <div className="px-6 pt-4">
                    <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex justify-between items-center text-sm">
                        <span className="text-blue-700 dark:text-blue-300">Available Balance:</span>
                        <span className="font-bold text-blue-700 dark:text-blue-300 text-lg">${balance.toFixed(2)}</span>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Amount ($)</label>
                        <input
                            type="number"
                            min="10"
                            step="0.01"
                            required
                            value={formData.amount}
                            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-dark-bg dark:text-white"
                        />
                        <p className="text-xs text-gray-500 mt-1">Minimum withdrawal amount is $10.00</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Payment Method</label>
                        <select
                            value={formData.paymentMethod}
                            onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-dark-bg dark:text-white"
                        >
                            <option value="bank_transfer">Bank Transfer</option>
                            <option value="crypto">Cryptocurrency (USDT/BTC)</option>
                            <option value="e_wallet">E-Wallet (PayPal/Skrill)</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Payment Details</label>
                        <textarea
                            required
                            rows="3"
                            value={formData.paymentDetails}
                            onChange={(e) => setFormData({ ...formData, paymentDetails: e.target.value })}
                            placeholder={formData.paymentMethod === 'bank_transfer' ? 'Bank Name, Account Holder, IBAN/SWIFT' : 'Wallet Address / Email'}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-dark-bg dark:text-white"
                        />
                    </div>

                    <div className="pt-4 flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:bg-dark-bg dark:text-gray-300 dark:border-dark-border dark:hover:bg-gray-700"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-75"
                        >
                            {loading ? 'Submitting...' : 'Submit Request'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default WithdrawalRequestModal;
