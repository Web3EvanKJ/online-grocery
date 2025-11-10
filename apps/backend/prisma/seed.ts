// import {
//   PrismaClient,
//   Role,
//   DiscountType,
//   DiscountInputType,
//   VoucherType,
//   VoucherDiscountType,
//   PaymentMethod,
//   OrderStatus,
//   StockType,
// } from '@prisma/client';
// import { Decimal } from '@prisma/client/runtime/library';

// const prisma = new PrismaClient();

// async function main() {
//   console.log('🌱 Starting seed...');

//   // --- USERS ---
//   const superAdmin = await prisma.users.create({
//     data: {
//       name: 'Super Admin',
//       email: 'superadmin@example.com',
//       password: 'hashedpassword',
//       role: Role.super_admin,
//       is_verified: true,
//     },
//   });

//   const storeAdmin1 = await prisma.users.create({
//     data: {
//       name: 'Store Admin 1',
//       email: 'storeadmin1@example.com',
//       password: 'hashedpassword',
//       role: Role.store_admin,
//       is_verified: true,
//     },
//   });

//   const storeAdmin2 = await prisma.users.create({
//     data: {
//       name: 'Store Admin 2',
//       email: 'storeadmin2@example.com',
//       password: 'hashedpassword',
//       role: Role.store_admin,
//       is_verified: true,
//     },
//   });

//   const user1 = await prisma.users.create({
//     data: {
//       name: 'John Doe',
//       email: 'john@example.com',
//       password: 'hashedpassword',
//       role: Role.user,
//       is_verified: true,
//     },
//   });

//   const user2 = await prisma.users.create({
//     data: {
//       name: 'Jane Smith',
//       email: 'jane@example.com',
//       password: 'hashedpassword',
//       role: Role.user,
//       is_verified: true,
//     },
//   });

//   // --- STORES ---
//   const store1 = await prisma.stores.create({
//     data: {
//       name: 'Jakarta Store',
//       address: 'Jl. Merdeka No.1',
//       province: 'DKI Jakarta',
//       city: 'Jakarta',
//       district: 'Central Jakarta',
//       latitude: new Decimal('-6.1751'),
//       longitude: new Decimal('106.8650'),
//     },
//   });

//   const store2 = await prisma.stores.create({
//     data: {
//       name: 'Bandung Store',
//       address: 'Jl. Asia Afrika No.12',
//       province: 'West Java',
//       city: 'Bandung',
//       district: 'Bandung Wetan',
//       latitude: new Decimal('-6.9175'),
//       longitude: new Decimal('107.6191'),
//     },
//   });

//   // --- STORE ADMINS ---
//   await prisma.store_admins.createMany({
//     data: [
//       { user_id: storeAdmin1.id, store_id: store1.id },
//       { user_id: storeAdmin2.id, store_id: store2.id },
//     ],
//   });

//   // --- CATEGORIES ---
//   const [catFood, catDrinks] = await prisma.$transaction([
//     prisma.categories.create({ data: { name: 'Food' } }),
//     prisma.categories.create({ data: { name: 'Drinks' } }),
//   ]);

//   // --- PRODUCTS ---
//   const burger = await prisma.products.create({
//     data: {
//       name: 'Classic Burger',
//       slug: 'classic-burger',
//       category_id: catFood.id,
//       description: 'A delicious beef burger with cheese and lettuce.',
//       price: new Decimal(35000),
//       images: {
//         createMany: {
//           data: [
//             { image_url: 'https://via.placeholder.com/300x300?text=Burger+1' },
//             { image_url: 'https://via.placeholder.com/300x300?text=Burger+2' },
//           ],
//         },
//       },
//     },
//   });

