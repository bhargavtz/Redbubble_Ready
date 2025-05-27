"use client";

import React from 'react';
import { ControllerRenderProps } from 'react-hook-form';
import { FormItem, FormControl, FormLabel, FormMessage } from '@/components/ui/form';
import { Checkbox } from '@/components/ui/checkbox';

interface CategoryCheckboxItemProps {
  category: string;
  field: ControllerRenderProps<any, 'categories'>; // Adjust type if needed
  canCheckMore: boolean;
  isSubmitting: boolean;
}

const CategoryCheckboxItem: React.FC<CategoryCheckboxItemProps> = ({
  category,
  field,
  canCheckMore,
  isSubmitting,
}) => {
  const isChecked = field.value?.includes(category);

  return (
    <FormItem className="flex flex-row items-center space-x-3 space-y-0 p-2.5 rounded-md hover:bg-muted/20 transition-colors bg-input border border-transparent hover:border-border">
      <FormControl>
        <Checkbox
          checked={isChecked}
          onCheckedChange={(checked) => {
            const currentCategories = field.value || [];
            if (checked) {
              if (canCheckMore) {
                field.onChange([...currentCategories, category]);
              }
            } else {
              field.onChange(
                currentCategories?.filter(
                  (value: string) => value !== category
                )
              );
            }
          }}
          disabled={!isChecked && !canCheckMore && isSubmitting}
          className="data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
        />
      </FormControl>
      <FormLabel className="font-normal text-sm cursor-pointer text-foreground/90">
        {category}
      </FormLabel>
      {/* <FormMessage /> This is handled by the parent FormField */}
    </FormItem>
  );
};

export default CategoryCheckboxItem;
