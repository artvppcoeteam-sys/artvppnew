import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Separator } from '../ui/separator';
import { Package, MapPin, CreditCard, User, Phone, Mail, Truck } from 'lucide-react';

interface OrderDetailsModalProps {
  open: boolean;
  onClose: () => void;
  order: any;
}

export function OrderDetailsModal({ open, onClose, order }: OrderDetailsModalProps) {
  if (!order) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'shipped': return 'bg-purple-100 text-purple-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Order Details</DialogTitle>
          <DialogDescription>Order ID: {order.id}</DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Status */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Status</p>
              <Badge className={`${getStatusColor(order.status)} mt-1`}>
                {order.status}
              </Badge>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Order Date</p>
              <p className="font-medium">{order.date}</p>
            </div>
          </div>

          <Separator />

          {/* Product Details */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Package className="w-5 h-5 text-[#a73f2b]" />
              <h3 className="font-semibold">Product Information</h3>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <p className="font-medium">{order.product}</p>
              {order.vendor && (
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Vendor:</span> {order.vendor}
                </p>
              )}
              <p className="text-lg font-semibold text-[#a73f2b]">
                ₹{order.amount?.toLocaleString()}
              </p>
            </div>
          </div>

          {/* Customer Details */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <User className="w-5 h-5 text-[#a73f2b]" />
              <h3 className="font-semibold">Customer Information</h3>
            </div>
            <div className="space-y-2">
              <p className="font-medium">{order.customer}</p>
              {order.customerEmail && (
                <p className="text-sm text-gray-600 flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  {order.customerEmail}
                </p>
              )}
              {order.customerPhone && (
                <p className="text-sm text-gray-600 flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  {order.customerPhone}
                </p>
              )}
            </div>
          </div>

          {/* Shipping Address */}
          {order.shippingAddress && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <MapPin className="w-5 h-5 text-[#a73f2b]" />
                <h3 className="font-semibold">Shipping Address</h3>
              </div>
              <p className="text-sm text-gray-700 bg-gray-50 rounded-lg p-4">
                {order.shippingAddress}
              </p>
            </div>
          )}

          {/* Payment Method */}
          {order.paymentMethod && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <CreditCard className="w-5 h-5 text-[#a73f2b]" />
                <h3 className="font-semibold">Payment Method</h3>
              </div>
              <p className="text-sm text-gray-700">{order.paymentMethod}</p>
            </div>
          )}

          {/* Tracking Information */}
          {order.trackingNumber && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Truck className="w-5 h-5 text-[#a73f2b]" />
                <h3 className="font-semibold">Tracking Information</h3>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm font-medium text-blue-900">
                  Tracking Number: {order.trackingNumber}
                </p>
              </div>
            </div>
          )}

          {/* Platform Commission (Admin view) */}
          {order.commission !== undefined && (
            <div>
              <Separator className="mb-4" />
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Platform Commission (10%)</span>
                <span className="font-medium">₹{order.commission?.toLocaleString()}</span>
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-2">
          {order.status === 'pending' && (
            <Button className="flex-1 bg-gradient-to-r from-[#a73f2b] to-[#b30452] hover:bg-gradient-to-r from-[#a73f2b] to-[#b30452] text-white">
              Mark as Processing
            </Button>
          )}
          {order.status === 'processing' && (
            <Button className="flex-1 bg-gradient-to-r from-[#a73f2b] to-[#b30452] hover:bg-gradient-to-r from-[#a73f2b] to-[#b30452] text-white">
              Mark as Shipped
            </Button>
          )}
          <Button variant="outline" onClick={onClose} className="flex-1">
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
