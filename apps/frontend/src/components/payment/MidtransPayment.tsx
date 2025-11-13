'use client';

interface MidtransPaymentData {
  payment_url?: string;
  token?: string;
  redirect_url?: string;
  status_code?: string;
  transaction_id?: string;
}

interface MidtransPaymentProps {
  onInitialize: () => Promise<void>;
  isLoading: boolean;
  isInitialized: boolean;
  paymentData: MidtransPaymentData | null;
}

export default function MidtransPayment({
  onInitialize,
  isLoading,
  isInitialized,
  paymentData
}: MidtransPaymentProps) {
  const handlePayment = async () => {
    await onInitialize();
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Secure Payment Gateway</h3>
        
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-white rounded-lg shadow-sm flex items-center justify-center">
              <span className="text-lg font-bold text-gray-700">MT</span>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900">Midtrans Payment</h4>
              <p className="text-sm text-gray-600">Secure payment processing</p>
            </div>
          </div>

          {!isInitialized ? (
            <div className="space-y-4">
              <p className="text-gray-700">
                You will be redirected to Midtrans secure payment page to complete your payment.
                Multiple payment methods are available.
              </p>
              
              <button
                onClick={handlePayment}
                disabled={isLoading}
                className="w-full bg-orange-500 text-white py-3 px-4 rounded-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Initializing Payment...
                  </>
                ) : (
                  'Proceed to Payment Gateway'
                )}
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center gap-2 text-green-700">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="font-medium">Payment initialized successfully!</span>
                </div>
              </div>
              
              <p className="text-gray-700">
                If you are not redirected automatically,{' '}
                <a 
                  href={paymentData?.payment_url} 
                  className="text-blue-600 hover:text-blue-700 underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  click here to go to payment page
                </a>
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Security Features */}
      <div className="border-t pt-6">
        <h4 className="font-semibold text-gray-900 mb-3">Security Features:</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            PCI DSS Compliant
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            SSL Encryption
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            Fraud Detection
          </div>
        </div>
      </div>
    </div>
  );
}