//   const cola = await prisma.products.create({
//     data: {
//       name: 'Coca Cola',
//       slug: 'coca-cola',
//       category_id: catDrinks.id,
//       description: 'Refreshing carbonated drink.',
//       price: new Decimal(10000),
//       images: {
//         createMany: {
//           data: [
//             { image_url: 'https://via.placeholder.com/300x300?text=Cola+1' },
//             { image_url: 'https://via.placeholder.com/300x300?text=Cola+2' },
//           ],
//         },
//       },
//     },
//   });

//   // --- INVENTORIES ---
//   const inv1 = await prisma.inventories.create({
//     data: { product_id: burger.id, store_id: store1.id, stock: 50 },
//   });

//   const inv2 = await prisma.inventories.create({
//     data: { product_id: cola.id, store_id: store2.id, stock: 100 },
//   });

//   await prisma.stock_journals.createMany({
//     data: [
//       {
//         inventory_id: inv1.id,
//         type: StockType.in,
//         quantity: 50,
//         note: 'Initial stock',
//       },
//       {
//         inventory_id: inv2.id,
//         type: StockType.in,
//         quantity: 100,
//         note: 'Initial stock',
//       },
//     ],
//   });

//   // --- DISCOUNTS ---
//   await prisma.discounts.create({
//     data: {
//       store_id: store1.id,
//       product_id: burger.id,
//       type: DiscountType.product,
//       inputType: DiscountInputType.percentage,
//       value: new Decimal(10),
//       min_purchase: new Decimal(50000),
//       max_discount: new Decimal(10000),
//       start_date: new Date(),
//       end_date: new Date(new Date().setMonth(new Date().getMonth() + 1)),
//     },
//   });

//   // --- VOUCHERS ---
//   const voucher = await prisma.vouchers.create({
//     data: {
//       code: 'PROMO10',
//       type: VoucherType.total,
//       discount_type: VoucherDiscountType.percentage,
//       discount_value: new Decimal(10),
//       expired_at: new Date(new Date().setMonth(new Date().getMonth() + 1)),
//     },
//   });

//   await prisma.user_vouchers.create({
//     data: {
//       user_id: user1.id,
//       voucher_id: voucher.id,
//     },
//   });

//   // --- SHIPPING METHODS ---
//   const jne = await prisma.shipping_methods.create({
//     data: {
//       name: 'JNE Regular',
//       provider: 'JNE',
//       base_cost: new Decimal(10000),
//       cost_per_km: new Decimal(1000),
//     },
//   });

//   // --- ADDRESSES ---
//   const address = await prisma.addresses.create({
//     data: {
//       user_id: user1.id,
//       label: 'Home',
//       address_detail: 'Jl. Kebon Jeruk No. 5',
//       province: 'DKI Jakarta',
//       city: 'Jakarta',
//       district: 'West Jakarta',
//       latitude: new Decimal('-6.2'),
//       longitude: new Decimal('106.8'),
//       is_main: true,
//     },
//   });

//   // --- ORDERS ---
//   const order = await prisma.orders.create({
//     data: {
//       user_id: user1.id,
//       store_id: store1.id,
//       address_id: address.id,
//       voucher_id: voucher.id,
//       shipping_method_id: jne.id,
//       total_amount: new Decimal(70000),
//       shipping_cost: new Decimal(10000),
//       discount_amount: new Decimal(7000),
//       status: OrderStatus.Diproses,
//       order_items: {
//         create: [
//           {
//             product_id: burger.id,
//             quantity: 2,
//             price: new Decimal(35000),
//             discount: new Decimal(7000),
//           },
//         ],
//       },
//     },
//   });

//   await prisma.payments.create({
//     data: {
//       order_id: order.id,
//       method: PaymentMethod.manual_transfer,
//       proof_image: 'https://via.placeholder.com/300x300?text=Payment',
//       is_verified: true,
//       verified_by: superAdmin.id,
//     },
//   });

//   console.log('✅ Seeding complete!');
// }

// main()
//   .catch((e) => {
//     console.error(e);
//     process.exit(1);
//   })
//   .finally(async () => {
//     await prisma.$disconnect();
//   });
