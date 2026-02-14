# Testing Requirements

**Project:** HelpingDoctors EHR Pro
**Methodology:** Test-Driven Development (TDD)
**Tools:** PHPUnit, PHPCS, PHPStan

---

## TDD Workflow

```
1. Write failing test
2. Run test (confirm it fails)
3. Write minimum code to pass
4. Run test (confirm it passes)
5. Refactor
6. Run all tests (confirm nothing broke)
```

---

## Required Tests

### Unit Tests (PHPUnit)
```php
class PatientTest extends WP_UnitTestCase {
    
    public function test_create_patient_requires_mrn() {
        $this->expectException(InvalidArgumentException::class);
        hd_create_patient(['first_name' => 'John']);
    }
    
    public function test_create_patient_returns_id() {
        $patient_id = hd_create_patient([
            'mrn' => 'MRN-001',
            'first_name' => 'John',
            'last_name' => 'Doe',
            'date_of_birth' => '1990-01-01'
        ]);
        
        $this->assertIsInt($patient_id);
        $this->assertGreaterThan(0, $patient_id);
    }
    
    public function test_soft_delete_patient() {
        $patient_id = $this->factory->patient->create();
        
        hd_delete_patient($patient_id);
        
        $patient = hd_get_patient($patient_id);
        $this->assertNull($patient); // Should not return deleted
        
        $deleted = hd_get_patient($patient_id, true); // Include deleted
        $this->assertNotNull($deleted->deleted_at);
    }
}
```

---

## Code Quality Tools

### PHPCS (WordPress Standards)
```bash
# Run PHPCS
vendor/bin/phpcs --standard=WordPress path/to/file.php

# Auto-fix where possible
vendor/bin/phpcbf --standard=WordPress path/to/file.php
```

### PHPStan (Static Analysis)
```bash
# Run PHPStan level 4-5
vendor/bin/phpstan analyse -l 5 includes/
```

---

## Test Coverage Requirements

| Area | Minimum Coverage |
|------|------------------|
| Patient CRUD | 90% |
| Authentication | 95% |
| Encryption | 100% |
| API Endpoints | 85% |
| Database Operations | 90% |

---

## Before Deployment Checklist

- [ ] All tests passing?
- [ ] PHPCS reports no errors?
- [ ] PHPStan level 4+ passes?
- [ ] New code has tests?
- [ ] Edge cases covered?
