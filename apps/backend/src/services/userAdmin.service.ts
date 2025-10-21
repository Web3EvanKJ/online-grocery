import { Database } from '../config/prisma';
import {
  BadRequestError,
  ConflictError,
  NotFoundError,
} from '../utils/httpError';
import type { PrismaClient } from '@prisma/client';
import { validationStoreAdminSchema } from '../utils/validationSchema';
import { getCoordinates } from '../utils/address';

type dataInput = {
  name: string;
  email: string;
  province: string;
  city: string;
  district: string;
  address: string;
};

export class UserAdminService {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new Database().getInstance();
  }

  /**
   * CREATE Store Admin + Store + Store Admin Relation
   */
  public createStoreAdmin = async (data: dataInput) => {
    await validationStoreAdminSchema.validate(data);

    const existingUser = await this.prisma.users.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new ConflictError('Email already registered');
    }

    // Create new user with role = store_admin
    const user = await this.prisma.users.create({
      data: {
        name: data.name,
        email: data.email,
        password: `${data.email}12345`,
        role: 'store_admin',
        is_verified: true,
      },
    });

    const { latitude, longitude } = await getCoordinates({
      province: data.province,
      city: data.city,
      district: data.district,
      address: data.address,
    });

    const store = await this.prisma.stores.create({
      data: {
        name: 'temporary',
        address: data.address,
        latitude: latitude,
        longitude: longitude,
      },
    });

    await this.prisma.stores.update({
      where: { id: store.id },
      data: { name: `Store ${store.id}` },
    });

    await this.prisma.store_admins.create({
      data: {
        user_id: user.id,
        store_id: store.id,
      },
    });

    return { message: 'Store admin created successfully', user, store };
  };

  /**
   * READ - Pagination + Filter
   */
  public getUsers = async (query: any) => {
    const { page = 1, limit = 10, role, search } = query;
    const skip = (Number(page) - 1) * Number(limit);

    const whereClause: any = {};

    if (role) {
      whereClause.role = role;
    }

    if (search) {
      whereClause.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        {
          store_admins: {
            some: {
              store: { name: { contains: search, mode: 'insensitive' } },
            },
          },
        },
        {
          store_admins: {
            some: {
              store: { address: { contains: search, mode: 'insensitive' } },
            },
          },
        },
      ];
    }

    const [users, total] = await Promise.all([
      this.prisma.users.findMany({
        where: whereClause,
        skip,
        take: Number(limit),
        include: {
          store_admins: {
            include: {
              store: true,
            },
          },
        },
        orderBy: { created_at: 'desc' },
      }),
      this.prisma.users.count({ where: whereClause }),
    ]);

    return {
      data: users.map((u) => ({
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role,
        city: u.store_admins[0]?.store?.address ?? '',
        address: u.store_admins[0]?.store?.address ?? '',
      })),
      pagination: {
        total,
        page: Number(page),
        totalPages: Math.ceil(total / Number(limit)),
      },
    };
  };

  /**
   * UPDATE Store Admin
   */
  public updateStoreAdmin = async (id: number, data: dataInput) => {
    await validationStoreAdminSchema.validate(data);

    const user = await this.prisma.users.findUnique({ where: { id } });
    if (!user) throw new NotFoundError('User not found');
    if (user.role !== 'store_admin')
      throw new BadRequestError('This user is not a store admin');

    // Update user
    const updatedUser = await this.prisma.users.update({
      where: { id },
      data: { name: data.name, email: data.email },
    });

    // Update store
    const storeAdmin = await this.prisma.store_admins.findFirst({
      where: { user_id: id },
    });
    if (storeAdmin) {
      await this.prisma.stores.update({
        where: { id: storeAdmin.store_id },
        data: { address: data.address },
      });
    }

    return { message: 'Store admin updated successfully', updatedUser };
  };

  /**
   * DELETE Store Admin
   */
  public deleteStoreAdmin = async (id: number) => {
    const user = await this.prisma.users.findUnique({
      where: { id },
      include: { store_admins: true },
    });

    if (!user) throw new NotFoundError('User not found');
    if (user.role !== 'store_admin')
      throw new BadRequestError('Cannot delete non-store-admin user');

    await this.prisma.store_admins.deleteMany({
      where: { user_id: id },
    });

    // Optional: delete store also if not used by other admin
    const storeId = user.store_admins[0]?.store_id;
    if (storeId) {
      await this.prisma.stores.delete({ where: { id: storeId } });
    }

    await this.prisma.users.delete({ where: { id } });

    return { message: 'Store admin deleted successfully' };
  };
}
