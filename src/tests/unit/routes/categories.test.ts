import test, { describe } from "node:test";
import app from "../../../app";
import assert from "assert";
import { createCategoryType } from "../../../schemas/categioySchema";

type CRUDType = {
    method: string;
    query: string;
    headers?: { [key: string]: string }
    body?: string;
    status: number;
    json?: object;
    testRes?: (res: any) => boolean
}

describe('categories route test', () => {

    const testData: createCategoryType = { name: 'test' }

    const CRUD: CRUDType[] = [
        { 
            method: 'POST', 
            query: '',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(testData),
            status: 201,
            json: testData
        },
        { 
            method: 'GET', 
            query: '', 
            status: 200, 
            testRes: (res: {name: string}[]) => res.map(r => r.name).includes(testData.name) 
        },
        { method: 'GET', query: '?name=test', status: 200, json: [testData] },
        { method: 'DELETE', query: '?name=test', status: 204 },
    ]

    for(const { method, query, status, headers, body, json, testRes } of CRUD){
        test(`${method} /v1/categories${query}`, async () => {
            let res = await app.request(`/v1/categories${query}`, {
                method,
                headers,
                body
            })

            assert.strictEqual(res.status, status, `status code must be ${status} not ${res.status}`);

            if(json || testRes){
                res = await res.json()
                
                if(json) assert.deepStrictEqual(res, json)

                if(testRes) assert.ok(testRes(res))
            }
        })
    }
})