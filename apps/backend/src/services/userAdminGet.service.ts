import { Database } from '../config/prisma';
import { Role } from '@prisma/client';
import type { Prisma, PrismaClient } from '@prisma/client';

export interface GetUsersQuery {
  page?: number | string;
  limit?: number | string;
  role?: 'user' | 'store_admin' | 'super_admin';
  search?: string;
  sortOrder?: 'asc' | 'desc';
}

export class UserAdminGetService {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new Database().getInstance();
  }

  // READ - Pagination + Filter
  public getUsers = async (query: GetUsersQuery) => {
    const { page = 1, limit = 10, role, search, sortOrder = 'desc' } = query;
    const skip = (Number(page) - 1) * Number(limit);

    const whereClause: Prisma.usersWhereInput = {};
    if (role) whereClause.role = role;

    if (search) {
      whereClause.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        {
          store_admins: {
            some: {
              store: {
                OR: [
                  { name: { contains: search, mode: 'insensitive' } },
                  { address: { contains: search, mode: 'insensitive' } },
                  { city: { contains: search, mode: 'insensitive' } },
                  { district: { contains: search, mode: 'insensitive' } },
                ],
              },
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
          addresses: true,
        },
        orderBy: { created_at: sortOrder },
      }),
      this.prisma.users.count({ where: whereClause }),
    ]);

    const mappedUsers = await Promise.all(
      users.map(async (u) => {
        let lat = 0;
        let lon = 0;
        let province = '';
        let city = '';
        let district = '';
        let address = '';
        if (u.role === Role.store_admin) {
          const store = u.store_admins[0].store;
          lat = Number(store.latitude);
          lon = Number(store.longitude);
          province = store.province;
          city = store.city;
          district = store.district;
          address = store.address;
        }

        if (u.role === Role.user && u.addresses.length > 0) {
          const addresses = u.addresses[0];
          lat = Number(addresses?.latitude);
          lon = Number(addresses?.longitude);
          province = addresses.province;
          city = addresses.city;
          district = addresses.district;
          address = addresses.address_detail;
        }

        return {
          id: u.id,
          name:
            u.role === Role.store_admin
              ? u.store_admins[0]?.store?.name
              : u.name,
          email: u.email,
          role: u.role,
          latitude: lat,
          longitude: lon,
          province,
          city,
          district,
          address,
        };
      })
    );

    return {
      data: mappedUsers,
      pagination: {
        total,
        page: Number(page),
        totalPages: Math.ceil(total / Number(limit)),
      },
    };
  };
}
