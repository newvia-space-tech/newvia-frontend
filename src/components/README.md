# Components

This directory contains all React components organized by their purpose and usage.

## Structure

```
src/components/
├── layout/           # Layout components (Header, Hero, etc.)
├── shared/           # Reusable components (SearchBar, etc.)
├── ui/              # UI components (buttons, inputs, etc.)
└── index.ts         # Barrel exports for easy importing
```

## Components

### Layout Components

#### Header
- **Location**: `src/components/layout/Header.tsx`
- **Purpose**: Main navigation header with logo and navigation links
- **Props**: `HeaderProps` (variant: 'Default Home' | 'Internal Page' | 'After Login')
- **Features**: Responsive design, mobile menu button

#### HeroSection
- **Location**: `src/components/layout/HeroSection.tsx`
- **Purpose**: Hero section with video background and search functionality
- **Features**: Video background, gradient overlays, responsive text

#### FirstBookingBanner
- **Location**: `src/components/layout/FirstBookingBanner.tsx`
- **Purpose**: First booking discount banner that shows based on user authentication and eligibility
- **Features**: Responsive design, conditional display based on API response, redirects to login for unauthenticated users

#### Slider
- **Location**: `src/components/layout/Slider.tsx`
- **Purpose**: Video slider component for backgrounds
- **Props**: `SliderProps` (variant: 'Default' | 'Variant2' | 'Variant3')

### Shared Components

#### SearchBar
- **Location**: `src/components/shared/SearchBar.tsx`
- **Purpose**: Search form with location input and trust indicators
- **Features**: Responsive design, form validation, TypeScript support
- **State**: Manages search query and location inputs

## Usage

```tsx
import { Header, HeroSection, SearchBar } from '@/components';

// Or import individually
import Header from '@/components/layout/Header';
import SearchBar from '@/components/shared/SearchBar';
```

## Styling

All components use Tailwind CSS v4 with:
- Responsive design (mobile-first approach)
- Custom color palette matching the design system
- Consistent spacing and typography
- Hover states and transitions

## TypeScript

All components are fully typed with interfaces defined in `src/types/index.ts`:
- `HeaderProps`
- `SliderProps`
- `SearchFormData`
- `WellnessService`
- `BookingData`
