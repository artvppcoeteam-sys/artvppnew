import { useState, useEffect } from 'react';
import { Star, ThumbsUp, Trash2, Loader2 } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { toast } from 'sonner';
import { getMyReviews, deleteReview } from '../../utils/api';

interface Review {
    _id: string;
    product: {
        _id: string;
        title: string;
        images: { url: string }[];
    };
    rating: number;
    title: string;
    comment: string;
    createdAt: string;
    helpful: number;
}

export function MyReviews() {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchReviews();
    }, []);

    const fetchReviews = async () => {
        try {
            setIsLoading(true);
            const response = await getMyReviews();
            if (response.success) {
                setReviews(response.data?.reviews || []);
            }
        } catch (error: any) {
            setReviews([]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        try {
            await deleteReview(id);
            setReviews(reviews.filter(r => r._id !== id));
            toast.success('Review deleted successfully');
        } catch (error: any) {
            toast.error(error.message || 'Failed to delete review');
        }
    };

    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
            </div>
        );
    }

    if (reviews.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-center text-gray-500">
                <Star className="w-12 h-12 mb-4 text-gray-300" />
                <h3 className="text-lg font-medium text-gray-900">No Reviews Yet</h3>
                <p>You haven't written any reviews yet.</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <h2 className="text-xl font-semibold">My Reviews & Ratings ({reviews.length})</h2>
            <div className="space-y-4">
                {reviews.map((review) => (
                    <Card key={review._id} className="overflow-hidden">
                        <CardContent className="p-6">
                            <div className="flex gap-4 items-start">
                                <img
                                    src={review.product?.images?.[0]?.url || '/placeholder.png'}
                                    alt={review.product?.title}
                                    className="w-20 h-20 object-cover rounded-md bg-gray-100"
                                />
                                <div className="flex-1 space-y-2">
                                    <div className="flex justify-between">
                                        <div>
                                            <h3 className="font-semibold text-gray-900">{review.product?.title}</h3>
                                            <div className="flex items-center gap-2 mt-1">
                                                <div className="flex bg-green-600 text-white px-1.5 py-0.5 rounded text-xs items-center gap-0.5 font-bold">
                                                    {review.rating} <Star className="w-3 h-3 fill-white" />
                                                </div>
                                                {review.title && <span className="text-xs font-semibold">{review.title}</span>}
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-end gap-2">
                                            <span className="text-xs text-gray-500">{formatDate(review.createdAt)}</span>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="text-gray-400 hover:text-red-600 h-8"
                                                onClick={() => handleDelete(review._id)}
                                            >
                                                <Trash2 className="w-4 h-4 mr-2" /> Delete
                                            </Button>
                                        </div>
                                    </div>
                                    <p className="text-sm text-gray-600 leading-relaxed">{review.comment}</p>
                                    {review.helpful > 0 && (
                                        <div className="flex items-center gap-1 text-xs text-gray-500 pt-2">
                                            <ThumbsUp className="w-3 h-3" />
                                            <span>{review.helpful} found this helpful</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
