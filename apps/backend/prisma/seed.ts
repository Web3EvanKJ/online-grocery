// prisma/seed.ts
import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting seed...')

  // Clear existing data (dengan urutan yang benar untuk menghindari constraint violation)
  await prisma.carts.deleteMany()
  await prisma.payments.deleteMany()
  await prisma.order_items.deleteMany()
  await prisma.orders.deleteMany()
  await prisma.user_vouchers.deleteMany()
  await prisma.vouchers.deleteMany()
  await prisma.discounts.deleteMany()
  await prisma.stock_journals.deleteMany()
  await prisma.inventories.deleteMany()
  await prisma.product_images.deleteMany()
  await prisma.products.deleteMany()
  await prisma.categories.deleteMany()
  await prisma.addresses.deleteMany()
  await prisma.store_admins.deleteMany()
  await prisma.stores.deleteMany()
  await prisma.shipping_methods.deleteMany()
  await prisma.users.deleteMany()

  console.log('🗑️ Database cleared')

  // Create Users dengan mendapatkan ID secara eksplisit
  const hashedPassword = await bcrypt.hash('password123', 10)
  
  const superAdmin = await prisma.users.create({
    data: {
      name: 'Super Admin',
      email: 'superadmin@minimarket.com',
      password: hashedPassword,
      phone: '08111111111',
      role: 'super_admin',
      is_verified: true,
      profile_image: 'https://example.com/superadmin.jpg',
      referral_code: 'SUPER001'
    }
  })

  const storeManager1 = await prisma.users.create({
    data: {
      name: 'Store Manager 1',
      email: 'manager1@minimarket.com',
      password: hashedPassword,
      phone: '08222222222',
      role: 'store_admin',
      is_verified: true,
      profile_image: 'https://example.com/manager1.jpg',
      referral_code: 'MGR001'
    }
  })

  const storeManager2 = await prisma.users.create({
    data: {
      name: 'Store Manager 2',
      email: 'manager2@minimarket.com',
      password: hashedPassword,
      phone: '08333333333',
      role: 'store_admin',
      is_verified: true,
      referral_code: 'MGR002'
    }
  })

  const customer1 = await prisma.users.create({
    data: {
      name: 'Regular Customer',
      email: 'customer@email.com',
      password: hashedPassword,
      phone: '08444444444',
      role: 'user',
      is_verified: true,
      referral_code: 'CUST001',
      referred_by: 'MGR001'
    }
  })

  const customer2 = await prisma.users.create({
    data: {
      name: 'Another Customer',
      email: 'customer2@email.com',
      password: hashedPassword,
      phone: '08555555555',
      role: 'user',
      is_verified: true,
      referral_code: 'CUST002'
    }
  })

  console.log('👥 Users created')

  // Create Stores
  const store1 = await prisma.stores.create({
    data: {
      name: 'Minimarket Utama',
      address: 'Jl. Sudirman No. 123',
      province: 'DKI Jakarta',
      city: 'Jakarta Pusat',
      district: 'Tanah Abang',
      latitude: -6.2088,
      longitude: 106.8456
    }
  })

  const store2 = await prisma.stores.create({
    data: {
      name: 'Minimarket Cabang 1',
      address: 'Jl. Thamrin No. 456',
      province: 'DKI Jakarta',
      city: 'Jakarta Pusat',
      district: 'Menteng',
      latitude: -6.1865,
      longitude: 106.8227
    }
  })

  const store3 = await prisma.stores.create({
    data: {
      name: 'Minimarket Cabang 2',
      address: 'Jl. Gatot Subroto No. 789',
      province: 'DKI Jakarta',
      city: 'Jakarta Selatan',
      district: 'Kuningan',
      latitude: -6.2297,
      longitude: 106.8227
    }
  })

  console.log('🏪 Stores created')

  // Assign Store Admins menggunakan ID yang sudah diketahui
  await prisma.store_admins.createMany({
    data: [
      {
        user_id: storeManager1.id,
        store_id: store1.id
      },
      {
        user_id: storeManager2.id,
        store_id: store2.id
      }
    ]
  })

  console.log('👨‍💼 Store admins assigned')

  // Create Categories
  const categories = await prisma.categories.createMany({
    data: [
      { name: 'Makanan Ringan' },
      { name: 'Minuman' },
      { name: 'Produk Susu & Olahan' },
      { name: 'Roti & Kue' },
      { name: 'Bahan Masakan' },
      { name: 'Perawatan Diri' },
      { name: 'Kebutuhan Rumah Tangga' },
      { name: 'Buah & Sayuran' }
    ]
  })

  console.log('📦 Categories created')

  // Get category IDs
  const categoryList = await prisma.categories.findMany()
  const makananRingan = categoryList.find(c => c.name === 'Makanan Ringan')!
  const minuman = categoryList.find(c => c.name === 'Minuman')!
  const produkSusu = categoryList.find(c => c.name === 'Produk Susu & Olahan')!
  const rotiKue = categoryList.find(c => c.name === 'Roti & Kue')!

  // Create Products
  const products = await prisma.products.createMany({
    data: [
      // Makanan Ringan
      {
        category_id: makananRingan.id,
        name: 'Chips Kentang Rasa Original',
        slug: 'chips-kentang-rasa-original',
        description: 'Chips kentang dengan rasa original yang gurih',
        price: 12500
      },
      {
        category_id: makananRingan.id,
        name: 'Biskuit Coklat',
        slug: 'biskuit-coklat',
        description: 'Biskuit dengan isian coklat yang lezat',
        price: 8500
      },
      {
        category_id: makananRingan.id,
        name: 'Kerupuk Udang',
        slug: 'kerupuk-udang',
        description: 'Kerupuk udang renyah dengan rasa gurih',
        price: 7500
      },

      // Minuman
      {
        category_id: minuman.id,
        name: 'Air Mineral 600ml',
        slug: 'air-mineral-600ml',
        description: 'Air mineral kemasan botol 600ml',
        price: 4000
      },
      {
        category_id: minuman.id,
        name: 'Jus Jeruk Kotak 250ml',
        slug: 'jus-jeruk-kotak-250ml',
        description: 'Jus jeruk kemasan kotak 250ml',
        price: 8000
      },
      {
        category_id: minuman.id,
        name: 'Kopi Susu Kaleng 250ml',
        slug: 'kopi-susu-kaleng-250ml',
        description: 'Kopi susu siap minum dalam kemasan kaleng',
        price: 12000
      },

      // Produk Susu
      {
        category_id: produkSusu.id,
        name: 'Susu UHT Full Cream 1L',
        slug: 'susu-uht-full-cream-1l',
        description: 'Susu UHT full cream kemasan 1 liter',
        price: 25000
      },
      {
        category_id: produkSusu.id,
        name: 'Yogurt Strawberry 150ml',
        slug: 'yogurt-strawberry-150ml',
        description: 'Yogurt dengan rasa strawberry',
        price: 9500
      },
      {
        category_id: produkSusu.id,
        name: 'Keju Slice 200gr',
        slug: 'keju-slice-200gr',
        description: 'Keju slice kemasan 200 gram',
        price: 28500
      },

      // Roti & Kue
      {
        category_id: rotiKue.id,
        name: 'Roti Tawar 400gr',
        slug: 'roti-tawar-400gr',
        description: 'Roti tawar kemasan 400 gram',
        price: 15000
      },
      {
        category_id: rotiKue.id,
        name: 'Croissant Coklat',
        slug: 'croissant-coklat',
        description: 'Croissant dengan isian coklat',
        price: 12500
      }
    ]
  })

  console.log('🛍️ Products created')

  // Get product IDs
  const productList = await prisma.products.findMany()

  // Create Product Images
  await prisma.product_images.createMany({
    data: productList.map((product, index) => ({
      product_id: product.id,
      image_url: `https://example.com/images/product${index + 1}.jpg`
    }))
  })

  console.log('🖼️ Product images created')

  // Create Inventories
  await prisma.inventories.createMany({
    data: [
      // Store 1 inventories
      { product_id: productList[0].id, store_id: store1.id, stock: 50 },
      { product_id: productList[1].id, store_id: store1.id, stock: 30 },
      { product_id: productList[2].id, store_id: store1.id, stock: 25 },
      { product_id: productList[3].id, store_id: store1.id, stock: 100 },
      { product_id: productList[4].id, store_id: store1.id, stock: 40 },
      { product_id: productList[5].id, store_id: store1.id, stock: 35 },
      { product_id: productList[6].id, store_id: store1.id, stock: 20 },
      { product_id: productList[7].id, store_id: store1.id, stock: 15 },
      { product_id: productList[8].id, store_id: store1.id, stock: 10 },
      { product_id: productList[9].id, store_id: store1.id, stock: 25 },
      { product_id: productList[10].id, store_id: store1.id, stock: 18 },

      // Store 2 inventories
      { product_id: productList[0].id, store_id: store2.id, stock: 30 },
      { product_id: productList[1].id, store_id: store2.id, stock: 20 },
      { product_id: productList[3].id, store_id: store2.id, stock: 80 },
      { product_id: productList[4].id, store_id: store2.id, stock: 25 },
      { product_id: productList[6].id, store_id: store2.id, stock: 15 },
      { product_id: productList[9].id, store_id: store2.id, stock: 20 },

      // Store 3 inventories
      { product_id: productList[0].id, store_id: store3.id, stock: 40 },
      { product_id: productList[2].id, store_id: store3.id, stock: 15 },
      { product_id: productList[3].id, store_id: store3.id, stock: 60 },
      { product_id: productList[5].id, store_id: store3.id, stock: 20 },
      { product_id: productList[7].id, store_id: store3.id, stock: 10 },
      { product_id: productList[10].id, store_id: store3.id, stock: 12 }
    ]
  })

  console.log('📊 Inventories created')

  // Get inventory IDs
  const inventoryList = await prisma.inventories.findMany()

  // Create Stock Journals
  await prisma.stock_journals.createMany({
    data: [
      { inventory_id: inventoryList[0].id, type: 'in', quantity: 50, note: 'Stok awal' },
      { inventory_id: inventoryList[1].id, type: 'in', quantity: 30, note: 'Stok awal' },
      { inventory_id: inventoryList[2].id, type: 'in', quantity: 25, note: 'Stok awal' },
      { inventory_id: inventoryList[11].id, type: 'in', quantity: 30, note: 'Stok awal cabang 2' },
      { inventory_id: inventoryList[16].id, type: 'in', quantity: 40, note: 'Stok awal cabang 3' }
    ]
  })

  console.log('📝 Stock journals created')

  // Create Discounts
  await prisma.discounts.createMany({
    data: [
      {
        store_id: store1.id,
        product_id: productList[0].id,
        type: 'product',
        inputType: 'percentage',
        value: 10,
        min_purchase: 0,
        max_discount: 5000,
        start_date: new Date('2024-01-01'),
        end_date: new Date('2024-12-31')
      },
      {
        store_id: store1.id,
        product_id: null,
        type: 'store',
        inputType: 'nominal',
        value: 5000,
        min_purchase: 50000,
        max_discount: 5000,
        start_date: new Date('2024-01-01'),
        end_date: new Date('2024-12-31')
      },
      {
        store_id: store2.id,
        product_id: productList[3].id,
        type: 'product',
        inputType: 'percentage',
        value: 15,
        min_purchase: 0,
        max_discount: 3000,
        start_date: new Date('2024-01-01'),
        end_date: new Date('2024-12-31')
      }
    ]
  })

  console.log('💰 Discounts created')

  // Create Vouchers
  const vouchers = await prisma.vouchers.createMany({
    data: [
      {
        code: 'WELCOME10',
        type: 'total',
        discount_type: 'percentage',
        discount_value: 10,
        max_discount: 15000,
        product_id: null,
        expired_at: new Date('2024-12-31')
      },
      {
        code: 'GRATISONGKIR',
        type: 'shipping',
        discount_type: 'nominal',
        discount_value: 10000,
        max_discount: 10000,
        product_id: null,
        expired_at: new Date('2024-12-31')
      },
      {
        code: 'DISKONROTI',
        type: 'product',
        discount_type: 'percentage',
        discount_value: 20,
        max_discount: 5000,
        product_id: productList[9].id, // Roti Tawar
        expired_at: new Date('2024-12-31')
      }
    ]
  })

  console.log('🎫 Vouchers created')

  // Get voucher IDs
  const voucherList = await prisma.vouchers.findMany()

  // Assign Vouchers to Users
  await prisma.user_vouchers.createMany({
    data: [
      { user_id: customer1.id, voucher_id: voucherList[0].id }, // Customer gets WELCOME10
      { user_id: customer1.id, voucher_id: voucherList[1].id }, // Customer gets GRATISONGKIR
      { user_id: customer2.id, voucher_id: voucherList[0].id }  // Customer2 gets WELCOME10
    ]
  })

  console.log('🎁 Vouchers assigned to users')

  // Create Shipping Methods
  await prisma.shipping_methods.createMany({
    data: [
      {
        name: 'Regular Delivery',
        provider: 'Minimarket Express',
        base_cost: 8000,
        cost_per_km: 2000
      },
      {
        name: 'Same Day Delivery',
        provider: 'Minimarket Express',
        base_cost: 15000,
        cost_per_km: 3000
      },
      {
        name: 'Pickup In-Store',
        provider: 'Self Pickup',
        base_cost: 0,
        cost_per_km: 0
      }
    ]
  })

  console.log('🚚 Shipping methods created')

  // Create Addresses
  await prisma.addresses.createMany({
    data: [
      {
        user_id: customer1.id,
        label: 'Rumah',
        address_detail: 'Jl. Merdeka No. 45, RT 01/RW 02',
        province: 'DKI Jakarta',
        city: 'Jakarta Selatan',
        district: 'Kebayoran Baru',
        subdistrict: 'Senayan',
        latitude: -6.229386,
        longitude: 106.797430,
        is_main: true
      },
      {
        user_id: customer2.id,
        label: 'Kantor',
        address_detail: 'Gedung Perkantoran Plaza, Lantai 8, Jl. Jend. Sudirman',
        province: 'DKI Jakarta',
        city: 'Jakarta Pusat',
        district: 'Tanah Abang',
        subdistrict: 'Bendungan Hilir',
        latitude: -6.208763,
        longitude: 106.845599,
        is_main: true
      }
    ]
  })

  console.log('🏠 Addresses created')

  // Create Carts
  await prisma.carts.createMany({
    data: [
      { user_id: customer1.id, product_id: productList[0].id, quantity: 2 }, // Customer: 2x Chips
      { user_id: customer1.id, product_id: productList[3].id, quantity: 3 }, // Customer: 3x Air Mineral
      { user_id: customer1.id, product_id: productList[9].id, quantity: 1 }, // Customer: 1x Roti Tawar
      { user_id: customer2.id, product_id: productList[5].id, quantity: 2 }, // Customer2: 2x Kopi Susu
      { user_id: customer2.id, product_id: productList[7].id, quantity: 1 }  // Customer2: 1x Yogurt
    ]
  })

  console.log('🛒 Carts created')

  console.log('✅ Seed completed successfully!')
  
  // Tampilkan informasi login untuk testing
  console.log('\n📋 TESTING CREDENTIALS:')
  console.log('======================')
  console.log('Super Admin:')
  console.log('Email: superadmin@minimarket.com')
  console.log('Password: password123')
  console.log('\nStore Manager 1:')
  console.log('Email: manager1@minimarket.com') 
  console.log('Password: password123')
  console.log('\nRegular Customer:')
  console.log('Email: customer@email.com')
  console.log('Password: password123')
  console.log('\nVouchers: WELCOME10, GRATISONGKIR, DISKONROTI')
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })