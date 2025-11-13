import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Clear existing data
  await prisma.stock_journals.deleteMany();
  await prisma.payments.deleteMany();
  await prisma.order_items.deleteMany();
  await prisma.orders.deleteMany();
  await prisma.carts.deleteMany();
  await prisma.user_vouchers.deleteMany();
  await prisma.vouchers.deleteMany();
  await prisma.discounts.deleteMany();
  await prisma.inventories.deleteMany();
  await prisma.product_images.deleteMany();
  await prisma.products.deleteMany();
  await prisma.categories.deleteMany();
  await prisma.addresses.deleteMany();
  await prisma.store_admins.deleteMany();
  await prisma.stores.deleteMany();
  await prisma.shipping_methods.deleteMany();
  await prisma.users.deleteMany();

  console.log('✅ Database cleared');

  // ========== CREATE USERS ==========
  const hashedPassword = await bcrypt.hash('password123', 12);
  
  const users = await prisma.users.createMany({
    data: [
      {
        name: 'Bagas Customer',
        email: 'bagas@example.com',
        password: hashedPassword,
        phone: '081234567890',
        role: 'user',
        is_verified: true,
        referral_code: 'BAGAS123'
      },
      {
        name: 'Admin Toko Bekasi',
        email: 'admin.bekasi@example.com',
        password: hashedPassword,
        phone: '081234567891',
        role: 'store_admin',
        is_verified: true
      },
      {
        name: 'Super Admin',
        email: 'superadmin@example.com', 
        password: hashedPassword,
        phone: '081234567892',
        role: 'super_admin',
        is_verified: true
      },
      {
        name: 'Evan Customer',
        email: 'evan@example.com',
        password: hashedPassword,
        phone: '081234567893',
        role: 'user',
        is_verified: true,
        referral_code: 'EVAN456'
      }
    ]
  });
  console.log('✅ Users created');

  // ========== CREATE STORES (JABODETABEK) ==========
  const stores = await prisma.stores.createMany({
    data: [
      // BEKASI Stores
      {
        name: 'Fresh Mart Bekasi Central',
        address: 'Jl. Jend. Ahmad Yani No. 1, Bekasi Kota',
        province: 'Jawa Barat',
        city: 'Bekasi',
        district: 'Bekasi Kota',
        latitude: -6.2383,
        longitude: 106.9926
      },
      {
        name: 'Super Grocery Bekasi Timur',
        address: 'Jl. Pramuka No. 45, Bekasi Timur',
        province: 'Jawa Barat', 
        city: 'Bekasi',
        district: 'Bekasi Timur',
        latitude: -6.2456,
        longitude: 107.0069
      },
      {
        name: 'Daily Needs Bekasi Selatan',
        address: 'Jl. Raya Pondok Gede No. 123, Bekasi Selatan',
        province: 'Jawa Barat',
        city: 'Bekasi',
        district: 'Bekasi Selatan', 
        latitude: -6.2618,
        longitude: 106.9854
      },
      // JAKARTA Stores
      {
        name: 'Mega Market Jakarta Pusat',
        address: 'Jl. Thamrin No. 10, Jakarta Pusat',
        province: 'DKI Jakarta',
        city: 'Jakarta',
        district: 'Jakarta Pusat',
        latitude: -6.1866,
        longitude: 106.8233
      },
      {
        name: 'City Grocery Jakarta Selatan',
        address: 'Jl. Sudirman Kav. 25, Jakarta Selatan',
        province: 'DKI Jakarta',
        city: 'Jakarta', 
        district: 'Jakarta Selatan',
        latitude: -6.2260,
        longitude: 106.8099
      },
      // DEPOK Stores
      {
        name: 'Depok Fresh Market',
        address: 'Jl. Margonda Raya No. 500, Depok',
        province: 'Jawa Barat',
        city: 'Depok',
        district: 'Depok',
        latitude: -6.3741,
        longitude: 106.8324
      },
      // BOGOR Stores
      {
        name: 'Bogor Organic Store',
        address: 'Jl. Raya Pajajaran No. 25, Bogor',
        province: 'Jawa Barat',
        city: 'Bogor',
        district: 'Bogor',
        latitude: -6.5971, 
        longitude: 106.8060
      },
      // TANGERANG Stores
      {
        name: 'Tangerang Supermarket',
        address: 'Jl. Jend. Sudirman No. 45, Tangerang',
        province: 'Banten',
        city: 'Tangerang',
        district: 'Tangerang',
        latitude: -6.1783,
        longitude: 106.6319
      }
    ]
  });
  console.log('✅ Stores created');

  // ========== ASSIGN STORE ADMINS ==========
  const storeAdminUser = await prisma.users.findFirst({
    where: { email: 'admin.bekasi@example.com' }
  });

  const bekasiStore = await prisma.stores.findFirst({
    where: { name: 'Fresh Mart Bekasi Central' }
  });

  if (storeAdminUser && bekasiStore) {
    await prisma.store_admins.create({
      data: {
        user_id: storeAdminUser.id,
        store_id: bekasiStore.id
      }
    });
  }
  console.log('✅ Store admin assigned');

  // ========== CREATE CATEGORIES ==========
  const categories = await prisma.categories.createMany({
    data: [
      { name: 'Buah & Sayuran' },
      { name: 'Daging & Ikan' },
      { name: 'Susu & Produk Olahan' },
      { name: 'Makanan Pokok' },
      { name: 'Snack & Minuman' },
      { name: 'Kebutuhan Rumah Tangga' }
    ]
  });
  console.log('✅ Categories created');

  // ========== CREATE PRODUCTS ==========
  const categoriesList = await prisma.categories.findMany();
  
  const products = await prisma.products.createMany({
    data: [
      {
        category_id: categoriesList[0].id, // Buah & Sayuran
        name: 'Apel Fuji',
        slug: 'apel-fuji',
        description: 'Apel Fuji segar impor',
        price: 25000
      },
      {
        category_id: categoriesList[0].id,
        name: 'Pisang Ambon',
        slug: 'pisang-ambon', 
        description: 'Pisang Ambon lokal segar',
        price: 15000
      },
      {
        category_id: categoriesList[1].id, // Daging & Ikan
        name: 'Daging Sapi Premium',
        slug: 'daging-sapi-premium',
        description: 'Daging sapi pilihan',
        price: 120000
      },
      {
        category_id: categoriesList[1].id,
        name: 'Ikan Salmon Fillet',
        slug: 'ikan-salmon-fillet',
        description: 'Ikan salmon segar fillet',
        price: 85000
      },
      {
        category_id: categoriesList[2].id, // Susu & Produk Olahan
        name: 'Susu Ultra Milk',
        slug: 'susu-ultra-milk',
        description: 'Susu UHT full cream',
        price: 18000
      },
      {
        category_id: categoriesList[3].id, // Makanan Pokok
        name: 'Beras Premium',
        slug: 'beras-premium',
        description: 'Beras kualitas premium 5kg',
        price: 75000
      },
      {
        category_id: categoriesList[4].id, // Snack & Minuman
        name: 'Coklat Silverqueen',
        slug: 'coklat-silverqueen',
        description: 'Coklat Silverqueen 100gr',
        price: 22000
      },
      {
        category_id: categoriesList[5].id, // Kebutuhan Rumah Tangga
        name: 'Sabun Lifebuoy',
        slug: 'sabun-lifebuoy',
        description: 'Sabun cair Lifebuoy 450ml',
        price: 18500
      }
    ]
  });
  console.log('✅ Products created');

  // ========== CREATE PRODUCT IMAGES ==========
  const productsList = await prisma.products.findMany();
  
  for (const product of productsList) {
    await prisma.product_images.create({
      data: {
        product_id: product.id,
        image_url: `https://picsum.photos/400/300?random=${product.id}`
      }
    });
  }
  console.log('✅ Product images created');

  // ========== CREATE INVENTORIES ==========
  const storesList = await prisma.stores.findMany();
  
  for (const store of storesList) {
    for (const product of productsList) {
      await prisma.inventories.create({
        data: {
          product_id: product.id,
          store_id: store.id,
          stock: Math.floor(Math.random() * 50) + 10 // Random stock 10-60
        }
      });
    }
  }
  console.log('✅ Inventories created');

  // ========== CREATE SHIPPING METHODS ==========
  await prisma.shipping_methods.createMany({
    data: [
      {
        name: 'Regular Delivery',
        provider: 'jne',
        base_cost: 10000,
        cost_per_km: 1500
      },
      {
        name: 'Express Delivery', 
        provider: 'tiki',
        base_cost: 20000,
        cost_per_km: 2500
      },
      {
        name: 'Same Day Delivery',
        provider: 'jnt',
        base_cost: 30000, 
        cost_per_km: 3500
      }
    ]
  });
  console.log('✅ Shipping methods created');

  // ========== CREATE USER ADDRESSES ==========
  const customer = await prisma.users.findFirst({
    where: { email: 'bagas@example.com' }
  });

  if (customer) {
    await prisma.addresses.createMany({
      data: [
        {
          user_id: customer.id,
          label: 'Rumah',
          address_detail: 'Jl. Bekasi Raya No. 123, RT 01/RW 05',
          province: 'Jawa Barat',
          city: 'Bekasi',
          district: 'Bekasi Kota',
          subdistrict: 'Margahayu',
          latitude: -6.2400,
          longitude: 106.9900,
          is_main: true
        },
        {
          user_id: customer.id,
          label: 'Kantor',
          address_detail: 'Gedung Office Park Lt. 5, Jl. BSD Green Office Park',
          province: 'Banten', 
          city: 'Tangerang',
          district: 'Tangerang',
          subdistrict: 'Serpong',
          latitude: -6.3022,
          longitude: 106.6528,
          is_main: false
        }
      ]
    });
  }
  console.log('✅ User addresses created');

  console.log('🎉 Database seeding completed!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });