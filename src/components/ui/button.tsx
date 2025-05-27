import * as React from "react";
import MuiButton from "@mui/material/Button";
import { ButtonProps as MuiButtonProps } from "@mui/material/Button";

// Define the expected props based on the original component's usage
// We will map these to MUI's props
export interface ButtonProps
  extends Omit<MuiButtonProps, 'variant' | 'size' | 'color'> { // Omit MUI's variant/size/color to define our own mapping
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
  asChild?: boolean; // Note: asChild is not directly supported by MUI Button
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, children, ...props }, ref) => {

    // Map custom variants to MUI variants and colors
    let muiVariant: MuiButtonProps['variant'] = 'contained';
    let muiColor: MuiButtonProps['color'] = 'primary'; // Default color
    let muiSize: MuiButtonProps['size'] = 'medium';

    switch (variant) {
      case 'outline':
        muiVariant = 'outlined';
        break;
      case 'ghost':
      case 'link': // Link variant often looks like text
        muiVariant = 'text';
        break;
      case 'destructive':
        muiColor = 'error'; // Use error color for destructive
        // Determine the best MUI variant for destructive, default to contained
        if (muiVariant === 'contained') {
           // keep as contained error
        } else if (muiVariant === 'outlined') {
           // keep as outlined error
        } else {
           muiVariant = 'contained' // default destructive to contained
        }
        break;
      case 'secondary':
        muiColor = 'secondary';
         if (muiVariant === 'contained') {
           // keep as contained secondary
        } else if (muiVariant === 'outlined') {
           // keep as outlined secondary
        } else {
           muiVariant = 'contained' // default secondary to contained
        }
        break;
      case 'default':
      default:
        // muiVariant is already 'contained' by default
        // muiColor is already 'primary' by default
        break;
    }

    // Map custom sizes to MUI sizes
    switch (size) {
      case 'sm':
        muiSize = 'small';
        break;
      case 'lg':
        muiSize = 'large';
        break;
      case 'icon':
        // MUI's IconButton is often better for icon-only buttons. For a direct button replacement,
        // we map 'icon' size to 'medium', but you might need custom styles or IconButton instead.
        muiSize = 'medium'; // Fallback, potentially needs custom styles or IconButton
        break;
      case 'default':
      default:
        // muiSize is already 'medium' by default
        break;
    }

    // Note: asChild is not a standard prop for MUI Button and won't work
    // in the same way as with Radix UI. If asChild functionality is critical,
    // a different approach is needed.
    if (asChild) {
        console.warn("The 'asChild' prop is not fully supported by the MUI Button refactor. The button will render as a standard MUI Button.");
    }

    return (
      <MuiButton
        ref={ref}
        variant={muiVariant}
        size={muiSize}
        color={muiColor}
        className={className} // Pass className (MUI supports this, but often prefers its own styling system)
        {...props}
      >
        {children}
      </MuiButton>
    );
  }
);

Button.displayName = "Button";

export { Button }; // Export the new Button component
// We no longer export buttonVariants as it's specific to the old implementation
