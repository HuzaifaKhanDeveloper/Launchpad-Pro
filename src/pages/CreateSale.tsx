import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeftIcon, CalendarIcon, CurrencyDollarIcon, CheckCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { useTokenSale } from '../hooks/useTokenSale';
import { useWeb3 } from '../hooks/useWeb3';
import { toast } from 'react-hot-toast';
import AnimatedCard from '../components/common/AnimatedCard';
import GradientButton from '../components/common/GradientButton';
import LoadingSpinner from '../components/common/LoadingSpinner';

interface FormErrors {
  [key: string]: string;
}

const CreateSale: React.FC = () => {
  const navigate = useNavigate();
  const { createSale, isLoading } = useTokenSale();
  const { isConnected, address } = useWeb3();

  const [currentStep, setCurrentStep] = useState(1);
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
    whitelistEnabled: false,
    projectName: '',
    projectDescription: '',
    website: '',
    twitter: '',
    telegram: ''
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isValidating, setIsValidating] = useState(false);

  // Set default dates (start tomorrow, end in 7 days)
  useEffect(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 8);

    setFormData(prev => ({
      ...prev,
      startDate: tomorrow.toISOString().split('T')[0],
      startTime: '12:00',
      endDate: endDate.toISOString().split('T')[0],
      endTime: '12:00'
    }));
  }, []);

  const validateStep = (step: number): boolean => {
    const newErrors: FormErrors = {};

    if (step === 1) {
      if (!formData.projectName.trim()) newErrors.projectName = 'Project name is required';
      if (!formData.projectDescription.trim()) newErrors.projectDescription = 'Project description is required';
      if (!formData.tokenAddress.trim()) newErrors.tokenAddress = 'Token contract address is required';
      if (!/^0x[a-fA-F0-9]{40}$/.test(formData.tokenAddress)) newErrors.tokenAddress = 'Invalid Ethereum address format';
    }

    if (step === 2) {
      if (!formData.tokenPrice || parseFloat(formData.tokenPrice) <= 0) {
        newErrors.tokenPrice = 'Token price must be greater than 0';
      }
      if (!formData.totalSupply || parseFloat(formData.totalSupply) <= 0) {
        newErrors.totalSupply = 'Total supply must be greater than 0';
      }
      if (!formData.softCap || parseFloat(formData.softCap) <= 0) {
        newErrors.softCap = 'Soft cap must be greater than 0';
      }
      if (!formData.hardCap || parseFloat(formData.hardCap) <= 0) {
        newErrors.hardCap = 'Hard cap must be greater than 0';
      }
      if (parseFloat(formData.softCap) >= parseFloat(formData.hardCap)) {
        newErrors.hardCap = 'Hard cap must be greater than soft cap';
      }
    }

    if (step === 3) {
      if (!formData.startDate) newErrors.startDate = 'Start date is required';
      if (!formData.startTime) newErrors.startTime = 'Start time is required';
      if (!formData.endDate) newErrors.endDate = 'End date is required';
      if (!formData.endTime) newErrors.endTime = 'End time is required';

      const startTimestamp = new Date(`${formData.startDate}T${formData.startTime}`).getTime();
      const endTimestamp = new Date(`${formData.endDate}T${formData.endTime}`).getTime();
      const now = Date.now();

      if (startTimestamp <= now) {
        newErrors.startDate = 'Start time must be in the future';
      }
      if (endTimestamp <= startTimestamp) {
        newErrors.endDate = 'End time must be after start time';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 4));
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isConnected) {
      toast.error('Please connect your wallet first');
      return;
    }

    if (!validateStep(3)) {
      return;
    }

    setIsValidating(true);

    try {
      // Convert dates to timestamps
      const startTimestamp = Math.floor(new Date(`${formData.startDate}T${formData.startTime}`).getTime() / 1000);
      const endTimestamp = Math.floor(new Date(`${formData.endDate}T${formData.endTime}`).getTime() / 1000);

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

      setCurrentStep(4); // Success step
      
      setTimeout(() => {
        navigate('/sales');
      }, 3000);
    } catch (error) {
      console.error('Failed to create sale:', error);
      setIsValidating(false);
    }
  };

  const steps = [
    { number: 1, title: 'Project Info', description: 'Basic project information' },
    { number: 2, title: 'Sale Details', description: 'Token pricing and caps' },
    { number: 3, title: 'Timing', description: 'Sale schedule' },
    { number: 4, title: 'Complete', description: 'Review and submit' }
  ];

  if (!isConnected) {
    return (
      <div className="min-h-screen py-12 bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedCard direction="scale" className="text-center py-24">
            <div className="glass rounded-2xl p-12 border border-gray-700/50 max-w-md mx-auto">
              <ExclamationTriangleIcon className="h-16 w-16 text-yellow-400 mx-auto mb-6" />
              <h1 className="text-3xl font-bold text-white mb-4">Connect Your Wallet</h1>
              <p className="text-gray-300 mb-8">Please connect your wallet to create a token sale.</p>
              <GradientButton onClick={() => navigate('/')} variant="primary">
                Go Home
              </GradientButton>
            </div>
          </AnimatedCard>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 bg-slate-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <AnimatedCard direction="down" className="mb-8">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-gray-800/50"
            >
              <ArrowLeftIcon className="h-6 w-6" />
            </button>
            <div>
              <h1 className="text-4xl font-bold gradient-text">Create Token Sale</h1>
              <p className="text-gray-300 mt-2">Launch your token with our professional platform</p>
            </div>
          </div>
        </AnimatedCard>

        {/* Progress Steps */}
        <AnimatedCard direction="up" delay={200} className="mb-8">
          <div className="glass rounded-2xl p-6 border border-gray-700/50">
            <div className="flex items-center justify-between">
              {steps.map((step, index) => (
                <div key={step.number} className="flex items-center">
                  <div className="flex items-center">
                    <div className={`
                      w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all duration-300
                      ${currentStep >= step.number 
                        ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg' 
                        : 'bg-gray-700 text-gray-400'
                      }
                    `}>
                      {currentStep > step.number ? (
                        <CheckCircleIcon className="h-6 w-6" />
                      ) : (
                        step.number
                      )}
                    </div>
                    <div className="ml-3 hidden sm:block">
                      <div className={`text-sm font-medium ${
                        currentStep >= step.number ? 'text-white' : 'text-gray-400'
                      }`}>
                        {step.title}
                      </div>
                      <div className="text-xs text-gray-500">{step.description}</div>
                    </div>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`
                      w-16 h-0.5 mx-4 transition-all duration-300
                      ${currentStep > step.number ? 'bg-gradient-to-r from-blue-500 to-cyan-500' : 'bg-gray-700'}
                    `} />
                  )}
                </div>
              ))}
            </div>
          </div>
        </AnimatedCard>

        {/* Form */}
        <AnimatedCard direction="up" delay={400}>
          <div className="glass rounded-2xl p-8 border border-gray-700/50">
            <form onSubmit={handleSubmit}>
              {/* Step 1: Project Information */}
              {currentStep === 1 && (
                <div className="space-y-6 animate-fade-in-up">
                  <h2 className="text-2xl font-bold text-white mb-6">Project Information</h2>
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Project Name *
                      </label>
                      <input
                        type="text"
                        name="projectName"
                        value={formData.projectName}
                        onChange={handleInputChange}
                        placeholder="My Awesome Token"
                        className={`w-full px-4 py-3 bg-gray-900/50 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                          errors.projectName ? 'border-red-500' : 'border-gray-600'
                        }`}
                      />
                      {errors.projectName && (
                        <p className="text-red-400 text-sm mt-1">{errors.projectName}</p>
                      )}
                    </div>

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
                        className={`w-full px-4 py-3 bg-gray-900/50 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                          errors.tokenAddress ? 'border-red-500' : 'border-gray-600'
                        }`}
                      />
                      {errors.tokenAddress && (
                        <p className="text-red-400 text-sm mt-1">{errors.tokenAddress}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Project Description *
                    </label>
                    <textarea
                      name="projectDescription"
                      value={formData.projectDescription}
                      onChange={handleInputChange}
                      placeholder="Describe your project, its goals, and what makes it unique..."
                      rows={4}
                      className={`w-full px-4 py-3 bg-gray-900/50 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all resize-none ${
                        errors.projectDescription ? 'border-red-500' : 'border-gray-600'
                      }`}
                    />
                    {errors.projectDescription && (
                      <p className="text-red-400 text-sm mt-1">{errors.projectDescription}</p>
                    )}
                  </div>

                  <div className="grid md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Website
                      </label>
                      <input
                        type="url"
                        name="website"
                        value={formData.website}
                        onChange={handleInputChange}
                        placeholder="https://yourproject.com"
                        className="w-full px-4 py-3 bg-gray-900/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Twitter
                      </label>
                      <input
                        type="url"
                        name="twitter"
                        value={formData.twitter}
                        onChange={handleInputChange}
                        placeholder="https://twitter.com/yourproject"
                        className="w-full px-4 py-3 bg-gray-900/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Telegram
                      </label>
                      <input
                        type="url"
                        name="telegram"
                        value={formData.telegram}
                        onChange={handleInputChange}
                        placeholder="https://t.me/yourproject"
                        className="w-full px-4 py-3 bg-gray-900/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Sale Details */}
              {currentStep === 2 && (
                <div className="space-y-6 animate-fade-in-up">
                  <h2 className="text-2xl font-bold text-white mb-6">Sale Parameters</h2>
                  
                  <div className="grid md:grid-cols-2 gap-6">
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
                        className={`w-full px-4 py-3 bg-gray-900/50 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                          errors.tokenPrice ? 'border-red-500' : 'border-gray-600'
                        }`}
                      />
                      {errors.tokenPrice && (
                        <p className="text-red-400 text-sm mt-1">{errors.tokenPrice}</p>
                      )}
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
                        className={`w-full px-4 py-3 bg-gray-900/50 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                          errors.totalSupply ? 'border-red-500' : 'border-gray-600'
                        }`}
                      />
                      {errors.totalSupply && (
                        <p className="text-red-400 text-sm mt-1">{errors.totalSupply}</p>
                      )}
                    </div>

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
                        className={`w-full px-4 py-3 bg-gray-900/50 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                          errors.softCap ? 'border-red-500' : 'border-gray-600'
                        }`}
                      />
                      {errors.softCap && (
                        <p className="text-red-400 text-sm mt-1">{errors.softCap}</p>
                      )}
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
                        className={`w-full px-4 py-3 bg-gray-900/50 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                          errors.hardCap ? 'border-red-500' : 'border-gray-600'
                        }`}
                      />
                      {errors.hardCap && (
                        <p className="text-red-400 text-sm mt-1">{errors.hardCap}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Sale Type
                      </label>
                      <select
                        name="saleType"
                        value={formData.saleType}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-gray-900/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                      >
                        <option value={0}>Fixed Price</option>
                        <option value={1}>Dutch Auction</option>
                        <option value={2}>Lottery</option>
                      </select>
                    </div>

                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        name="whitelistEnabled"
                        checked={formData.whitelistEnabled}
                        onChange={handleInputChange}
                        className="w-4 h-4 text-blue-500 bg-gray-900 border-gray-600 rounded focus:ring-blue-500"
                      />
                      <label className="text-gray-300">Enable Whitelist</label>
                    </div>
                  </div>

                  {/* Preview */}
                  <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                    <h3 className="text-blue-300 font-medium mb-2">Sale Preview</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-400">Total Raise (if hard cap reached):</span>
                        <span className="text-white ml-2">
                          {formData.hardCap ? `${formData.hardCap} ETH` : '0 ETH'}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-400">Tokens per ETH:</span>
                        <span className="text-white ml-2">
                          {formData.tokenPrice ? (1 / parseFloat(formData.tokenPrice)).toLocaleString() : '0'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Timing */}
              {currentStep === 3 && (
                <div className="space-y-6 animate-fade-in-up">
                  <h2 className="text-2xl font-bold text-white mb-6">Sale Timing</h2>
                  
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
                        className={`w-full px-4 py-3 bg-gray-900/50 border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                          errors.startDate ? 'border-red-500' : 'border-gray-600'
                        }`}
                      />
                      {errors.startDate && (
                        <p className="text-red-400 text-sm mt-1">{errors.startDate}</p>
                      )}
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
                        className={`w-full px-4 py-3 bg-gray-900/50 border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                          errors.startTime ? 'border-red-500' : 'border-gray-600'
                        }`}
                      />
                      {errors.startTime && (
                        <p className="text-red-400 text-sm mt-1">{errors.startTime}</p>
                      )}
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
                        className={`w-full px-4 py-3 bg-gray-900/50 border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                          errors.endDate ? 'border-red-500' : 'border-gray-600'
                        }`}
                      />
                      {errors.endDate && (
                        <p className="text-red-400 text-sm mt-1">{errors.endDate}</p>
                      )}
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
                        className={`w-full px-4 py-3 bg-gray-900/50 border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                          errors.endTime ? 'border-red-500' : 'border-gray-600'
                        }`}
                      />
                      {errors.endTime && (
                        <p className="text-red-400 text-sm mt-1">{errors.endTime}</p>
                      )}
                    </div>
                  </div>

                  {/* Summary */}
                  <div className="glass-dark rounded-lg p-6">
                    <h3 className="text-white font-semibold mb-4">Sale Summary</h3>
                    <div className="grid md:grid-cols-2 gap-4 text-sm">
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Project:</span>
                          <span className="text-white">{formData.projectName || 'Not set'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Token Price:</span>
                          <span className="text-white">{formData.tokenPrice || '0'} ETH</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Total Supply:</span>
                          <span className="text-white">{formData.totalSupply ? parseInt(formData.totalSupply).toLocaleString() : '0'}</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Soft Cap:</span>
                          <span className="text-white">{formData.softCap || '0'} ETH</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Hard Cap:</span>
                          <span className="text-white">{formData.hardCap || '0'} ETH</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Duration:</span>
                          <span className="text-white">
                            {formData.startDate && formData.endDate 
                              ? `${Math.ceil((new Date(formData.endDate).getTime() - new Date(formData.startDate).getTime()) / (1000 * 60 * 60 * 24))} days`
                              : 'Not set'
                            }
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 4: Success */}
              {currentStep === 4 && (
                <div className="text-center py-12 animate-scale-in">
                  {isValidating ? (
                    <div className="space-y-6">
                      <LoadingSpinner size="lg" />
                      <div>
                        <h2 className="text-2xl font-bold text-white mb-2">Creating Your Sale...</h2>
                        <p className="text-gray-300">Please confirm the transaction in your wallet</p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto animate-glow">
                        <CheckCircleIcon className="h-12 w-12 text-white" />
                      </div>
                      <div>
                        <h2 className="text-3xl font-bold text-white mb-2">Sale Created Successfully!</h2>
                        <p className="text-gray-300 mb-6">Your token sale has been deployed to the blockchain</p>
                        <div className="text-sm text-gray-400">
                          Redirecting to sales page in 3 seconds...
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Navigation */}
              {currentStep < 4 && (
                <div className="flex justify-between pt-8 border-t border-gray-700">
                  <button
                    type="button"
                    onClick={prevStep}
                    disabled={currentStep === 1}
                    className="px-6 py-3 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  
                  {currentStep === 3 ? (
                    <GradientButton
                      type="submit"
                      disabled={isLoading || isValidating}
                      loading={isLoading || isValidating}
                      variant="primary"
                    >
                      Create Sale
                    </GradientButton>
                  ) : (
                    <GradientButton
                      type="button"
                      onClick={nextStep}
                      variant="primary"
                    >
                      Next Step
                    </GradientButton>
                  )}
                </div>
              )}
            </form>
          </div>
        </AnimatedCard>
      </div>
    </div>
  );
};

export default CreateSale;