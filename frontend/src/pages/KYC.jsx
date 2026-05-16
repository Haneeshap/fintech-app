import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText, Upload, CheckCircle, AlertCircle, Shield, User, CreditCard } from 'lucide-react';

const KYC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [kycStatus, setKycStatus] = useState('pending'); // pending, submitted, verified, rejected
  const [formData, setFormData] = useState({
    panNumber: '',
    aadhaarNumber: '',
    dateOfBirth: '',
    address: '',
    city: '',
    state: '',
    pincode: ''
  });
  const [documents, setDocuments] = useState({
    panCard: null,
    aadhaarFront: null,
    aadhaarBack: null,
    selfie: null
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validateStep1 = () => {
    const newErrors = {};
    
    if (!formData.panNumber) {
      newErrors.panNumber = 'PAN number is required';
    } else if (!/[A-Z]{5}[0-9]{4}[A-Z]{1}/.test(formData.panNumber.toUpperCase())) {
      newErrors.panNumber = 'Invalid PAN number format';
    }
    
    if (!formData.aadhaarNumber) {
      newErrors.aadhaarNumber = 'Aadhaar number is required';
    } else if (!/^\d{12}$/.test(formData.aadhaarNumber)) {
      newErrors.aadhaarNumber = 'Aadhaar number must be 12 digits';
    }
    
    if (!formData.dateOfBirth) {
      newErrors.dateOfBirth = 'Date of birth is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors = {};
    
    if (!documents.panCard) {
      newErrors.panCard = 'PAN card is required';
    }
    if (!documents.aadhaarFront) {
      newErrors.aadhaarFront = 'Aadhaar front is required';
    }
    if (!documents.aadhaarBack) {
      newErrors.aadhaarBack = 'Aadhaar back is required';
    }
    if (!documents.selfie) {
      newErrors.selfie = 'Selfie is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFileUpload = (docType, file) => {
    setDocuments({ ...documents, [docType]: file });
    setErrors({ ...errors, [docType]: '' });
  };

  const handleSubmit = async () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setKycStatus('submitted');
      setLoading(false);
      setStep(4);
    }, 2000);
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
          <div>
            <h4 className="font-semibold text-blue-900">Personal Information</h4>
            <p className="text-sm text-blue-700 mt-1">
              Please provide your personal details for KYC verification. Your information is secure and encrypted.
            </p>
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          PAN Number
        </label>
        <input
          type="text"
          value={formData.panNumber}
          onChange={(e) => setFormData({ ...formData, panNumber: e.target.value.toUpperCase() })}
          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none ${
            errors.panNumber ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="ABCDE1234F"
          maxLength={10}
        />
        {errors.panNumber && <p className="text-red-600 text-sm mt-1">{errors.panNumber}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Aadhaar Number
        </label>
        <input
          type="text"
          value={formData.aadhaarNumber}
          onChange={(e) => setFormData({ ...formData, aadhaarNumber: e.target.value.replace(/\D/g, '') })}
          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none ${
            errors.aadhaarNumber ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="123456789012"
          maxLength={12}
        />
        {errors.aadhaarNumber && <p className="text-red-600 text-sm mt-1">{errors.aadhaarNumber}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Date of Birth
        </label>
        <input
          type="date"
          value={formData.dateOfBirth}
          onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none ${
            errors.dateOfBirth ? 'border-red-500' : 'border-gray-300'
          }`}
        />
        {errors.dateOfBirth && <p className="text-red-600 text-sm mt-1">{errors.dateOfBirth}</p>}
      </div>

      <button
        onClick={() => validateStep1() && setStep(2)}
        className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
      >
        Continue
      </button>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <FileText className="w-5 h-5 text-blue-600 mt-0.5" />
          <div>
            <h4 className="font-semibold text-blue-900">Document Upload</h4>
            <p className="text-sm text-blue-700 mt-1">
              Upload clear images of your documents. Accepted formats: JPG, PNG, PDF (Max 5MB)
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            PAN Card
          </label>
          <div className={`border-2 border-dashed rounded-lg p-6 text-center ${
            errors.panCard ? 'border-red-500 bg-red-50' : 'border-gray-300 hover:border-blue-400'
          }`}>
            <input
              type="file"
              accept="image/*,.pdf"
              onChange={(e) => handleFileUpload('panCard', e.target.files[0])}
              className="hidden"
              id="panCard"
            />
            <label htmlFor="panCard" className="cursor-pointer">
              {documents.panCard ? (
                <div>
                  <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
                  <p className="text-sm text-gray-700">{documents.panCard.name}</p>
                </div>
              ) : (
                <div>
                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">Click to upload PAN card</p>
                </div>
              )}
            </label>
          </div>
          {errors.panCard && <p className="text-red-600 text-sm mt-1">{errors.panCard}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Aadhaar Card (Front)
          </label>
          <div className={`border-2 border-dashed rounded-lg p-6 text-center ${
            errors.aadhaarFront ? 'border-red-500 bg-red-50' : 'border-gray-300 hover:border-blue-400'
          }`}>
            <input
              type="file"
              accept="image/*,.pdf"
              onChange={(e) => handleFileUpload('aadhaarFront', e.target.files[0])}
              className="hidden"
              id="aadhaarFront"
            />
            <label htmlFor="aadhaarFront" className="cursor-pointer">
              {documents.aadhaarFront ? (
                <div>
                  <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
                  <p className="text-sm text-gray-700">{documents.aadhaarFront.name}</p>
                </div>
              ) : (
                <div>
                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">Click to upload Aadhaar front</p>
                </div>
              )}
            </label>
          </div>
          {errors.aadhaarFront && <p className="text-red-600 text-sm mt-1">{errors.aadhaarFront}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Aadhaar Card (Back)
          </label>
          <div className={`border-2 border-dashed rounded-lg p-6 text-center ${
            errors.aadhaarBack ? 'border-red-500 bg-red-50' : 'border-gray-300 hover:border-blue-400'
          }`}>
            <input
              type="file"
              accept="image/*,.pdf"
              onChange={(e) => handleFileUpload('aadhaarBack', e.target.files[0])}
              className="hidden"
              id="aadhaarBack"
            />
            <label htmlFor="aadhaarBack" className="cursor-pointer">
              {documents.aadhaarBack ? (
                <div>
                  <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
                  <p className="text-sm text-gray-700">{documents.aadhaarBack.name}</p>
                </div>
              ) : (
                <div>
                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">Click to upload Aadhaar back</p>
                </div>
              )}
            </label>
          </div>
          {errors.aadhaarBack && <p className="text-red-600 text-sm mt-1">{errors.aadhaarBack}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Selfie with PAN Card
          </label>
          <div className={`border-2 border-dashed rounded-lg p-6 text-center ${
            errors.selfie ? 'border-red-500 bg-red-50' : 'border-gray-300 hover:border-blue-400'
          }`}>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleFileUpload('selfie', e.target.files[0])}
              className="hidden"
              id="selfie"
            />
            <label htmlFor="selfie" className="cursor-pointer">
              {documents.selfie ? (
                <div>
                  <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
                  <p className="text-sm text-gray-700">{documents.selfie.name}</p>
                </div>
              ) : (
                <div>
                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">Click to upload selfie</p>
                </div>
              )}
            </label>
          </div>
          {errors.selfie && <p className="text-red-600 text-sm mt-1">{errors.selfie}</p>}
        </div>
      </div>

      <div className="flex gap-4">
        <button
          onClick={() => setStep(1)}
          className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300 transition"
        >
          Back
        </button>
        <button
          onClick={() => validateStep2() && setStep(3)}
          className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
        >
          Continue
        </button>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
          <div>
            <h4 className="font-semibold text-blue-900">Review & Submit</h4>
            <p className="text-sm text-blue-700 mt-1">
              Please review your information before submitting. Once submitted, you cannot make changes.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-gray-50 rounded-xl p-6 space-y-4">
        <h3 className="font-semibold text-gray-900">Personal Information</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-600">PAN Number</p>
            <p className="font-medium">{formData.panNumber}</p>
          </div>
          <div>
            <p className="text-gray-600">Aadhaar Number</p>
            <p className="font-medium">{formData.aadhaarNumber.replace(/(\d{4})/g, '$1 ').trim()}</p>
          </div>
          <div>
            <p className="text-gray-600">Date of Birth</p>
            <p className="font-medium">{formData.dateOfBirth}</p>
          </div>
        </div>

        <h3 className="font-semibold text-gray-900 mt-6">Documents Uploaded</h3>
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-600" />
            <span>PAN Card: {documents.panCard?.name}</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-600" />
            <span>Aadhaar Front: {documents.aadhaarFront?.name}</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-600" />
            <span>Aadhaar Back: {documents.aadhaarBack?.name}</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-600" />
            <span>Selfie: {documents.selfie?.name}</span>
          </div>
        </div>
      </div>

      <div className="flex items-start gap-2">
        <input type="checkbox" id="terms" className="mt-1" />
        <label htmlFor="terms" className="text-sm text-gray-600">
          I confirm that the information provided is accurate and I agree to the terms and conditions for KYC verification.
        </label>
      </div>

      <div className="flex gap-4">
        <button
          onClick={() => setStep(2)}
          className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300 transition"
        >
          Back
        </button>
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50"
        >
          {loading ? 'Submitting...' : 'Submit KYC'}
        </button>
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="text-center space-y-6">
      <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
        <CheckCircle className="w-10 h-10 text-green-600" />
      </div>
      <div>
        <h2 className="text-2xl font-bold text-gray-900">KYC Submitted Successfully</h2>
        <p className="text-gray-600 mt-2">
          Your KYC verification has been submitted. Our team will review your documents within 24-48 hours.
        </p>
      </div>
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-left">
        <h4 className="font-semibold text-blue-900 mb-2">What happens next?</h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Our team will verify your documents</li>
          <li>• You'll receive an email notification</li>
          <li>• Once verified, you can start investing</li>
        </ul>
      </div>
      <button
        onClick={() => navigate('/dashboard')}
        className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
      >
        Back to Dashboard
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition"
            >
              <ArrowLeft className="w-5 h-5" />
              Back
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">KYC Verification</h1>
          <p className="text-gray-600 mt-2">Complete your KYC to start investing</p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              step >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
            }`}>
              {step > 1 ? <CheckCircle className="w-5 h-5" /> : '1'}
            </div>
            <span className="ml-2 text-sm font-medium">Personal Info</span>
          </div>
          <div className={`flex-1 h-1 mx-4 ${step >= 2 ? 'bg-blue-600' : 'bg-gray-200'}`} />
          <div className="flex items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              step >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
            }`}>
              {step > 2 ? <CheckCircle className="w-5 h-5" /> : '2'}
            </div>
            <span className="ml-2 text-sm font-medium">Documents</span>
          </div>
          <div className={`flex-1 h-1 mx-4 ${step >= 3 ? 'bg-blue-600' : 'bg-gray-200'}`} />
          <div className="flex items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              step >= 3 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
            }`}>
              {step > 3 ? <CheckCircle className="w-5 h-5" /> : '3'}
            </div>
            <span className="ml-2 text-sm font-medium">Review</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}
          {step === 4 && renderStep4()}
        </div>
      </main>
    </div>
  );
};

export default KYC;
