import test, { describe } from "node:test";
import app from "../../../app";
import assert from "assert";
import { createPlan, deletePlanByName } from "../../../database/plans";

type CRUDType = {
    method: string;
    query?: boolean;
    headers?: { [key: string]: string }
    body?: string;
    status: number;
    json?: object;
    testRes?: (res: any) => boolean
}

describe('users route test', async () => {

    const randomNumber = Math.floor(Math.random() * 1000)
    const testData = {
        name: `exmaple${randomNumber}name`,
        email: `exmaple${randomNumber}@email.com`,
        password: `password${randomNumber}`,
        id: ''
    }

    const CRUD: CRUDType[] = [
        { 
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(testData),
            status: 201,
            testRes: (res) => res.name === testData.name
        },
        { 
            method: 'GET', 
            status: 200, 
            testRes: (res: (typeof testData)[]) => res.map(r => r.name).includes(testData.name)
        },
        { 
            method: 'GET', 
            query: true, 
            status: 200, 
            testRes: (res: (typeof testData)[]) => res[0].name === testData.name
        },
        { 
            method: 'PATCH', 
            query: true, 
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ email: 'test2@email.com' }),
            status: 200, 
            testRes: (res) => res.user.name === testData.name && res.user.email === 'test2@email.com'
        },
        { method: 'DELETE', query: true, status: 204 },
    ]

    await createPlan({ name: 'testFree', annuallyCost: 0, maxCalls: 0, monthlyCost: 5, default: true, annuallyPlanId: '', monthlyPlanId: '' })

    await test('routes tests', async t => {
        for(const { method, query, status, headers, body, json, testRes } of CRUD){

            const thisQuery = query ? `?id=${testData.id}` : '';

            await t.test(`${method} /v1/users${thisQuery}`, async () => {
                let res: any = await app.request(`/v1/users${thisQuery}`, {
                    method,
                    headers,
                    body
                })

                assert.strictEqual(res.status, status, `status code must be ${status} not ${res.status}`);

                if(json || testRes){
                    res = await res.json()
                    
                    if('id' in res) testData.id = res.id

                    if(json) assert.deepStrictEqual(res, json)

                    if(testRes) assert.ok(testRes(res))
                }
            })
        }
    })

}).then(() => setTimeout(() => deletePlanByName('testFree'), 1000))