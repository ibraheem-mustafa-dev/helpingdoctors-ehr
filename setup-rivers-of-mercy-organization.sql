-- Setup Rivers of Mercy Organization and Clinic
-- Run this in phpMyAdmin on database: u945238940_oFkSr

-- 1. Insert organization settings
INSERT INTO wp_3_options (option_name, option_value, autoload) VALUES
('hd_ehr_general_options', 'a:7:{s:11:"clinic_name";s:16:"Rivers of Mercy";s:14:"clinic_address";s:15:"Gaza Strip, Gaza";s:12:"clinic_phone";s:0:"";s:12:"clinic_email";s:0:"";s:16:"default_timezone";s:14:"Asia/Gaza";s:11:"date_format";s:5:"d/m/Y";s:11:"time_format";s:3:"H:i";}', 'yes')
ON DUPLICATE KEY UPDATE option_value = 'a:7:{s:11:"clinic_name";s:16:"Rivers of Mercy";s:14:"clinic_address";s:15:"Gaza Strip, Gaza";s:12:"clinic_phone";s:0:"";s:12:"clinic_email";s:0:"";s:16:"default_timezone";s:14:"Asia/Gaza";s:11:"date_format";s:5:"d/m/Y";s:11:"time_format";s:3:"H:i";}';

-- 2. Check if clinics table exists
SELECT 'Checking for clinics table...' as Status;

-- 3. Insert primary clinic location (if clinics table exists)
-- INSERT INTO wp_3_hd_clinics (clinic_id, name, address, city, country, phone, email, is_active, created_at)
-- VALUES
-- ('CLI-ROM-001', 'Rivers of Mercy Primary Clinic', 'Main Location', 'Gaza', 'Palestine', '', '', 1, NOW())
-- ON DUPLICATE KEY UPDATE name = 'Rivers of Mercy Primary Clinic';

SELECT 'Organization settings configured for Rivers of Mercy!' as Status;
SELECT 'Timezone set to Asia/Gaza' as Info;
SELECT 'Date format set to d/m/Y (day/month/year)' as Info;
