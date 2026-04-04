import React from 'react';
import { Card } from './ui/card';
import { LucideIcon } from 'lucide-react';

export interface Category {
  id: string;
  name: string;
  description: string;
  icon: LucideIcon;
  image?: string;
  itemCount?: number;
}

interface CategoryCardProps {
  category: Category;
  onClick?: (category: Category) => void;
}

export function CategoryCard({ category, onClick }: CategoryCardProps) {
  const Icon = category.icon;

  return (
    <Card
      className="group overflow-hidden transition-all hover:shadow-lg cursor-pointer border-2 hover:border-primary"
      onClick={() => onClick?.(category)}
    >
      {category.image ? (
        <div className="relative h-48 overflow-hidden bg-muted">
          <img
            src={category.image}
            alt={category.name}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
            <div className="flex items-center gap-3 mb-2">
              <div className="h-10 w-10 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="text-white">{category.name}</h3>
            </div>
            <p className="text-sm text-white/90">{category.description}</p>
            {category.itemCount !== undefined && (
              <p className="text-xs text-white/70 mt-2">{category.itemCount} items</p>
            )}
          </div>
        </div>
      ) : (
        <div className="p-6">
          <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
            <Icon className="h-6 w-6 text-primary" />
          </div>
          <h3 className="mb-2">{category.name}</h3>
          <p className="text-sm text-muted-foreground">{category.description}</p>
          {category.itemCount !== undefined && (
            <p className="text-xs text-muted-foreground mt-3">{category.itemCount} items</p>
          )}
        </div>
      )}
    </Card>
  );
}
