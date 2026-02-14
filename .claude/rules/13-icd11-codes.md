# ICD-11 Medical Codes

**Project:** HelpingDoctors EHR Pro
**Standard:** WHO ICD-11 (NOT ICD-10)
**API:** WHO ICD-11 API with HD_WHO_ICD11_TOKEN

---

## Why ICD-11

- **Current standard** - Released 2022, replacing ICD-10
- **More specific** - Better granularity for diagnosis
- **Multilingual** - Arabic support for Gaza clinics
- **API available** - WHO provides free API

---

## API Usage

```php
// Search ICD-11 codes
function hd_search_icd11($term, $language = 'en') {
    $response = wp_remote_get(
        'https://id.who.int/icd/release/11/2024-01/mms/search?' . 
        http_build_query([
            'q' => $term,
            'language' => $language
        ]),
        [
            'headers' => [
                'Authorization' => 'Bearer ' . HD_WHO_ICD11_TOKEN,
                'Accept' => 'application/json',
                'API-Version' => 'v2',
                'Accept-Language' => $language
            ]
        ]
    );
    
    if (is_wp_error($response)) {
        return [];
    }
    
    return json_decode(wp_remote_retrieve_body($response), true);
}
```

---

## Code Validation

```php
// Validate ICD-11 code format
function hd_validate_icd11_code($code) {
    // ICD-11 format: Letter + digits, optionally with dot
    // Examples: BA00, BA00.0, BA00.00
    return preg_match('/^[A-Z][A-Z0-9]{2,5}(\.[0-9Z]{1,2})?$/', $code);
}
```

---

## Common Codes Reference

| Code | Description |
|------|-------------|
| BA00 | Acute respiratory infection |
| CA00 | Malignant neoplasms |
| DA01 | Diabetes mellitus |
| FA00 | Mood disorders |
| GA00 | Diseases of the nervous system |
| NA00 | Injuries |

---

## Offline Fallback

For Gaza clinics with poor connectivity:
- Cache common codes locally
- Allow free-text if API unavailable
- Sync codes when connection restored

---

## Checklist

- [ ] Using ICD-11, not ICD-10?
- [ ] Validating code format?
- [ ] Caching for offline use?
- [ ] Arabic language support?
