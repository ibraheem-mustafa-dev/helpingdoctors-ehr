export default {
  extends: ['stylelint-config-standard'],
  rules: {
    // WordPress-friendly rules
    'no-descending-specificity': null,
    'selector-class-pattern': null,
    'custom-property-pattern': null,
    'alpha-value-notation': 'number', // For WP compatibility
    'color-function-notation': 'legacy', // For WP compatibility
    'property-no-deprecated': null, // Allow clip for sr-only pattern
    'keyframe-declaration-no-important': null, // Sometimes needed
    'no-duplicate-selectors': null, // Allow duplicates for specificity overrides
    'font-family-no-missing-generic-family-keyword': null, // Icon fonts
    'media-feature-name-value-no-unknown': null, // Browser compat
    'declaration-block-single-line-max-declarations': null, // Formatting
    'declaration-block-no-duplicate-properties': [true, { ignore: ['consecutive-duplicates-with-different-values'] }], // Allow vendor prefixes
    'keyframes-name-pattern': null, // Allow camelCase animation names
    'at-rule-empty-line-before': null,
    'rule-empty-line-before': null,
  },
  ignoreFiles: [
    '**/*.min.css',
    '**/vendor/**',
    '**/node_modules/**',
    '**/public_html/wp-admin/**',
    '**/public_html/wp-includes/**',
    '**/public_html/wp-content/themes/**', // Ignore all themes
    '**/public_html/wp-content/plugins/*/assets/build/**', // Ignore built files
    '!**/public_html/wp-content/plugins/helpingdoctors-ehr-pro/**', // Include our plugin
  ],
};
