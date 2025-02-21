import { defineSwitcherWidth, defineViewportHeight, isServerError } from '../utils';
import '@testing-library/jest-dom';

describe('Wallets Utils', () => {
    describe('isServerError', () => {
        test('returns true for valid server error object', () => {
            const error = { code: '123', message: 'Error message' };
            expect(isServerError(error)).toBe(true);
        });

        test('returns false for non-object input', () => {
            expect(isServerError('string')).toBe(false);
            expect(isServerError(123)).toBe(false);
            expect(isServerError(null)).toBe(false);
        });

        test('returns false for object without code property', () => {
            expect(isServerError({ message: 'Error message' })).toBe(false);
        });
    });

    describe('defineViewportHeight', () => {
        const originalInnerHeight = window.innerHeight;
        const originalSetProperty = CSSStyleDeclaration.prototype.setProperty;

        beforeEach(() => {
            Object.defineProperty(window, 'innerHeight', { configurable: true, value: 1000, writable: true });
            CSSStyleDeclaration.prototype.setProperty = jest.fn();
        });

        afterEach(() => {
            window.innerHeight = originalInnerHeight;
            CSSStyleDeclaration.prototype.setProperty = originalSetProperty;
        });

        test('sets --wallets-vh property', () => {
            defineViewportHeight();
            expect(CSSStyleDeclaration.prototype.setProperty).toHaveBeenCalledWith('--wallets-vh', '10px');
        });
    });

    describe('defineSwitcherWidth', () => {
        const originalSetProperty = CSSStyleDeclaration.prototype.setProperty;

        beforeEach(() => {
            CSSStyleDeclaration.prototype.setProperty = jest.fn();
        });

        afterEach(() => {
            CSSStyleDeclaration.prototype.setProperty = originalSetProperty;
        });

        test('sets --wallets-real-width, --wallets-demo-width, and --wallets-switcher-width properties', () => {
            const realWidth = 100;
            const demoWidth = 80;

            defineSwitcherWidth(realWidth, demoWidth);

            expect(CSSStyleDeclaration.prototype.setProperty).toHaveBeenCalledWith('--wallets-real-width', '100px');
            expect(CSSStyleDeclaration.prototype.setProperty).toHaveBeenCalledWith('--wallets-demo-width', '80px');
            expect(CSSStyleDeclaration.prototype.setProperty).toHaveBeenCalledWith('--wallets-switcher-width', '196px');
        });
    });
});
