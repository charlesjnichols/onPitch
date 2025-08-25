# Enhanced Dark Theme Guide

## Overview
This enhanced dark theme provides a professional, soccer-themed UI with improved accessibility, visual hierarchy, and user experience.

...

## Implementation Examples

### Basic Card
```jsx
<div className="enhanced-card p-4">
  <h3 className="text-text-primary">Card Title</h3>
  <p className="text-text-secondary">Card content</p>
</div>
```

### Enhanced Button
```jsx
<button className="enhanced-button text-text-primary">
  Click Me
</button>
```

...

## Best Practices

1. **Consistent Spacing**: Use Tailwind's spacing scale (4px increments)
2. **Typography Hierarchy**: Maintain consistent font sizes and weights
3. **Color Usage**: Follow the defined color palette strictly
4. **Component Patterns**: Reuse established component styles
5. **Performance**: Minimize custom CSS, leverage Tailwind utilities

...

## Testing

Test the theme for:
- ✅ Color contrast ratios (WCAG AA compliance)
- ✅ Keyboard navigation and focus states
- ✅ Responsive behavior across devices
- ✅ Browser compatibility
- ✅ Performance impact

### Export CSV Button
```jsx
<button className="enhanced-button text-text-primary">
  Export CSV
</button>
```

### Send to Lineup Button
```jsx
<button className="enhanced-button text-text-primary">
  Send to Lineup
</button>
```
