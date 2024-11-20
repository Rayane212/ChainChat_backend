import { Prisma } from "@prisma/client";

export class User implements Prisma.UserCreateInput {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  phoneNumber: string;
  bio: string;
  password: string;
  status: string;
  birthday: string | Date;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}