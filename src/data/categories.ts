import { Category } from '../types';

export const INITIAL_CATEGORIES: Category[] = [
  {
    id: 'medicines',
    name: 'Medicines',
    slug: 'medicines',
    type: 'medical',
    iconName: 'Pill',
    description: 'Essential prescription and OTC pharmaceuticals, tablets, syrups & remedies.',
    subcategories: [
      'Fever & Pain Relief',
      'Cold & Cough',
      'Digestive Care',
      'Allergy',
      'Vitamins & Supplements',
      'General Medicines',
      'Children\'s Medicines',
      'Other Medicines'
    ],
    bannerImage: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=1200&auto=format&fit=crop&q=80'
  },
  {
    id: 'medical-supplies',
    name: 'Medical Supplies',
    slug: 'medical-supplies',
    type: 'medical',
    iconName: 'ShieldAlert',
    description: 'First aid kits, thermometers, BP monitors, surgical gauze & home care essentials.',
    subcategories: [
      'Bandages',
      'Wound Care',
      'First Aid',
      'Surgical Supplies',
      'Personal Medical Equipment',
      'Other Medical Supplies'
    ],
    bannerImage: 'https://images.unsplash.com/photo-1603398938378-e54eab446dde?w=1200&auto=format&fit=crop&q=80'
  },
  {
    id: 'skin-care',
    name: 'Skin Care / Face',
    slug: 'skin-care',
    type: 'cosmetic',
    iconName: 'Sparkles',
    description: 'Dermatologist-tested face washes, sunscreens, moisturizers, serums & acne care.',
    subcategories: [
      'Face Wash',
      'Moisturizers',
      'Acne Care',
      'Sunscreen',
      'Face Treatments',
      'Cleansers',
      'Creams & Lotions'
    ],
    bannerImage: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=1200&auto=format&fit=crop&q=80'
  },
  {
    id: 'body-care',
    name: 'Body Care',
    slug: 'body-care',
    type: 'cosmetic',
    iconName: 'HeartPulse',
    description: 'Nourishing body lotions, therapeutic body washes, deodorants & luxury soaps.',
    subcategories: [
      'Body Wash',
      'Body Lotion',
      'Soaps',
      'Deodorants',
      'Body Treatments'
    ],
    bannerImage: 'https://images.unsplash.com/photo-1571875257727-256c39da42af?w=1200&auto=format&fit=crop&q=80'
  },
  {
    id: 'hair-care',
    name: 'Hair Care',
    slug: 'hair-care',
    type: 'cosmetic',
    iconName: 'Scissors',
    description: 'Anti-dandruff solutions, Ayurvedic hair oils, nourishing shampoos & conditioners.',
    subcategories: [
      'Shampoo',
      'Conditioner',
      'Hair Oil',
      'Hair Treatment',
      'Hair Styling'
    ],
    bannerImage: 'https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?w=1200&auto=format&fit=crop&q=80'
  },
  {
    id: 'cosmetics',
    name: 'Cosmetics & Beauty',
    slug: 'cosmetics',
    type: 'cosmetic',
    iconName: 'Palette',
    description: 'Lipsticks, kajal, compacts, nail colors and premium Indian beauty products.',
    subcategories: [
      'Makeup',
      'Lip Care',
      'Lip Products',
      'Eye Care',
      'Beauty Products',
      'Other Cosmetics'
    ],
    bannerImage: 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=1200&auto=format&fit=crop&q=80'
  },
  {
    id: 'baby-care',
    name: 'Baby Care',
    slug: 'baby-care',
    type: 'general',
    iconName: 'Baby',
    description: 'Gentle baby soaps, baby lotions, diapers, wipes and pediatrician-recommended items.',
    subcategories: [
      'Baby Skin Care',
      'Baby Hygiene',
      'Baby Essentials'
    ],
    bannerImage: 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=1200&auto=format&fit=crop&q=80'
  },
  {
    id: 'personal-care',
    name: 'Personal Care & Hygiene',
    slug: 'personal-care',
    type: 'general',
    iconName: 'Smile',
    description: 'Oral health, feminine hygiene, men\'s grooming and daily sanitization needs.',
    subcategories: [
      'Oral Care',
      'Feminine Hygiene',
      'Men\'s Grooming',
      'Hygiene Products'
    ],
    bannerImage: 'https://images.unsplash.com/photo-1583947215259-38e31be8751f?w=1200&auto=format&fit=crop&q=80'
  }
];
