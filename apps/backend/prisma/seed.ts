import {
  PrismaClient,
  Role,
  StockType,
  DiscountType,
  DiscountInputType,
  VoucherType,
  VoucherDiscountType,
  PaymentMethod,
  OrderStatus,
} from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database with rich sample data...');

  // ---------------------------------------------------------------------------
  // USERS
  // ---------------------------------------------------------------------------
  const usersData = [
    {
      name: 'Super Admin',
      email: 'superadmin@shop.com',
      role: Role.super_admin,
      is_verified: true,
    },
    {
      name: 'Alice StoreAdmin',
      email: 'alice@store.com',
      role: Role.store_admin,
      is_verified: true,
    },
    {
      name: 'Bob StoreAdmin',
      email: 'bob@store.com',
      role: Role.store_admin,
      is_verified: true,
    },
    {
      name: 'Charlie User',
      email: 'charlie@user.com',
      role: Role.user,
      is_verified: true,
    },
    {
      name: 'Diana User',
      email: 'diana@user.com',
      role: Role.user,
      is_verified: true,
    },
    {
      name: 'Eve User',
      email: 'eve@user.com',
      role: Role.user,
      is_verified: true,
    },
  ];

  const users = await Promise.all(
    usersData.map((u) =>
      prisma.users.upsert({
        where: { email: u.email },
        update: {},
        create: u,
      })
    )
  );

  const superAdmin = users[0];
  const storeAdmins = users.filter((u) => u.role === Role.store_admin);
  const customers = users.filter((u) => u.role === Role.user);

  // ---------------------------------------------------------------------------
  // STORES
  // ---------------------------------------------------------------------------
  const stores = await prisma.$transaction([
    prisma.stores.create({
      data: {
        name: 'Store 103',
        address: 'Jl. Sudirman No. 99, Jakarta',
        latitude: 6.2,
        longitude: 106.8166,
        store_admins: { create: { user_id: storeAdmins[0].id } },
      },
    }),
    prisma.stores.create({
      data: {
        name: 'Store 23',
        address: 'Jl. Diponegoro No. 12, Bandung',
        latitude: 6.9,
        longitude: 107.6,
        store_admins: { create: { user_id: storeAdmins[1].id } },
      },
    }),
  ]);

  // ---------------------------------------------------------------------------
  // CATEGORIES
  // ---------------------------------------------------------------------------
  const categoryNames = [
    'Beverages',
    'Snacks',
    'Household',
    'Personal Care',
    'Fruits',
    'Vegetables',
  ];
  const categories = await Promise.all(
    categoryNames.map((name) => prisma.categories.create({ data: { name } }))
  );

  // ---------------------------------------------------------------------------
  // PRODUCTS + IMAGES
  // ---------------------------------------------------------------------------
  const products = [];
  for (const store of stores) {
    for (const category of categories) {
      for (let i = 1; i <= 5; i++) {
        const product = await prisma.products.create({
          data: {
            category_id: category.id,
            name: `${category.name} Product ${i} (${store.name})`,
            description: `High quality ${category.name.toLowerCase()} item number ${i}`,
            price: Math.floor(Math.random() * 50000 + 5000),
            images: {
              create: {
                image_url: `https://picsum.photos/seed/${category.name}-${i}/300/300`,
              },
            },
          },
        });
        products.push(product);
      }
    }
  }

  // ---------------------------------------------------------------------------
  // INVENTORIES + JOURNALS
  // ---------------------------------------------------------------------------
  for (const store of stores) {
    for (const product of products.slice(0, 10)) {
      const inv = await prisma.inventories.create({
        data: {
          product_id: product.id,
          store_id: store.id,
          stock: Math.floor(Math.random() * 100 + 20),
        },
      });

      await prisma.stock_journals.create({
        data: {
          inventory_id: inv.id,
          type: StockType.in,
          quantity: inv.stock,
          note: 'Initial stock',
        },
      });
    }
  }

  // ---------------------------------------------------------------------------
  // DISCOUNTS
  // ---------------------------------------------------------------------------
  for (const store of stores) {
    await prisma.discounts.create({
      data: {
        store_id: store.id,
        type: DiscountType.store,
        inputType: DiscountInputType.percentage,
        value: 5,
        start_date: new Date('2025-10-01'),
        end_date: new Date('2025-12-31'),
      },
    });
  }

  // ---------------------------------------------------------------------------
  // SHIPPING METHODS
  // ---------------------------------------------------------------------------
  const shippingMethods = await prisma.shipping_methods.createMany({
    data: [
      {
        name: 'JNE Regular',
        provider: 'JNE',
        base_cost: 10000,
        cost_per_km: 2000,
      },
      {
        name: 'GoSend Instant',
        provider: 'GoSend',
        base_cost: 15000,
        cost_per_km: 3000,
      },
      {
        name: 'SiCepat Express',
        provider: 'SiCepat',
        base_cost: 12000,
        cost_per_km: 2500,
      },
    ],
  });

  // ---------------------------------------------------------------------------
  // ADDRESSES
  // ---------------------------------------------------------------------------
  const addresses = [];
  for (const user of customers) {
    const addr = await prisma.addresses.create({
      data: {
        user_id: user.id,
        label: 'Home',
        address_detail: `Jl. Example Street No. ${Math.floor(Math.random() * 100)}`,
        latitude: 6.2 + Math.random() * 0.1,
        longitude: 106.8 + Math.random() * 0.1,
        is_main: true,
      },
    });
    addresses.push(addr);
  }

  // ---------------------------------------------------------------------------
  // VOUCHERS + USER VOUCHERS
  // ---------------------------------------------------------------------------
  const voucherList = await Promise.all([
    prisma.vouchers.create({
      data: {
        code: 'DISKON10',
        type: VoucherType.total,
        discount_type: VoucherDiscountType.percentage,
        discount_value: 10,
        expired_at: new Date('2025-12-31'),
      },
    }),
    prisma.vouchers.create({
      data: {
        code: 'ONGKIRFREE',
        type: VoucherType.shipping,
        discount_type: VoucherDiscountType.nominal,
        discount_value: 10000,
        expired_at: new Date('2025-11-30'),
      },
    }),
  ]);

  for (const user of customers) {
    for (const v of voucherList) {
      await prisma.user_vouchers.create({
        data: { user_id: user.id, voucher_id: v.id },
      });
    }
  }

  // ---------------------------------------------------------------------------
  // CARTS
  // ---------------------------------------------------------------------------
  for (const user of customers) {
    for (const product of products.slice(0, 5)) {
      await prisma.carts.create({
        data: {
          user_id: user.id,
          product_id: product.id,
          quantity: Math.floor(Math.random() * 3 + 1),
        },
      });
    }
  }

  // ---------------------------------------------------------------------------
  // ORDERS + ORDER ITEMS + PAYMENTS
  // ---------------------------------------------------------------------------
  for (const user of customers) {
    const store = stores[Math.floor(Math.random() * stores.length)];
    const address = addresses.find((a) => a.user_id === user.id)!;

    const order = await prisma.orders.create({
      data: {
        user_id: user.id,
        store_id: store.id,
        address_id: address.id,
        shipping_method_id: 1,
        total_amount: 120000,
        shipping_cost: 15000,
        discount_amount: 5000,
        status: OrderStatus.Diproses,
        order_items: {
          create: products.slice(0, 3).map((p) => ({
            product_id: p.id,
            quantity: Math.floor(Math.random() * 2 + 1),
            price: p.price,
          })),
        },
      },
      include: { order_items: true },
    });

    await prisma.payments.create({
      data: {
        order_id: order.id,
        method: PaymentMethod.manual_transfer,
        is_verified: Math.random() > 0.3,
        verified_by: superAdmin.id,
      },
    });
  }

  console.log('✅ Seeding completed with rich mock data!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
