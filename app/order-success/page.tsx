"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { CheckCircle, Package } from "lucide-react";

function OrderSuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      <Navbar />

      <main className="container-custom py-20">
        <div className="max-w-2xl mx-auto text-center space-y-6">
          <div className="flex justify-center">
            <div className="bg-green-100 dark:bg-green-900/20 rounded-full p-6">
              <CheckCircle className="h-20 w-20 text-green-600 dark:text-green-400" />
            </div>
          </div>

          <h1 className="text-4xl font-bold text-foreground">
            Order Placed Successfully!
          </h1>

          <p className="text-lg text-muted-foreground">
            Thank you for your purchase. Your order has been confirmed and will be shipped soon.
          </p>

          {orderId && (
            <div className="bg-gray-50 dark:bg-slate-900 border rounded-lg p-6">
              <p className="text-sm text-muted-foreground mb-2">Order ID</p>
              <p className="text-2xl font-mono font-bold text-primary">{orderId}</p>
            </div>
          )}

          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
            <div className="flex items-start gap-3">
              <Package className="h-6 w-6 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
              <div className="text-left">
                <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-1">
                  What&apos;s Next?
                </h3>
                <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                  <li>• Order confirmation email sent to your registered email</li>
                  <li>• Your artwork will be carefully packed and shipped</li>
                  <li>• Expected delivery: 7-10 business days</li>
                  <li>• Track your order in the Order History section</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
            <Link href="/profile?tab=orders">
              <Button variant="outline" className="w-full sm:w-auto">
                View Order History
              </Button>
            </Link>
            <Link href="/products">
              <Button className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-white">
                Continue Shopping
              </Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function OrderSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white dark:bg-slate-950">
        <Navbar />
        <main className="container-custom py-20">
          <div className="max-w-2xl mx-auto text-center">
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </main>
      </div>
    }>
      <OrderSuccessContent />
    </Suspense>
  );
}

