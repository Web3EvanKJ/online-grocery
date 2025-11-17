'use client';
interface PaymentStepperProps {
  currentStep: number; // 1 = Checkout, 2 = Payment, 3 = Confirmation
}

export default function PaymentStepper({ currentStep }: PaymentStepperProps) {
  const steps = ['Checkout', 'Payment', 'Confirmation'];

  return (
    <div className="flex items-center justify-between mb-8">
      {steps.map((step, index) => (
        <div key={index} className="flex-1 flex items-center">
          <div className="relative flex items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
              currentStep > index ? 'bg-blue-600 border-blue-600 text-white' :
              currentStep === index + 1 ? 'bg-white border-blue-600 text-blue-600' :
              'bg-white border-gray-300 text-gray-300'
            }`}>
              {index + 1}
            </div>
            {index < steps.length - 1 && (
              <div className={`flex-1 h-0.5 ${currentStep > index + 1 ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
            )}
          </div>
          <span className={`ml-2 text-sm font-medium ${currentStep > index ? 'text-blue-600' : 'text-gray-500'}`}>
            {step}
          </span>
        </div>
      ))}
    </div>
  );
}
