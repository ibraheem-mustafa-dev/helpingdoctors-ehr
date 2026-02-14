# IMPLEMENTATION: Video Consultation Patterns

**Source:** ADR-006-gaza-video-optimization.md
**Status:** ✅ Complete (100% field test success)
**Last Updated:** December 2025

---

## Overview

HelpingDoctors EHR uses **Jitsi Meet** for video consultations, optimised for Gaza's 2G/3G networks with **360p default resolution** (0.5 Mbps bandwidth). This is free, open-source, and requires no app download.

**Key Stats:**
- 100% field test success rate
- 480 Kbps average bandwidth usage
- $90/month self-hosted vs $200+ Zoom
- Works on 3G networks (384 Kbps - 2 Mbps)

---

## File Locations

| File | Purpose |
|------|---------|
| `includes/integrations/class-hd-jitsi-integration.php` | Core Jitsi integration |
| `includes/communication/class-hd-twilio-integration.php` | SMS patient invitations |
| `templates/page-video-consultation.php` | Provider consultation UI |
| `assets/js/hd-video-consultation.js` | Frontend JavaScript |

---

## Gaza-Optimised Jitsi Configuration

### Core Configuration (Lines 74-118)

```javascript
/**
 * File: assets/js/hd-video-consultation.js
 * Gaza-optimised Jitsi configuration
 */
const gazaConfig = {
    // Server configuration
    hosts: {
        domain: HD_JITSI_DOMAIN, // 'meet.jit.si' or self-hosted
        muc: 'conference.' + HD_JITSI_DOMAIN
    },

    // CRITICAL: Skip prejoin page (faster connection)
    prejoinPageEnabled: false, // Line 84

    // BANDWIDTH OPTIMIZATION: Force 360p resolution
    resolution: 360, // Line 86 - 640x360 pixels

    // Video constraints (prevent auto-upgrade to HD)
    constraints: {
        video: {
            height: { ideal: 360, max: 720 }, // Lines 88-90
            width: { ideal: 480, max: 1280 },
            frameRate: { ideal: 15, max: 24 } // Reduce for bandwidth
        }
    },

    // BANDWIDTH SAVING: Disable video backgrounds
    disableVideoBackground: true, // Line 103 - Saves ~200 Kbps

    // Start with video enabled (for medical exam)
    startAudioOnly: false,

    // Minimal UI (essential buttons only)
    toolbarButtons: [ // Lines 104-112
        'microphone',  // Mute/unmute
        'camera',      // Video on/off
        'hangup',      // End call
        'chat',        // Text chat fallback
        'raisehand',   // Patient can signal
        'tileview'     // Grid view
    ],

    // Disable high-bandwidth features
    disableDeepLinking: true,
    disableInviteFunctions: true,
    disableProfile: true,

    // Audio quality (CRITICAL for medical consultation)
    audioQuality: {
        stereo: false, // Mono saves bandwidth
        opusMaxAverageBitrate: 20000 // 20 Kbps (voice-optimised)
    },

    // P2P mode (direct peer-to-peer, lower latency)
    p2p: {
        enabled: true,
        stunServers: [
            { urls: 'stun:meet-jit-si-turnrelay.jitsi.net:443' }
        ]
    },

    // Default language
    defaultLanguage: 'ar', // Arabic for Gaza

    // Disable analytics (privacy + bandwidth)
    disableThirdPartyRequests: true,
    analytics: {
        disabled: true
    }
};
```

---

## Bandwidth Breakdown

### Total Bandwidth for 360p Consultation

| Component | Bandwidth | Notes |
|-----------|-----------|-------|
| **Video (360p)** | 400 Kbps | 640x360 @ 15fps |
| **Audio (mono)** | 20 Kbps | Opus codec, voice-optimised |
| **Signalling** | 10 Kbps | Connection management |
| **Overhead** | 70 Kbps | TCP/IP (~15%) |
| **TOTAL** | **~500 Kbps** | **0.5 Mbps** |

### Gaza Network Compatibility

| Network Type | Typical Speed | Video Status |
|--------------|---------------|--------------|
| **2G (GPRS)** | 56-114 Kbps | ❌ Audio-only mode |
| **2G (EDGE)** | 128-256 Kbps | ⚠️ Marginal |
| **3G (UMTS)** | 384 Kbps - 2 Mbps | ✅ **Works well** |
| **3G (HSPA)** | 1-3 Mbps | ✅ Excellent |
| **4G (LTE)** | 5-50 Mbps | ✅ Excellent |

### Savings vs Standard HD

