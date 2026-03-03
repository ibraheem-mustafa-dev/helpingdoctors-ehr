# HelpingDoctors EHR Pro — WordPress Plugin

## Always Do First
- Read `wordpress-pro` SKILL.md before any WordPress/PHP work
- Check existing table schema in `includes/database/` before adding DB logic
- NEVER modify existing DB columns without a migration script

## Project Context
- **Type:** WordPress plugin (humanitarian — Gaza/Palestine refugee medical clinics)
- **Deployment:** SFTP to Hostinger — no local environment, no WP CLI
- **Plugin slug:** helpingdoctors-ehr-pro
- **DB:** 70+ custom tables, all prefixed with `hd_`
- **PHP minimum:** 7.4 (hosted environment)

## Security is Non-Negotiable
- ALL user inputs: `sanitize_text_field()`, `absint()`, `wp_kses()` as appropriate
- ALL DB queries: prepared statements (`$wpdb->prepare()`) — NO direct interpolation
- ALL forms: nonces (`wp_nonce_field()` + `check_ajax_referer()`)
- ALL AJAX: `wp_verify_nonce()` before processing
- Capability checks on every admin action (`current_user_can()`)
- NO direct file access: `defined('ABSPATH') || exit;` at top of every PHP file

## SDLC — Mandatory Process
1. Write failing test first (PHPUnit)
2. Implement minimum code to pass test
3. Refactor if needed
4. Commit with message format: `feat(module): description` or `fix(module): description`

## Data Sensitivity
- Patient data: never log to error_log or debug files
- No hardcoded patient records in test fixtures
- Mock all external API calls in tests

## Hard Rules
- No placeholders, no TODOs left in committed code
- No `var_dump()` or `print_r()` in committed code
- UK English in all user-facing strings
- Document every public method with DocBlock
- Never drop or rename tables — use ALTER TABLE migrations only
