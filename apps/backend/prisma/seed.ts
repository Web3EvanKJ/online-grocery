// import {
//   PrismaClient,
//   Role,
//   StockType,
//   DiscountType,
//   DiscountInputType,
//   VoucherType,
//   VoucherDiscountType,
//   PaymentMethod,
//   OrderStatus,
// } from '@prisma/client';
// import { Decimal } from '@prisma/client/runtime/library';

// const prisma = new PrismaClient();

// async function main() {
//   console.log('🌱 Seeding database...');

//   // --- Super Admin ---
//   const superAdmin = await prisma.users.create({
//     data: {
//       name: 'Super Admin',
//       email: 'admin@example.com',
//       password: 'hashedpassword123', // TODO: hash later with bcrypt
//       role: Role.super_admin,
//       is_verified: true,
//     },
//   });

//   // --- Store ---
//   const store = await prisma.stores.create({
//     data: {
//       name: 'Main Store',
//       address: 'Jl. Merdeka No. 123',
//       province: 'Jakarta',
//       city: 'Central Jakarta',
//       district: 'Menteng',
//       latitude: new Decimal(-6.2),
//       longitude: new Decimal(106.816666),
//     },
//   });

//   // --- Store Admin ---
//   const storeAdmin = await prisma.users.create({
//     data: {
//       name: 'Store Admin',
//       email: 'storeadmin@example.com',
//       password: 'hashedpassword456',
//       role: Role.store_admin,
//       is_verified: true,
//       store_admins: {
//         create: {
//           store_id: store.id,
//         },
//       },
//     },
//   });

//   // --- Regular User ---
//   const user = await prisma.users.create({
//     data: {
//       name: 'John Doe',
//       email: 'john@example.com',
//       password: 'hashedpassword789',
//       role: Role.user,
//       is_verified: true,
//       addresses: {
//         create: {
//           label: 'Home',
//           address_detail: 'Jl. Mawar No. 45',
//           province: 'Jakarta',
//           city: 'South Jakarta',
//           district: 'Kebayoran Baru',
//           subdistrict: 'Gunung',
//           latitude: new Decimal(-6.238),
//           longitude: new Decimal(106.81),
//           is_main: true,
//         },
//       },
//     },
//   });

//   // --- Categories ---
//   const categories = await prisma.categories.createMany({
//     data: [
//       { name: 'Beverages' },
//       { name: 'Snacks' },
//       { name: 'Personal Care' },
//     ],
//   });

//   const categoryList = await prisma.categories.findMany();

//   // --- Products ---
//   const products = await Promise.all([
//     prisma.products.create({
//       data: {
//         category_id: categoryList[0].id,
//         name: 'Bottled Water',
//         slug: 'bottled-water',
//         description: 'Refreshing mineral water',
//         price: new Decimal(5000),
//         images: {
//           create: [{ image_url: 'https://example.com/images/water.jpg' }],
//         },
//       },
//     }),
//     prisma.products.create({
//       data: {
//         category_id: categoryList[1].id,
//         name: 'Potato Chips',
//         slug: 'potato-chips',
//         description: 'Crispy potato snack',
//         price: new Decimal(12000),
//         images: {
//           create: [{ image_url: 'https://example.com/images/chips.jpg' }],
//         },
//       },
//     }),
//   ]);

//   // --- Inventories ---
//   const inventories = await Promise.all(
//     products.map((product) =>
//       prisma.inventories.create({
//         data: {
//           product_id: product.id,
//           store_id: store.id,
//           stock: 100,
//           journals: {
//             create: {
//               type: StockType.in,
//               quantity: 100,
//               note: 'Initial stock',
//             },
//           },
//         },
//       })
//     )
//   );

//   // --- Discount Example ---
//   const discount = await prisma.discounts.create({
//     data: {
//       store_id: store.id,
//       product_id: products[0].id,
//       type: DiscountType.product,
//       inputType: DiscountInputType.percentage,
//       value: new Decimal(10),
//       min_purchase: new Decimal(10000),
//       start_date: new Date(),
//       end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // valid for 7 days
//     },
//   });

//   // --- Voucher Example ---
//   const voucher = await prisma.vouchers.create({
//     data: {
//       code: 'PROMO10',
//       type: VoucherType.total,
//       discount_type: VoucherDiscountType.percentage,
//       discount_value: new Decimal(10),
//       max_discount: new Decimal(20000),
//       expired_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
//       user_vouchers: {
//         create: {
//           user_id: user.id,
//         },
//       },
//     },
//   });

//   // --- Shipping Method ---
//   const shipping = await prisma.shipping_methods.create({
//     data: {
//       name: 'Regular Shipping',
//       provider: 'JNE',
//       base_cost: new Decimal(10000),
//       cost_per_km: new Decimal(2000),
//     },
//   });

//   // --- Example Order ---
//   const address = await prisma.addresses.findFirst({
//     where: { user_id: user.id },
//   });

//   const order = await prisma.orders.create({
//     data: {
//       user_id: user.id,
//       store_id: store.id,
//       address_id: address!.id,
//       voucher_id: voucher.id,
//       shipping_method_id: shipping.id,
//       total_amount: new Decimal(50000),
//       shipping_cost: new Decimal(10000),
//       discount_amount: new Decimal(5000),
//       status: OrderStatus.Diproses,
//       order_items: {
//         create: [
//           {
//             product_id: products[0].id,
//             quantity: 2,
//             price: new Decimal(5000),
//           },
//           {
//             product_id: products[1].id,
//             quantity: 1,
//             price: new Decimal(12000),
//           },
//         ],
//       },
//     },
//   });

//   // --- Example Payment ---
//   await prisma.payments.create({
//     data: {
//       order_id: order.id,
//       method: PaymentMethod.manual_transfer,
//       proof_image: 'https://example.com/payments/transfer.jpg',
//       transaction_id: 'TX123456',
//       is_verified: true,
//       verified_by: superAdmin.id,
//     },
//   });

//   console.log('✅ Seeding completed successfully!');
// }

// main()
//   .then(async () => {
//     await prisma.$disconnect();
//   })
//   .catch(async (e) => {
//     console.error('❌ Seeding failed:', e);
//     await prisma.$disconnect();
//     process.exit(1);
//   });
