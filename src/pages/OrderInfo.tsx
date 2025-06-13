import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

interface OrderStep {
    id: number;
    step: string;
    timestamp: string;
    sequence: number;
}

interface OrderTrackingProps {
    orderId: string;
}

const OrderTrackingPage: React.FC<OrderTrackingProps> = ({ orderId }) => {
    const [steps, setSteps] = useState<OrderStep[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrderStatus = async () => {
            setLoading(true);
            const { data, error } = await supabase
                .from('order_status')
                .select('*')
                .eq('order_id', orderId)
                .order('sequence', { ascending: true });

            if (error) {
                console.error('Error fetching order status:', error.message);
            } else {
                setSteps(data as OrderStep[]);
            }
            setLoading(false);
        };

        fetchOrderStatus();
    }, [orderId]);

    return (
        <div className="max-w-2xl mx-auto p-4">
            <h1 className="text-2xl font-bold mb-6">Order Tracking</h1>
            {loading ? (
                <p className="text-gray-500">Loading order steps...</p>
            ) : (
                <ol className="relative border-l border-gray-300">
                    {steps.map((step, idx) => (
                        <li key={step.id} className="mb-6 ml-4">
                            <div className="absolute w-3 h-3 bg-blue-600 rounded-full -left-1.5 border border-white"></div>
                            <time className="text-sm text-gray-500">
                                {new Date(step.timestamp).toLocaleString()}
                            </time>
                            <h3 className="text-lg font-semibold text-gray-900">{step.step}</h3>
                        </li>
                    ))}
                </ol>
            )}
        </div>
    );
};

export default OrderTrackingPage;
