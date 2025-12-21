import React, { useState } from 'react';
import { Globe, Check } from 'lucide-react';
import { PAYMENT_METHODS_BY_COUNTRY, COUNTRIES, CountryName } from '../data/paymentMethods';

interface CountryPaymentSelectorProps {
    onMethodsSelected: (methods: string[]) => void;
}

const CountryPaymentSelector: React.FC<CountryPaymentSelectorProps> = ({ onMethodsSelected }) => {
    const [selectedCountry, setSelectedCountry] = useState<CountryName>('Pakistan');
    const [selectedMethods, setSelectedMethods] = useState<string[]>([]);

    const availableMethods = PAYMENT_METHODS_BY_COUNTRY[selectedCountry];

    const toggleMethod = (method: string) => {
        const updated = selectedMethods.includes(method)
            ? selectedMethods.filter(m => m !== method)
            : [...selectedMethods, method];

        setSelectedMethods(updated);
        onMethodsSelected(updated);
    };

    const selectAll = () => {
        setSelectedMethods(availableMethods);
        onMethodsSelected(availableMethods);
    };

    const clearAll = () => {
        setSelectedMethods([]);
        onMethodsSelected([]);
    };

    return (
        <div className="space-y-6">
            {/* Country Selector */}
            <div className="space-y-3">
                <label className="text-[10px] font-black uppercase text-zinc-600 tracking-[0.2em] flex items-center gap-2">
                    <Globe size={14} /> Select Country/Region
                </label>
                <select
                    value={selectedCountry}
                    onChange={(e) => {
                        setSelectedCountry(e.target.value as CountryName);
                        setSelectedMethods([]);
                        onMethodsSelected([]);
                    }}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 outline-none focus:border-purple-500 text-sm font-bold text-zinc-300 cursor-pointer"
                >
                    {COUNTRIES.map(country => (
                        <option key={country} value={country}>
                            {country}
                        </option>
                    ))}
                </select>
            </div>

            {/* Quick Actions */}
            <div className="flex gap-3">
                <button
                    type="button"
                    onClick={selectAll}
                    className="flex-1 px-4 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs font-black uppercase tracking-widest text-zinc-400 hover:text-green-500 hover:border-green-500 transition-all"
                >
                    Select All
                </button>
                <button
                    type="button"
                    onClick={clearAll}
                    className="flex-1 px-4 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs font-black uppercase tracking-widest text-zinc-400 hover:text-red-500 hover:border-red-500 transition-all"
                >
                    Clear All
                </button>
            </div>

            {/* Payment Methods Grid */}
            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <label className="text-[10px] font-black uppercase text-zinc-600 tracking-[0.2em]">
                        Available Payment Methods ({availableMethods.length})
                    </label>
                    <span className="text-[10px] font-black uppercase text-purple-500 tracking-widest">
                        {selectedMethods.length} Selected
                    </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[400px] overflow-y-auto pr-2">
                    {availableMethods.map(method => {
                        const isSelected = selectedMethods.includes(method);
                        return (
                            <button
                                key={method}
                                type="button"
                                onClick={() => toggleMethod(method)}
                                className={`text-left p-4 rounded-xl border transition-all ${isSelected
                                        ? 'bg-purple-500/10 border-purple-500 text-purple-400'
                                        : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                                    }`}
                            >
                                <div className="flex items-center justify-between gap-3">
                                    <span className="text-xs font-bold">{method}</span>
                                    {isSelected && (
                                        <div className="w-5 h-5 bg-purple-500 rounded-full flex items-center justify-center shrink-0">
                                            <Check size={12} className="text-black" />
                                        </div>
                                    )}
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>

            {selectedMethods.length > 0 && (
                <div className="p-4 bg-purple-500/5 border border-purple-500/20 rounded-xl">
                    <p className="text-xs text-zinc-500 mb-2 font-bold uppercase tracking-widest">Selected Methods:</p>
                    <div className="flex flex-wrap gap-2">
                        {selectedMethods.map(method => (
                            <span
                                key={method}
                                className="px-3 py-1 bg-purple-500/20 text-purple-400 rounded-lg text-[10px] font-bold"
                            >
                                {method}
                            </span>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default CountryPaymentSelector;
