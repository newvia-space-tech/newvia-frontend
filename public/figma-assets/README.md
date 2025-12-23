# Figma Assets

This directory contains all SVG assets exported from Figma with properly named files for better organization and maintainability.

## Naming Convention

- **Format**: `{component}-{type}.svg`
- **Examples**:
  - `instagram-logo.svg` - Instagram social media icon
  - `facebook-logo.svg` - Facebook social media icon
  - `linkedin-logo.svg` - LinkedIn social media icon
  - `x-logo.svg` - X (Twitter) social media icon

## Current Assets

### Icons
- `arrow-right.svg` - Right arrow icon (used in buttons, CTAs)
- `building-office.svg` - Building/office icon (company info)
- `map-pin.svg` - Location pin icon (address, location inputs)
- `magnifying-glass.svg` - Search icon (search inputs, buttons)
- `divider-line.svg` - Vertical divider line
- `shield-check.svg` - Security/trust icon
- `seal-check.svg` - Verification/approval icon
- `identification-card.svg` - ID card icon
- `button-icon.svg` - Generic button icon
- `search-icon.svg` - Alternative search icon

### Logos
- `header-logo.svg` - Main logo for header
- `logo.svg` - Footer logo

### Social Media
- `instagram-logo.svg` - Instagram social media icon
- `facebook-logo.svg` - Facebook social media icon
- `linkedin-logo.svg` - LinkedIn social media icon
- `x-logo.svg` - X (Twitter) social media icon

### Backgrounds
- `hero-background.svg` - Hero section background image

## Usage in Components

```tsx
// Import with descriptive path
const instagramIcon = '/figma-assets/instagram-logo.svg';

// Use in component
<Image
  src={instagramIcon}
  alt="Instagram"
  width={20}
  height={20}
  className="w-5 h-5"
/>
```

## Benefits

1. **Clear naming** - Easy to identify what each asset is
2. **Organized structure** - All Figma assets in one place
3. **Maintainable** - Easy to update or replace assets
4. **Version control friendly** - Clear file names in git history
5. **Team collaboration** - Other developers can easily understand the asset structure

## Future Assets

When adding new Figma assets:
1. Export from Figma
2. Rename using the naming convention
3. Place in this directory
4. Update component imports
5. Update this README if needed
