import React, { useState, useEffect } from 'react';
import { FaTruck, FaHandshake, FaCalendar, FaPhone, FaMapMarkerAlt, FaCheckCircle, FaArrowRight, FaCoins } from 'react-icons/fa';
import Modal from './Modal';

const CollectionShippingModal = ({ isOpen, onClose, asset, onConfirm }) => {
  const [deliveryMethod, setDeliveryMethod] = useState(null);
  const [step, setStep] = useState(1); // Step 1: Choose method, Step 2: Confirm details
  const [hasZeroFees, setHasZeroFees] = useState(false);

  // Check if asset has zero fees
  useEffect(() => {
    if (asset?.charges) {
      const totalFees = asset.charges.reduce((sum, charge) => sum + (charge.amount || 0), 0);
      setHasZeroFees(totalFees === 0);
    }
  }, [asset]);

  const handleMethodSelect = (method) => {
    setDeliveryMethod(method);
    setStep(2);
  };

  const handleBack = () => {
    setStep(1);
    setDeliveryMethod(null);
  };

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm(deliveryMethod, asset);
    }
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Asset Cleared - Choose Delivery Method"
      size="large"
    >
      <div className="space-y-6">
        {/* Success Banner */}
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-l-4 border-green-500 rounded-lg p-4 flex items-start gap-3">
          <FaCheckCircle className="text-green-600 text-2xl mt-1 flex-shrink-0" />
          <div>
            <h3 className="font-bold text-green-900">Asset Cleared Successfully! ✓</h3>
            <p className="text-sm text-green-700 mt-1">
              Your asset <strong>{asset?.name}</strong> has been verified and approved for release.
            </p>
          </div>
        </div>

        {/* Zero Fees Banner */}
        {hasZeroFees && (
          <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border-l-4 border-amber-500 rounded-lg p-4 flex items-start gap-3">
            <FaCoins className="text-amber-600 text-2xl mt-1 flex-shrink-0" />
            <div>
              <h3 className="font-bold text-amber-900">🎉 Zero Fees Applied!</h3>
              <p className="text-sm text-amber-700 mt-1">
                This asset has <strong>no fees</strong>. After you select your delivery method, you'll go directly to tracking without any payment required.
              </p>
            </div>
          </div>
        )}

        {step === 1 ? (
          <>
            {/* Choose Delivery Method */}
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-4">
                How would you like to receive your asset?
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Collection Option */}
                <button
                  onClick={() => handleMethodSelect('collection')}
                  className="p-6 border-2 border-gray-200 rounded-xl hover:border-kestrel-gold hover:bg-yellow-50 transition-all duration-300 text-left group"
                >
                  <div className="flex items-start justify-between mb-3">
                    <FaHandshake className="text-3xl text-purple-600 group-hover:text-kestrel-gold" />
                    <FaArrowRight className="text-gray-300 group-hover:text-kestrel-gold transition-colors" />
                  </div>
                  <h5 className="font-bold text-gray-900 mb-2">Collection</h5>
                  <p className="text-sm text-gray-600 mb-4">
                    Pick up your asset from our secure facility at your convenience
                  </p>
                  <ul className="text-xs text-gray-600 space-y-1">
                    <li>✓ Flexible scheduling</li>
                    <li>✓ No shipping costs</li>
                    <li>✓ Immediate possession</li>
                  </ul>
                </button>

                {/* Shipping Option */}
                <button
                  onClick={() => handleMethodSelect('shipping')}
                  className="p-6 border-2 border-gray-200 rounded-xl hover:border-kestrel-gold hover:bg-yellow-50 transition-all duration-300 text-left group"
                >
                  <div className="flex items-start justify-between mb-3">
                    <FaTruck className="text-3xl text-blue-600 group-hover:text-kestrel-gold" />
                    <FaArrowRight className="text-gray-300 group-hover:text-kestrel-gold transition-colors" />
                  </div>
                  <h5 className="font-bold text-gray-900 mb-2">Shipping</h5>
                  <p className="text-sm text-gray-600 mb-4">
                    We'll securely ship your asset to your preferred address
                  </p>
                  <ul className="text-xs text-gray-600 space-y-1">
                    <li>✓ Doorstep delivery</li>
                    <li>✓ Full insurance included</li>
                    <li>✓ Tracking available</li>
                  </ul>
                </button>
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Confirm Details */}
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-4">
                {deliveryMethod === 'collection' ? 'Schedule Collection' : 'Arrange Shipping'}
              </h4>

              {deliveryMethod === 'collection' ? (
                <div className="space-y-4">
                  {/* Collection Details */}
                  <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                    <h5 className="font-semibold text-purple-900 mb-3">Facility Details</h5>
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <FaMapMarkerAlt className="text-purple-600 mt-1 flex-shrink-0" />
                        <div>
                          <p className="text-sm font-medium text-purple-900">Kestrel Security Vault</p>
                          <p className="text-sm text-purple-700">123 Security Lane, Premium District</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <FaCalendar className="text-purple-600 mt-1 flex-shrink-0" />
                        <div>
                          <p className="text-sm font-medium text-purple-900">Operating Hours</p>
                          <p className="text-sm text-purple-700">Monday - Friday: 9:00 AM - 5:00 PM</p>
                          <p className="text-sm text-purple-700">Saturday: 10:00 AM - 2:00 PM</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <FaPhone className="text-purple-600 mt-1 flex-shrink-0" />
                        <div>
                          <p className="text-sm font-medium text-purple-900">Contact</p>
                          <p className="text-sm text-purple-700">+1 (555) 123-4567</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <p className="text-sm text-blue-900">
                      <strong>Note:</strong> Please call ahead at least 24 hours in advance to schedule your collection appointment. Valid ID will be required at pickup.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Shipping Details Form */}
                  <div className="bg-blue-50 rounded-lg p-4 border border-blue-200 space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Shipping Address
                      </label>
                      <textarea
                        placeholder="Enter your complete shipping address"
                        className="w-full px-4 py-2 bg-gray-800 border border-gray-600 text-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-kestrel-gold"
                        rows="4"
                        defaultValue=""
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Phone Number
                        </label>
                        <input
                          type="tel"
                          placeholder="+1 (555) 000-0000"
                          className="w-full px-4 py-2 bg-gray-800 border border-gray-600 text-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-kestrel-gold"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Preferred Delivery Date
                        </label>
                        <input
                          type="date"
                          className="w-full px-4 py-2 bg-gray-800 border border-gray-600 text-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-kestrel-gold"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <p className="text-sm text-green-900">
                      <strong>Shipping Insurance:</strong> Full insurance coverage included in the shipping fee. Your asset will be tracked throughout transit.
                    </p>
                  </div>
                </div>
              )}

              {/* Asset Summary */}
              <div className="mt-6 bg-gray-50 rounded-lg p-4 border border-gray-200">
                <h5 className="font-semibold text-gray-900 mb-2">Asset Summary</h5>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Asset Name</p>
                    <p className="font-semibold text-gray-900">{asset?.name}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Quantity</p>
                    <p className="font-semibold text-gray-900">{asset?.quantity}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Assessed Value</p>
                    <p className="font-bold text-kestrel-gold">
                      ${asset?.assessedValue?.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">Consignment #</p>
                    <p className="font-semibold text-gray-900">{asset?.consignmentNumber}</p>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4 border-t border-gray-200">
          {step === 2 && (
            <button
              onClick={handleBack}
              className="flex-1 btn-secondary text-sm py-2.5"
            >
              Back
            </button>
          )}
          {step === 1 ? (
            <button
              onClick={onClose}
              className="flex-1 btn-secondary text-sm py-2.5"
            >
              Cancel
            </button>
          ) : (
            <>
              {hasZeroFees ? (
                <button
                  onClick={() => {
                    handleConfirm();
                    // Navigate to tracking after confirming delivery method
                    setTimeout(() => {
                      window.location.href = '/client/tracking';
                    }, 300);
                  }}
                  className="flex-1 btn-primary text-sm py-2.5 flex items-center justify-center gap-2"
                >
                  <FaArrowRight />
                  Go to Tracking
                </button>
              ) : (
                <button
                  onClick={handleConfirm}
                  className="flex-1 btn-primary text-sm py-2.5"
                >
                  Confirm {deliveryMethod === 'collection' ? 'Collection' : 'Shipping'}
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default CollectionShippingModal;
