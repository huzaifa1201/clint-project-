// Currency utility functions

export const CURRENCY_SYMBOLS: Record<string, string> = {
    USD: '$',
    PKR: 'Rs',
    INR: '₹',
    EUR: '€'
};

export const formatPrice = (price: number, currency: string = 'USD'): string => {
    const symbol = CURRENCY_SYMBOLS[currency] || '$';
    return `${symbol}${price.toFixed(2)}`;
};

export const getCurrencySymbol = (currency: string = 'USD'): string => {
    return CURRENCY_SYMBOLS[currency] || '$';
};
