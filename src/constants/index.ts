export const jwtSecret = process.env.JWT_SECRET;

export enum Roles {
  ADMIN = 1,
  USER = 2,
  TEACHER = 4,
  STUDENT = 5,
  OTHERS = 6,
}
