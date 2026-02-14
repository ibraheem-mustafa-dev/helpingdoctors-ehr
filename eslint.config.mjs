// eslint.config.mjs
import js from "@eslint/js";
import globals from "globals";

export default [
  // 0) Ignore heavy/irrelevant paths (flat config ignores replace .eslintignore)
  {
    ignores: [
      ".git/**",
      ".claude/**",
      ".vscode/**",
      "node_modules/**",
      "vendor/**",
      "public_html/wp-admin/**",
      "public_html/wp-includes/**",
      "public_html/core/**",
      "public_html/.private/**",
      "public_html/test-sync/**",
      "**/*.min.js",
      "**/dist/**",
      "**/build/**",
      "**/*.json",
      "**/*.md"
    ]
  },

  // 1) Base JS recommendations
  js.configs.recommended,

  // 2) Project rules (target ONLY your real JS sources)
  {
    files: [
      "public_html/wp-content/plugins/helpingdoctors-ehr-pro/assets/**/*.{js,mjs,cjs}",
      "public_html/wp-content/themes/**/*.{js,mjs,cjs}",
      // If you keep a service worker in assets or root:
      "public_html/**/*sw*.js"
    ],
    languageOptions: {
      sourceType: "script", // classic WP scripts
      globals: {
        ...globals.browser,
        ...globals.jquery,

        // WordPress/browser globals you actually use
        ajaxurl: "readonly",
        wp: "readonly",
        jQuery: "readonly",

        // Plugin globals
        hdAppointmentBooking: "readonly",
        hdBooking: "readonly",
        hdEncounter: "readonly",
        hdAnalyticsChatbot: "readonly",
        hdAccessibility: "readonly",
        hdAdmin: "readonly",
        hdAISafety: "readonly",
        hdBlocks: "readonly",
        hdDashboard: "readonly",
        hdEhr: "readonly",
        Chart: "readonly",
        GridStack: "readonly",
        gtag: "readonly",
        turnstile: "readonly",
        HDTurnstileHandler: "writable",
        dismissNotification: "readonly",
        navigator: "readonly",
        document: "readonly",
        window: "readonly"
      }
    },
    rules: {
      // Practical defaults for WP/jQuery land
      "no-unused-vars": ["warn", { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }],
      "no-undef": "error",
      "no-console": "off"
    }
  },

  // 3) Files using CommonJS module.exports pattern
  {
    files: [
      "**/accessibility.js",
      "**/code-splitting.js",
      "**/color-contrast.js",
      "**/comprehensive-lazy-loading.js",
      "**/core-web-vitals-optimization.js",
      "**/critical-rendering-path.js",
      "**/hd-analytics-chatbot.js",
      "**/hd-dashboard-customizer.js",
      "**/image-font-optimization.js",
      "**/keyboard-navigation.js",
      "**/mobile-performance.js",
      "**/offline-storage.js",
      "**/screen-reader.js",
      "**/voice-input.js"
    ],
    languageOptions: {
      sourceType: "commonjs",
      globals: {
        ...globals.browser,
        module: "readonly",
        exports: "readonly"
      }
    }
  },

  // 4) Service Worker specific override
  {
    files: ["public_html/**/*sw*.js", "public_html/**/sw.js"],
    languageOptions: {
      globals: {
        clients: "readonly",
        self: "readonly",
        caches: "readonly"
      }
    }
  }
];