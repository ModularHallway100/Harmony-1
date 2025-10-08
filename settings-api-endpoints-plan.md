# Settings API Endpoints Integration Plan

## Overview
This plan outlines the steps needed to create comprehensive API endpoints for settings management in the Harmony application.

## Current Issues
1. No backend API endpoints for settings management
2. Form submissions are not connected to backend
3. No user authentication for settings access
4. Missing data persistence for user preferences
5. No error handling for API failures
6. No validation for settings data

## Current Backend Analysis

### Existing Infrastructure:
- Cloudflare Workers with Hono framework
- Basic chat API endpoints in `userRoutes.ts`
- Durable Objects for chat state management
- Basic error handling and response formatting

### Missing Components:
- User management system
- Settings persistence layer
- Authentication middleware
- Data validation schemas
- Proper error responses

## Implementation Plan

### 1. User Management API Endpoints

#### File: `Harmony-1/worker/userRoutes.ts`

**User Authentication Middleware:**
```typescript
// Add authentication middleware
const authenticateUser = async (c: Context<{ Bindings: Env }>, next: () => Promise<void>) => {
  const authHeader = c.req.header('Authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({ 
      success: false, 
      error: 'Missing or invalid authorization header' 
    }, 401);
  }

  const token = authHeader.substring(7);
  
  try {
    // Verify token with Cloudflare KV or database
    const user = await c.env.USER_STORE.get(`user:${token}`);
    
    if (!user) {
      return c.json({ 
        success: false, 
        error: 'Invalid or expired token' 
      }, 401);
    }

    // Add user to context for downstream use
    c.set('user', JSON.parse(user));
    await next();
  } catch (error) {
    console.error('Authentication error:', error);
    return c.json({ 
      success: false, 
      error: 'Authentication failed' 
    }, 401);
  }
};
```

**User Profile Endpoints:**
```typescript
// Get user profile
app.get('/api/user/profile', authenticateUser, async (c) => {
  try {
    const user = c.get('user');
    
    // Get user profile from database
    const profile = await c.env.DB.prepare(
      'SELECT id, username, email, bio, avatar_url, created_at FROM users WHERE id = ?'
    ).bind(user.id).first();
    
    return c.json({ 
      success: true, 
      data: profile 
    });
  } catch (error) {
    console.error('Failed to get profile:', error);
    return c.json({ 
      success: false, 
      error: 'Failed to retrieve profile' 
    }, 500);
  }
});

// Update user profile
app.put('/api/user/profile', authenticateUser, async (c) => {
  try {
    const user = c.get('user');
    const { username, email, bio } = await c.req.json();
    
    // Validate input
    if (!username || username.length < 3 || username.length > 20) {
      return c.json({ 
        success: false, 
        error: 'Username must be between 3 and 20 characters' 
      }, 400);
    }
    
    if (!email || !email.includes('@')) {
      return c.json({ 
        success: false, 
        error: 'Please provide a valid email address' 
      }, 400);
    }
    
    // Update profile in database
    await c.env.DB.prepare(
      'UPDATE users SET username = ?, email = ?, bio = ? WHERE id = ?'
    ).bind(username, email, bio || '', user.id).run();
    
    // Update user cache
    const updatedUser = { ...user, username, email, bio };
    await c.env.USER_STORE.put(`user:${user.token}`, JSON.stringify(updatedUser));
    
    return c.json({ 
      success: true, 
      data: updatedUser 
    });
  } catch (error) {
    console.error('Failed to update profile:', error);
    return c.json({ 
      success: false, 
      error: 'Failed to update profile' 
    }, 500);
  }
});
```

### 2. Settings Management Endpoints

