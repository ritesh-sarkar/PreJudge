import assert from 'assert';
import { validateAndTranspileToJs } from '../lib/transpiler.js';
import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import os from 'os';

async function runNodeCode(jsCode, input = '') {
    const tmpFile = path.join(os.tmpdir(), `test_run_${Date.now()}_${Math.random().toString(36).slice(2)}.js`);
    await fs.promises.writeFile(tmpFile, jsCode, 'utf8');

    return new Promise((resolve) => {
        let stdout = '';
        let stderr = '';
        const proc = spawn('node', [tmpFile]);
        if (input) proc.stdin.write(input);
        proc.stdin.end();

        proc.stdout.on('data', d => stdout += d.toString());
        proc.stderr.on('data', d => stderr += d.toString());
        proc.on('close', (code) => {
            fs.promises.unlink(tmpFile).catch(() => {});
            resolve({ code, stdout, stderr });
        });
        proc.on('error', (err) => {
            fs.promises.unlink(tmpFile).catch(() => {});
            resolve({ code: -1, stdout: '', stderr: err.message });
        });
    });
}

async function runSuite() {
    console.log('--- Testing STL, Libraries, & Multi-Language Expansion ---');

    // 1. C++ STL Containers Test (vector, stack, queue, priority_queue, deque, set, map, bitset, pair, stringstream)
    const cppCode = `
#include <iostream>
#include <vector>
#include <stack>
#include <queue>
#include <deque>
#include <set>
#include <map>
#include <bitset>
#include <algorithm>
#include <numeric>
#include <cmath>
#include <cstring>
#include <sstream>

using namespace std;

int main() {
    // Vector
    vector<int> v;
    v.push_back(10);
    v.push_back(20);
    v.push_back(5);
    sort(v.begin(), v.end());
    cout << "V:" << v[0] << "," << v[1] << "," << v[2] << endl;

    // Stack
    stack<int> s;
    s.push(100);
    s.push(200);
    cout << "S:" << s.top() << endl;
    s.pop();
    cout << "S2:" << s.top() << endl;

    // Queue
    queue<int> q;
    q.push(1);
    q.push(2);
    cout << "Q:" << q.front() << "," << q.back() << endl;
    q.pop();
    cout << "Q2:" << q.front() << endl;

    // Priority Queue
    priority_queue<int> pq;
    pq.push(10);
    pq.push(50);
    pq.push(20);
    cout << "PQ:" << pq.top() << endl;

    // Set
    set<int> st;
    st.insert(42);
    st.insert(10);
    st.insert(42);
    cout << "SET_SZ:" << st.size() << " CNT:" << st.count(42) << endl;

    // Map
    map<string, int> mp;
    mp["alpha"] = 100;
    mp["beta"] = 200;
    cout << "MAP:" << mp["alpha"] << "," << mp["beta"] << endl;

    // Bitset
    bitset<8> bs(42);
    cout << "BITSET_CNT:" << bs.count() << endl;

    // Pair
    pair<int, string> p = make_pair(7, "seven");
    cout << "PAIR:" << p.first << "," << p.second << endl;

    // Algorithms: accumulate, min, max, gcd, popcount
    cout << "ACC:" << accumulate(v.begin(), v.end(), 0) << endl;
    cout << "GCD:" << __gcd(24, 36) << endl;
    cout << "POPCNT:" << __builtin_popcount(7) << endl;

    return 0;
}
`;

    console.log('1. Testing C++ STL containers...');
    const cppRes = validateAndTranspileToJs(cppCode, 'cpp20');
    assert.strictEqual(cppRes.success, true, 'Transpilation should succeed');
    const cppRun = await runNodeCode(cppRes.jsCode);
    console.log('CPP Output:\n' + cppRun.stdout);
    assert.ok(cppRun.stdout.includes('V:5,10,20'), 'Vector sort worked');
    assert.ok(cppRun.stdout.includes('S:200'), 'Stack top worked');
    assert.ok(cppRun.stdout.includes('Q:1,2'), 'Queue front/back worked');
    assert.ok(cppRun.stdout.includes('PQ:50'), 'PQ top worked');
    assert.ok(cppRun.stdout.includes('SET_SZ:2 CNT:1'), 'Set worked');
    assert.ok(cppRun.stdout.includes('MAP:100,200'), 'Map worked');
    assert.ok(cppRun.stdout.includes('ACC:35'), 'Accumulate worked');
    assert.ok(cppRun.stdout.includes('GCD:12'), 'GCD worked');
    assert.ok(cppRun.stdout.includes('POPCNT:3'), 'Popcount worked');
    console.log('✓ C++ STL containers verified successfully!\n');

    // 2. Testing Java Standard Library (Scanner, BigInteger, Math, Arrays, Collections, StringBuilder)
    const javaCode = `
import java.util.Scanner;
import java.util.Arrays;
import java.util.Collections;
import java.util.ArrayList;
import java.math.BigInteger;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int a = sc.nextInt();
        int b = sc.nextInt();
        System.out.println("SUM=" + (a + b));

        BigInteger big1 = new BigInteger("12345678901234567890");
        BigInteger big2 = new BigInteger("98765432109876543210");
        System.out.println("BIG_SUM=" + big1.add(big2));

        StringBuilder sb = new StringBuilder("hello");
        sb.append(" world");
        System.out.println("SB=" + sb.reverse().toString());

        int[] arr = { 5, 2, 8, 1 };
        Arrays.sort(arr);
        System.out.println("ARR_MIN=" + arr[0] + " ARR_MAX=" + arr[3]);
    }
}
`;

    console.log('2. Testing Java Standard Library...');
    const javaRes = validateAndTranspileToJs(javaCode, 'java');
    assert.strictEqual(javaRes.success, true, 'Java transpilation should succeed');
    const javaRun = await runNodeCode(javaRes.jsCode, '15 25\n');
    console.log('Java Output:\n' + javaRun.stdout);
    assert.ok(javaRun.stdout.includes('SUM=40'), 'Java Scanner worked');
    assert.ok(javaRun.stdout.includes('BIG_SUM=111111111011111111100'), 'BigInteger worked');
    assert.ok(javaRun.stdout.includes('SB=dlrow olleh'), 'StringBuilder worked');
    assert.ok(javaRun.stdout.includes('ARR_MIN=1 ARR_MAX=8'), 'Arrays.sort worked');
    console.log('✓ Java Standard Library verified successfully!\n');

    // 3. Testing Python Built-ins and Libraries (sys, math, collections, heapq, bisect)
    const pythonCode = `
import sys
import math
from collections import deque, Counter
import heapq
import bisect

def main():
    lines = sys.stdin.read().split()
    if not lines:
        return
    x = int(lines[0])
    y = int(lines[1])
    print(f"PY_SUM={x + y}")
    print(f"PY_SQRT={math.isqrt(x + y)}")

    d = deque([1, 2, 3])
    d.append(4)
    d.appendleft(0)
    print(f"DEQUE={list(d)}")

    h = [5, 1, 3]
    heapq.heapify(h)
    print(f"HEAP_MIN={heapq.heappop(h)}")

    arr = [10, 20, 30, 40]
    idx = bisect.bisect_left(arr, 25)
    print(f"BISECT={idx}")

if __name__ == '__main__':
    main()
`;

    console.log('3. Testing Python Standard Library & Modules...');
    const pyRes = validateAndTranspileToJs(pythonCode, 'python');
    assert.strictEqual(pyRes.success, true, 'Python transpilation should succeed');
    const pyRun = await runNodeCode(pyRes.jsCode, '20 16\n');
    console.log('Python Output:\n' + pyRun.stdout);
    assert.ok(pyRun.stdout.includes('PY_SUM=36'), 'Python arithmetic worked');
    assert.ok(pyRun.stdout.includes('PY_SQRT=6'), 'Python math.isqrt worked');
    assert.ok(pyRun.stdout.includes('DEQUE=[0, 1, 2, 3, 4]'), 'Python deque worked');
    assert.ok(pyRun.stdout.includes('HEAP_MIN=1'), 'Python heapq worked');
    assert.ok(pyRun.stdout.includes('BISECT=2'), 'Python bisect worked');
    console.log('✓ Python Standard Library verified successfully!\n');

    console.log('ALL EXPANSION TESTS COMPLETED SUCCESSFULLY!');
}

runSuite().catch(err => {
    console.error('Test suite failed:', err);
    process.exit(1);
});
