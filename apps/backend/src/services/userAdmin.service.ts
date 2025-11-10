import { Database } from '../config/prisma';
import {
  BadRequestError,
  ConflictError,
  NotFoundError,
} from '../utils/httpError';
import { Prisma, type PrismaClient } from '@prisma/client';
import { getCoordinates } from '../utils/address';
import { dataInput } from '../utils/type/user';

export class UserAdminService {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new Database().getInstance();
  }

  // CREATE Store Admin + Store + Store Admin Relation
  public createStoreAdmin = async (data: dataInput) => {
    if (
      data.name === '' ||
      data.email === '' ||
      data.province === '' ||
      data.city === '' ||
      data.district === '' ||
      data.address === ''
    )
      throw new BadRequestError('Missing Required Fields');

    return await this.prisma.$transaction(async (tx) => {
      const existingUser = await tx.users.findUnique({
        where: { email: data.email },
      });
      if (existingUser) throw new ConflictError('Email already registered');

      const user = await tx.users.create({
        data: {
          name: data.name,
          email: data.email,
          password: `${data.email}12345`,
          role: 'store_admin',
          is_verified: true,
        },
      });

      const { latitude, longitude, confidence } = await getCoordinates({
        province: data.province,
        city: data.city,
        district: data.district,
        subdistrict: data.address,
      });

      if (latitude === 0 || longitude === 0 || confidence < 5)
        throw new BadRequestError('Invalid Address');

      let storeName: string | null = null;
      for (let attempt = 0; attempt < 5; attempt++) {
        const randomSuffix = Math.floor(Math.random() * 9999) + 1;
        const formattedCode = String(randomSuffix).padStart(4, '0');
        const candidateName = `Store ${formattedCode}`;

        const existingStore = await tx.stores.findFirst({
          where: { name: candidateName },
        });

        if (!existingStore) {
          storeName = candidateName;
          break;
        }
      }
      if (!storeName)
        throw new ConflictError(
          'Failed to generate unique store name. Try again.'
        );

      const store = await tx.stores.create({
        data: {
          name: storeName,
          address: data.address,
          latitude,
          longitude,
          province: data.province,
          city: data.city,
          district: data.district,
        },
      });

      await tx.store_admins.create({
        data: { user_id: user.id, store_id: store.id },
      });

      return { message: 'Store admin created successfully', user, store };
    });
  };

  // UPDATE Store Admin
  public updateStoreAdmin = async (id: number, data: dataInput) => {
    if (
      data.name === '' ||
      data.email === '' ||
      data.province === '' ||
      data.city === '' ||
      data.district === '' ||
      data.address === ''
    )
      throw new BadRequestError('Missing Required Fields');

    return await this.prisma.$transaction(async (tx) => {
      const user = await tx.users.findUnique({ where: { id } });
      if (!user) throw new NotFoundError('User not found');
      if (user.role !== 'store_admin')
        throw new BadRequestError('This user is not a store admin');

      const existingEmail = await tx.users.findUnique({
        where: { email: data.email },
      });

      if (existingEmail && existingEmail.id !== id) {
        throw new ConflictError('Email already registered by another user');
      }

      const updatedUser = await tx.users.update({
        where: { id },
        data: { name: data.name, email: data.email },
      });

      const storeAdmin = await tx.store_admins.findFirst({
        where: { user_id: id },
      });
      if (!storeAdmin) throw new NotFoundError('Only store admin allowed.');

      const { latitude, longitude, confidence } = await getCoordinates({
        province: data.province,
        city: data.city,
        district: data.district,
        subdistrict: data.address,
      });

      if (latitude === 0 || longitude === 0 || confidence < 5)
        throw new BadRequestError('Invalid Address');

      const updatedStore = await tx.stores.update({
        where: { id: storeAdmin.store_id },
        data: {
          address: data.address,
          latitude,
          longitude,
          province: data.province,
          city: data.city,
          district: data.district,
        },
      });

      return {
        message: 'Store admin updated successfully',
        updatedUser,
        updatedStore,
      };
    });
  };

  // DELETE Store Admin
  public deleteStoreAdmin = async (id: number) => {
    try {
      return await this.prisma.$transaction(async (tx) => {
        const user = await tx.users.findUnique({
          where: { id },
          include: { store_admins: true },
        });

        if (!user) throw new NotFoundError('User not found');
        if (user.role !== 'store_admin')
          throw new BadRequestError('Cannot delete non-store-admin user');

        const storeId = user.store_admins[0]?.store_id;
        await tx.store_admins.deleteMany({ where: { user_id: id } });
        if (storeId) {
          await tx.stores.delete({ where: { id: storeId } });
        }
        await tx.users.delete({ where: { id } });

        return { message: 'Store admin deleted successfully' };
      });
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError) {
        if (err.code === 'P2003') {
          throw new BadRequestError(
            'Cannot delete this product because it is referenced by other data.'
          );
        }
      }
      throw err;
    }
  };
}
