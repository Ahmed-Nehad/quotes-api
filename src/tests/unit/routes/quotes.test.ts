import test, { describe } from "node:test";
import app from "../../../app";
import assert from "assert";
import { createQuoteType } from "../../../schemas/quoteSchema";
import { createCategory, deleteCategoryByName } from "../../../database/categories";

type CRUDType = {
    method: string;
    query?: boolean;
    headers?: { [key: string]: string }
    body?: string;
    status: number;
    json?: object;
    testRes?: (res: any) => boolean
}

describe('quotes route test', async () => {

    const testData = {
        text: 'test test test test test test',
        author: 'test',
        categoryName: 'testCategory',
        id: ''
    }

    const CRUD: CRUDType[] = [
        { 
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(testData),
            status: 201,
            testRes: (res) => res.text === testData.text
        },
        { 
            method: 'GET', 
            status: 200, 
            testRes: (res: (typeof testData)[]) => res.map(r => r.text).includes(testData.text)
        },
        { 
            method: 'GET', 
            query: true, 
            status: 200, 
            testRes: (res: (typeof testData)[]) => res[0].text === testData.text
        },
        { 
            method: 'PATCH', 
            query: true, 
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ author: 'test2' }),
            status: 200, 
            testRes: (res: typeof testData) => res.text === testData.text && res.author === 'test2'
        },
        { method: 'DELETE', query: true, status: 204 },
    ]

    await createCategory({name: 'testCategory'})

    test('routes tests', async t => {
        for(const { method, query, status, headers, body, json, testRes } of CRUD){

            const thisQuery = query ? `?id=${testData.id}` : '';

            await t.test(`${method} /v1/quotes${thisQuery}`, async () => {
                let res: any = await app.request(`/v1/quotes${thisQuery}`, {
                    method,
                    headers,
                    body
                })

                assert.strictEqual(res.status, status, `status code must be ${status} not ${res.status}`);

                if(json || testRes){
                    res = await res.json()

                    if('id' in res) testData.id = res.id;

                    if(json) assert.deepStrictEqual(res, json)

                    if(testRes) assert.ok(testRes(res))
                }
            })
        }
    })

}).finally(async () => await deleteCategoryByName('testCategory'))