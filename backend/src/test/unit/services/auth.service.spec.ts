import { compare, hash } from 'bcryptjs';
import { CreateUserDto } from '@dtos/users.dto';
import { User } from '@entities/user.entity';
import { InMemoryUsersRepository } from '@repositories/in-memory-users.repository';
import { AuthService } from '@services/auth.service';

describe('AuthService (with UserMemoryRepository)', () => {
  let authService: AuthService;
  let userRepo: InMemoryUsersRepository;

  beforeEach(async () => {
    userRepo = new InMemoryUsersRepository();
    authService = new AuthService(userRepo);
  });

  it('should sign up a new user', async () => {
    const dto: CreateUserDto = {
      email: 'newuser@example.com',
      password: 'newpassword123',
      name: 'New User',
    };
    const created = await authService.signup(dto);
    expect(created.email).toBe(dto.email);

    const found = await userRepo.findByEmail(dto.email);
    expect(found).toBeDefined();
    expect(await compare(dto.password, found!.password)).toBe(true);
  });

  it('should throw an error if email is already in use', async () => {
    // First create a user
    const existingUser = await User.create({
      email: 'existing@example.com',
      password: 'password123',
      name: 'Existing User',
    });
    await userRepo.save(existingUser);

    const dto: CreateUserDto = {
      email: 'existing@example.com',
      password: 'anypass1',
      name: 'Anyone',
    };
    await expect(authService.signup(dto)).rejects.toThrow(/already/);
  });

  it('should return user and cookie on successful login', async () => {
    // Create user using Entity
    const plainPassword = 'mySecret123';
    const email = 'loginuser@example.com';
    const user = await User.create({ email, password: plainPassword, name: 'Login User' });
    await userRepo.save(user);

    const result = await authService.login({ email, password: plainPassword });
    expect(result.user.email).toBe(email);
    expect(result.cookie).toContain('Authorization=');
  });

  it('should throw an error if email or password is incorrect', async () => {
    // Non-existing email
    await expect(
      authService.login({ email: 'nobody@example.com', password: 'wrongpass1' }),
    ).rejects.toThrow(/Invalid email or password/i);

    // Create user and test wrong password
    const user = await User.create({
      email: 'test@example.com',
      password: 'correctpass1',
      name: 'Test User',
    });
    await userRepo.save(user);

    await expect(
      authService.login({ email: 'test@example.com', password: 'wrongpass2' }),
    ).rejects.toThrow(/password/i);
  });

  it('should successfully logout without errors', async () => {
    const user = await User.create({
      email: 'logout@example.com',
      password: 'password123',
      name: 'Logout User',
    });
    await expect(authService.logout(user)).resolves.toBeUndefined();
  });
});
