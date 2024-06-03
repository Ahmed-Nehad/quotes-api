import prisma, { Prisma } from ".";

export const createCategory = async (data: Prisma.categoryCreateInput) => prisma.category.create({ data })

export const getcategories = async () => prisma.category.findMany()

export const getCategoryByName = async (name: string) => prisma.category.findUnique({ where: {name} })

export const updateCategoryByName = async (name: string, data: Prisma.categoryUpdateInput) => prisma.category.update({ data, where: {name} })

export const deleteCategoryByName = async (name: string) => prisma.category.delete({ where: {name} })