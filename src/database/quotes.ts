import prisma, { Prisma } from ".";

export const createQuote = async (data: Prisma.QuoteCreateInput) => prisma.quote.create({ data })

export const getQuotes = async () => prisma.quote.findMany()

export const getQuoteById = async (id: string) => prisma.quote.findUnique({ where: {id} })

export const updateQuoteById = async (id: string, data: Prisma.QuoteUpdateInput) => prisma.quote.update({ data, where: {id} })

export const deleteQuoteById = async (id: string) => prisma.quote.delete({ where: {id} })