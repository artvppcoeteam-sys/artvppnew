"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import Script from "next/script";
import Navbar from "@/components/Navbar";
import ProductCard from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/utils/supabase/client";
import { useToast } from "@/lib/toast-context";
import { MapPin, Package, FileText, TrendingUp, Heart } from "lucide-react";

function ProfilePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { showToast } = useToast();
  const [user, setUser] = useState<{ id: string; email?: string } | null>(null);
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);
  const [profile, setProfile] = useState<{
    full_name?: string;
    shipping_full_name?: string;
    shipping_address?: string;
    shipping_city?: string;
    shipping_state?: string;
    shipping_postal_code?: string;
    shipping_phone?: string;
    role?: string;
  } | null>(null);
  const [activeTab, setActiveTab] = useState(searchParams.get("tab") || "shipping");
  const [loading, setLoading] = useState(false);
  const [likedProducts, setLikedProducts] = useState<Array<{
    id: string;
    title: string;
    price: number;
    preview_url: string;
    category: string;
  }>>([]);
  const [orders, setOrders] = useState<Array<{
    id: string;
    product_id: string;
    quantity: number;
    total_price: number;
    payment_status: string;
    order_status?: string;
    created_at: string;
    products?: {
      id: string;
      title: string;
      preview_url: string;
    };
  }>>([]);
  const [customerCommissions, setCustomerCommissions] = useState<Array<{
    id: string;
    vendor_id: string;
    product_id: string;
    description: string;
    budget: number;
    quantity: number;
    status: string;
    vendor_response: string | null;
    quoted_price: number | null;
    created_at: string;
    products: {
      id: string;
      title: string;
      price: number;
      preview_url: string;
    } | null;
    vendor: {
      id: string;
      full_name: string | null;
      email: string;
    };
  }>>([]);
  const [shippingForm, setShippingForm] = useState({
    shipping_full_name: "",
    shipping_address: "",
    shipping_city: "",
    shipping_state: "",
    shipping_postal_code: "",
    shipping_phone: "",
  });

  const supabase = createClient();

  const fetchProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      setUser(user);

      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (profile) {
        setProfile(profile);
        setShippingForm({
          shipping_full_name: profile.shipping_full_name || "",
          shipping_address: profile.shipping_address || "",
          shipping_city: profile.shipping_city || "",
          shipping_state: profile.shipping_state || "",
          shipping_postal_code: profile.shipping_postal_code || "",
          shipping_phone: profile.shipping_phone || "",
        });
      }

      // Fetch liked products
      await fetchLikedProducts(user.id);

      // Fetch orders
      await fetchOrders(user.id);
    } catch (error) {
      console.error("Error fetching profile:", error);
    }
  };

  const fetchOrders = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("orders")
        .select(`
          id,
          product_id,
          quantity,
          total_price,
          payment_status,
          order_status,
          created_at,
          products:product_id (
            id,
            title,
            preview_url
          )
        `)
        .eq("user_id", userId)
        .order("created_at", { ascending: false });


      setOrders(data as any || []);
    } catch (error) {
      console.error("Error fetching orders:", error);
    }
  };

  const fetchLikedProducts = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("product_likes")
        .select(`
          product_id,
          products (
            id,
            title,
            price,
            preview_url,
            category
          )
        `)
        .eq("user_id", userId);

      if (error) {
        console.warn("Likes feature requires database setup");
        return;
      }

      const products = (data || [])
        .map((like: any) => Array.isArray(like.products) ? like.products[0] : like.products)
        .filter(Boolean);

      setLikedProducts(products);
    } catch (error) {
      console.error("Error fetching liked products:", error);
    }
  };

  const fetchCustomerCommissions = async () => {
    try {
      const response = await fetch("/api/commissions/customer");
      const result = await response.json();

      if (result.success) {
        setCustomerCommissions(result.data.commissions || []);
      }
    } catch (error) {
      console.error("Error fetching customer commissions:", error);
    }
  };

  const handleCommissionPayment = async (commission: typeof customerCommissions[0]) => {
    try {
      // Check if Razorpay is loaded
      if (!razorpayLoaded || typeof window === 'undefined' || !(window as any).Razorpay) {
        showToast("Payment system is loading, please try again in a moment", "warning");
        return;
      }

      // Create Razorpay order
      const response = await fetch("/api/commissions/create-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ commissionId: commission.id }),
      });

      const result = await response.json();

      if (!result.success) {
        showToast(result.error || "Failed to create payment", "error");
        return;
      }

      // Initialize Razorpay
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: result.data.amount,
        currency: result.data.currency,
        name: "ArtVPP",
        description: `Commission: ${result.data.commission.product_title}`,
        order_id: result.data.orderId,
        handler: async function (response: any) {
          // Verify payment
          const verifyResponse = await fetch("/api/commissions/verify-payment", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              commissionId: commission.id,
            }),
          });

          const verifyResult = await verifyResponse.json();

          if (verifyResult.success) {
            showToast("Payment successful! Artist will start working on your commission.", "success");
            await fetchCustomerCommissions(); // Refresh commissions
          } else {
            showToast("Payment verification failed", "error");
          }
        },
        prefill: {
          email: user?.email,
        },
        theme: {
          color: "#EF4444",
        },
      };

      const razorpay = new (window as any).Razorpay(options);
      razorpay.open();
    } catch (error) {
      console.error("Error processing payment:", error);
      showToast("Failed to process payment", "error");
    }
  };

  useEffect(() => {
    fetchProfile();
    fetchCustomerCommissions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleShippingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase
        .from("profiles")
        .update(shippingForm)
        .eq("id", user!.id);

      if (error) throw error;

      showToast("Shipping address saved successfully!", "success");
      fetchProfile();
    } catch (error) {
      console.error("Error saving shipping address:", error);
      showToast("Failed to save shipping address", "error");
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-950">
        <Navbar />
        <div className="container-custom py-20 text-center">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      {/* Load Razorpay Script */}
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        onLoad={() => setRazorpayLoaded(true)}
        onError={() => {
          console.error("Failed to load Razorpay script");
          showToast("Payment system failed to load", "error");
        }}
      />

      <Navbar />

      <main className="container-custom py-8">
        <h1 className="text-3xl font-bold text-foreground mb-8">My Account</h1>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-slate-900 border rounded-lg p-6 space-y-6">
              {/* Profile Info */}
              <div className="text-center space-y-3 pb-6 border-b">
                <div className="h-20 w-20 rounded-full bg-primary text-white flex items-center justify-center text-2xl font-bold mx-auto">
                  {profile?.full_name?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase()}
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">{profile?.full_name || "User"}</h3>
                  <p className="text-sm text-muted-foreground">{user?.email}</p>
                </div>
              </div>

              {/* Navigation */}
              <nav className="space-y-2">
                <button
                  onClick={() => setActiveTab("shipping")}
                  className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
                    activeTab === "shipping"
                      ? "bg-primary text-white"
                      : "text-foreground hover:bg-gray-100 dark:hover:bg-slate-800"
                  }`}
                >
                  <MapPin className="h-5 w-5" />
                  <span>Shipping Address</span>
                </button>

                <button
                  onClick={() => setActiveTab("orders")}
                  className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
                    activeTab === "orders"
                      ? "bg-primary text-white"
                      : "text-foreground hover:bg-gray-100 dark:hover:bg-slate-800"
                  }`}
                >
                  <Package className="h-5 w-5" />
                  <span>Order History</span>
                </button>

                <button
                  onClick={() => setActiveTab("invoices")}
                  className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
                    activeTab === "invoices"
                      ? "bg-primary text-white"
                      : "text-foreground hover:bg-gray-100 dark:hover:bg-slate-800"
                  }`}
                >
                  <FileText className="h-5 w-5" />
                  <span>Invoices</span>
                </button>

                <button
                  onClick={() => setActiveTab("liked")}
                  className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
                    activeTab === "liked"
                      ? "bg-primary text-white"
                      : "text-foreground hover:bg-gray-100 dark:hover:bg-slate-800"
                  }`}
                >
                  <Heart className="h-5 w-5" />
                  <span>Liked Products</span>
                </button>

                <button
                  onClick={() => setActiveTab("commissions")}
                  className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
                    activeTab === "commissions"
                      ? "bg-primary text-white"
                      : "text-foreground hover:bg-gray-100 dark:hover:bg-slate-800"
                  }`}
                >
                  <TrendingUp className="h-5 w-5" />
                  <span>Commission Requests</span>
                </button>
              </nav>
            </div>
          </div>

          {/* Content */}
          <div className="lg:col-span-3">
            <div className="bg-white dark:bg-slate-900 border rounded-lg p-6">
              {/* Shipping Address Tab */}
              {activeTab === "shipping" && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-foreground">Shipping Address</h2>
                  <form onSubmit={handleShippingSubmit} className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="shipping_full_name">Full Name *</Label>
                        <Input
                          id="shipping_full_name"
                          value={shippingForm.shipping_full_name}
                          onChange={(e) =>
                            setShippingForm({ ...shippingForm, shipping_full_name: e.target.value })
                          }
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="shipping_phone">Phone Number *</Label>
                        <Input
                          id="shipping_phone"
                          type="tel"
                          value={shippingForm.shipping_phone}
                          onChange={(e) =>
                            setShippingForm({ ...shippingForm, shipping_phone: e.target.value })
                          }
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="shipping_address">Address *</Label>
                      <Input
                        id="shipping_address"
                        value={shippingForm.shipping_address}
                        onChange={(e) =>
                          setShippingForm({ ...shippingForm, shipping_address: e.target.value })
                        }
                        placeholder="House no., Building name, Street"
                        required
                      />
                    </div>

                    <div className="grid md:grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="shipping_city">City *</Label>
                        <Input
                          id="shipping_city"
                          value={shippingForm.shipping_city}
                          onChange={(e) =>
                            setShippingForm({ ...shippingForm, shipping_city: e.target.value })
                          }
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="shipping_state">State *</Label>
                        <Input
                          id="shipping_state"
                          value={shippingForm.shipping_state}
                          onChange={(e) =>
                            setShippingForm({ ...shippingForm, shipping_state: e.target.value })
                          }
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="shipping_postal_code">Postal Code *</Label>
                        <Input
                          id="shipping_postal_code"
                          value={shippingForm.shipping_postal_code}
                          onChange={(e) =>
                            setShippingForm({ ...shippingForm, shipping_postal_code: e.target.value })
                          }
                          required
                        />
                      </div>
                    </div>

                    <Button
                      type="submit"
                      disabled={loading}
                      className="bg-primary hover:bg-primary/90 text-white"
                    >
                      {loading ? "Saving..." : "Save Shipping Address"}
                    </Button>
                  </form>
                </div>
              )}

              {/* Order History Tab */}
              {activeTab === "orders" && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-foreground">Order History</h2>
                  {orders.length === 0 ? (
                    <div className="text-center py-12">
                      <Package className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">No orders yet.</p>
                      <Link href="/products" className="link-primary inline-block mt-4">
                        Start Shopping →
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {orders.map((order) => (
                        <div key={order.id} className="bg-white dark:bg-slate-800 border rounded-lg p-6">
                          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 pb-4 border-b">
                            <div>
                              <p className="text-sm text-muted-foreground">Order ID</p>
                              <p className="font-mono font-semibold text-foreground text-sm">{order.id.slice(0, 8)}...</p>
                            </div>
                            <div className="mt-2 md:mt-0">
                              <p className="text-sm text-muted-foreground">Order Date</p>
                              <p className="font-semibold text-foreground">
                                {new Date(order.created_at).toLocaleDateString("en-US", {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                })}
                              </p>
                            </div>
                            <div className="mt-2 md:mt-0">
                              <p className="text-sm text-muted-foreground">Total</p>
                              <p className="text-xl font-bold text-primary">
                                ₹{order.total_price.toLocaleString()}
                              </p>
                            </div>
                          </div>

                          {/* Order Status Tracker */}
                          <div className="mb-4 pb-4 border-b">
                            <div className="flex items-center justify-between text-xs mb-2">
                              <span className="font-semibold text-foreground">Order Status</span>
                              <span className={`px-2 py-1 rounded-full font-semibold ${
                                order.order_status === "delivered"
                                  ? "bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400"
                                  : order.order_status === "shipped"
                                  ? "bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400"
                                  : order.order_status === "processing"
                                  ? "bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400"
                                  : "bg-gray-100 dark:bg-gray-900/20 text-gray-700 dark:text-gray-400"
                              }`}>
                                {order.order_status === "delivered" ? "✓ Delivered"
                                  : order.order_status === "shipped" ? "🚚 Shipped"
                                  : order.order_status === "processing" ? "📦 Processing"
                                  : "⏳ Pending"}
                              </span>
                            </div>

                            {/* Progress Bar */}
                            <div className="flex items-center gap-2">
                              <div className={`h-2 flex-1 rounded-full ${
                                (order.order_status === "processing" || order.order_status === "shipped" || order.order_status === "delivered")
                                  ? "bg-primary"
                                  : "bg-gray-200 dark:bg-gray-700"
                              }`} />
                              <div className={`h-2 flex-1 rounded-full ${
                                (order.order_status === "shipped" || order.order_status === "delivered")
                                  ? "bg-primary"
                                  : "bg-gray-200 dark:bg-gray-700"
                              }`} />
                              <div className={`h-2 flex-1 rounded-full ${
                                order.order_status === "delivered"
                                  ? "bg-primary"
                                  : "bg-gray-200 dark:bg-gray-700"
                              }`} />
                            </div>

                            <div className="flex justify-between text-xs text-muted-foreground mt-1">
                              <span>Processing</span>
                              <span>Shipped</span>
                              <span>Delivered</span>
                            </div>
                          </div>

                          <div className="space-y-3">
                            {order.products ? (
                              <div className="flex gap-3">
                                <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                                  <Image
                                    src={order.products.preview_url || "/placeholder.jpg"}
                                    alt={order.products.title || "Product"}
                                    fill
                                    className="object-cover"
                                  />
                                </div>
                                <div className="flex-1">
                                  <p className="font-semibold text-foreground">{order.products.title}</p>
                                  <p className="text-sm text-muted-foreground">Quantity: {order.quantity || 1}</p>
                                </div>
                              </div>
                            ) : (
                              <p className="text-sm text-muted-foreground">Product information not available</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Invoices Tab */}
              {activeTab === "invoices" && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-foreground">Invoices</h2>
                  <p className="text-muted-foreground">Your invoices will appear here.</p>
                </div>
              )}

              {/* Liked Products Tab */}
              {activeTab === "liked" && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-foreground">Liked Products</h2>
                  {likedProducts.length === 0 ? (
                    <div className="text-center py-12">
                      <Heart className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">You haven&apos;t liked any products yet.</p>
                      <Link href="/products" className="link-primary inline-block mt-4">
                        Browse Products →
                      </Link>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      {likedProducts.map((product) => (
                        <ProductCard
                          key={product.id}
                          id={product.id}
                          title={product.title}
                          preview_url={product.preview_url}
                          price={product.price}
                          category={product.category}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Commissions Tab */}
              {activeTab === "commissions" && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-foreground">Commission Requests</h2>
                  <p className="text-sm text-muted-foreground">Track your custom artwork requests and bulk orders</p>
                  
                  {customerCommissions.length === 0 ? (
                    <div className="text-center py-12">
                      <TrendingUp className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">No commission requests yet.</p>
                      <p className="text-sm text-muted-foreground mt-2">
                        Request commissions for multiple copies or custom artwork from product pages.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {customerCommissions.map((commission) => (
                        <div key={commission.id} className="bg-white dark:bg-slate-800 border rounded-lg p-6 space-y-4">
                          <div className="flex flex-col md:flex-row gap-4">
                            {/* Product Image */}
                            {commission.products && (
                              <div className="relative w-32 h-32 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                                <Image
                                  src={commission.products.preview_url}
                                  alt={commission.products.title}
                                  fill
                                  className="object-cover"
                                />
                              </div>
                            )}

                            {/* Commission Details */}
                            <div className="flex-1 space-y-3">
                              <div className="flex items-start justify-between">
                                <div>
                                  <h3 className="text-lg font-bold text-foreground">
                                    {commission.products?.title || "Custom Commission"}
                                  </h3>
                                  <p className="text-sm text-muted-foreground">
                                    Artist: {commission.vendor.full_name || commission.vendor.email}
                                  </p>
                                </div>
                                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                                  commission.status === "accepted"
                                    ? "bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400"
                                    : commission.status === "in_progress"
                                    ? "bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400"
                                    : commission.status === "rejected"
                                    ? "bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400"
                                    : commission.status === "completed"
                                    ? "bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400"
                                    : "bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400"
                                }`}>
                                  {commission.status === "accepted" ? "✓ Accepted - Awaiting Payment"
                                    : commission.status === "in_progress" ? "🎨 In Progress"
                                    : commission.status === "rejected" ? "✗ Rejected"
                                    : commission.status === "completed" ? "✓ Completed"
                                    : "⏳ Pending"}
                                </span>
                              </div>

                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                <div>
                                  <span className="text-muted-foreground">Quantity:</span>
                                  <p className="font-semibold text-foreground">{commission.quantity}</p>
                                </div>
                                <div>
                                  <span className="text-muted-foreground">Your Budget:</span>
                                  <p className="font-semibold text-foreground">₹{commission.budget.toLocaleString()}</p>
                                </div>
                                {commission.quoted_price && (
                                  <div>
                                    <span className="text-muted-foreground">Artist Quote:</span>
                                    <p className="font-semibold text-primary">₹{commission.quoted_price.toLocaleString()}</p>
                                  </div>
                                )}
                                <div>
                                  <span className="text-muted-foreground">Requested:</span>
                                  <p className="font-semibold text-foreground">
                                    {new Date(commission.created_at).toLocaleDateString()}
                                  </p>
                                </div>
                              </div>

                              {commission.description && (
                                <div className="bg-gray-50 dark:bg-slate-700 rounded-lg p-3">
                                  <p className="text-sm text-muted-foreground mb-1">Your Request:</p>
                                  <p className="text-sm text-foreground">{commission.description}</p>
                                </div>
                              )}

                              {commission.vendor_response && (
                                <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                                  <p className="text-sm text-blue-900 dark:text-blue-100 mb-1 font-semibold">
                                    Artist Response:
                                  </p>
                                  <p className="text-sm text-blue-800 dark:text-blue-200">
                                    {commission.vendor_response}
                                  </p>
                                </div>
                              )}

                              {/* Action Buttons */}
                              {commission.status === "accepted" && commission.quoted_price && (
                                <div className="flex gap-3 pt-2">
                                  <Button
                                    onClick={() => handleCommissionPayment(commission)}
                                    className="bg-primary hover:bg-primary/90 text-white"
                                  >
                                    Pay ₹{commission.quoted_price.toLocaleString()} & Accept Quote
                                  </Button>
                                  <Button
                                    variant="outline"
                                    onClick={() => {
                                      showToast("You can decline this commission by contacting the artist.", "info");
                                    }}
                                  >
                                    Decline
                                  </Button>
                                </div>
                              )}

                              {commission.status === "in_progress" && (
                                <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-3">
                                  <p className="text-sm text-purple-900 dark:text-purple-100">
                                    🎨 Artist is working on your commission. You'll be notified when it's completed!
                                  </p>
                                </div>
                              )}

                              {commission.status === "pending" && (
                                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
                                  <p className="text-sm text-yellow-900 dark:text-yellow-100">
                                    ⏳ Waiting for artist to review your request...
                                  </p>
                                </div>
                              )}

                              {commission.status === "rejected" && (
                                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                                  <p className="text-sm text-red-900 dark:text-red-100">
                                    The artist was unable to accept this commission at this time.
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white dark:bg-slate-950">
        <Navbar />
        <div className="container-custom py-20 text-center">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    }>
      <ProfilePageContent />
    </Suspense>
  );
}

