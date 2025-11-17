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
        expired_at: new Date('2025-12-31')
      },
      {
        code: 'GRATISONGKIR',
        type: 'shipping',
        discount_type: 'nominal',
        discount_value: 10000,
        max_discount: 10000,
        product_id: null,
        expired_at: new Date('2025-12-31')
      },
      {
        code: 'DISKONROTI',
        type: 'product',
        discount_type: 'percentage',
        discount_value: 20,
        max_discount: 5000,
        product_id: productList[9].id, // Roti Tawar
        expired_at: new Date('2025-12-31')
      },
      {
        code: 'DISKONTEST1',
        type: 'total',
        discount_type: 'percentage',
        discount_value: 110,
        max_discount: 10000000,
        product_id: null, // Roti Tawar
        expired_at: new Date('2025-12-31')
      },
      {
        code: 'DISKONTEST2',
        type: 'total',
        discount_type: 'nominal',
        discount_value: 1000000,
        max_discount: 10000000,
        product_id: null, // Roti Tawar
        expired_at: new Date('2025-12-31')
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
  const shippingMethods = await prisma.shipping_methods.createMany({
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

  // Get shipping method IDs
  const shippingMethodList = await prisma.shipping_methods.findMany()
  const regularDelivery = shippingMethodList.find(s => s.name === 'Regular Delivery')!
  const sameDayDelivery = shippingMethodList.find(s => s.name === 'Same Day Delivery')!
  const pickupInStore = shippingMethodList.find(s => s.name === 'Pickup In-Store')!

  // Create Addresses
  const addresses = await prisma.addresses.createMany({
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

  // Get address IDs
  const addressList = await prisma.addresses.findMany()
  const customer1Address = addressList.find(a => a.user_id === customer1.id)!
  const customer2Address = addressList.find(a => a.user_id === customer2.id)!

  // Create Orders
  console.log('📦 Creating orders...')

  // Order 1: Customer 1 - Completed order
  const order1 = await prisma.orders.create({
    data: {
      user_id: customer1.id,
      store_id: store1.id,
      address_id: customer1Address.id,
      shipping_method_id: regularDelivery.id,
      voucher_id: voucherList[0].id, // WELCOME10
      total_amount: 68500,
      shipping_cost: 12000,
      discount_amount: 6850, // 10% dari total
      status: 'Pesanan_Dikonfirmasi',
      created_at: new Date('2025-11-14T10:00:00Z')
    }
  })

  // Order items for order 1
  await prisma.order_items.createMany({
    data: [
      {
        order_id: order1.id,
        product_id: productList[0].id, // Chips Kentang
        quantity: 2,
        price: 12500,
        discount: 1250 // 10% discount
      },
      {
        order_id: order1.id,
        product_id: productList[3].id, // Air Mineral
        quantity: 3,
        price: 4000,
        discount: 0
      },
      {
        order_id: order1.id,
        product_id: productList[9].id, // Roti Tawar
        quantity: 1,
        price: 15000,
        discount: 0
      }
    ]
  })

  // Payment for order 1
  await prisma.payments.create({
    data: {
      order_id: order1.id,
      method: 'manual_transfer',
      proof_image: 'https://example.com/payments/proof1.jpg',
      is_verified: true,
      verified_by: superAdmin.id,
      created_at: new Date('2025-10-14T10:30:00Z')
    }
  })

  // Order 2: Customer 1 - Processing order
  const order2 = await prisma.orders.create({
    data: {
      user_id: customer1.id,
      store_id: store1.id,
      address_id: customer1Address.id,
      shipping_method_id: sameDayDelivery.id,
      total_amount: 47500,
      shipping_cost: 15000,
      discount_amount: 0,
      status: 'Diproses',
      created_at: new Date('2025-11-14T14:30:00Z')
    }
  })

  await prisma.order_items.createMany({
    data: [
      {
        order_id: order2.id,
        product_id: productList[6].id, // Susu UHT
        quantity: 1,
        price: 25000,
        discount: 0
      },
      {
        order_id: order2.id,
        product_id: productList[7].id, // Yogurt
        quantity: 2,
        price: 9500,
        discount: 0
      }
    ]
  })

  await prisma.payments.create({
    data: {
      order_id: order2.id,
      method: 'payment_gateway',
      transaction_id: 'TXN_00123456',
      is_verified: true,
      verified_by: superAdmin.id,
      created_at: new Date('2024-01-20T14:35:00Z')
    }
  })

  // Order 3: Customer 2 - Waiting for payment
  const order3 = await prisma.orders.create({
    data: {
      user_id: customer2.id,
      store_id: store2.id,
      address_id: customer2Address.id,
      shipping_method_id: regularDelivery.id,
      voucher_id: voucherList[0].id, // WELCOME10
      total_amount: 36600,
      shipping_cost: 10000,
      discount_amount: 3600, // 10% dari 36000
      status: 'Menunggu_Pembayaran',
      created_at: new Date('2025-11-15T09:15:00Z')
    }
  })

  await prisma.order_items.createMany({
    data: [
      {
        order_id: order3.id,
        product_id: productList[5].id, // Kopi Susu
        quantity: 2,
        price: 12000,
        discount: 0
      },
      {
        order_id: order3.id,
        product_id: productList[8].id, // Keju Slice
        quantity: 1,
        price: 28500,
        discount: 0
      }
    ]
  })

  // Order 4: Customer 1 - Shipped order
  const order4 = await prisma.orders.create({
    data: {
      user_id: customer1.id,
      store_id: store3.id,
      address_id: customer1Address.id,
      shipping_method_id: regularDelivery.id,
      total_amount: 22000,
      shipping_cost: 8000,
      discount_amount: 0,
      status: 'Dikirim',
      created_at: new Date('2025-11-14T16:45:00Z')
    }
  })

  await prisma.order_items.createMany({
    data: [
      {
        order_id: order4.id,
        product_id: productList[1].id, // Biskuit Coklat
        quantity: 2,
        price: 8500,
        discount: 0
      },
      {
        order_id: order4.id,
        product_id: productList[2].id, // Kerupuk Udang
        quantity: 1,
        price: 7500,
        discount: 0
      }
    ]
  })

  await prisma.payments.create({
    data: {
      order_id: order4.id,
      method: 'manual_transfer',
      proof_image: 'https://example.com/payments/proof4.jpg',
      is_verified: true,
      verified_by: superAdmin.id,
      created_at: new Date('2024-01-18T17:00:00Z')
    }
  })

  // Order 5: Customer 2 - Cancelled order
  const order5 = await prisma.orders.create({
    data: {
      user_id: customer2.id,
      store_id: store1.id,
      address_id: customer2Address.id,
      shipping_method_id: pickupInStore.id,
      total_amount: 12500,
      shipping_cost: 0,
      discount_amount: 0,
      status: 'Dibatalkan',
      created_at: new Date('2024-01-22T11:20:00Z')
    }
  })

  await prisma.order_items.createMany({
    data: [
      {
        order_id: order5.id,
        product_id: productList[10].id, // Croissant
        quantity: 1,
        price: 12500,
        discount: 0
      }
    ]
  })

  console.log('📋 Orders created')

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
  
  // Tampilkan informasi login dan testing data
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
  console.log('\nAnother Customer:')
  console.log('Email: customer2@email.com')
  console.log('Password: password123')
  
  console.log('\n🛒 TESTING DATA SUMMARY:')
  console.log('=======================')
  console.log(`📦 Products: ${productList.length} items`)
  console.log(`🏪 Stores: 3 stores`)
  console.log(`👥 Users: 5 users`)
  console.log(`📋 Orders: 5 orders with various statuses`)
  console.log(`💳 Payments: 3 verified payments`)
  console.log(`🎫 Vouchers: WELCOME10, GRATISONGKIR, DISKONROTI`)
  
  console.log('\n📊 ORDER STATUSES:')
  console.log('=================')
  console.log('✅ Order 1: Pesanan_Dikonfirmasi (Completed)')
  console.log('🔄 Order 2: Diproses (Processing)') 
  console.log('⏳ Order 3: Menunggu_Pembayaran (Pending Payment)')
  console.log('🚚 Order 4: Dikirim (Shipped)')
  console.log('❌ Order 5: Dibatalkan (Cancelled)')
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })