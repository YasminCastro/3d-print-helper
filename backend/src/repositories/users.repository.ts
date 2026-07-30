import { singleton } from 'tsyringe';
import { User } from '@entities/user.entity';
import { prisma } from '@config/prisma';

export interface IUsersRepository {
  findAll(): Promise<User[]>;
  findById(id: string): Promise<User | undefined>;
  findByEmail(email: string): Promise<User | undefined>;
  save(user: User): Promise<User>;
  update(id: string, user: User): Promise<User | undefined>;
  delete(id: string): Promise<boolean>;
}

@singleton()
export class UsersRepository implements IUsersRepository {
  async findAll(): Promise<User[]> {
    const rows = await prisma.user.findMany();
    return rows.map((row) => User.fromPersistence(row));
  }

  async findById(id: string): Promise<User | undefined> {
    const row = await prisma.user.findUnique({ where: { id } });
    return row ? User.fromPersistence(row) : undefined;
  }

  async findByEmail(email: string): Promise<User | undefined> {
    const row = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    return row ? User.fromPersistence(row) : undefined;
  }

  async save(user: User): Promise<User> {
    await prisma.user.create({ data: user.toPersistence() });
    return user;
  }

  async update(id: string, user: User): Promise<User | undefined> {
    const exists = await prisma.user.findUnique({ where: { id } });
    if (!exists) return undefined;

    await prisma.user.update({ where: { id }, data: user.toPersistence() });
    return user;
  }

  async delete(id: string): Promise<boolean> {
    const exists = await prisma.user.findUnique({ where: { id } });
    if (!exists) return false;

    await prisma.user.delete({ where: { id } });
    return true;
  }
}
