"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import ProductCard from "@/components/ProductCard";
import { Filter } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Product {
  id: string;
  title: string;
  description: string;
  preview_url: string;
  price: number;
  category: string;
  created_at: string;
}

function ProductsPageContent() {
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("newest");

  const categories = ["all", "painting", "drawing", "sketch", "digital"];

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    // Apply filters
    let filtered = [...products];

    // Category filter
    const categoryParam = searchParams.get("category");
    const activeCategory = categoryParam || selectedCategory;
    if (activeCategory !== "all") {
      filtered = filtered.filter((p) =>
        p.category.toLowerCase() === activeCategory.toLowerCase()
      );
    }

    // Search filter
    const searchQuery = searchParams.get("search");
    if (searchQuery) {
      filtered = filtered.filter((p) =>
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Sort
    switch (sortBy) {
      case "price-low":
        filtered.sort((a, b) => a.price - b.price);
        break;
      case "price-high":
        filtered.sort((a, b) => b.price - a.price);
        break;
      case "oldest":
        filtered.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
        break;
      default: // newest
        filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }

    setFilteredProducts(filtered);
  }, [products, selectedCategory, sortBy, searchParams]);

  const fetchProducts = async () => {
    try {
      const response = await fetch("/api/products?type=all", {
        cache: "no-store",
      });

      const result = await response.json();
      if (result.success) {
        setProducts(result.data.products || []);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-950">
        <Navbar />
        <div className="container-custom py-20 text-center">
          <p className="text-muted-foreground">Loading products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      <Navbar />

      <main className="container-custom py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">
            Original Artwork Collection
          </h1>
          <p className="text-muted-foreground">
            Explore unique {filteredProducts.length} artworks from talented artists
          </p>
        </div>

        {/* Filters */}
        <div className="mb-8 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          {/* Category Filter */}
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                onClick={() => setSelectedCategory(category)}
                className={
                  selectedCategory === category
                    ? "bg-primary text-white hover:bg-primary/90"
                    : ""
                }
              >
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </Button>
            ))}
          </div>

          {/* Sort */}
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary bg-white dark:bg-slate-800"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
            </select>
          </div>
        </div>

        {/* Products Grid */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-muted-foreground text-lg">
              No products found matching your criteria.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
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
      </main>

      {/* Footer */}
      <footer className="border-t bg-gray-50 dark:bg-slate-900 mt-20">
        <div className="container-custom py-12">
          <div className="text-center text-sm text-muted-foreground">
            <p>© 2024 ArtVPP. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white dark:bg-slate-950">
        <Navbar />
        <div className="container-custom py-20 text-center">
          <p className="text-muted-foreground">Loading products...</p>
        </div>
      </div>
    }>
      <ProductsPageContent />
    </Suspense>
  );
}

