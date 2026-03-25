# ICD-11 Medical Codes

**Project:** Medinova
**Standard:** WHO ICD-11 (NOT ICD-10)
**API:** WHO ICD-11 API via NestJS HttpService

---

## Why ICD-11

- Current WHO standard (released 2022, replacing ICD-10)
- Better granularity for diagnosis coding
- Multilingual — Arabic, French, Spanish, and more
- Free API from WHO
- ICD-10 crossmap available for transitioning clinics

---

## ICD11Service

```typescript
@Injectable()
export class Icd11Service {
  private readonly baseUrl = 'https://id.who.int/icd/release/11/2024-01/mms';

  constructor(
    private readonly http: HttpService,
    private readonly redis: RedisService,
    private readonly config: ConfigService,
  ) {}

  async search(term: string, language = 'en'): Promise<Icd11SearchResult[]> {
    const cacheKey = `icd11:search:${language}:${term}`;
    const cached = await this.redis.get(cacheKey);
    if (cached) return JSON.parse(cached);

    const { data } = await firstValueFrom(
      this.http.get<Icd11ApiResponse>(`${this.baseUrl}/search`, {
        params: { q: term, language },
        headers: {
          Authorization: `Bearer ${this.config.get('WHO_ICD11_TOKEN')}`,
          Accept: 'application/json',
          'API-Version': 'v2',
          'Accept-Language': language,
        },
      }),
    );

    const results = data.destinationEntities.map((e) => ({
      code: e.theCode,
      title: e.title,
      matchScore: e.score,
    }));

    await this.redis.set(cacheKey, JSON.stringify(results), 'EX', 86400); // 24h TTL
    return results;
  }
}
```

---

## Response Types

```typescript
interface Icd11SearchResult {
  code: string;       // e.g. "BA00.0"
  title: string;      // e.g. "Acute nasopharyngitis"
  matchScore: number;
}

interface Icd11ApiResponse {
  destinationEntities: Array<{
    theCode: string;
    title: string;
    score: number;
  }>;
}
```

---

## Code Validation

```typescript
function isValidIcd11Code(code: string): boolean {
  // ICD-11 format: Letter + alphanumeric, optionally with dot
  // Examples: BA00, BA00.0, BA00.0Z
  return /^[A-Z][A-Z0-9]{2,5}(\.[0-9Z]{1,2})?$/.test(code);
}
```

---

## Offline Fallback

Redis cache serves as the primary offline strategy. If the WHO API is unreachable:

1. Return cached results if available (even if expired)
2. Allow free-text diagnosis entry with `icd11Code: null`
3. Queue unresolved entries for code assignment when connectivity returns
4. Pre-seed Redis with ~500 most common codes per specialty on tenant creation

---

## Arabic Language Support

Pass `language: 'ar'` to search. WHO API returns Arabic titles natively. Store the user's preferred language in their profile and default all ICD-11 lookups to it.

---

## Checklist

- [ ] Using ICD-11, not ICD-10?
- [ ] Results cached in Redis with 24h TTL?
- [ ] Offline fallback handles API unavailability?
- [ ] Arabic + other languages supported via Accept-Language?
- [ ] Code format validated before storage?
