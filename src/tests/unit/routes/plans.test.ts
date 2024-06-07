import test, { describe } from "node:test";
import app from "../../../app";
import assert from "assert";
import { createPlanType } from "../../../schemas/planSchema";

type CRUDType = {
    method: string;
    query: string;
    headers?: { [key: string]: string }
    body?: string;
    status: number;
    json?: object;
    testRes?: (res: any) => boolean
}

describe('plans route test', () => {

    const testData: createPlanType = {
        name: 'test',
        annuallyCost: 90,
        monthlyCost: 9,
        maxCalls: 100000
    }

    const CRUD: CRUDType[] = [
        { 
            method: 'POST', 
            query: '',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(testData),
            status: 201,
            testRes: res => res.name == testData.name
        },
        { 
            method: 'GET', 
            query: '', 
            status: 200, 
            testRes: (res: (typeof testData)[]) => res.map(r => r.name).includes(testData.name) 
        },
        { 
            method: 'PATCH', 
            query: '?name=test', 
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ monthlyCost: 8 }),
            status: 200, 
            testRes: res => res.name == testData.name && res.monthlyCost == 8
        },
        { method: 'DELETE', query: '?name=test', status: 204 },
    ]

    for(const { method, query, status, headers, body, json, testRes } of CRUD){
        test(`${method} /v1/plans${query}`, async () => {
            let res = await app.request(`/v1/plans${query}`, {
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