# Admin Dashboard Functionality

## Overview

This document provides an overview of the admin dashboard functionality added to the eco-friendly social media platform.

## Features

### Admin Dashboard

- **Dashboard Overview**: View platform statistics including total users, total badges, and badges purchased
- **Badge Management**: Create new badges with customizable properties (name, description, cost, category, etc.)
- **User Management**: View all users, update their eco points, and send alerts
- **Alert System**: Send warning notifications to users about policy violations or inappropriate behavior

## How to Access

Access to the admin dashboard is restricted to users with administrator privileges. To access:

1. Log in to your account (must have isAdmin=true)
2. Click on the "Admin" button in the navigation bar
3. Navigate through the dashboard tabs to access different admin functions

## Admin Features

### Badge Management

The admin can create new badges with the following properties:
- Name
- Description
- Cost (in eco points)
- Category (beginner, intermediate, advanced, expert, special)
- Availability status
- Expiration date (optional)

### User Management

Administrators can:
- View all users registered on the platform
- Search for users by name or email
- Update a user's eco points
- Send alerts/warnings to users

### Alert System

Administrators can send different types of alerts:
- Warning alerts for policy violations
- Informational alerts
- Critical alerts for serious concerns

## Implementation Notes

1. The admin status is controlled by the `isAdmin` flag in the user model
2. Admin routes are protected by middleware that checks for admin privileges
3. By default, all users are regular users (not admins)
4. Admin access must be granted directly in the database

## Future Enhancements

- Content moderation tools
- User activity reports and analytics
- Badge usage statistics
- User behavior tracking