| Resolution | Bandwidth | Gaza Compatible | vs 720p |
|------------|-----------|-----------------|---------|
| 720p HD | 1.5 Mbps | ❌ No | Baseline |
| 480p SD | 0.8 Mbps | ⚠️ Marginal | -47% |
| **360p** | **0.5 Mbps** | ✅ **Yes** | **-67%** |
| 240p | 0.3 Mbps | ✅ Yes | -80% (too pixelated) |

---

## Patient Invitation System

### SMS Invitation (Lines 123-150)

```php
<?php
/**
 * File: includes/integrations/class-hd-jitsi-integration.php
 * Lines: 123-150
 */

public function send_patient_invitation(int $consultation_id): bool|WP_Error {
    global $wpdb;

    // 1. Get consultation details
    $consultation = $wpdb->get_row($wpdb->prepare("
        SELECT * FROM {$wpdb->prefix}hd_video_consultations 
        WHERE consultation_id = %d
    ", $consultation_id));

    if (!$consultation) {
        return new WP_Error('not_found', 'Consultation not found');
    }

    // 2. Get patient phone number
    $patient_phone = get_user_meta($consultation->patient_id, 'phone', true);
    
    if (empty($patient_phone)) {
        return new WP_Error('no_phone', 'Patient has no phone number');
    }

    // 3. Generate unique join URL (Line 141)
    $join_url = $this->get_patient_url($consultation_id);
    // Format: https://meet.jit.si/hd_consultation_123_abc456xyz

    // 4. Compose SMS message (Arabic + English)
    $message = sprintf(
        "Your doctor is ready for your video consultation. Join here: %s\n\n" .
        "طبيبك جاهز للاستشارة. انضم هنا: %s",
        $join_url,
        $join_url
    );

    // 5. Send via Twilio (Line 148)
    $twilio = new HD_Twilio_Integration();
    $result = $twilio->send_sms($patient_phone, $message);

    // 6. Log invitation
    HD_Audit_Logger::log('video_consultation_invite', [
        'consultation_id' => $consultation_id,
        'patient_id' => $consultation->patient_id,
        'sms_status' => $result ? 'sent' : 'failed',
    ]);

    return $result;
}
```

### Patient Join Flow

```
┌─────────────────────┐
│ Provider creates    │
│ consultation in EHR │
└─────────┬───────────┘
          │
          ▼
┌─────────────────────┐
│ System generates    │
│ unique Jitsi room   │
└─────────┬───────────┘
          │
          ▼
┌─────────────────────┐
│ SMS sent to patient │
│ (Arabic + English)  │
└─────────┬───────────┘
          │
          ▼
┌─────────────────────┐
│ Patient clicks link │
│ on smartphone       │
└─────────┬───────────┘
          │
          ▼
┌─────────────────────┐
│ Browser opens Jitsi │
│ (no app download)   │
└─────────┬───────────┘
          │
          ▼
┌─────────────────────┐
│ Patient joins call  │
│ (no account needed) │
└─────────────────────┘
```

---

## Provider Interface

### Consultation Page Template

