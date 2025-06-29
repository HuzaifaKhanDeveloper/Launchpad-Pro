import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeftIcon, CalendarIcon, CurrencyDollarIcon } from '@heroicons/react/24/outline';
import { useTokenSale } from '../hooks/useTokenSale';
import { useWeb3 } from '../hooks/useWeb3';
import { toast } from 'react-hot-toast';

const CreateSale: React.FC = () => {
  const navigate = useNavigate();
  const { createSale, isLoading } = useTokenSale();
  const { isConnected } = useWeb3();

  const [formData, setFormData] = useState({
    tokenAddress: '',
    tokenPrice: '',
    totalSupply: '',
    softCap: '',
    hardCap: '',
    startDate: '',
    startTime: '',
    endDate: '',
    endTime: '',
    saleType: 0,
    whitelistEnabled: false
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isConnected) {
      toast.error('Please connect your wallet first');
      return;
    }

    // Validate form
    if (!formData.tokenAddress || !formData.tokenPrice || !formData.totalSupply) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (parseFloat(formData.softCap) >= parseFloat(formData.hardCap)) {
      toast.error('Hard cap must be greater than soft cap');
      return;
    }

    // Convert dates to timestamps
    const startTimestamp = Math.floor(new Date(`${formData.startDate}T${formData.startTime}`).getTime() / 1000);
    const endTimestamp = Math.floor(new Date(`${formData.endDate}T${formData.endTime}`).getTime() / 1000);

    if (startTimestamp <= Math.floor(Date.now() / 1000)) {
      toast.error('Start time must be in the future');
      return;
    }

    if (endTimestamp <= startTimestamp) {
      toast.error('End time must be after start time');
      return;
    }

    try {
      await createSale({
        tokenAddress: formData.tokenAddress,
        tokenPrice: formData.tokenPrice,
        totalSupply: formData.totalSupply,
        softCap: formData.softCap,
        hardCap: formData.hardCap,
        startTime: startTimestamp,
        endTime: endTimestamp,
        saleType: formData.saleType,
        whitelistEnabled: formData.whitelistEnabled
      });

      toast.success('Sale created successfully!');
      navigate('/sales');
    } catch (error) {
      console.error('Failed to create sale:', error);
    }
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-24">
            <h1 className="text-3xl font-bold text-white mb-4">Connect Your Wallet</h1>
            <p className="text-gray-300 mb-8">Please connect your wallet to create a token sale.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center space-x-4 mb-8">
          <button
            onClick={() => navigate(-1)}
            className="p-2 text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeftIcon className="h-6 w-6" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-white">Create Token Sale</h1>
            <p className="text-gray-300">Launch your token with our professional platform</p>
          </div>
        </div>

        {/* Form */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700/50">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Token Information */}
            <div>
              <h2 className="text-xl font-semibold text-white mb-6">Token Information</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Token Contract Address *
                  </label>
                  <input
                    type="text"
                    name="tokenAddress"
                    value={formData.tokenAddress}
                    onChange={handleInputChange}
                    placeholder="0x..."
                    className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Token Price (ETH) *
                  </label>
                  <input
                    type="number"
                    name="tokenPrice"
                    value={formData.tokenPrice}
                    onChange={handleInputChange}
                    placeholder="0.001"
                    step="0.000001"
                    className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Total Supply for Sale *
                  </label>
                  <input
                    type="number"
                    name="totalSupply"
                    value={formData.totalSupply}
                    onChange={handleInputChange}
                    placeholder="100000"
                    className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Sale Type
                  </label>
                  <select
                    name="saleType"
                    value={formData.saleType}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value={0}>Fixed Price</option>
                    <option value={1}>Dutch Auction</option>
                    <option value={2}>Lottery</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Sale Parameters */}
            <div>
              <h2 className="text-xl font-semibold text-white mb-6">Sale Parameters</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Soft Cap (ETH) *
                  </label>
                  <input
                    type="number"
                    name="softCap"
                    value={formData.softCap}
                    onChange={handleInputChange}
                    placeholder="10"
                    step="0.1"
                    className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Hard Cap (ETH) *
                  </label>
                  <input
                    type="number"
                    name="hardCap"
                    value={formData.hardCap}
                    onChange={handleInputChange}
                    placeholder="100"
                    step="0.1"
                    className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Timing */}
            <div>
              <h2 className="text-xl font-semibold text-white mb-6">Sale Timing</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Start Date *
                  </label>
                  <input
                    type="date"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Start Time *
                  </label>
                  <input
                    type="time"
                    name="startTime"
                    value={formData.startTime}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    End Date *
                  </label>
                  <input
                    type="date"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    End Time *
                  </label>
                  <input
                    type="time"
                    name="endTime"
                    value={formData.endTime}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Options */}
            <div>
              <h2 className="text-xl font-semibold text-white mb-6">Additional Options</h2>
              <div className="space-y-4">
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    name="whitelistEnabled"
                    checked={formData.whitelistEnabled}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-primary-500 bg-gray-900 border-gray-600 rounded focus:ring-primary-500"
                  />
                  <span className="text-gray-300">Enable Whitelist</span>
                </label>
              </div>
            </div>

            {/* Submit */}
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="px-6 py-3 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-6 py-3 bg-gradient-to-r from-primary-500 to-secondary-500 hover:from-primary-600 hover:to-secondary-600 text-white rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Creating Sale...' : 'Create Sale'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateSale;