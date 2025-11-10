"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const library_1 = require("@prisma/client/runtime/library");
const prisma = new client_1.PrismaClient();
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        console.log('🌱 Starting seed...');
        // --- USERS ---
        const superAdmin = yield prisma.users.create({
            data: {
                name: 'Super Admin',
                email: 'superadmin@example.com',
                password: 'hashedpassword',
                role: client_1.Role.super_admin,
                is_verified: true,
            },
        });
        const storeAdmin1 = yield prisma.users.create({
            data: {
                name: 'Store Admin 1',
                email: 'storeadmin1@example.com',
                password: 'hashedpassword',
                role: client_1.Role.store_admin,
                is_verified: true,
            },
        });
        const storeAdmin2 = yield prisma.users.create({
            data: {
                name: 'Store Admin 2',
                email: 'storeadmin2@example.com',
                password: 'hashedpassword',
                role: client_1.Role.store_admin,
                is_verified: true,
            },
        });
        const user1 = yield prisma.users.create({
            data: {
                name: 'John Doe',
                email: 'john@example.com',
                password: 'hashedpassword',
                role: client_1.Role.user,
                is_verified: true,
            },
        });
        const user2 = yield prisma.users.create({
            data: {
                name: 'Jane Smith',
                email: 'jane@example.com',
                password: 'hashedpassword',
                role: client_1.Role.user,
                is_verified: true,
            },
        });
        // --- STORES ---
        const store1 = yield prisma.stores.create({
            data: {
                name: 'Jakarta Store',
                address: 'Jl. Merdeka No.1',
                province: 'DKI Jakarta',
                city: 'Jakarta',
                district: 'Central Jakarta',
                latitude: new library_1.Decimal('-6.1751'),
                longitude: new library_1.Decimal('106.8650'),
            },
        });
        const store2 = yield prisma.stores.create({
            data: {
                name: 'Bandung Store',
                address: 'Jl. Asia Afrika No.12',
                province: 'West Java',
                city: 'Bandung',
                district: 'Bandung Wetan',
                latitude: new library_1.Decimal('-6.9175'),
                longitude: new library_1.Decimal('107.6191'),
            },
        });
        // --- STORE ADMINS ---
        yield prisma.store_admins.createMany({
            data: [
                { user_id: storeAdmin1.id, store_id: store1.id },
                { user_id: storeAdmin2.id, store_id: store2.id },
            ],
        });
        // --- CATEGORIES ---
        const [catFood, catDrinks] = yield prisma.$transaction([
            prisma.categories.create({ data: { name: 'Food' } }),
            prisma.categories.create({ data: { name: 'Drinks' } }),
        ]);
        // --- PRODUCTS ---
        const burger = yield prisma.products.create({
            data: {
                name: 'Classic Burger',
                slug: 'classic-burger',
                category_id: catFood.id,
                description: 'A delicious beef burger with cheese and lettuce.',
                price: new library_1.Decimal(35000),
                images: {
                    createMany: {
                        data: [
                            { image_url: 'https://via.placeholder.com/300x300?text=Burger+1' },
                            { image_url: 'https://via.placeholder.com/300x300?text=Burger+2' },
                        ],
                    },
                },
            },
        });
        const cola = yield prisma.products.create({
            data: {
                name: 'Coca Cola',
                slug: 'coca-cola',
                category_id: catDrinks.id,
                description: 'Refreshing carbonated drink.',
                price: new library_1.Decimal(10000),
                images: {
                    createMany: {
                        data: [
                            { image_url: 'https://via.placeholder.com/300x300?text=Cola+1' },
                            { image_url: 'https://via.placeholder.com/300x300?text=Cola+2' },
                        ],
                    },
                },
            },
        });
        // --- INVENTORIES ---
        const inv1 = yield prisma.inventories.create({
            data: { product_id: burger.id, store_id: store1.id, stock: 50 },
        });
        const inv2 = yield prisma.inventories.create({
            data: { product_id: cola.id, store_id: store2.id, stock: 100 },
        });
        yield prisma.stock_journals.createMany({
            data: [
                {
                    inventory_id: inv1.id,
                    type: client_1.StockType.in,
                    quantity: 50,
                    note: 'Initial stock',
                },
                {
                    inventory_id: inv2.id,
                    type: client_1.StockType.in,
                    quantity: 100,
                    note: 'Initial stock',
                },
            ],
        });
        // --- DISCOUNTS ---
        yield prisma.discounts.create({
            data: {
                store_id: store1.id,
                product_id: burger.id,
                type: client_1.DiscountType.product,
                inputType: client_1.DiscountInputType.percentage,
                value: new library_1.Decimal(10),
                min_purchase: new library_1.Decimal(50000),
                max_discount: new library_1.Decimal(10000),
                start_date: new Date(),
                end_date: new Date(new Date().setMonth(new Date().getMonth() + 1)),
            },
        });
        // --- VOUCHERS ---
        const voucher = yield prisma.vouchers.create({
            data: {
                code: 'PROMO10',
                type: client_1.VoucherType.total,
                discount_type: client_1.VoucherDiscountType.percentage,
                discount_value: new library_1.Decimal(10),
                expired_at: new Date(new Date().setMonth(new Date().getMonth() + 1)),
            },
        });
        yield prisma.user_vouchers.create({
            data: {
                user_id: user1.id,
                voucher_id: voucher.id,
            },
        });
        // --- SHIPPING METHODS ---
        const jne = yield prisma.shipping_methods.create({
            data: {
                name: 'JNE Regular',
                provider: 'JNE',
                base_cost: new library_1.Decimal(10000),
                cost_per_km: new library_1.Decimal(1000),
            },
        });
        // --- ADDRESSES ---
        const address = yield prisma.addresses.create({
            data: {
                user_id: user1.id,
                label: 'Home',
                address_detail: 'Jl. Kebon Jeruk No. 5',
                province: 'DKI Jakarta',
                city: 'Jakarta',
                district: 'West Jakarta',
                latitude: new library_1.Decimal('-6.2'),
                longitude: new library_1.Decimal('106.8'),
                is_main: true,
            },
        });
        // --- ORDERS ---
        const order = yield prisma.orders.create({
            data: {
                user_id: user1.id,
                store_id: store1.id,
                address_id: address.id,
                voucher_id: voucher.id,
                shipping_method_id: jne.id,
                total_amount: new library_1.Decimal(70000),
                shipping_cost: new library_1.Decimal(10000),
                discount_amount: new library_1.Decimal(7000),
                status: client_1.OrderStatus.Diproses,
                order_items: {
                    create: [
                        {
                            product_id: burger.id,
                            quantity: 2,
                            price: new library_1.Decimal(35000),
                            discount: new library_1.Decimal(7000),
                        },
                    ],
                },
            },
        });
        yield prisma.payments.create({
            data: {
                order_id: order.id,
                method: client_1.PaymentMethod.manual_transfer,
                proof_image: 'https://via.placeholder.com/300x300?text=Payment',
                is_verified: true,
                verified_by: superAdmin.id,
            },
        });
        console.log('✅ Seeding complete!');
    });
}
main()
    .catch((e) => {
    console.error(e);
    process.exit(1);
})
    .finally(() => __awaiter(void 0, void 0, void 0, function* () {
    yield prisma.$disconnect();
}));