**Theme Settings Endpoints:**
```typescript
// Get user theme settings
app.get('/api/user/theme', authenticateUser, async (c) => {
  try {
    const user = c.get('user');
    
    const themeSettings = await c.env.DB.prepare(
      'SELECT theme_type, custom_colors FROM user_settings WHERE user_id = ?'
    ).bind(user.id).first();
    
    return c.json({ 
      success: true, 
      data: themeSettings || { 
        theme_type: 'system', 
        custom_colors: null 
      } 
    });
  } catch (error) {
    console.error('Failed to get theme settings:', error);
    return c.json({ 
      success: false, 
      error: 'Failed to retrieve theme settings' 
    }, 500);
  }
});

// Update user theme settings
app.put('/api/user/theme', authenticateUser, async (c) => {
  try {
    const user = c.get('user');
    const { theme_type, custom_colors } = await c.req.json();
    
    // Validate theme type
    const validThemes = ['light', 'dark', 'system'];
    if (!validThemes.includes(theme_type)) {
      return c.json({ 
        success: false, 
        error: 'Invalid theme type' 
      }, 400);
    }
    
    // Upsert theme settings
    await c.env.DB.prepare(`
      INSERT INTO user_settings (user_id, theme_type, custom_colors)
      VALUES (?, ?, ?)
      ON CONFLICT(user_id) DO UPDATE SET
        theme_type = excluded.theme_type,
        custom_colors = excluded.custom_colors,
        updated_at = CURRENT_TIMESTAMP
    `).bind(user.id, theme_type, custom_colors ? JSON.stringify(custom_colors) : null).run();
    
    return c.json({ 
      success: true, 
      data: { theme_type, custom_colors } 
    });
  } catch (error) {
    console.error('Failed to update theme settings:', error);
    return c.json({ 
      success: false, 
      error: 'Failed to update theme settings' 
    }, 500);
  }
});
```

**Audio Settings Endpoints:**
```typescript
// Get user audio settings
app.get('/api/user/audio', authenticateUser, async (c) => {
  try {
    const user = c.get('user');
    
    const audioSettings = await c.env.DB.prepare(
      'SELECT audio_quality, output_device, volume, crossfade_duration FROM user_audio_settings WHERE user_id = ?'
    ).bind(user.id).first();
    
    return c.json({ 
      success: true, 
      data: audioSettings || { 
        audio_quality: 'high',
        output_device: 'default',
        volume: 80,
        crossfade_duration: 5
      } 
    });
  } catch (error) {
    console.error('Failed to get audio settings:', error);
    return c.json({ 
      success: false, 
      error: 'Failed to retrieve audio settings' 
    }, 500);
  }
});

// Update user audio settings
app.put('/api/user/audio', authenticateUser, async (c) => {
  try {
    const user = c.get('user');
    const { audio_quality, output_device, volume, crossfade_duration } = await c.req.json();
    
    // Validate audio quality
    const validQualities = ['low', 'normal', 'high', 'lossless'];
    if (!validQualities.includes(audio_quality)) {
      return c.json({ 
        success: false, 
        error: 'Invalid audio quality setting' 
      }, 400);
    }
    
    // Validate volume
    if (volume < 0 || volume > 100) {
      return c.json({ 
        success: false, 
        error: 'Volume must be between 0 and 100' 
      }, 400);
    }
    
    // Validate crossfade duration
    if (crossfade_duration < 0 || crossfade_duration > 10) {
      return c.json({ 
        success: false, 
        error: 'Crossfade duration must be between 0 and 10 seconds' 
      }, 400);
    }
    
    // Upsert audio settings
    await c.env.DB.prepare(`
      INSERT INTO user_audio_settings (user_id, audio_quality, output_device, volume, crossfade_duration)
      VALUES (?, ?, ?, ?, ?)
      ON CONFLICT(user_id) DO UPDATE SET
        audio_quality = excluded.audio_quality,
        output_device = excluded.output_device,
        volume = excluded.volume,
        crossfade_duration = excluded.crossfade_duration,
        updated_at = CURRENT_TIMESTAMP
    `).bind(user.id, audio_quality, output_device, volume, crossfade_duration).run();
    
    return c.json({ 
      success: true, 
      data: { audio_quality, output_device, volume, crossfade_duration } 
    });
  } catch (error) {
    console.error('Failed to update audio settings:', error);
    return c.json({ 
      success: false, 
      error: 'Failed to update audio settings' 
    }, 500);
  }
});
```

### 3. Notification Settings Endpoints

