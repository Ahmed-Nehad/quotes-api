import prisma, { Prisma } from ".";

export const createQuote = async (data: Prisma.QuoteCreateInput) => prisma.quote.create({ data })

export const getQuotes = async (where?: Prisma.QuoteWhereInput) => prisma.quote.findMany({where, })

export const getQuoteById = async (id: string) => prisma.quote.findUnique({ where: {id} })

export const getRandomQuote = async (categoryName?: string, author?: string) => {
    const count = await prisma.quote.count({ where: { categoryName, author } });

    const skip = Math.floor(Math.random() * count);

    const quotes = await prisma.quote.findMany({
        take: 1, 
        skip,
        where: {categoryName, author},
        select: {
            text: true,
            categoryName: true,
            author: true
        }
    })
    
    return quotes[0] || null
}

export const updateQuoteById = async (id: string, data: Prisma.QuoteUpdateInput) => prisma.quote.update({ data, where: {id} })

export const deleteQuoteById = async (id: string) => prisma.quote.delete({ where: {id} })