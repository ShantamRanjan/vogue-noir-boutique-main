import React from 'react';
import { CheckCircle, Clock } from 'lucide-react';

type OrderStep = {
    label: string;
    completed: boolean;
};

const steps: OrderStep[] = [
    { label: 'Order Placed', completed: true },
    { label: 'Order Confirmed', completed: true },
    { label: 'Order Dispatched', completed: true },
    { label: 'Out for Delivery', completed: false },
    { label: 'Delivered', completed: false },
];

const OrderInfo: React.FC = () => {
    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4 py-12">
            <div className="max-w-3xl w-full bg-white shadow-lg rounded-xl p-6">
                <h2 className="text-2xl font-bold mb-6 text-center">Track Your Order</h2>

                <div className="flex flex-col space-y-6">
                    {steps.map((step, index) => (
                        <div key={index} className="flex items-center space-x-4">
                            {step.completed ? (
                                <CheckCircle className="text-green-500 w-6 h-6" />
                            ) : (
                                <Clock className="text-gray-400 w-6 h-6" />
                            )}

                            <div className="flex flex-col">
                                <span className={`font-medium ${step.completed ? 'text-green-600' : 'text-gray-600'}`}>
                                    {step.label}
                                </span>
                                <span className="text-sm text-gray-400">
                                    {step.completed ? 'Completed' : 'Pending'}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-8 text-center">
                    <button className="px-4 py-2 bg-black text-white rounded hover:bg-gray-800">
                        View Order Details
                    </button>
                </div>
            </div>
        </div>
    );
};

export default OrderInfo;
