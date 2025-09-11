-- Panchakarma Workload Management System Database Schema
-- Complete schema for Supabase PostgreSQL database

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum types
CREATE TYPE gender_type AS ENUM ('M', 'F');
CREATE TYPE scholar_year_type AS ENUM (1, 2, 3);
CREATE TYPE procedure_grade_type AS ENUM (1, 2, 3);

-- Create scholars table
CREATE TABLE IF NOT EXISTS scholars (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    year scholar_year_type NOT NULL,
    gender gender_type NOT NULL,
    is_posted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create procedures table
CREATE TABLE IF NOT EXISTS procedures (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    grade procedure_grade_type NOT NULL,
    points INTEGER NOT NULL,
    code VARCHAR(10) NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create patients table
CREATE TABLE IF NOT EXISTS patients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    gender gender_type NOT NULL,
    is_attendant BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create daily_record table (main table for storing daily assignments)
CREATE TABLE IF NOT EXISTS daily_record (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    date DATE NOT NULL UNIQUE,
    scholars JSONB NOT NULL DEFAULT '[]',
    patients JSONB NOT NULL DEFAULT '[]',
    assignments JSONB NOT NULL DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create patient_procedures junction table (for linking patients to their procedures)
CREATE TABLE IF NOT EXISTS patient_procedures (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    procedure_id UUID NOT NULL REFERENCES procedures(id) ON DELETE CASCADE,
    assigned_date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(patient_id, procedure_id, assigned_date)
);

-- Create scholar_assignments table (for tracking individual scholar assignments)
CREATE TABLE IF NOT EXISTS scholar_assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    scholar_id UUID NOT NULL REFERENCES scholars(id) ON DELETE CASCADE,
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    procedure_id UUID NOT NULL REFERENCES procedures(id) ON DELETE CASCADE,
    assigned_date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(scholar_id, patient_id, procedure_id, assigned_date)
);

-- Create workload_analytics table (for storing computed analytics)
CREATE TABLE IF NOT EXISTS workload_analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    date DATE NOT NULL UNIQUE,
    total_patients INTEGER DEFAULT 0,
    total_scholars INTEGER DEFAULT 0,
    total_procedures INTEGER DEFAULT 0,
    total_points INTEGER DEFAULT 0,
    average_points_per_scholar DECIMAL(10,2) DEFAULT 0,
    analytics_data JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_daily_record_date ON daily_record(date);
CREATE INDEX IF NOT EXISTS idx_scholar_assignments_date ON scholar_assignments(assigned_date);
CREATE INDEX IF NOT EXISTS idx_scholar_assignments_scholar ON scholar_assignments(scholar_id);
CREATE INDEX IF NOT EXISTS idx_patient_procedures_date ON patient_procedures(assigned_date);
CREATE INDEX IF NOT EXISTS idx_workload_analytics_date ON workload_analytics(date);

-- Create updated_at triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_scholars_updated_at BEFORE UPDATE ON scholars
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_procedures_updated_at BEFORE UPDATE ON procedures
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_patients_updated_at BEFORE UPDATE ON patients
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_daily_record_updated_at BEFORE UPDATE ON daily_record
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_workload_analytics_updated_at BEFORE UPDATE ON workload_analytics
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample procedures data
INSERT INTO procedures (name, grade, points, code) VALUES
('Vamana', 1, 15, 'VAM'),
('Virechana', 1, 15, 'VIR'),
('Basti', 1, 20, 'BAS'),
('Nasya', 2, 10, 'NAS'),
('Raktamokshana', 2, 12, 'RAK'),
('Abhyanga', 3, 8, 'ABH'),
('Swedana', 3, 6, 'SWE'),
('Shirodhara', 2, 14, 'SHI'),
('Pizhichil', 1, 18, 'PIZ'),
('Udvartana', 3, 7, 'UDV'),
('Kati Basti', 2, 11, 'KAT'),
('Janu Basti', 2, 11, 'JAN'),
('Greeva Basti', 2, 11, 'GRE'),
('Netra Tarpana', 3, 9, 'NET'),
('Karna Purana', 3, 8, 'KAR'),
('Mukha Lepana', 3, 7, 'MUK'),
('Pada Abhyanga', 3, 6, 'PAD'),
('Shiro Abhyanga', 3, 7, 'SHA'),
('Pinda Sweda', 2, 13, 'PIN'),
('Valuka Sweda', 2, 12, 'VAL');

-- Insert sample scholars data
INSERT INTO scholars (name, year, gender, is_posted) VALUES
('Dr. Priya Sharma', 3, 'F', true),
('Dr. Rahul Verma', 3, 'M', true),
('Dr. Anjali Patel', 2, 'F', false),
('Dr. Vikas Kumar', 2, 'M', false),
('Dr. Neha Gupta', 1, 'F', false),
('Dr. Sanjay Singh', 1, 'M', false),
('Dr. Pooja Desai', 3, 'F', true),
('Dr. Amit Joshi', 2, 'M', false),
('Dr. Deepa Menon', 1, 'F', false),
('Dr. Rajesh Nair', 3, 'M', true);

-- Create function to calculate workload analytics
CREATE OR REPLACE FUNCTION calculate_daily_analytics(p_date DATE)
RETURNS JSON AS $$
DECLARE
    result JSON;
    total_procs INTEGER;
    total_pts INTEGER;
    avg_points DECIMAL(10,2);
BEGIN
    SELECT 
        COALESCE(COUNT(*), 0),
        COALESCE(SUM(p.points), 0),
        COALESCE(AVG(p.points), 0)
    INTO total_procs, total_pts, avg_points
    FROM scholar_assignments sa
    JOIN procedures p ON sa.procedure_id = p.id
    WHERE sa.assigned_date = p_date;

    result := json_build_object(
        'date', p_date,
        'total_procedures', total_procs,
        'total_points', total_pts,
        'average_points_per_procedure', avg_points
    );

    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Create function to get date range statistics
CREATE OR REPLACE FUNCTION get_date_range_stats(p_start_date DATE, p_end_date DATE)
RETURNS TABLE(
    date DATE,
    total_patients BIGINT,
    total_scholars BIGINT,
    total_procedures BIGINT,
    total_points BIGINT,
    average_points_per_scholar DECIMAL(10,2)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        dr.date,
        COALESCE(jsonb_array_length(dr.patients), 0)::BIGINT as total_patients,
        COALESCE(jsonb_array_length(dr.scholars), 0)::BIGINT as total_scholars,
        COALESCE(jsonb_array_length(dr.assignments), 0)::BIGINT as total_procedures,
        COALESCE(
            (SELECT SUM((assignment->>'totalPoints')::INTEGER) 
             FROM jsonb_array_elements(dr.assignments) as assignment), 0
        )::BIGINT as total_points,
        COALESCE(
            (SELECT AVG((assignment->>'totalPoints')::INTEGER) 
             FROM jsonb_array_elements(dr.assignments) as assignment), 0
        )::DECIMAL(10,2) as average_points_per_scholar
    FROM daily_record dr
    WHERE dr.date >= p_start_date AND dr.date <= p_end_date
    ORDER BY dr.date ASC;
END;
$$ LANGUAGE plpgsql;

-- Create RLS (Row Level Security) policies
ALTER TABLE scholars ENABLE ROW LEVEL SECURITY;
ALTER TABLE procedures ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_record ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_procedures ENABLE ROW LEVEL SECURITY;
ALTER TABLE scholar_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE workload_analytics ENABLE ROW LEVEL SECURITY;

-- Create policies for read access (allow all for now)
CREATE POLICY "Allow read access to scholars" ON scholars FOR SELECT USING (true);
CREATE POLICY "Allow read access to procedures" ON procedures FOR SELECT USING (true);
CREATE POLICY "Allow read access to patients" ON patients FOR SELECT USING (true);
CREATE POLICY "Allow read access to daily_record" ON daily_record FOR SELECT USING (true);
CREATE POLICY "Allow read access to workload_analytics" ON workload_analytics FOR SELECT USING (true);

-- Create policies for write access (allow all for now)
CREATE POLICY "Allow write access to scholars" ON scholars FOR ALL USING (true);
CREATE POLICY "Allow write access to procedures" ON procedures FOR ALL USING (true);
CREATE POLICY "Allow write access to patients" ON patients FOR ALL USING (true);
CREATE POLICY "Allow write access to daily_record" ON daily_record FOR ALL USING (true);
CREATE POLICY "Allow write access to workload_analytics" ON workload_analytics FOR ALL USING (true);

-- Grant permissions
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon;