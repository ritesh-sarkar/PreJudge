/**
 * Standard competitive programming starter code templates per language
 */

export const CODE_TEMPLATES = {
    cpp20: `#include <iostream>

using namespace std;

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);

    int a, b;
    if (cin >> a >> b) {
        int x = a + b;
        cout << "X = " << x << "\\n";
    }

    return 0;
}
`,

    c17: `#include <stdio.h>

int main() {
    int a, b;
    if (scanf("%d %d", &a, &b) == 2) {
        int x = a + b;
        printf("X = %d\\n", x);
    }
    return 0;
}
`,

    python: `import sys

def main():
    tokens = sys.stdin.read().split()
    if len(tokens) >= 2:
        a = int(tokens[0])
        b = int(tokens[1])
        x = a + b
        print(f"X = {x}")

if __name__ == "__main__":
    main()
`,

    javascript: `const fs = require('fs');

function main() {
    const input = fs.readFileSync(0, 'utf-8').trim().split(/\\s+/);
    if (input.length >= 2 && input[0] !== '') {
        const a = parseInt(input[0], 10);
        const b = parseInt(input[1], 10);
        const x = a + b;
        console.log(\`X = \${x}\`);
    }
}

main();
`,

    java: `import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        if (scanner.hasNextInt()) {
            int a = scanner.nextInt();
            if (scanner.hasNextInt()) {
                int b = scanner.nextInt();
                int x = a + b;
                System.out.println("X = " + x);
            }
        }
        scanner.close();
    }
}
`,
};

export const LANGUAGE_LABELS = {
    cpp20: { name: 'C++20', file: 'main.cpp', compiler: 'G++ 12.3' },
    c17: { name: 'C17', file: 'main.c', compiler: 'GCC 12' },
    python: { name: 'Python 3', file: 'solution.py', compiler: 'Python 3.11' },
    javascript: { name: 'JavaScript', file: 'solution.js', compiler: 'Node.js 22' },
    java: { name: 'Java', file: 'Main.java', compiler: 'OpenJDK 17' },
};
