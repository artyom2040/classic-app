import {
    validators,
    composeValidators,
    validateField,
    validateForm,
    commonSchemas,
} from '../../utils/validation';

describe('Validation Utilities', () => {
    describe('validators.required', () => {
        const validator = validators.required();

        it('returns error for empty string', () => {
            const result = validator.validate('');
            expect(result.isValid).toBe(false);
            expect(result.error).not.toBeNull();
        });

        it('returns valid for non-empty string', () => {
            const result = validator.validate('hello');
            expect(result.isValid).toBe(true);
            expect(result.error).toBeNull();
        });

        it('uses custom message', () => {
            const customValidator = validators.required('Custom message');
            const result = customValidator.validate('');
            expect(result.error).toBe('Custom message');
        });
    });

    describe('validators.minLength', () => {
        const validator = validators.minLength(5);

        it('returns error for string shorter than min', () => {
            const result = validator.validate('abc');
            expect(result.isValid).toBe(false);
        });

        it('returns valid for string equal to min', () => {
            const result = validator.validate('abcde');
            expect(result.isValid).toBe(true);
        });

        it('returns valid for string longer than min', () => {
            const result = validator.validate('abcdefg');
            expect(result.isValid).toBe(true);
        });
    });

    describe('validators.maxLength', () => {
        const validator = validators.maxLength(5);

        it('returns error for string longer than max', () => {
            const result = validator.validate('abcdefg');
            expect(result.isValid).toBe(false);
        });

        it('returns valid for string equal to max', () => {
            const result = validator.validate('abcde');
            expect(result.isValid).toBe(true);
        });

        it('returns valid for string shorter than max', () => {
            const result = validator.validate('abc');
            expect(result.isValid).toBe(true);
        });
    });

    describe('validators.email', () => {
        const validator = validators.email();

        it('validates correct email format', () => {
            expect(validator.validate('test@example.com').isValid).toBe(true);
            expect(validator.validate('user.name@domain.org').isValid).toBe(true);
        });

        it('rejects invalid email format', () => {
            expect(validator.validate('notanemail').isValid).toBe(false);
            expect(validator.validate('@nodomain.com').isValid).toBe(false);
        });
    });

    describe('validators.password', () => {
        it('validates strong password', () => {
            const validator = validators.password({ minLength: 8 });
            const result = validator.validate('Password123');
            expect(result.isValid).toBe(true);
        });

        it('rejects short password', () => {
            const validator = validators.password({ minLength: 8 });
            const result = validator.validate('Pass1');
            expect(result.isValid).toBe(false);
        });

        it('rejects password without uppercase when required', () => {
            const validator = validators.password({ requireUppercase: true });
            const result = validator.validate('password123');
            expect(result.isValid).toBe(false);
        });

        it('rejects password without number when required', () => {
            const validator = validators.password({ requireNumber: true });
            const result = validator.validate('PasswordNoNumber');
            expect(result.isValid).toBe(false);
        });
    });

    describe('validators.matches', () => {
        it('validates matching values', () => {
            const passwordValue = 'test123';
            const validator = validators.matches(() => passwordValue);
            expect(validator.validate('test123').isValid).toBe(true);
        });

        it('rejects non-matching values', () => {
            const passwordValue = 'test123';
            const validator = validators.matches(() => passwordValue);
            expect(validator.validate('different').isValid).toBe(false);
        });
    });

    describe('validators.pattern', () => {
        const validator = validators.pattern(/^[A-Z]+$/);

        it('validates matching pattern', () => {
            expect(validator.validate('ALLCAPS').isValid).toBe(true);
        });

        it('rejects non-matching pattern', () => {
            expect(validator.validate('lowercase').isValid).toBe(false);
        });
    });

    describe('validators.url', () => {
        const validator = validators.url();

        it('validates correct URL format', () => {
            expect(validator.validate('https://example.com').isValid).toBe(true);
            expect(validator.validate('http://sub.domain.org/path').isValid).toBe(true);
        });

        it('rejects invalid URL format', () => {
            expect(validator.validate('not-a-url').isValid).toBe(false);
        });
    });

    describe('validators.phone', () => {
        const validator = validators.phone();

        it('validates phone numbers', () => {
            expect(validator.validate('123-456-7890').isValid).toBe(true);
            expect(validator.validate('+1 123 456 7890').isValid).toBe(true);
        });

        it('rejects invalid phone numbers', () => {
            expect(validator.validate('123').isValid).toBe(false);
        });
    });

    describe('composeValidators', () => {
        it('runs validators in order and returns first error', () => {
            const composed = composeValidators(
                validators.required(),
                validators.minLength(5)
            );
            expect(composed.validate('').isValid).toBe(false);
            expect(composed.validate('abc').isValid).toBe(false);
            expect(composed.validate('abcde').isValid).toBe(true);
        });

        it('returns valid when all validators pass', () => {
            const composed = composeValidators(
                validators.required(),
                validators.minLength(3),
                validators.maxLength(10)
            );
            expect(composed.validate('hello').isValid).toBe(true);
        });
    });

    describe('validateField', () => {
        it('validates a single field', () => {
            const validation = validators.email();
            const result = validateField('test@example.com', validation);
            expect(result.isValid).toBe(true);
        });

        it('returns error for invalid field', () => {
            const validation = validators.email();
            const result = validateField('notanemail', validation);
            expect(result.isValid).toBe(false);
            expect(result.error).not.toBeNull();
        });
    });

    describe('validateForm', () => {
        const schema = {
            email: composeValidators(validators.required(), validators.email()),
            password: composeValidators(validators.required(), validators.minLength(8)),
        };

        it('validates entire form', () => {
            const result = validateForm({
                email: 'test@example.com',
                password: 'password123',
            }, schema);
            expect(result.isValid).toBe(true);
        });

        it('returns all field errors', () => {
            const result = validateForm({
                email: 'notvalid',
                password: 'short',
            }, schema);
            expect(result.isValid).toBe(false);
            expect(result.errors.email).not.toBeNull();
            expect(result.errors.password).not.toBeNull();
        });
    });

    describe('commonSchemas', () => {
        it('provides login schema', () => {
            expect(commonSchemas.login).toBeDefined();
            expect(commonSchemas.login.email).toBeDefined();
            expect(commonSchemas.login.password).toBeDefined();
        });

        it('provides register schema', () => {
            expect(commonSchemas.register).toBeDefined();
        });

        it('provides resetPassword schema', () => {
            expect(commonSchemas.resetPassword).toBeDefined();
        });
    });
});
