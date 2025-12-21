// Country-wise Payment Methods Database

export const PAYMENT_METHODS_BY_COUNTRY = {
    Pakistan: [
        'Easypaisa',
        'JazzCash',
        'Bank Transfer (IBFT)',
        'Raast',
        'Debit Card',
        'Credit Card',
        'Cash on Delivery (COD)',
        'ATM Card',
        'Mobile Banking Apps'
    ],
    India: [
        'UPI (Google Pay)',
        'UPI (PhonePe)',
        'UPI (Paytm)',
        'UPI (BHIM)',
        'Paytm Wallet',
        'PhonePe Wallet',
        'Debit Card',
        'Credit Card',
        'Net Banking',
        'IMPS',
        'NEFT',
        'RTGS',
        'Cash on Delivery (COD)',
        'RuPay Card'
    ],
    'United Kingdom': [
        'Debit Card',
        'Credit Card',
        'Apple Pay',
        'Google Pay',
        'Bank Transfer (Faster Payments)',
        'PayPal',
        'Direct Debit',
        'Klarna',
        'Clearpay',
        'Laybuy',
        'Cash'
    ],
    'United States': [
        'Debit Card',
        'Credit Card',
        'ACH Bank Transfer',
        'PayPal',
        'Apple Pay',
        'Google Pay',
        'Venmo',
        'Cash App',
        'Zelle',
        'Checks',
        'Affirm',
        'Klarna',
        'Afterpay'
    ],
    Europe: [
        'SEPA Bank Transfer',
        'Debit Card',
        'Credit Card',
        'PayPal',
        'Apple Pay',
        'Google Pay',
        'Klarna',
        'SOFORT',
        'Giropay',
        'iDEAL',
        'Bancontact',
        'Carte Bancaire',
        'Bizum',
        'BLIK',
        'Swish',
        'Vipps',
        'MobilePay'
    ]
};

export type CountryName = keyof typeof PAYMENT_METHODS_BY_COUNTRY;

export const COUNTRIES: CountryName[] = [
    'Pakistan',
    'India',
    'United Kingdom',
    'United States',
    'Europe'
];