**Notification Management:**
```typescript
// Get user notification settings
app.get('/api/user/notifications', authenticateUser, async (c) => {
  try {
    const user = c.get('user');
    
    const notificationSettings = await c.env.DB.prepare(
      'SELECT email_notifications, push_notifications, new_releases, follows, promotions, email_frequency FROM user_notification_settings WHERE user_id = ?'
    ).bind(user.id).first();
    
    return c.json({ 
      success: true, 
      data: notificationSettings || { 
        email_notifications: true,
        push_notifications: true,
        new_releases: true,
        follows: true,
        promotions: false,
        email_frequency: 'daily'
      } 
    });
  } catch (error) {
    console.error('Failed to get notification settings:', error);
    return c.json({ 
      success: false, 
      error: 'Failed to retrieve notification settings' 
    }, 500);
  }
});

// Update user notification settings
app.put('/api/user/notifications', authenticateUser, async (c) => {
  try {
    const user = c.get('user');
    const { 
      email_notifications, 
      push_notifications, 
      new_releases, 
      follows, 
      promotions, 
      email_frequency 
    } = await c.req.json();
    
    // Validate email frequency
    const validFrequencies = ['immediate', 'daily', 'weekly', 'never'];
    if (!validFrequencies.includes(email_frequency)) {
      return c.json({ 
        success: false, 
        error: 'Invalid email frequency setting' 
      }, 400);
    }
    
    // Upsert notification settings
    await c.env.DB.prepare(`
      INSERT INTO user_notification_settings (user_id, email_notifications, push_notifications, new_releases, follows, promotions, email_frequency)
      VALUES (?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(user_id) DO UPDATE SET
        email_notifications = excluded.email_notifications,
        push_notifications = excluded.push_notifications,
        new_releases = excluded.new_releases,
        follows = excluded.follows,
        promotions = excluded.promotions,
        email_frequency = excluded.email_frequency,
        updated_at = CURRENT_TIMESTAMP
    `).bind(user.id, email_notifications, push_notifications, new_releases, follows, promotions, email_frequency).run();
    
    return c.json({ 
      success: true, 
      data: { 
        email_notifications, 
        push_notifications, 
        new_releases, 
        follows, 
        promotions, 
        email_frequency 
      } 
    });
  } catch (error) {
    console.error('Failed to update notification settings:', error);
    return c.json({ 
      success: false, 
      error: 'Failed to update notification settings' 
    }, 500);
  }
});
```

### 4. Privacy Settings Endpoints

**Privacy Management:**
```typescript
// Get user privacy settings
app.get('/api/user/privacy', authenticateUser, async (c) => {
  try {
    const user = c.get('user');
    
    const privacySettings = await c.env.DB.prepare(
      'SELECT profile_visibility, activity_status, show_listening_activity, data_collection, allow_downloads FROM user_privacy_settings WHERE user_id = ?'
    ).bind(user.id).first();
    
    return c.json({ 
      success: true, 
      data: privacySettings || { 
        profile_visibility: 'public',
        activity_status: true,
        show_listening_activity: true,
        data_collection: true,
        allow_downloads: false
      } 
    });
  } catch (error) {
    console.error('Failed to get privacy settings:', error);
    return c.json({ 
      success: false, 
      error: 'Failed to retrieve privacy settings' 
    }, 500);
  }
});

// Update user privacy settings
app.put('/api/user/privacy', authenticateUser, async (c) => {
  try {
    const user = c.get('user');
    const { 
      profile_visibility, 
      activity_status, 
      show_listening_activity, 
      data_collection, 
      allow_downloads 
    } = await c.req.json();
    
    // Validate profile visibility
    const validVisibilities = ['public', 'friends', 'private'];
    if (!validVisibilities.includes(profile_visibility)) {
      return c.json({ 
        success: false, 
        error: 'Invalid profile visibility setting' 
      }, 400);
    }
    
    // Upsert privacy settings
    await c.env.DB.prepare(`
      INSERT INTO user_privacy_settings (user_id, profile_visibility, activity_status, show_listening_activity, data_collection, allow_downloads)
      VALUES (?, ?, ?, ?, ?, ?)
      ON CONFLICT(user_id) DO UPDATE SET
        profile_visibility = excluded.profile_visibility,
        activity_status = excluded.activity_status,
        show_listening_activity = excluded.show_listening_activity,
        data_collection = excluded.data_collection,
        allow_downloads = excluded.allow_downloads,
        updated_at = CURRENT_TIMESTAMP
    `).bind(user.id, profile_visibility, activity_status, show_listening_activity, data_collection, allow_downloads).run();
    
    return c.json({ 
      success: true, 
      data: { 
        profile_visibility, 
        activity_status, 
        show_listening_activity, 
        data_collection, 
        allow_downloads 
      } 
    });
  } catch (error) {
    console.error('Failed to update privacy settings:', error);
    return c.json({ 
      success: false, 
      error: 'Failed to update privacy settings' 
    }, 500);
  }
});
```

### 5. Password Management Endpoints

**Password Change Endpoint:**
```typescript
// Change user password
app.put('/api/user/password', authenticateUser, async (c) => {
  try {
    const user = c.get('user');
    const { current_password, new_password, confirm_password } = await c.req.json();
    
    // Validate input
    if (!current_password || !new_password || !confirm_password) {
      return c.json({ 
        success: false, 
        error: 'All password fields are required' 
      }, 400);
    }
    
    if (new_password !== confirm_password) {
      return c.json({ 
        success: false, 
        error: 'New passwords do not match' 
      }, 400);
    }
    
    if (new_password.length < 8) {
      return c.json({ 
        success: false, 
        error: 'New password must be at least 8 characters long' 
      }, 400);
    }
    
    // Verify current password
    const currentUser = await c.env.DB.prepare(
      'SELECT password_hash FROM users WHERE id = ?'
    ).bind(user.id).first();
    
    if (!currentUser || !(await verifyPassword(current_password, currentUser.password_hash))) {
      return c.json({ 
        success: false, 
        error: 'Current password is incorrect' 
      }, 400);
    }
    
    // Update password
    const newPasswordHash = await hashPassword(new_password);
    await c.env.DB.prepare(
      'UPDATE users SET password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?'
    ).bind(newPasswordHash, user.id).run();
    
    return c.json({ 
      success: true, 
      message: 'Password updated successfully' 
    });
  } catch (error) {
    console.error('Failed to change password:', error);
    return c.json({ 
      success: false, 
      error: 'Failed to change password' 
    }, 500);
  }
});
```

### 6. Database Schema

**SQLite Schema for Settings:**
```sql
-- Users table
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  bio TEXT,
  avatar_url TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- User settings table
CREATE TABLE IF NOT EXISTS user_settings (
  user_id TEXT PRIMARY KEY,
  theme_type TEXT DEFAULT 'system',
  custom_colors TEXT, -- JSON stored as string
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- User audio settings table
CREATE TABLE IF NOT EXISTS user_audio_settings (
  user_id TEXT PRIMARY KEY,
  audio_quality TEXT DEFAULT 'high',
  output_device TEXT DEFAULT 'default',
  volume INTEGER DEFAULT 80,
  crossfade_duration INTEGER DEFAULT 5,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- User notification settings table
CREATE TABLE IF NOT EXISTS user_notification_settings (
  user_id TEXT PRIMARY KEY,
  email_notifications BOOLEAN DEFAULT TRUE,
  push_notifications BOOLEAN DEFAULT TRUE,
  new_releases BOOLEAN DEFAULT TRUE,
  follows BOOLEAN DEFAULT TRUE,
  promotions BOOLEAN DEFAULT FALSE,
  email_frequency TEXT DEFAULT 'daily',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- User privacy settings table
CREATE TABLE IF NOT EXISTS user_privacy_settings (
  user_id TEXT PRIMARY KEY,
  profile_visibility TEXT DEFAULT 'public',
  activity_status BOOLEAN DEFAULT TRUE,
  show_listening_activity BOOLEAN DEFAULT TRUE,
  data_collection BOOLEAN DEFAULT TRUE,
  allow_downloads BOOLEAN DEFAULT FALSE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

### 7. Utility Functions

**Password Hashing and Verification:**
```typescript
// Password utilities
import { createHash, randomBytes } from 'crypto';

async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString('hex');
  const hash = createHash('sha256').update(password + salt).digest('hex');
  return `${salt}:${hash}`;
}

