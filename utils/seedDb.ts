
import { collection, addDoc, getDocs, query, where, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase';

const DUMMY_PRODUCTS = [
    {
        name: "CYBERPUNK HOODIE V1",
        price: 5999,
        category: "Hoodies",
        description: "High-performance techwear hoodie with reflective accents and breathable mesh lining.",
        sizes: ["S", "M", "L", "XL"],
        stock: 50,
        imageUrls: ["https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&q=80&w=800"],
        tags: ["new", "techwear"],
        isPublished: true
    },
    {
        name: "NEON STITCH OVERSIZED TEE",
        price: 2499,
        category: "T-Shirts",
        description: "Premium cotton oversized tee with neon stitch branding.",
        sizes: ["M", "L", "XL"],
        stock: 100,
        imageUrls: ["https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&q=80&w=800"],
        tags: ["bestseller", "oversized"],
        isPublished: true
    },
    {
        name: "URBAN CARGO PANTS",
        price: 4999,
        category: "Pants",
        description: "Multi-pocket cargo pants built for the urban explorer.",
        sizes: ["30", "32", "34", "36"],
        stock: 30,
        imageUrls: ["https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&q=80&w=800"],
        tags: ["cargo", "techwear"],
        isPublished: true
    },
    {
        name: "VOID MASK GOGGLES",
        price: 1500,
        category: "Accessories",
        description: "Futuristic mask with tinted goggles for the ultimate street look.",
        sizes: ["OS"],
        stock: 20,
        imageUrls: ["https://images.unsplash.com/photo-1509391366360-fe5ab6147526?auto=format&fit=crop&q=80&w=800"],
        tags: ["accessory", "cyberpunk"],
        isPublished: true
    },
    {
        name: "STEALTH BOMBER JACKET",
        price: 8999,
        category: "Jackets",
        description: "Water-resistant bomber jacket with hidden compartments.",
        sizes: ["L", "XL", "XXL"],
        stock: 15,
        imageUrls: ["https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&q=80&w=800"],
        tags: ["jacket", "stealth"],
        isPublished: true
    },
    {
        name: "MATRIX LONG COAT",
        price: 12999,
        category: "Jackets",
        description: "Elegant yet gritty long coat inspired by digital rain.",
        sizes: ["M", "L"],
        stock: 10,
        imageUrls: ["https://images.unsplash.com/photo-1544022613-e87ca75a784a?auto=format&fit=crop&q=80&w=800"],
        tags: ["exclusive"],
        isPublished: true
    },
    {
        name: "GLITCH PRINT SHIRT",
        price: 3499,
        category: "T-Shirts",
        description: "Sublimated glitch art print on high-grade polyester.",
        sizes: ["S", "M", "L"],
        stock: 45,
        imageUrls: ["https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&q=80&w=800"],
        tags: ["limited"],
        isPublished: true
    },
    {
        name: "TECH-RUNNER SNEAKERS",
        price: 14999,
        category: "Footwear",
        description: "Ergonomic sneakers with neon glow elements.",
        sizes: ["40", "41", "42", "43", "44"],
        stock: 25,
        imageUrls: ["https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=800"],
        tags: ["footwear", "glow"],
        isPublished: true
    },
    {
        name: "PHANTOM BEANIE",
        price: 999,
        category: "Accessories",
        description: "Warm knit beanie with embroidered NS logo.",
        sizes: ["OS"],
        stock: 80,
        imageUrls: ["https://images.unsplash.com/photo-1576871337622-98d48d1cf531?auto=format&fit=crop&q=80&w=800"],
        tags: ["essentials"],
        isPublished: true
    },
    {
        name: "ZENITH UTILITY VEST",
        price: 6499,
        category: "Jackets",
        description: "Tactical utility vest with modular attachments.",
        sizes: ["M", "L", "XL"],
        stock: 20,
        imageUrls: ["https://images.unsplash.com/photo-1614031679232-0dae7f897df7?auto=format&fit=crop&q=80&w=800"],
        tags: ["tactical"],
        isPublished: true
    }
];

// Double it up to make 20
const FULL_PRODUCTS = [
    ...DUMMY_PRODUCTS,
    ...DUMMY_PRODUCTS.map(p => ({ ...p, name: p.name + " V2", price: p.price + 500 }))
];

export const seedDatabase = async () => {
    const categories = Array.from(new Set(FULL_PRODUCTS.map(p => p.category)));

    // 1. Add Categories
    for (const catName of categories) {
        const q = query(collection(db, 'categories'), where("name", "==", catName));
        const snap = await getDocs(q);
        if (snap.empty) {
            await addDoc(collection(db, 'categories'), { name: catName });
            console.log(`Added category: ${catName}`);
        }
    }

    // 2. Add Products
    for (const product of FULL_PRODUCTS) {
        await addDoc(collection(db, 'products'), product);
        console.log(`Added product: ${product.name}`);
    }

    alert("Successfully added 20 dummy products across multiple categories!");
};
