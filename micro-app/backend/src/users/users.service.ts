import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    const user = this.userRepository.create({
      ...createUserDto,
      password: hashedPassword,
    });
    const saved = await this.userRepository.save(user);
    return this.stripPassword(saved);
  }

  async findAll(): Promise<User[]> {
    const users = await this.userRepository.find({ relations: ['rol'] });
    return users.map(u => this.stripPassword(u));
  }

  async findOne(id: number): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return this.stripPassword(user);
  }

  async findOneWithRole(id: number): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['rol'],
    });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return this.stripPassword(user);
  }

  // Usado internamente por auth: necesita el hash para comparar contraseñas
  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { email } });
  }

  // Usado internamente por auth: necesita el hash para comparar contraseñas
  async findByEmailWithRole(email: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { email },
      relations: ['rol'],
    });
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    if (updateUserDto.password) {
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
    }
    Object.assign(user, updateUserDto);
    const saved = await this.userRepository.save(user);
    return this.stripPassword(saved);
  }

  async remove(id: number): Promise<void> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    await this.userRepository.remove(user);
  }

  async resetPassword(id: number, newPassword: string): Promise<void> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await this.userRepository.save(user);
  }

  /** Elimina el campo password del objeto antes de retornar al cliente */
  private stripPassword(user: User): User {
    const { password, ...safeUser } = user;
    return safeUser as User;
  }
}
