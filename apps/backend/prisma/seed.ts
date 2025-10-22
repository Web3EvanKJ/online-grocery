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
import { UserAdminService } from '../src/services/userAdmin.service'; // adjust path as needed

const prisma = new PrismaClient();
const userAdminService = new UserAdminService();

async function main() {
  console.log('🌱 Seeding database with rich sample data...');

  // ---------------------------------------------------------------------------
  // SUPER ADMIN + NORMAL USERS
  // ---------------------------------------------------------------------------
  const superAdmin = await prisma.users.upsert({
    where: { email: 'superadmin@shop.com' },
    update: {},
    create: {
      name: 'Super Admin',
      email: 'superadmin@shop.com',
      role: Role.super_admin,
      is_verified: true,
    },
  });

  const customersData = [
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

  const customers = await Promise.all(
    customersData.map((u) =>
      prisma.users.upsert({
        where: { email: u.email },
        update: {},
        create: u,
      })
    )
  );

  // ---------------------------------------------------------------------------
  // STORE ADMINS (use service method)
  // ---------------------------------------------------------------------------
  const storeAdminsInput = [
    {
      name: 'Alice StoreAdmin',
      email: 'alice@store.com',
      province: 'DKI Jakarta',
      city: 'Jakarta Selatan',
      district: 'Setiabudi',
      address: 'Jl. Sudirman No. 99, Jakarta',
    },
    {
      name: 'Bob StoreAdmin',
      email: 'bob@store.com',
      province: 'Jawa Barat',
      city: 'Bandung',
      district: 'Bandung Wetan',
      address: 'Jl. Diponegoro No. 12, Bandung',
    },
  ];

  const storeAdmins = [];
  for (const input of storeAdminsInput) {
    const { user, store } = await userAdminService.createStoreAdmin(input);
    storeAdmins.push({ user, store });
  }

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
  // PRODUCTS
  // ---------------------------------------------------------------------------
  const products = [];
  for (const { store } of storeAdmins) {
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
  // INVENTORY
  // ---------------------------------------------------------------------------
  for (const { store } of storeAdmins) {
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
  // ADDRESSES
  // ---------------------------------------------------------------------------
  const addresses = [];
  for (const user of customers) {
    const addr = await prisma.addresses.create({
      data: {
        user_id: user.id,
        label: 'Home',
        address_detail: `Jl. Example Street No. ${Math.floor(
          Math.random() * 100
        )}`,
        province: 'DKI Jakarta',
        city: 'Jakarta Barat',
        district: 'Kalideres',
        latitude: 6.2 + Math.random() * 0.1,
        longitude: 106.8 + Math.random() * 0.1,
        is_main: true,
      },
    });
    addresses.push(addr);
  }

  console.log('✅ Seeding completed with consistent data!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
