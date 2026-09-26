// script.js
// Profile Settings form: pure validation helpers + DOM wiring.
// The helpers are pure functions so they can be unit tested with
// Node's built-in test runner (see /test), with no extra dependencies.

'use strict';

var BIO_MAX_LENGTH = 160;

// Practical email format check: something@something.tld
var EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateProfile(values) {
    var fullName = String((values && values.fullName) || '').trim();
    var email = String((values && values.email) || '').trim();
    var bio = String((values && values.bio) || '');
    var errors = {};

    if (!fullName) {
        errors.fullName = 'Full name is required.';
    }

    if (!email) {
        errors.email = 'Email is required.';
    } else if (!EMAIL_PATTERN.test(email)) {
        errors.email = 'Enter a valid email address (for example, name@example.com).';
    }

    // Bio is optional, but must not exceed the maximum length.
    if (bio.length > BIO_MAX_LENGTH) {
        errors.bio = 'Bio must not exceed ' + BIO_MAX_LENGTH + ' characters.';
    }

    return {
        errors: errors,
        isValid: Object.keys(errors).length === 0
    };
}

// Decides whether a submission should go through. Invalid input is never
// submitted; the entered values are returned untouched so the form can
// preserve what the user typed.
function submitProfile(values) {
    var source = values || {};
    var validation = validateProfile(source);

    if (!validation.isValid) {
        return { submitted: false, errors: validation.errors, profile: null };
    }

    return {
        submitted: true,
        errors: {},
        profile: {
            fullName: String(source.fullName).trim(),
            email: String(source.email).trim(),
            bio: String(source.bio || '')
        }
    };
}

// Prevents the bio from ever exceeding the maximum length.
function clampBio(value) {
    return String(value || '').slice(0, BIO_MAX_LENGTH);
}

// Characters left before the bio reaches its maximum length.
function getRemainingBio(value) {
    return Math.max(0, BIO_MAX_LENGTH - String(value || '').length);
}

// Export for the Node test runner; a plain browser has no `module`.
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        BIO_MAX_LENGTH: BIO_MAX_LENGTH,
        EMAIL_PATTERN: EMAIL_PATTERN,
        validateProfile: validateProfile,
        submitProfile: submitProfile,
        clampBio: clampBio,
        getRemainingBio: getRemainingBio
    };
}

function initProfileForm() {
    var form = document.getElementById('profile-settings-form');
    if (!form) {
        return;
    }

    var nameInput = document.getElementById('full-name');
    var emailInput = document.getElementById('email');
    var bioInput = document.getElementById('bio');
    var bioCount = document.getElementById('bio-count');
    var statusBox = document.getElementById('form-status');

    var fields = {
        fullName: { input: nameInput, error: document.getElementById('full-name-error') },
        email: { input: emailInput, error: document.getElementById('email-error') },
        bio: { input: bioInput, error: document.getElementById('bio-error') }
    };

    function readValues() {
        return {
            fullName: nameInput.value,
            email: emailInput.value,
            bio: bioInput.value
        };
    }

    function showFieldError(key, message) {
        var field = fields[key];
        field.error.textContent = message;
        field.error.hidden = false;
        field.input.setAttribute('aria-invalid', 'true');
    }

    function clearFieldError(key) {
        var field = fields[key];
        field.error.textContent = '';
        field.error.hidden = true;
        field.input.removeAttribute('aria-invalid');
    }

    function updateBioCount() {
        bioCount.textContent = String(getRemainingBio(bioInput.value));
    }

    form.addEventListener('submit', function (event) {
        // Never let the browser submit invalid or unvalidated data.
        event.preventDefault();

        var result = submitProfile(readValues());
        var keys = ['fullName', 'email', 'bio'];

        if (!result.submitted) {
            statusBox.hidden = true;
            keys.forEach(function (key) {
                if (result.errors[key]) {
                    showFieldError(key, result.errors[key]);
                } else {
                    clearFieldError(key);
                }
            });

            // Move focus to the first invalid field for keyboard/screen reader users.
            var firstInvalidKey = keys.find(function (key) {
                return result.errors[key];
            });
            if (firstInvalidKey) {
                fields[firstInvalidKey].input.focus();
            }
            return;
        }

        // Valid submission: clear errors and show the success state.
        // Entered values are preserved on screen.
        keys.forEach(clearFieldError);
        statusBox.hidden = false;
    });

    // Keep the bio within its limit and re-validate a field only once it
    // already shows an error, so the user is not interrupted while typing.
    Object.keys(fields).forEach(function (key) {
        fields[key].input.addEventListener('input', function () {
            statusBox.hidden = true;

            if (key === 'bio') {
                var clamped = clampBio(bioInput.value);
                if (clamped !== bioInput.value) {
                    bioInput.value = clamped;
                }
                updateBioCount();
            }

            if (!fields[key].error.hidden) {
                var errors = validateProfile(readValues()).errors;
                if (errors[key]) {
                    showFieldError(key, errors[key]);
                } else {
                    clearFieldError(key);
                }
            }
        });
    });

    updateBioCount();
}

if (typeof document !== 'undefined' && typeof document.addEventListener === 'function') {
    document.addEventListener('DOMContentLoaded', initProfileForm);
}

