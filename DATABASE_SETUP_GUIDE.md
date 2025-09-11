# Database Setup Guide

## Complete Database Schema for Panchakarma Workload Management

### Step 1: Access Supabase Dashboard
1. Go to https://app.supabase.com
2. Sign in to your account
3. Select your project: `uvfvflyvcfcrxvihkpge`

### Step 2: Run the Database Schema
1. In your Supabase project dashboard, go to **SQL Editor**
2. Copy the entire contents of `database_schema.sql` file
3. Paste it into the SQL Editor
4. Click **Run** to execute all the SQL commands

### Step 3: Verify the Setup
After running the SQL, verify that the following tables have been created:
- `scholars` - Stores scholar information
- `procedures` - Stores procedure information
- `patients` - Stores patient information
- `daily_record` - Main table for daily assignments
- `patient_procedures` - Links patients to procedures
- `scholar_assignments` - Individual scholar assignments
- `workload_analytics` - Computed analytics

### Step 4: Check Sample Data
The schema includes sample data:
- **20 common Panchakarma procedures** with grades and points
- **10 sample scholars** across different years

### Step 5: Test the Connection
Your application should now be able to connect to the database without the 404 error.

## Database Schema Overview

### Core Tables

#### 1. `daily_record` (Main Table)
- **Purpose**: Stores daily workload assignments
- **Columns**: `id`, `date`, `scholars`, `patients`, `assignments`, `created_at`, `updated_at`
- **Key**: Unique constraint on `date`

#### 2. `scholars`
- **Purpose**: Master list of scholars
- **Columns**: `id`, `name`, `year`, `gender`, `is_posted`, `created_at`, `updated_at`

#### 3. `procedures`
- **Purpose**: Master list of Panchakarma procedures
- **Columns**: `id`, `name`, `grade`, `points`, `code`, `created_at`, `updated_at`

#### 4. `patients`
- **Purpose**: Master list of patients
- **Columns**: `id`, `name`, `gender`, `is_attendant`, `created_at`, `updated_at`

### Supporting Tables

#### 5. `scholar_assignments`
- **Purpose**: Individual assignments linking scholars to patient procedures
- **Columns**: `id`, `scholar_id`, `patient_id`, `procedure_id`, `assigned_date`

#### 6. `patient_procedures`
- **Purpose**: Links patients to their procedures
- **Columns**: `id`, `patient_id`, `procedure_id`, `assigned_date`

#### 7. `workload_analytics`
- **Purpose**: Stores computed analytics for performance optimization
- **Columns**: `id`, `date`, `total_patients`, `total_scholars`, `total_procedures`, `total_points`, `analytics_data`

## Custom Functions Created

### 1. `calculate_daily_analytics(date)`
- Calculates daily workload statistics
- Returns JSON with procedure counts and points

### 2. `get_date_range_stats(start_date, end_date)`
- Provides analytics for date ranges
- Returns table with daily statistics

## Security Setup

### Row Level Security (RLS)
- **Enabled** on all tables
- **Policies**: Allow all read/write operations (adjust as needed for production)
- **Access**: Configured for anonymous access (adjust for production)

## Indexes Created

Performance indexes on:
- `daily_record.date`
- `scholar_assignments.assigned_date`
- `scholar_assignments.scholar_id`
- `patient_procedures.assigned_date`
- `workload_analytics.date`

## Troubleshooting

### Common Issues

1. **Table not found error**: Ensure all SQL commands were executed successfully
2. **Permission denied**: Check RLS policies and grants
3. **Connection timeout**: Verify Supabase project URL and anon key in `.env`

### Verification Queries

```sql
-- Check if tables exist
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';

-- Check sample data
SELECT COUNT(*) FROM procedures;
SELECT COUNT(*) FROM scholars;
SELECT COUNT(*) FROM daily_record;

-- Test date range function
SELECT * FROM get_date_range_stats('2024-01-01', '2024-12-31');
```

## Environment Variables

Ensure your `.env` file contains:
```
VITE_SUPABASE_URL=https://uvfvflyvcfcrxvihkpge.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

## Next Steps

1. Restart your development server
2. Test basic CRUD operations
3. Verify data persistence
4. Test analytics functions

Your application should now work without the 404 database errors!