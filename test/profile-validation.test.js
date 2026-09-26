// Tests for the Profile Settings form validation and submission behavior.
// Uses Node's built-in test runner (node:test) — no extra dependencies.

'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');

const {
    BIO_MAX_LENGTH,
    validateProfile,
    submitProfile,
    clampBio,
    getRemainingBio
} = require('../my-capstone-app/script.js');

const validProfile = () => ({
    fullName: 'Jane Doe',
    email: 'jane.doe@example.com',
    bio: 'Front-end developer who loves accessible UIs.'
});

// ---------------------------------------------------------------------------
// Validation: Full Name
// ---------------------------------------------------------------------------

test('full name is required', () => {
    const { errors, isValid } = validateProfile({ ...validProfile(), fullName: '' });

    assert.equal(isValid, false);
    assert.ok(errors.fullName);
    assert.match(errors.fullName, /required/i);
});

test('full name of only whitespace counts as empty', () => {
    const { errors, isValid } = validateProfile({ ...validProfile(), fullName: '   ' });

    assert.equal(isValid, false);
    assert.ok(errors.fullName);
});

// ---------------------------------------------------------------------------
// Validation: Email
// ---------------------------------------------------------------------------

test('email is required', () => {
    const { errors, isValid } = validateProfile({ ...validProfile(), email: '' });

    assert.equal(isValid, false);
    assert.ok(errors.email);
    assert.match(errors.email, /required/i);
});

test('email must use a valid format', () => {
    const invalidEmails = ['not-an-email', 'foo@bar', 'foo@.com', 'foo@example.', '@example.com'];

    for (const email of invalidEmails) {
        const { errors, isValid } = validateProfile({ ...validProfile(), email });
        assert.equal(isValid, false, `expected "${email}" to be rejected`);
        assert.ok(errors.email, `expected an error message for "${email}"`);
        assert.match(errors.email, /valid email/i);
    }
});

test('valid email formats pass validation', () => {
    const validEmails = ['jane@example.com', 'jane.doe@example.co.uk', 'j+tag@sub.example.org'];

    for (const email of validEmails) {
        const { errors, isValid } = validateProfile({ ...validProfile(), email });
        assert.equal(isValid, true, `expected "${email}" to be accepted`);
        assert.deepEqual(errors, {});
    }
});

// ---------------------------------------------------------------------------
// Validation: Bio (optional, max 160 characters)
// ---------------------------------------------------------------------------

test('bio is optional — empty bio passes validation', () => {
    const { errors, isValid } = validateProfile({ ...validProfile(), bio: '' });

    assert.equal(isValid, true);
    assert.deepEqual(errors, {});
});

test('bio at exactly 160 characters passes validation', () => {
    const { errors, isValid } = validateProfile({ ...validProfile(), bio: 'a'.repeat(160) });

    assert.equal(isValid, true);
    assert.deepEqual(errors, {});
});

test('bio over 160 characters fails validation with a clear message', () => {
    const { errors, isValid } = validateProfile({ ...validProfile(), bio: 'a'.repeat(161) });

    assert.equal(isValid, false);
    assert.ok(errors.bio);
    assert.match(errors.bio, /160/);
});

test('all applicable errors are reported at the same time', () => {
    const { errors, isValid } = validateProfile({ fullName: '', email: 'nope', bio: 'b'.repeat(200) });

    assert.equal(isValid, false);
    assert.ok(errors.fullName);
    assert.ok(errors.email);
    assert.ok(errors.bio);
});

// ---------------------------------------------------------------------------
// Submission behavior
// ---------------------------------------------------------------------------

test('invalid values are not submitted', () => {
    const result = submitProfile({ fullName: '', email: '', bio: '' });

    assert.equal(result.submitted, false);
    assert.equal(result.profile, null);
    assert.ok(result.errors.fullName);
    assert.ok(result.errors.email);
});

test('invalid submission preserves the entered values (form is not reset)', () => {
    const values = { fullName: 'J', email: 'bad-email', bio: 'short' };
    const result = submitProfile(values);

    assert.equal(result.submitted, false);
    // The source object is untouched, so the form can keep showing it.
    assert.deepEqual(values, { fullName: 'J', email: 'bad-email', bio: 'short' });
});

test('valid values are submitted with trimmed name and email', () => {
    const result = submitProfile({
        fullName: '  Jane Doe  ',
        email: '  jane@example.com  ',
        bio: 'Hello'
    });

    assert.equal(result.submitted, true);
    assert.deepEqual(result.errors, {});
    assert.deepEqual(result.profile, {
        fullName: 'Jane Doe',
        email: 'jane@example.com',
        bio: 'Hello'
    });
});

test('valid submission with an empty optional bio still succeeds', () => {
    const result = submitProfile({ fullName: 'Jane Doe', email: 'jane@example.com', bio: '' });

    assert.equal(result.submitted, true);
    assert.equal(result.profile.bio, '');
});

// ---------------------------------------------------------------------------
// Bio character limit helpers
// ---------------------------------------------------------------------------

test('clampBio prevents the bio from exceeding 160 characters', () => {
    assert.equal(clampBio('a'.repeat(200)).length, BIO_MAX_LENGTH);
    assert.equal(clampBio('short'), 'short');
    assert.equal(clampBio('a'.repeat(200)), 'a'.repeat(160));
    assert.equal(clampBio(null), '');
});

test('getRemainingBio reports the remaining character count', () => {
    assert.equal(getRemainingBio(''), 160);
    assert.equal(getRemainingBio('abc'), 157);
    assert.equal(getRemainingBio('a'.repeat(160)), 0);
    assert.equal(getRemainingBio('a'.repeat(161)), 0);
});

