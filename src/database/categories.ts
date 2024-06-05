import prisma, { Prisma } from ".";

export const createCategory = async (data: Prisma.categoryCreateInput) => prisma.category.create({ data })

export const getCategories = async (where?: Prisma.categoryWhereInput) => prisma.category.findMany({ where })

export const getCategoryByName = async (name: string) => prisma.category.findUnique({ where: {name} })

export const deleteCategoryByName = async (name: string) => prisma.category.delete({ where: {name} })