```php
<?php
/**
 * File: templates/page-video-consultation.php
 */
?>
<div class="video-consultation-container">
    <!-- Left: Jitsi Video Embed -->
    <div class="video-panel">
        <div id="jitsi-meet-container"></div>
        <div class="video-controls">
            <button class="btn-send-invite" data-id="<?php echo $consultation_id; ?>">
                <svg class="health-icon"><use xlink:href="#hi-sms"/></svg>
                Send Patient Invite
            </button>
            <button class="btn-end-consultation">
                <svg class="health-icon health-icon-danger"><use xlink:href="#hi-phone-end"/></svg>
                End Consultation
            </button>
        </div>
    </div>

    <!-- Right: Patient Summary Sidebar -->
    <div class="patient-summary-sidebar">
        <h3><?php echo esc_html($patient->display_name); ?></h3>
        
        <div class="patient-demographics">
            <p><strong>Age:</strong> <?php echo $patient_age; ?></p>
            <p><strong>Gender:</strong> <?php echo $patient_gender; ?></p>
            <p><strong>MRN:</strong> <?php echo $patient_mrn; ?></p>
        </div>

        <div class="patient-allergies alert-danger">
            <h4>⚠️ Allergies</h4>
            <?php foreach ($allergies as $allergy): ?>
                <span class="badge badge-danger"><?php echo esc_html($allergy); ?></span>
            <?php endforeach; ?>
        </div>

        <div class="patient-vitals">
            <h4>Recent Vitals</h4>
            <table class="vitals-table">
                <tr><td>BP</td><td><?php echo $vitals->blood_pressure; ?></td></tr>
                <tr><td>Temp</td><td><?php echo $vitals->temperature; ?>°C</td></tr>
                <tr><td>Weight</td><td><?php echo $vitals->weight; ?> kg</td></tr>
            </table>
        </div>

        <div class="patient-medications">
            <h4>Active Medications</h4>
            <ul>
                <?php foreach ($medications as $med): ?>
                    <li><?php echo esc_html($med->name . ' ' . $med->dosage); ?></li>
                <?php endforeach; ?>
            </ul>
        </div>

        <!-- Consultation Notes Form -->
        <div class="consultation-notes">
            <h4>Consultation Notes</h4>
            <textarea id="consultation_notes" rows="10"><?php 
                echo esc_textarea($consultation->notes ?? ''); 
            ?></textarea>
            <button class="btn-save-notes">Save Notes</button>
            <span class="autosave-status">Auto-saving every 30s</span>
        </div>
    </div>
</div>

<script>
// Initialise Jitsi with Gaza-optimised config
const api = new JitsiMeetExternalAPI('<?php echo HD_JITSI_DOMAIN; ?>', {
    roomName: '<?php echo esc_js($consultation->room_name); ?>',
    width: '100%',
    height: 600,
    parentNode: document.querySelector('#jitsi-meet-container'),
    configOverwrite: <?php echo wp_json_encode($gaza_config); ?>,
    interfaceConfigOverwrite: {
        SHOW_JITSI_WATERMARK: false,
        SHOW_WATERMARK_FOR_GUESTS: false,
        TOOLBAR_BUTTONS: ['microphone', 'camera', 'hangup', 'chat', 'raisehand']
    },
    userInfo: {
        displayName: '<?php echo esc_js($provider_name); ?>'
    }
});

// Auto-save notes every 30 seconds
setInterval(() => saveConsultationNotes(), 30000);
</script>
```

---

## Medical Use Case Guidelines

### Suitable for Video Consultation ✅

| Use Case | Why Suitable |
|----------|--------------|
| Follow-up appointments | Stable patients, no physical exam needed |
| Medication reviews | Discuss side effects, adjust dosages |
| Mental health | Talk therapy, counselling |
| Chronic disease management | Diabetes, hypertension check-ins |
| Post-op follow-up | Wound visible via camera |
| Results discussion | Lab results, imaging findings |
| Patient education | Explain conditions, treatments |

### NOT Suitable for Video ❌

| Use Case | Why Not Suitable |
|----------|------------------|
| Emergency care | Requires physical intervention |
| Physical examination | Cannot palpate, auscultate |
| Procedures | Injections, suturing, etc. |
| Acute conditions | Need immediate hands-on care |
| Paediatric assessment | Children difficult via video |

---

## Field Test Results

### Gaza Network Performance

| Metric | Target | Actual | Status |
|--------|--------|--------|--------|
| **Connection success** | >90% | **100%** | ✅ |
| **Average bandwidth** | <600 Kbps | **480 Kbps** | ✅ |
| **Call duration** | >10 min | **15+ min** | ✅ |
| **Patient satisfaction** | >80% | **92%** | ✅ |

### Test Conditions

- Location: Gaza City clinics
- Network: 3G (Jawwal, Ooredoo)
- Devices: Android smartphones (budget models)
- Duration: 2-week pilot, 50+ consultations

---

## Cost Analysis

### Self-Hosted vs Commercial

| Solution | Monthly Cost | Annual Cost |
|----------|--------------|-------------|
| **Jitsi (self-hosted)** | **$90** | **$1,080** |
| Zoom (HIPAA) | $200+ | $2,400+ |
| Google Meet (Business) | $144 | $1,728 |
| Microsoft Teams | $150 | $1,800 |

**Savings:** $1,320+/year vs Zoom

### Self-Hosted Requirements

- VPS: $20-40/month (DigitalOcean, Linode)
- Domain: $12/year
- SSL: Free (Let's Encrypt)
- Maintenance: ~2 hours/month

---

## AJAX Endpoints

| Action | Purpose |
|--------|---------|
| `hd_create_video_consultation` | Create new consultation |
| `hd_get_consultation_status` | Check if patient joined |
| `hd_send_patient_invite` | Send SMS invitation |
| `hd_save_consultation_notes` | Auto-save notes |
| `hd_end_consultation` | End and log consultation |
| `hd_get_patient_summary` | Load patient sidebar data |

---

## Related Documentation

- [ADR-006: Gaza Video Optimization](../decisions/ADR-006-gaza-video-optimization.md)
- [IMPLEMENTATION-SECURITY-PATTERNS.md](./security/IMPLEMENTATION-SECURITY-PATTERNS.md)
- [SMS Integration Guide](../integrations/TWILIO-GUIDE.md)
