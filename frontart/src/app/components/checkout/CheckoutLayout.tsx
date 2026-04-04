import { Check } from 'lucide-react';

interface CheckoutLayoutProps {
    currentStep: 'address' | 'summary' | 'payment';
    children: React.ReactNode;
}

export function CheckoutLayout({ currentStep, children }: CheckoutLayoutProps) {
    const steps = [
        { id: 'address', label: 'Address', number: 1 },
        { id: 'summary', label: 'Order Summary', number: 2 },
        { id: 'payment', label: 'Payment', number: 3 },
    ];

    const getStepStatus = (stepId: string) => {
        const stepOrder = ['address', 'summary', 'payment'];
        const currentIndex = stepOrder.indexOf(currentStep);
        const stepIndex = stepOrder.indexOf(stepId);

        if (stepIndex < currentIndex) return 'completed';
        if (stepIndex === currentIndex) return 'current';
        return 'upcoming';
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-12">
            <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 pt-8">
                <h1 className="text-3xl md:text-4xl font-serif mb-8 text-center">Checkout</h1>

                {/* Stepper */}
                <div className="max-w-3xl mx-auto mb-12">
                    <div className="flex items-center justify-between relative">
                        {/* Connection Lines */}
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-gray-200 -z-10"></div>
                        <div
                            className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-gradient-to-r from-[#a73f2b] to-[#b30452] hover:brightness-110 hover:shadow-[0px_6px_20px_rgba(179,4,82,0.35)] transition-all duration-500 -z-10"
                            style={{
                                width: currentStep === 'address' ? '0%' :
                                    currentStep === 'summary' ? '50%' : '100%'
                            }}
                        ></div>

                        {steps.map((step) => {
                            const status = getStepStatus(step.id);

                            return (
                                <div key={step.id} className="flex flex-col items-center bg-gray-50 px-2 sm:px-4">
                                    <div
                                        className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 z-10 
                      ${status === 'completed' ? 'bg-gradient-to-r from-[#a73f2b] to-[#b30452] hover:brightness-110 hover:shadow-[0px_6px_20px_rgba(179,4,82,0.35)] border-[#a73f2b] text-white' :
                                                status === 'current' ? 'bg-white border-[#a73f2b] text-[#a73f2b] shadow-[0_0_15px_rgba(212,175,55,0.4)]' :
                                                    'bg-white border-gray-300 text-gray-400'}`}
                                    >
                                        {status === 'completed' ? (
                                            <Check className="w-6 h-6" />
                                        ) : (
                                            <span className="font-semibold">{step.number}</span>
                                        )}
                                    </div>
                                    <span
                                        className={`mt-2 text-xs sm:text-sm font-medium transition-colors duration-300
                      ${status === 'current' ? 'text-[#a73f2b]' :
                                                status === 'completed' ? 'text-gray-800' : 'text-gray-400'}`}
                                    >
                                        {step.label}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Content */}
                <div className="max-w-4xl mx-auto">
                    {children}
                </div>
            </div>
        </div>
    );
}
