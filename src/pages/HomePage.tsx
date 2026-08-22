import React from 'react';
import { HeroBanner } from '../components/home/HeroBanner';
import { QuickCategoryGrid } from '../components/home/QuickCategoryGrid';
import { DeliveryRadiusBanner } from '../components/home/DeliveryRadiusBanner';
import { FeaturedSection } from '../components/home/FeaturedSection';

export const HomePage: React.FC = () => {
  return (
    <div className="space-y-0">
      <HeroBanner />
      <QuickCategoryGrid />
      <DeliveryRadiusBanner />
      <FeaturedSection />
    </div>
  );
};
