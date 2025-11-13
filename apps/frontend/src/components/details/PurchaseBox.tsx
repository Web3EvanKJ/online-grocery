import { PrismaClient, Role, StockType, DiscountType, DiscountInputType, VoucherType, VoucherDiscountType, PaymentMethod, OrderStatus } from '@prisma/client';
import { hash } from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // Clear existing data in correct order to handle foreign key constraints
  await prisma.payments.deleteMany();
  await prisma.order_items.deleteMany();
  await prisma.orders.deleteMany();
  await prisma.carts.deleteMany();
  await prisma.user_vouchers.deleteMany();
  await prisma.vouchers.deleteMany();
  await prisma.discounts.deleteMany();
  await prisma.stock_journals.deleteMany();
  await prisma.inventories.deleteMany();
  await prisma.product_images.deleteMany();
  await prisma.products.deleteMany();
  await prisma.categories.deleteMany();
  await prisma.addresses.deleteMany();
  await prisma.store_admins.deleteMany();
  await prisma.stores.deleteMany();
  await prisma.users.deleteMany();
  await prisma.shipping_methods.deleteMany();

  console.log('✅ Database cleared');

  // ==================== USERS ====================
  const hashedPassword = await hash('password123', 12);
  
  const users = await prisma.users.createManyAndReturn({
    data: [
      {
        name: 'John Doe',
        email: 'john@example.com',
        password: hashedPassword,
        phone: '+6281234567890',
        role: Role.user,
        is_verified: true,
        referral_code: 'JOHN123',
      },
      {
        name: 'Jane Smith',
        email: 'jane@example.com',
        password: hashedPassword,
        phone: '+6281234567891',
        role: Role.user,
        is_verified: true,
        referral_code: 'JANE123',
      },
      {
        name: 'Store Manager',
        email: 'manager@store.com',
        password: hashedPassword,
        phone: '+6281234567892',
        role: Role.store_admin,
        is_verified: true,
      },
      {
        name: 'Admin Super',
        email: 'admin@example.com',
        password: hashedPassword,
        phone: '+6281234567893',
        role: Role.super_admin,
        is_verified: true,
      },
    ],
  });

  console.log(`✅ Created ${users.length} users`);

  // ==================== STORES ====================
  const stores = await prisma.stores.createManyAndReturn({
    data: [
      {
        name: 'Fresh Mart Bekasi',
        address: 'Jl. Bekasi Raya No. 123',
        province: 'Jawa Barat',
        city: 'Bekasi',
        district: 'Bekasi Timur',
        latitude: -6.238270,
        longitude: 106.975571,
      },
      {
        name: 'Grocery Center Jakarta',
        address: 'Jl. Sudirman No. 456',
        province: 'DKI Jakarta',
        city: 'Jakarta Selatan',
        district: 'Setiabudi',
        latitude: -6.229728,
        longitude: 106.822746,
      },
      {
        name: 'Market Place Tangerang',
        address: 'Jl. Merdeka No. 789',
        province: 'Banten',
        city: 'Tangerang',
        district: 'Tangerang Selatan',
        latitude: -6.283521,
        longitude: 106.711293,
      },
    ],
  });

  console.log(`✅ Created ${stores.length} stores`);

  // ==================== STORE ADMINS ====================
  await prisma.store_admins.create({
    data: {
      user_id: users[2].id, // Store Manager
      store_id: stores[0].id,
    },
  });

  console.log('✅ Created store admins');

  // ==================== CATEGORIES ====================
  const categories = await prisma.categories.createManyAndReturn({
    data: [
      { name: 'Buah & Sayuran' },
      { name: 'Daging & Ikan' },
      { name: 'Susu & Produk Olahan' },
      { name: 'Makanan Pokok' },
      { name: 'Snack & Minuman' },
      { name: 'Kebutuhan Rumah Tangga' },
    ],
  });

  console.log(`✅ Created ${categories.length} categories`);

  // ==================== PRODUCTS ====================
  const products = await prisma.products.createManyAndReturn({
    data: [
      // Buah & Sayuran
      {
        category_id: categories[0].id,
        name: 'Apel Fuji Premium',
        slug: 'apel-fuji-premium',
        description: 'Apel Fuji segar impor dengan rasa manis dan renyah',
        price: 35000,
      },
      {
        category_id: categories[0].id,
        name: 'Pisang Cavendish',
        slug: 'pisang-cavendish',
        description: 'Pisang Cavendish segar dengan tingkat kematangan optimal',
        price: 25000,
      },
      {
        category_id: categories[0].id,
        name: 'Jeruk Mandarin',
        slug: 'jeruk-mandarin',
        description: 'Jeruk Mandarin manis tanpa biji',
        price: 28000,
      },
      // Daging & Ikan
      {
        category_id: categories[1].id,
        name: 'Daging Sapi Cincang',
        slug: 'daging-sapi-cincang',
        description: 'Daging sapi cincang premium untuk berbagai masakan',
        price: 85000,
      },
      {
        category_id: categories[1].id,
        name: 'Fillet Ayam',
        slug: 'fillet-ayam',
        description: 'Fillet ayam tanpa tulang dan kulit',
        price: 45000,
      },
      {
        category_id: categories[1].id,
        name: 'Salmon Fillet',
        slug: 'salmon-fillet',
        description: 'Salmon fillet segar kaya omega-3',
        price: 120000,
      },
      // Susu & Produk Olahan
      {
        category_id: categories[2].id,
        name: 'Susu UHT Full Cream',
        slug: 'susu-uht-full-cream',
        description: 'Susu UHT full cream 1 liter',
        price: 22000,
      },
      {
        category_id: categories[2].id,
        name: 'Yogurt Plain',
        slug: 'yogurt-plain',
        description: 'Yogurt plain tanpa gula tambahan',
        price: 15000,
      },
      {
        category_id: categories[2].id,
        name: 'Keju Cheddar',
        slug: 'keju-cheddar',
        description: 'Keju cheddar block 200gr',
        price: 32000,
      },
      // Makanan Pokok
      {
        category_id: categories[3].id,
        name: 'Beras Premium',
        slug: 'beras-premium',
        description: 'Beras premium pulen 5kg',
        price: 75000,
      },
      {
        category_id: categories[3].id,
        name: 'Mie Instan Special',
        slug: 'mie-instan-special',
        description: 'Mie instan special pack isi 5',
        price: 15000,
      },
      {
        category_id: categories[3].id,
        name: 'Minyak Goreng',
        slug: 'minyak-goreng',
        description: 'Minyak goreng sawit 2 liter',
        price: 35000,
      },
    ],
  });

  console.log(`✅ Created ${products.length} products`);

  // ==================== PRODUCT IMAGES ====================
  const productImages = [];
  for (const product of products) {
    productImages.push({
      product_id: product.id,
      image_url: `https://res.cloudinary.com/demo/image/upload/v1/groceries/${product.slug}.jpg`,
    });
  }

  await prisma.product_images.createMany({
    data: productImages,
  });

  console.log(`✅ Created ${productImages.length} product images`);

  // ==================== INVENTORIES ====================
  const inventoryData = [];
  for (const store of stores) {
    for (const product of products) {
      inventoryData.push({
        product_id: product.id,
        store_id: store.id,
        stock: Math.floor(Math.random() * 50) + 10, // Random stock 10-60
      });
    }
  }

  const inventories = await prisma.inventories.createManyAndReturn({
    data: inventoryData,
  });

  console.log(`✅ Created ${inventories.length} inventory records`);

  // ==================== DISCOUNTS ====================
  await prisma.discounts.createMany({
    data: [
      {
        store_id: stores[0].id,
        product_id: products[0].id, // Apel Fuji
        type: DiscountType.product,
        inputType: DiscountInputType.percentage,
        value: 10, // 10% discount
        min_purchase: 50000,
        start_date: new Date(),
        end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      },
      {
        store_id: stores[0].id,
        type: DiscountType.store,
        inputType: DiscountInputType.nominal,
        value: 15000, // Rp 15.000 discount
        min_purchase: 100000,
        start_date: new Date(),
        end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    ],
  });

  console.log('✅ Created discounts');

  // ==================== VOUCHERS ====================
  const vouchers = await prisma.vouchers.createManyAndReturn({
    data: [
      {
        code: 'WELCOME10',
        type: VoucherType.total,
        discount_type: VoucherDiscountType.percentage,
        discount_value: 10,
        max_discount: 20000,
        expired_at: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days
      },
      {
        code: 'FRESH15',
        type: VoucherType.product,
        discount_type: VoucherDiscountType.percentage,
        discount_value: 15,
        product_id: products[0].id, // For Apel Fuji
        expired_at: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days
      },
      {
        code: 'FREESHIP',
        type: VoucherType.shipping,
        discount_type: VoucherDiscountType.nominal,
        discount_value: 15000,
        max_discount: 15000,
        expired_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      },
    ],
  });

  console.log('✅ Created vouchers');

  // ==================== USER VOUCHERS ====================
  await prisma.user_vouchers.createMany({
    data: [
      {
        user_id: users[0].id,
        voucher_id: vouchers[0].id, // WELCOME10
      },
      {
        user_id: users[0].id,
        voucher_id: vouchers[2].id, // FREESHIP
      },
    ],
  });

  console.log('✅ Created user vouchers');

  // ==================== ADDRESSES ====================
  const addresses = await prisma.addresses.createManyAndReturn({
    data: [
      {
        user_id: users[0].id,
        label: 'Rumah',
        address_detail: 'Jl. Merdeka No. 123, RT 01/RW 02',
        province: 'Jawa Barat',
        city: 'Bekasi',
        district: 'Bekasi Timur',
        subdistrict: 'Margahayu',
        latitude: -6.238270,
        longitude: 106.975571,
        is_main: true,
      },
      {
        user_id: users[0].id,
        label: 'Kantor',
        address_detail: 'Gedung Office Park Lt. 5, Jl. Sudirman Kav. 45',
        province: 'DKI Jakarta',
        city: 'Jakarta Selatan',
        district: 'Setiabudi',
        subdistrict: 'Karet',
        latitude: -6.229728,
        longitude: 106.822746,
        is_main: false,
      },
    ],
  });

  console.log(`✅ Created ${addresses.length} addresses`);

  // ==================== SHIPPING METHODS ====================
  const shippingMethods = await prisma.shipping_methods.createManyAndReturn({
    data: [
      {
        name: 'Regular Delivery',
        provider: 'JNE',
        base_cost: 10000,
        cost_per_km: 2000,
      },
      {
        name: 'Express Delivery',
        provider: 'JNE',
        base_cost: 15000,
        cost_per_km: 3000,
      },
      {
        name: 'Same Day Delivery',
        provider: 'GoSend',
        base_cost: 20000,
        cost_per_km: 4000,
      },
    ],
  });

  console.log('✅ Created shipping methods');

  // ==================== CARTS ====================
  await prisma.carts.createMany({
    data: [
      {
        user_id: users[0].id,
        product_id: products[0].id, // Apel Fuji
        quantity: 2,
      },
      {
        user_id: users[0].id,
        product_id: products[6].id, // Susu UHT
        quantity: 1,
      },
      {
        user_id: users[1].id,
        product_id: products[3].id, // Daging Sapi
        quantity: 1,
      },
    ],
  });

  console.log('✅ Created cart items');

  // ==================== ORDERS ====================
  const orders = await prisma.orders.createManyAndReturn({
    data: [
      {
        user_id: users[0].id,
        store_id: stores[0].id,
        address_id: addresses[0].id,
        shipping_method_id: shippingMethods[0].id,
        total_amount: 92000, // (35000*2) + 22000
        shipping_cost: 15000,
        discount_amount: 7000, // 10% discount on apples
        status: OrderStatus.Pesanan_Dikonfirmasi,
      },
      {
        user_id: users[1].id,
        store_id: stores[1].id,
        address_id: addresses[0].id,
        shipping_method_id: shippingMethods[1].id,
        total_amount: 85000,
        shipping_cost: 12000,
        status: OrderStatus.Dikirim,
      },
      {
        user_id: users[0].id,
        store_id: stores[0].id,
        address_id: addresses[0].id,
        shipping_method_id: shippingMethods[0].id,
        total_amount: 45000,
        shipping_cost: 10000,
        status: OrderStatus.Menunggu_Pembayaran,
      },
    ],
  });

  console.log(`✅ Created ${orders.length} orders`);

  // ==================== ORDER ITEMS ====================
  await prisma.order_items.createMany({
    data: [
      {
        order_id: orders[0].id,
        product_id: products[0].id, // Apel Fuji
        quantity: 2,
        price: 35000,
        discount: 3500, // 10% per item
      },
      {
        order_id: orders[0].id,
        product_id: products[6].id, // Susu UHT
        quantity: 1,
        price: 22000,
        discount: 0,
      },
      {
        order_id: orders[1].id,
        product_id: products[3].id, // Daging Sapi
        quantity: 1,
        price: 85000,
        discount: 0,
      },
      {
        order_id: orders[2].id,
        product_id: products[4].id, // Fillet Ayam
        quantity: 1,
        price: 45000,
        discount: 0,
      },
    ],
  });

  console.log('✅ Created order items');

  // ==================== PAYMENTS ====================
  await prisma.payments.createMany({
    data: [
      {
        order_id: orders[0].id,
        method: PaymentMethod.manual_transfer,
        proof_image: 'https://res.cloudinary.com/demo/image/upload/v1/payments/proof_1.jpg',
        is_verified: true,
        verified_by: users[3].id, // Super admin
      },
      {
        order_id: orders[1].id,
        method: PaymentMethod.payment_gateway,
        transaction_id: 'MT_123456789',
        is_verified: true,
      },
      {
        order_id: orders[2].id,
        method: PaymentMethod.manual_transfer,
        is_verified: false,
      },
    ],
  });

  console.log('✅ Created payments');

  // ==================== STOCK JOURNALS ====================
  const stockJournals = [];
  for (let i = 0; i < Math.min(10, inventories.length); i++) {
    stockJournals.push({
      inventory_id: inventories[i].id,
      type: StockType.in,
      quantity: inventories[i].stock,
      note: 'Initial stock from seed',
    });
  }

  await prisma.stock_journals.createMany({
    data: stockJournals,
  });

  console.log(`✅ Created ${stockJournals.length} stock journals`);

  console.log('🎉 Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });