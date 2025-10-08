# Settings Form Handling and Validation Enhancement Plan

## Overview
This plan outlines the steps needed to enhance the settings page with proper form handling, validation, and backend integration.

## Current Issues
1. Profile form doesn't connect to backend API
2. No real-time validation feedback
3. Password change button has no functionality
4. Missing success/error states
5. Form data is not persisted

## Implementation Plan

### 1. Enhance Profile Form Handling

#### File: `Harmony-1/src/pages/SettingsPage.tsx`

**Current Form Schema:**
```typescript
const profileFormSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters.').max(20),
  email: z.string().email('Please enter a valid email.'),
  bio: z.string().max(160, 'Bio must be 160 characters or less.').optional(),
});
```

**Enhancements Needed:**
- Add loading states during form submission
- Implement API integration for form submission
- Add success/error notifications
- Include form data persistence
- Add character counter for bio field

**Code Changes:**
```typescript
// Add loading state and API integration
const [isSubmitting, setIsSubmitting] = useState(false);
const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

// Enhanced submit handler
const onSubmit = async (data: ProfileFormValues) => {
  setIsSubmitting(true);
  setSubmitStatus('idle');
  
  try {
    // API call to update profile
    const response = await fetch('/api/user/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    
    if (response.ok) {
      setSubmitStatus('success');
      // Show success notification
    } else {
      setSubmitStatus('error');
      // Show error notification
    }
  } catch (error) {
    setSubmitStatus('error');
    console.error('Profile update failed:', error);
  } finally {
    setIsSubmitting(false);
  }
};
```

### 2. Implement Password Change Functionality

**New Form Schema:**
```typescript
const passwordFormSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required.'),
  newPassword: z.string().min(8, 'New password must be at least 8 characters.'),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});
```

**UI Components:**
- Add password change section to settings page
- Include password strength indicator
- Add show/hide password functionality
- Implement confirmation dialog for password changes

### 3. Add Real-time Validation Feedback

**Enhancements:**
- Character count for bio field
- Password strength meter
- Email format validation
- Username availability checking

**Implementation:**
```typescript
// Add character counter
const [bioCharCount, setBioCharCount] = useState(0);

// Bio field enhancement
<FormField
  control={form.control}
  name="bio"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Bio</FormLabel>
      <FormControl>
        <Textarea 
          {...field} 
          className="bg-neutral-950 border-neutral-700"
          maxLength={160}
          onChange={(e) => {
            field.onChange(e);
            setBioCharCount(e.target.value.length);
          }}
        />
      </FormControl>
      <FormMessage />
      <p className="text-xs text-gray-500 mt-1">
        {bioCharCount}/160 characters
      </p>
    </FormItem>
  )}
/>
```

### 4. Create Settings API Endpoints

#### File: `Harmony-1/worker/userRoutes.ts`

**New Endpoints:**
```typescript
// Update user profile
app.put('/api/user/profile', async (c) => {
  try {
    const body = await c.req.json();
    // Validate and update user profile
    return c.json({ success: true, data: body });
  } catch (error) {
    return c.json({ success: false, error: 'Update failed' }, 500);
  }
});

// Change password
app.put('/api/user/password', async (c) => {
  try {
    const body = await c.req.json();
    // Validate and update password
    return c.json({ success: true });
  } catch (error) {
    return c.json({ success: false, error: 'Password change failed' }, 500);
  }
});
```

### 5. Add Notification System

**Integration:**
- Use existing Sonner toast notifications
- Add success/error notifications for form submissions
- Include loading indicators

**Implementation:**
```typescript
import { toast } from 'sonner';

// In submit handler
if (response.ok) {
  toast.success('Profile updated successfully!');
  setSubmitStatus('success');
} else {
  toast.error('Failed to update profile. Please try again.');
  setSubmitStatus('error');
}
```

### 6. Form Layout Improvements

**Enhanced Layout:**
- Add tabbed interface for different settings sections
- Improve responsive design
- Add progress indicators for multi-step forms
- Include form validation summary

## Implementation Steps

### Phase 1: Profile Form Enhancement
1. Add loading states
2. Implement API integration
3. Add notification system
4. Test form submission

### Phase 2: Password Change Feature
1. Create password form schema
2. Add password UI components
3. Implement password change API
4. Add validation and feedback

### Phase 3: Real-time Validation
1. Add character counters
2. Implement password strength meter
3. Add availability checking
4. Enhance error messages

### Phase 4: Testing and Optimization
1. Test all form scenarios
2. Optimize performance
3. Add accessibility features
4. Document functionality

## Expected Outcome
- Fully functional profile form with backend integration
- Password change functionality with proper validation
- Real-time feedback and notifications
- Improved user experience with loading states
- Form data persistence and error handling

## Dependencies
- Existing React Hook Form and Zod validation
- Sonner for notifications
- Hono API framework for backend endpoints
- Zustand for state management (if needed)

## Timeline
- Phase 1: 30-45 minutes
- Phase 2: 20-30 minutes
- Phase 3: 15-25 minutes
- Phase 4: 15-20 minutes
- Total: 80-120 minutes