async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
  const [salt, hash] = storedHash.split(':');
  const computedHash = createHash('sha256').update(password + salt).digest('hex');
  return computedHash === hash;
}
```

## Implementation Steps

### Phase 1: Database Setup
1. Create database schema
2. Set up Cloudflare D1 database
3. Create migration scripts
4. Test database connectivity

### Phase 2: Authentication
1. Implement JWT token generation
2. Create authentication middleware
3. Add user registration/login endpoints
4. Test authentication flow

### Phase 3: Settings Endpoints
1. Create profile management endpoints
2. Add theme settings endpoints
3. Implement audio settings endpoints
4. Add notification and privacy endpoints

### Phase 4: Testing & Deployment
1. Test all API endpoints
2. Add error handling
3. Create API documentation
4. Deploy to production

## Expected Outcome
- Complete settings API with all CRUD operations
- User authentication and authorization
- Data persistence in Cloudflare D1
- Proper error handling and validation
- Secure password management
- Comprehensive database schema

## Dependencies
- Cloudflare Workers D1 database
- Hono framework
- JWT token handling
- Password hashing libraries
- Database migration tools

## Timeline
- Phase 1: 30-40 minutes
- Phase 2: 25-35 minutes
- Phase 3: 35-45 minutes
- Phase 4: 20-30 minutes
- Total: 110-150 minutes