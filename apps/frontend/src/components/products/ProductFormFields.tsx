'use client';

import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { FormField } from '../FormField';

export function ProductFormFields({
  values,
  errors,
  touched,
  handleChange,
  handleBlur,
  setFieldValue,
  isSuperAdmin,
}: any) {
  const categories = ['Electronics', 'Clothing', 'Food'];

  return (
    <>
      <FormField
        id="name"
        name="name"
        label="Name"
        value={values.name}
        onChange={handleChange}
        onBlur={handleBlur}
        placeholder="Enter name"
        required
        disabled={!isSuperAdmin}
        error={errors.name}
        touched={touched.name}
      />

      <div>
        <Label htmlFor="category" className="text-sky-700">
          Category <span className="text-red-500">*</span>
        </Label>
        <Select
          onValueChange={(val) => setFieldValue('category', val)}
          value={values.category}
          disabled={!isSuperAdmin}
        >
          <SelectTrigger className="mt-1">
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {cat}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {touched.category && typeof errors.category === 'string' && (
          <p className="mt-1 text-sm text-red-500">{errors.category}</p>
        )}
      </div>

      <FormField
        id="description"
        name="description"
        label="Description"
        type="textarea"
        value={values.description}
        onChange={handleChange}
        onBlur={handleBlur}
        placeholder="Enter product description"
        required
        disabled={!isSuperAdmin}
        error={errors.description}
        touched={touched.description}
      />

      <FormField
        id="price"
        name="price"
        label="Price"
        type="number"
        value={values.price}
        onChange={handleChange}
        onBlur={handleBlur}
        placeholder="Enter price"
        required
        disabled={!isSuperAdmin}
        error={errors.price}
        touched={touched.price}
      />
    </>
  );
}
