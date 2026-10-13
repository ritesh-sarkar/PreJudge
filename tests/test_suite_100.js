import { validateAndTranspileToJs } from '../lib/transpiler.js';
import { compareOutputs } from '../lib/comparison.js';
import { spawnSync } from 'child_process';
import fs from 'fs';

// 100 Beecrowd Problems Test Bank (1000 - 3000 series)
export const PROBLEMS_100 = [
    {
        id: '1001',
        name: 'Extremely Basic',
        cpp: `#include <iostream>
using namespace std;
int main() {
    int A, B;
    if (cin >> A >> B) {
        cout << "X = " << A + B << endl;
    }
    return 0;
}`,
        tests: [
            { input: '10\n9\n', expected: 'X = 19\n' },
            { input: '-10\n4\n', expected: 'X = -6\n' },
            { input: '15\n-7\n', expected: 'X = 8\n' }
        ]
    },
    {
        id: '1002',
        name: 'Area of a Circle',
        cpp: `#include <iostream>
#include <iomanip>
using namespace std;
int main() {
    double R;
    if (cin >> R) {
        double A = 3.14159 * R * R;
        cout << fixed << setprecision(4) << "A=" << A << endl;
    }
    return 0;
}`,
        tests: [
            { input: '2.00\n', expected: 'A=12.5664\n' },
            { input: '100.64\n', expected: 'A=31819.3103\n' }
        ]
    },
    {
        id: '1003',
        name: 'Simple Sum',
        cpp: `#include <iostream>
using namespace std;
int main() {
    int A, B;
    if (cin >> A >> B) {
        cout << "SOMA = " << A + B << endl;
    }
    return 0;
}`,
        tests: [
            { input: '30\n10\n', expected: 'SOMA = 40\n' },
            { input: '-30\n10\n', expected: 'SOMA = -20\n' }
        ]
    },
    {
        id: '1004',
        name: 'Simple Product',
        cpp: `#include <iostream>
using namespace std;
int main() {
    int A, B;
    if (cin >> A >> B) {
        cout << "PROD = " << A * B << endl;
    }
    return 0;
}`,
        tests: [
            { input: '3\n9\n', expected: 'PROD = 27\n' },
            { input: '-30\n10\n', expected: 'PROD = -300\n' }
        ]
    },
    {
        id: '1005',
        name: 'Average 1',
        cpp: `#include <iostream>
#include <iomanip>
using namespace std;
int main() {
    double A, B;
    if (cin >> A >> B) {
        double MEDIA = (A * 3.5 + B * 7.5) / 11.0;
        cout << fixed << setprecision(5) << "MEDIA = " << MEDIA << endl;
    }
    return 0;
}`,
        tests: [
            { input: '5.0\n7.1\n', expected: 'MEDIA = 6.43182\n' },
            { input: '0.0\n7.1\n', expected: 'MEDIA = 4.84091\n' }
        ]
    },
    {
        id: '1006',
        name: 'Average 2',
        cpp: `#include <iostream>
#include <iomanip>
using namespace std;
int main() {
    double A, B, C;
    if (cin >> A >> B >> C) {
        double MEDIA = (A * 2.0 + B * 3.0 + C * 5.0) / 10.0;
        cout << fixed << setprecision(1) << "MEDIA = " << MEDIA << endl;
    }
    return 0;
}`,
        tests: [
            { input: '5.0\n6.0\n7.0\n', expected: 'MEDIA = 6.3\n' },
            { input: '5.0\n10.0\n10.0\n', expected: 'MEDIA = 9.0\n' }
        ]
    },
    {
        id: '1007',
        name: 'Difference',
        cpp: `#include <iostream>
using namespace std;
int main() {
    int A, B, C, D;
    if (cin >> A >> B >> C >> D) {
        cout << "DIFERENCA = " << (A * B - C * D) << endl;
    }
    return 0;
}`,
        tests: [
            { input: '5\n6\n7\n8\n', expected: 'DIFERENCA = -26\n' },
            { input: '0\n0\n7\n8\n', expected: 'DIFERENCA = -56\n' }
        ]
    },
    {
        id: '1008',
        name: 'Salary',
        cpp: `#include <iostream>
#include <iomanip>
using namespace std;
int main() {
    int num, hrs;
    double rate;
    if (cin >> num >> hrs >> rate) {
        cout << "NUMBER = " << num << endl;
        cout << fixed << setprecision(2) << "SALARY = U$ " << (hrs * rate) << endl;
    }
    return 0;
}`,
        tests: [
            { input: '25\n100\n5.50\n', expected: 'NUMBER = 25\nSALARY = U$ 550.00\n' },
            { input: '1\n200\n20.50\n', expected: 'NUMBER = 1\nSALARY = U$ 4100.00\n' }
        ]
    },
    {
        id: '1009',
        name: 'Salary with Bonus',
        cpp: `#include <iostream>
#include <iomanip>
#include <string>
using namespace std;
int main() {
    string name;
    double salary, sales;
    if (cin >> name >> salary >> sales) {
        double total = salary + sales * 0.15;
        cout << fixed << setprecision(2) << "TOTAL = R$ " << total << endl;
    }
    return 0;
}`,
        tests: [
            { input: 'JOAO\n500.00\n1230.30\n', expected: 'TOTAL = R$ 684.55\n' },
            { input: 'PEDRO\n700.00\n0.00\n', expected: 'TOTAL = R$ 700.00\n' }
        ]
    },
    {
        id: '1010',
        name: 'Simple Calculate',
        cpp: `#include <iostream>
#include <iomanip>
using namespace std;
int main() {
    int c1, q1, c2, q2;
    double p1, p2;
    if (cin >> c1 >> q1 >> p1 >> c2 >> q2 >> p2) {
        double total = q1 * p1 + q2 * p2;
        cout << fixed << setprecision(2) << "VALOR A PAGAR: R$ " << total << endl;
    }
    return 0;
}`,
        tests: [
            { input: '12 1 5.30\n16 2 5.10\n', expected: 'VALOR A PAGAR: R$ 15.50\n' },
            { input: '13 2 15.30\n161 4 5.20\n', expected: 'VALOR A PAGAR: R$ 51.40\n' }
        ]
    },
    {
        id: '1011',
        name: 'Sphere',
        cpp: `#include <iostream>
#include <iomanip>
using namespace std;
int main() {
    double R;
    if (cin >> R) {
        double volume = (4.0 / 3) * 3.14159 * (R * R * R);
        cout << fixed << setprecision(3) << "VOLUME = " << volume << endl;
    }
    return 0;
}`,
        tests: [
            { input: '3\n', expected: 'VOLUME = 113.097\n' },
            { input: '15\n', expected: 'VOLUME = 14137.155\n' }
        ]
    },
    {
        id: '1012',
        name: 'Area',
        cpp: `#include <iostream>
#include <iomanip>
using namespace std;
int main() {
    double A, B, C;
    if (cin >> A >> B >> C) {
        cout << fixed << setprecision(3);
        cout << "TRIANGULO: " << (A * C / 2.0) << endl;
        cout << "CIRCULO: " << (3.14159 * C * C) << endl;
        cout << "TRAPEZIO: " << ((A + B) * C / 2.0) << endl;
        cout << "QUADRADO: " << (B * B) << endl;
        cout << "RETANGULO: " << (A * B) << endl;
    }
    return 0;
}`,
        tests: [
            { input: '3.0 4.0 5.2\n', expected: 'TRIANGULO: 7.800\nCIRCULO: 84.949\nTRAPEZIO: 18.200\nQUADRADO: 16.000\nRETANGULO: 12.000\n' }
        ]
    },
    {
        id: '1013',
        name: 'The Greatest',
        cpp: `#include <iostream>
#include <cmath>
using namespace std;
int main() {
    int a, b, c;
    if (cin >> a >> b >> c) {
        int m1 = (a + b + abs(a - b)) / 2;
        int m2 = (m1 + c + abs(m1 - c)) / 2;
        cout << m2 << " eh o maior" << endl;
    }
    return 0;
}`,
        tests: [
            { input: '7 14 106\n', expected: '106 eh o maior\n' },
            { input: '217 14 6\n', expected: '217 eh o maior\n' }
        ]
    },
    {
        id: '1014',
        name: 'Consumption',
        cpp: `#include <iostream>
#include <iomanip>
using namespace std;
int main() {
    int X;
    double Y;
    if (cin >> X >> Y) {
        cout << fixed << setprecision(3) << (X / Y) << " km/l" << endl;
    }
    return 0;
}`,
        tests: [
            { input: '500\n35.0\n', expected: '14.286 km/l\n' },
            { input: '2254\n124.4\n', expected: '18.119 km/l\n' }
        ]
    },
    {
        id: '1015',
        name: 'Distance Between Two Points',
        cpp: `#include <iostream>
#include <iomanip>
#include <cmath>
using namespace std;
int main() {
    double x1, y1, x2, y2;
    if (cin >> x1 >> y1 >> x2 >> y2) {
        double d = sqrt(pow(x2 - x1, 2) + pow(y2 - y1, 2));
        cout << fixed << setprecision(4) << d << endl;
    }
    return 0;
}`,
        tests: [
            { input: '1.0 7.0\n5.0 9.0\n', expected: '4.4721\n' },
            { input: '-2.5 0.4\n12.1 7.3\n', expected: '16.1484\n' }
        ]
    },
    {
        id: '1016',
        name: 'Distance',
        cpp: `#include <iostream>
using namespace std;
int main() {
    int d;
    if (cin >> d) {
        cout << d * 2 << " minutos" << endl;
    }
    return 0;
}`,
        tests: [
            { input: '30\n', expected: '60 minutos\n' },
            { input: '110\n', expected: '220 minutos\n' }
        ]
    },
    {
        id: '1017',
        name: 'Fuel Spent',
        cpp: `#include <iostream>
#include <iomanip>
using namespace std;
int main() {
    int t, v;
    if (cin >> t >> v) {
        double spent = (t * v) / 12.0;
        cout << fixed << setprecision(3) << spent << endl;
    }
    return 0;
}`,
        tests: [
            { input: '10\n85\n', expected: '70.833\n' },
            { input: '2\n92\n', expected: '15.333\n' }
        ]
    },
    {
        id: '1018',
        name: 'Banknotes',
        cpp: `#include <iostream>
using namespace std;
int main() {
    int N;
    if (cin >> N) {
        cout << N << endl;
        int notes[] = {100, 50, 20, 10, 5, 2, 1};
        for (int i = 0; i < 7; i++) {
            int count = N / notes[i];
            cout << count << " nota(s) de R$ " << notes[i] << ",00" << endl;
            N %= notes[i];
        }
    }
    return 0;
}`,
        tests: [
            { input: '576\n', expected: '576\n5 nota(s) de R$ 100,00\n1 nota(s) de R$ 50,00\n1 nota(s) de R$ 20,00\n0 nota(s) de R$ 10,00\n1 nota(s) de R$ 5,00\n0 nota(s) de R$ 2,00\n1 nota(s) de R$ 1,00\n' }
        ]
    },
    {
        id: '1019',
        name: 'Time Conversion',
        cpp: `#include <iostream>
using namespace std;
int main() {
    int N;
    if (cin >> N) {
        int h = N / 3600;
        N %= 3600;
        int m = N / 60;
        int s = N % 60;
        cout << h << ":" << m << ":" << s << endl;
    }
    return 0;
}`,
        tests: [
            { input: '556\n', expected: '0:9:16\n' },
            { input: '1\n', expected: '0:0:1\n' },
            { input: '140153\n', expected: '38:55:53\n' }
        ]
    },
    {
        id: '1020',
        name: 'Age in Days',
        cpp: `#include <iostream>
using namespace std;
int main() {
    int N;
    if (cin >> N) {
        int y = N / 365;
        N %= 365;
        int m = N / 30;
        int d = N % 30;
        cout << y << " ano(s)" << endl;
        cout << m << " mes(es)" << endl;
        cout << d << " dia(s)" << endl;
    }
    return 0;
}`,
        tests: [
            { input: '400\n', expected: '1 ano(s)\n1 mes(es)\n5 dia(s)\n' },
            { input: '800\n', expected: '2 ano(s)\n2 mes(es)\n10 dia(s)\n' },
            { input: '30\n', expected: '0 ano(s)\n1 mes(es)\n0 dia(s)\n' }
        ]
    },
    {
        id: '1035',
        name: 'Selection Test 1',
        cpp: `#include <iostream>
using namespace std;
int main() {
    int A, B, C, D;
    if (cin >> A >> B >> C >> D) {
        if (B > C && D > A && (C + D) > (A + B) && C > 0 && D > 0 && A % 2 == 0) {
            cout << "Valores aceitos" << endl;
        } else {
            cout << "Valores nao aceitos" << endl;
        }
    }
    return 0;
}`,
        tests: [
            { input: '5 6 7 8\n', expected: 'Valores nao aceitos\n' },
            { input: '2 3 2 6\n', expected: 'Valores aceitos\n' }
        ]
    },
    {
        id: '1036',
        name: "Bhaskara's Formula",
        cpp: `#include <iostream>
#include <iomanip>
#include <cmath>
using namespace std;
int main() {
    double A, B, C;
    if (cin >> A >> B >> C) {
        double delta = B * B - 4 * A * C;
        if (A == 0 || delta < 0) {
            cout << "Impossivel calcular" << endl;
        } else {
            double r1 = (-B + sqrt(delta)) / (2 * A);
            double r2 = (-B - sqrt(delta)) / (2 * A);
            cout << fixed << setprecision(5);
            cout << "R1 = " << r1 << endl;
            cout << "R2 = " << r2 << endl;
        }
    }
    return 0;
}`,
        tests: [
            { input: '10.0 20.1 5.1\n', expected: 'R1 = -0.29788\nR2 = -1.71212\n' },
            { input: '0.0 20.1 5.1\n', expected: 'Impossivel calcular\n' }
        ]
    },
    {
        id: '1037',
        name: 'Interval',
        cpp: `#include <iostream>
using namespace std;
int main() {
    double x;
    if (cin >> x) {
        if (x >= 0 && x <= 25) cout << "Intervalo [0,25]" << endl;
        else if (x > 25 && x <= 50) cout << "Intervalo (25,50]" << endl;
        else if (x > 50 && x <= 75) cout << "Intervalo (50,75]" << endl;
        else if (x > 75 && x <= 100) cout << "Intervalo (75,100]" << endl;
        else cout << "Fora de intervalo" << endl;
    }
    return 0;
}`,
        tests: [
            { input: '25.01\n', expected: 'Intervalo (25,50]\n' },
            { input: '25.00\n', expected: 'Intervalo [0,25]\n' },
            { input: '-25.02\n', expected: 'Fora de intervalo\n' }
        ]
    },
    {
        id: '1038',
        name: 'Snack',
        cpp: `#include <iostream>
#include <iomanip>
using namespace std;
int main() {
    int X, Y;
    if (cin >> X >> Y) {
        double prices[] = {0.0, 4.00, 4.50, 5.00, 2.00, 1.50};
        double total = prices[X] * Y;
        cout << fixed << setprecision(2) << "Total: R$ " << total << endl;
    }
    return 0;
}`,
        tests: [
            { input: '3 2\n', expected: 'Total: R$ 10.00\n' },
            { input: '4 3\n', expected: 'Total: R$ 6.00\n' }
        ]
    },
    {
        id: '1041',
        name: 'Coordinates of a Point',
        cpp: `#include <iostream>
using namespace std;
int main() {
    double x, y;
    if (cin >> x >> y) {
        if (x == 0 && y == 0) cout << "Origem" << endl;
        else if (x == 0) cout << "Eixo Y" << endl;
        else if (y == 0) cout << "Eixo X" << endl;
        else if (x > 0 && y > 0) cout << "Q1" << endl;
        else if (x < 0 && y > 0) cout << "Q2" << endl;
        else if (x < 0 && y < 0) cout << "Q3" << endl;
        else cout << "Q4" << endl;
    }
    return 0;
}`,
        tests: [
            { input: '4.5 -2.2\n', expected: 'Q4\n' },
            { input: '0.1 0.1\n', expected: 'Q1\n' },
            { input: '0.0 0.0\n', expected: 'Origem\n' }
        ]
    },
    {
        id: '1042',
        name: 'Simple Sort',
        cpp: `#include <iostream>
#include <vector>
#include <algorithm>
using namespace std;
int main() {
    int a, b, c;
    if (cin >> a >> b >> c) {
        vector<int> v;
        v.push_back(a);
        v.push_back(b);
        v.push_back(c);
        sort(v.begin(), v.end());
        for (int i = 0; i < 3; i++) cout << v[i] << endl;
        cout << endl;
        cout << a << endl << b << endl << c << endl;
    }
    return 0;
}`,
        tests: [
            { input: '7 21 -14\n', expected: '-14\n7\n21\n\n7\n21\n-14\n' }
        ]
    },
    {
        id: '1043',
        name: 'Triangle',
        cpp: `#include <iostream>
#include <iomanip>
using namespace std;
int main() {
    double a, b, c;
    if (cin >> a >> b >> c) {
        cout << fixed << setprecision(1);
        if (a < b + c && b < a + c && c < a + b) {
            cout << "Perimetro = " << (a + b + c) << endl;
        } else {
            cout << "Area = " << ((a + b) * c / 2.0) << endl;
        }
    }
    return 0;
}`,
        tests: [
            { input: '6.0 4.0 2.0\n', expected: 'Area = 10.0\n' },
            { input: '6.0 4.0 2.1\n', expected: 'Perimetro = 12.1\n' }
        ]
    },
    {
        id: '1044',
        name: 'Multiples',
        cpp: `#include <iostream>
using namespace std;
int main() {
    int A, B;
    if (cin >> A >> B) {
        if (A % B == 0 || B % A == 0) cout << "Sao Multiplos" << endl;
        else cout << "Nao sao Multiplos" << endl;
    }
    return 0;
}`,
        tests: [
            { input: '6 24\n', expected: 'Sao Multiplos\n' },
            { input: '6 25\n', expected: 'Nao sao Multiplos\n' }
        ]
    },
    {
        id: '1046',
        name: 'Game Time',
        cpp: `#include <iostream>
using namespace std;
int main() {
    int start, end;
    if (cin >> start >> end) {
        int duration = end - start;
        if (duration <= 0) duration += 24;
        cout << "O JOGO DUROU " << duration << " HORA(S)" << endl;
    }
    return 0;
}`,
        tests: [
            { input: '16 2\n', expected: 'O JOGO DUROU 10 HORA(S)\n' },
            { input: '0 0\n', expected: 'O JOGO DUROU 24 HORA(S)\n' },
            { input: '2 16\n', expected: 'O JOGO DUROU 14 HORA(S)\n' }
        ]
    },
    {
        id: '1048',
        name: 'Salary Increase',
        cpp: `#include <iostream>
#include <iomanip>
using namespace std;
int main() {
    double sal;
    if (cin >> sal) {
        double rate = 0.0;
        if (sal <= 400.00) rate = 0.15;
        else if (sal <= 800.00) rate = 0.12;
        else if (sal <= 1200.00) rate = 0.10;
        else if (sal <= 2000.00) rate = 0.07;
        else rate = 0.04;
        double gain = sal * rate;
        double newSal = sal + gain;
        cout << fixed << setprecision(2);
        cout << "Novo salario: " << newSal << endl;
        cout << "Reajuste ganho: " << gain << endl;
        cout << "Em percentual: " << (int)(rate * 100) << " %" << endl;
    }
    return 0;
}`,
        tests: [
            { input: '400.00\n', expected: 'Novo salario: 460.00\nReajuste ganho: 60.00\nEm percentual: 15 %\n' },
            { input: '800.01\n', expected: 'Novo salario: 880.01\nReajuste ganho: 80.00\nEm percentual: 10 %\n' }
        ]
    },
    {
        id: '1049',
        name: 'Animal',
        cpp: `#include <iostream>
#include <string>
using namespace std;
int main() {
    string w1, w2, w3;
    if (cin >> w1 >> w2 >> w3) {
        if (w1 == "vertebrado") {
            if (w2 == "ave") {
                if (w3 == "carnivoro") cout << "aguia" << endl;
                else cout << "pomba" << endl;
            } else {
                if (w3 == "onivoro") cout << "homem" << endl;
                else cout << "vaca" << endl;
            }
        } else {
            if (w2 == "inseto") {
                if (w3 == "hematofago") cout << "pulga" << endl;
                else cout << "lagarta" << endl;
            } else {
                if (w3 == "hematofago") cout << "sanguessuga" << endl;
                else cout << "minhoca" << endl;
            }
        }
    }
    return 0;
}`,
        tests: [
            { input: 'vertebrado\nave\ncarnivoro\n', expected: 'aguia\n' },
            { input: 'invertebrado\nanelideo\nonivoro\n', expected: 'minhoca\n' }
        ]
    },
    {
        id: '1050',
        name: 'DDD',
        cpp: `#include <iostream>
using namespace std;
int main() {
    int d;
    if (cin >> d) {
        if (d == 61) cout << "Brasilia" << endl;
        else if (d == 71) cout << "Salvador" << endl;
        else if (d == 11) cout << "Sao Paulo" << endl;
        else if (d == 21) cout << "Rio de Janeiro" << endl;
        else if (d == 32) cout << "Juiz de Fora" << endl;
        else if (d == 19) cout << "Campinas" << endl;
        else if (d == 27) cout << "Vitoria" << endl;
        else if (d == 31) cout << "Belo Horizonte" << endl;
        else cout << "DDD nao cadastrado" << endl;
    }
    return 0;
}`,
        tests: [
            { input: '11\n', expected: 'Sao Paulo\n' },
            { input: '35\n', expected: 'DDD nao cadastrado\n' }
        ]
    },
    {
        id: '1052',
        name: 'Month',
        cpp: `#include <iostream>
#include <string>
using namespace std;
int main() {
    int m;
    if (cin >> m) {
        string months[] = {"", "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"};
        if (m >= 1 && m <= 12) cout << months[m] << endl;
    }
    return 0;
}`,
        tests: [
            { input: '4\n', expected: 'April\n' },
            { input: '1\n', expected: 'January\n' }
        ]
    },
    {
        id: '1059',
        name: 'Even Numbers',
        cpp: `#include <iostream>
using namespace std;
int main() {
    for (int i = 2; i <= 100; i += 2) {
        cout << i << endl;
    }
    return 0;
}`,
        tests: [
            { input: '', expected: Array.from({length: 50}, (_, i) => (i + 1) * 2).join('\n') + '\n' }
        ]
    },
    {
        id: '1060',
        name: 'Positive Numbers',
        cpp: `#include <iostream>
using namespace std;
int main() {
    double x;
    int count = 0;
    for (int i = 0; i < 6; i++) {
        if (cin >> x && x > 0) count++;
    }
    cout << count << " valores positivos" << endl;
    return 0;
}`,
        tests: [
            { input: '7\n-5\n6\n-3.4\n4.6\n12\n', expected: '4 valores positivos\n' }
        ]
    },
    {
        id: '1064',
        name: 'Positives and Average',
        cpp: `#include <iostream>
#include <iomanip>
using namespace std;
int main() {
    double x, sum = 0;
    int count = 0;
    for (int i = 0; i < 6; i++) {
        if (cin >> x && x > 0) {
            count++;
            sum += x;
        }
    }
    cout << count << " valores positivos" << endl;
    if (count > 0) {
        cout << fixed << setprecision(1) << (sum / count) << endl;
    }
    return 0;
}`,
        tests: [
            { input: '7\n-5\n6\n-3.4\n4.6\n12\n', expected: '4 valores positivos\n7.4\n' }
        ]
    },
    {
        id: '1065',
        name: 'Even Between five Numbers',
        cpp: `#include <iostream>
using namespace std;
int main() {
    int x, evens = 0;
    for (int i = 0; i < 5; i++) {
        if (cin >> x && x % 2 == 0) evens++;
    }
    cout << evens << " valores pares" << endl;
    return 0;
}`,
        tests: [
            { input: '7\n-5\n6\n-4\n12\n', expected: '3 valores pares\n' }
        ]
    },
    {
        id: '1066',
        name: 'Even, Odd, Positive and Negative',
        cpp: `#include <iostream>
using namespace std;
int main() {
    int x;
    int par = 0, impar = 0, pos = 0, neg = 0;
    for (int i = 0; i < 5; i++) {
        if (cin >> x) {
            if (x % 2 == 0) par++; else impar++;
            if (x > 0) pos++; else if (x < 0) neg++;
        }
    }
    cout << par << " valor(es) par(es)" << endl;
    cout << impar << " valor(es) impar(es)" << endl;
    cout << pos << " valor(es) positivo(s)" << endl;
    cout << neg << " valor(es) negativo(s)" << endl;
    return 0;
}`,
        tests: [
            { input: '-5\n0\n-3\n-4\n12\n', expected: '3 valor(es) par(es)\n2 valor(es) impar(es)\n1 valor(es) positivo(s)\n3 valor(es) negativo(s)\n' }
        ]
    },
    {
        id: '1067',
        name: 'Odd Numbers',
        cpp: `#include <iostream>
using namespace std;
int main() {
    int x;
    if (cin >> x) {
        for (int i = 1; i <= x; i += 2) {
            cout << i << endl;
        }
    }
    return 0;
}`,
        tests: [
            { input: '8\n', expected: '1\n3\n5\n7\n' }
        ]
    },
    {
        id: '1070',
        name: 'Six Odd Numbers',
        cpp: `#include <iostream>
using namespace std;
int main() {
    int x;
    if (cin >> x) {
        if (x % 2 == 0) x++;
        for (int i = 0; i < 6; i++) {
            cout << x + i * 2 << endl;
        }
    }
    return 0;
}`,
        tests: [
            { input: '8\n', expected: '9\n11\n13\n15\n17\n19\n' }
        ]
    },
    {
        id: '1071',
        name: 'Sum of Consecutive Odd Numbers I',
        cpp: `#include <iostream>
#include <algorithm>
using namespace std;
int main() {
    int x, y;
    if (cin >> x >> y) {
        int mi = min(x, y);
        int ma = max(x, y);
        int sum = 0;
        for (int i = mi + 1; i < ma; i++) {
            if (i % 2 != 0) sum += i;
        }
        cout << sum << endl;
    }
    return 0;
}`,
        tests: [
            { input: '6\n-5\n', expected: '5\n' },
            { input: '15\n12\n', expected: '13\n' }
        ]
    },
    {
        id: '1072',
        name: 'Interval 2',
        cpp: `#include <iostream>
using namespace std;
int main() {
    int n, x, inCount = 0, outCount = 0;
    if (cin >> n) {
        for (int i = 0; i < n; i++) {
            cin >> x;
            if (x >= 10 && x <= 20) inCount++;
            else outCount++;
        }
        cout << inCount << " in" << endl;
        cout << outCount << " out" << endl;
    }
    return 0;
}`,
        tests: [
            { input: '4\n14\n123\n10\n-25\n', expected: '2 in\n2 out\n' }
        ]
    },
    {
        id: '1073',
        name: 'Even Square',
        cpp: `#include <iostream>
using namespace std;
int main() {
    int N;
    if (cin >> N) {
        for (int i = 2; i <= N; i += 2) {
            cout << i << "^2 = " << (i * i) << endl;
        }
    }
    return 0;
}`,
        tests: [
            { input: '6\n', expected: '2^2 = 4\n4^2 = 16\n6^2 = 36\n' }
        ]
    },
    {
        id: '1074',
        name: 'Even or Odd',
        cpp: `#include <iostream>
using namespace std;
int main() {
    int N, x;
    if (cin >> N) {
        while (N--) {
            cin >> x;
            if (x == 0) cout << "NULL" << endl;
            else {
                if (x % 2 == 0) cout << "EVEN ";
                else cout << "ODD ";
                if (x > 0) cout << "POSITIVE" << endl;
                else cout << "NEGATIVE" << endl;
            }
        }
    }
    return 0;
}`,
        tests: [
            { input: '4\n-5\n0\n3\n-4\n', expected: 'ODD NEGATIVE\nNULL\nODD POSITIVE\nEVEN NEGATIVE\n' }
        ]
    },
    {
        id: '1075',
        name: 'Remaining 2',
        cpp: `#include <iostream>
using namespace std;
int main() {
    int N;
    if (cin >> N) {
        for (int i = 1; i <= 10000; i++) {
            if (i % N == 2) cout << i << endl;
        }
    }
    return 0;
}`,
        tests: [
            { input: '13\n', expected: Array.from({length: 10000}, (_, i) => i + 1).filter(i => i % 13 === 2).join('\n') + '\n' }
        ]
    },
    {
        id: '1078',
        name: 'Multiplication Table',
        cpp: `#include <iostream>
using namespace std;
int main() {
    int N;
    if (cin >> N) {
        for (int i = 1; i <= 10; i++) {
            cout << i << " x " << N << " = " << (i * N) << endl;
        }
    }
    return 0;
}`,
        tests: [
            { input: '140\n', expected: '1 x 140 = 140\n2 x 140 = 280\n3 x 140 = 420\n4 x 140 = 560\n5 x 140 = 700\n6 x 140 = 840\n7 x 140 = 980\n8 x 140 = 1120\n9 x 140 = 1260\n10 x 140 = 1400\n' }
        ]
    },
    {
        id: '1079',
        name: 'Weighted Averages',
        cpp: `#include <iostream>
#include <iomanip>
using namespace std;
int main() {
    int N;
    if (cin >> N) {
        while (N--) {
            double a, b, c;
            cin >> a >> b >> c;
            double m = (a * 2.0 + b * 3.0 + c * 5.0) / 10.0;
            cout << fixed << setprecision(1) << m << endl;
        }
    }
    return 0;
}`,
        tests: [
            { input: '3\n6.5 4.3 6.2\n5.1 4.2 8.1\n8.0 9.0 10.0\n', expected: '5.7\n6.3\n9.3\n' }
        ]
    },
    {
        id: '1080',
        name: 'Highest and Position',
        cpp: `#include <iostream>
using namespace std;
int main() {
    int highest = -1, pos = -1, val;
    for (int i = 1; i <= 100; i++) {
        if (cin >> val) {
            if (val > highest) {
                highest = val;
                pos = i;
            }
        }
    }
    cout << highest << endl << pos << endl;
    return 0;
}`,
        tests: [
            {
                input: Array.from({length: 100}, (_, i) => i === 50 ? '9999' : String(i)).join('\n') + '\n',
                expected: '9999\n51\n'
            }
        ]
    },
    {
        id: '1095',
        name: 'Sequence IJ 1',
        cpp: `#include <iostream>
using namespace std;
int main() {
    for (int i = 1, j = 60; j >= 0; i += 3, j -= 5) {
        cout << "I=" << i << " J=" << j << endl;
    }
    return 0;
}`,
        tests: [
            { input: '', expected: 'I=1 J=60\nI=4 J=55\nI=7 J=50\nI=10 J=45\nI=13 J=40\nI=16 J=35\nI=19 J=30\nI=22 J=25\nI=25 J=20\nI=28 J=15\nI=31 J=10\nI=34 J=5\nI=37 J=0\n' }
        ]
    },
    {
        id: '1096',
        name: 'Sequence IJ 2',
        cpp: `#include <iostream>
using namespace std;
int main() {
    for (int i = 1; i <= 9; i += 2) {
        for (int j = 7; j >= 5; j--) {
            cout << "I=" << i << " J=" << j << endl;
        }
    }
    return 0;
}`,
        tests: [
            { input: '', expected: 'I=1 J=7\nI=1 J=6\nI=1 J=5\nI=3 J=7\nI=3 J=6\nI=3 J=5\nI=5 J=7\nI=5 J=6\nI=5 J=5\nI=7 J=7\nI=7 J=6\nI=7 J=5\nI=9 J=7\nI=9 J=6\nI=9 J=5\n' }
        ]
    },
    {
        id: '1097',
        name: 'Sequence IJ 3',
        cpp: `#include <iostream>
using namespace std;
int main() {
    int startJ = 7;
    for (int i = 1; i <= 9; i += 2) {
        for (int j = startJ; j >= startJ - 2; j--) {
            cout << "I=" << i << " J=" << j << endl;
        }
        startJ += 2;
    }
    return 0;
}`,
        tests: [
            { input: '', expected: 'I=1 J=7\nI=1 J=6\nI=1 J=5\nI=3 J=9\nI=3 J=8\nI=3 J=7\nI=5 J=11\nI=5 J=10\nI=5 J=9\nI=7 J=13\nI=7 J=12\nI=7 J=11\nI=9 J=15\nI=9 J=14\nI=9 J=13\n' }
        ]
    },
    {
        id: '1101',
        name: 'Sequence of Numbers and Sum',
        cpp: `#include <iostream>
#include <algorithm>
using namespace std;
int main() {
    int m, n;
    while (cin >> m >> n && m > 0 && n > 0) {
        int mi = min(m, n);
        int ma = max(m, n);
        int sum = 0;
        for (int i = mi; i <= ma; i++) {
            cout << i << " ";
            sum += i;
        }
        cout << "Sum=" << sum << endl;
    }
    return 0;
}`,
        tests: [
            { input: '5 2\n6 3\n5 0\n', expected: '2 3 4 5 Sum=14\n3 4 5 6 Sum=18\n' }
        ]
    },
    {
        id: '1113',
        name: 'Ascending and Descending',
        cpp: `#include <iostream>
using namespace std;
int main() {
    int x, y;
    while (cin >> x >> y && x != y) {
        if (x < y) cout << "Crescente" << endl;
        else cout << "Decrescente" << endl;
    }
    return 0;
}`,
        tests: [
            { input: '5 4\n7 2\n3 8\n2 2\n', expected: 'Decrescente\nDecrescente\nCrescente\n' }
        ]
    },
    {
        id: '1114',
        name: 'Fixed Password',
        cpp: `#include <iostream>
using namespace std;
int main() {
    int p;
    while (cin >> p) {
        if (p == 2002) {
            cout << "Acesso Permitido" << endl;
            break;
        } else {
            cout << "Senha Invalida" << endl;
        }
    }
    return 0;
}`,
        tests: [
            { input: '2200\n1020\n2022\n2002\n', expected: 'Senha Invalida\nSenha Invalida\nSenha Invalida\nAcesso Permitido\n' }
        ]
    },
    {
        id: '1115',
        name: 'Quadrant',
        cpp: `#include <iostream>
using namespace std;
int main() {
    int x, y;
    while (cin >> x >> y && x != 0 && y != 0) {
        if (x > 0 && y > 0) cout << "primeiro" << endl;
        else if (x < 0 && y > 0) cout << "segundo" << endl;
        else if (x < 0 && y < 0) cout << "terceiro" << endl;
        else cout << "quarto" << endl;
    }
    return 0;
}`,
        tests: [
            { input: '2 2\n3 -2\n-8 -1\n-7 1\n0 2\n', expected: 'primeiro\nquarto\nterceiro\nsegundo\n' }
        ]
    },
    {
        id: '1116',
        name: 'Dividing X by Y',
        cpp: `#include <iostream>
#include <iomanip>
using namespace std;
int main() {
    int n;
    if (cin >> n) {
        while (n--) {
            int x, y;
            cin >> x >> y;
            if (y == 0) cout << "divisao impossivel" << endl;
            else {
                double res = (double)x / y;
                cout << fixed << setprecision(1) << res << endl;
            }
        }
    }
    return 0;
}`,
        tests: [
            { input: '3\n3 -2\n-8 0\n0 8\n', expected: '-1.5\ndivisao impossivel\n0.0\n' }
        ]
    },
    {
        id: '1132',
        name: 'Multiples of 13',
        cpp: `#include <iostream>
#include <algorithm>
using namespace std;
int main() {
    int x, y;
    if (cin >> x >> y) {
        int mi = min(x, y);
        int ma = max(x, y);
        int sum = 0;
        for (int i = mi; i <= ma; i++) {
            if (i % 13 != 0) sum += i;
        }
        cout << sum << endl;
    }
    return 0;
}`,
        tests: [
            { input: '100\n200\n', expected: '13954\n' }
        ]
    },
    {
        id: '1134',
        name: 'Type of Fuel',
        cpp: `#include <iostream>
using namespace std;
int main() {
    int code, alc = 0, gas = 0, die = 0;
    while (cin >> code && code != 4) {
        if (code == 1) alc++;
        else if (code == 2) gas++;
        else if (code == 3) die++;
    }
    cout << "MUITO OBRIGADO" << endl;
    cout << "Alcool: " << alc << endl;
    cout << "Gasolina: " << gas << endl;
    cout << "Diesel: " << die << endl;
    return 0;
}`,
        tests: [
            { input: '8\n1\n7\n2\n2\n4\n', expected: 'MUITO OBRIGADO\nAlcool: 1\nGasolina: 2\nDiesel: 0\n' }
        ]
    },
    {
        id: '1142',
        name: 'PUM',
        cpp: `#include <iostream>
using namespace std;
int main() {
    int n;
    if (cin >> n) {
        int cur = 1;
        for (int i = 0; i < n; i++) {
            cout << cur << " " << cur + 1 << " " << cur + 2 << " PUM" << endl;
            cur += 4;
        }
    }
    return 0;
}`,
        tests: [
            { input: '7\n', expected: '1 2 3 PUM\n5 6 7 PUM\n9 10 11 PUM\n13 14 15 PUM\n17 18 19 PUM\n21 22 23 PUM\n25 26 27 PUM\n' }
        ]
    },
    {
        id: '1143',
        name: 'Squared and Cubic',
        cpp: `#include <iostream>
using namespace std;
int main() {
    int n;
    if (cin >> n) {
        for (int i = 1; i <= n; i++) {
            cout << i << " " << (i * i) << " " << (i * i * i) << endl;
        }
    }
    return 0;
}`,
        tests: [
            { input: '5\n', expected: '1 1 1\n2 4 8\n3 9 27\n4 16 64\n5 25 125\n' }
        ]
    },
    {
        id: '1144',
        name: 'Logical Sequence 1',
        cpp: `#include <iostream>
using namespace std;
int main() {
    int n;
    if (cin >> n) {
        for (int i = 1; i <= n; i++) {
            cout << i << " " << (i * i) << " " << (i * i * i) << endl;
            cout << i << " " << (i * i + 1) << " " << (i * i * i + 1) << endl;
        }
    }
    return 0;
}`,
        tests: [
            { input: '5\n', expected: '1 1 1\n1 2 2\n2 4 8\n2 5 9\n3 9 27\n3 10 28\n4 16 64\n4 17 65\n5 25 125\n5 26 126\n' }
        ]
    },
    {
        id: '1146',
        name: 'Growing Sequences',
        cpp: `#include <iostream>
using namespace std;
int main() {
    int x;
    while (cin >> x && x != 0) {
        for (int i = 1; i <= x; i++) {
            cout << i << (i == x ? "" : " ");
        }
        cout << endl;
    }
    return 0;
}`,
        tests: [
            { input: '5\n10\n3\n0\n', expected: '1 2 3 4 5\n1 2 3 4 5 6 7 8 9 10\n1 2 3\n' }
        ]
    },
    {
        id: '1151',
        name: 'Easy Fibonacci',
        cpp: `#include <iostream>
using namespace std;
int main() {
    int N;
    if (cin >> N) {
        int a = 0, b = 1;
        for (int i = 0; i < N; i++) {
            if (i == 0) cout << 0;
            else if (i == 1) cout << " " << 1;
            else {
                int c = a + b;
                cout << " " << c;
                a = b;
                b = c;
            }
        }
        cout << endl;
    }
    return 0;
}`,
        tests: [
            { input: '5\n', expected: '0 1 1 2 3\n' }
        ]
    },
    {
        id: '1153',
        name: 'Simple Factorial',
        cpp: `#include <iostream>
using namespace std;
int main() {
    int n;
    if (cin >> n) {
        long long f = 1;
        for (int i = 1; i <= n; i++) f *= i;
        cout << f << endl;
    }
    return 0;
}`,
        tests: [
            { input: '4\n', expected: '24\n' },
            { input: '1\n', expected: '1\n' }
        ]
    },
    {
        id: '1154',
        name: 'Ages',
        cpp: `#include <iostream>
#include <iomanip>
using namespace std;
int main() {
    int age, count = 0;
    double sum = 0;
    while (cin >> age && age >= 0) {
        sum += age;
        count++;
    }
    if (count > 0) {
        cout << fixed << setprecision(2) << (sum / count) << endl;
    }
    return 0;
}`,
        tests: [
            { input: '34\n56\n44\n27\n-2\n', expected: '40.25\n' }
        ]
    },
    {
        id: '1155',
        name: 'S Sequence',
        cpp: `#include <iostream>
#include <iomanip>
using namespace std;
int main() {
    double S = 0;
    for (int i = 1; i <= 100; i++) {
        S += 1.0 / i;
    }
    cout << fixed << setprecision(2) << S << endl;
    return 0;
}`,
        tests: [
            { input: '', expected: '5.19\n' }
        ]
    },
    {
        id: '1157',
        name: 'Divisors I',
        cpp: `#include <iostream>
using namespace std;
int main() {
    int N;
    if (cin >> N) {
        for (int i = 1; i <= N; i++) {
            if (N % i == 0) cout << i << endl;
        }
    }
    return 0;
}`,
        tests: [
            { input: '6\n', expected: '1\n2\n3\n6\n' }
        ]
    },
    {
        id: '1165',
        name: 'Prime Number',
        cpp: `#include <iostream>
using namespace std;
int main() {
    int n, x;
    if (cin >> n) {
        while (n--) {
            cin >> x;
            bool isPrime = (x > 1);
            for (int i = 2; i * i <= x; i++) {
                if (x % i == 0) { isPrime = false; break; }
            }
            if (isPrime) cout << x << " eh primo" << endl;
            else cout << x << " nao eh primo" << endl;
        }
    }
    return 0;
}`,
        tests: [
            { input: '3\n8\n51\n7\n', expected: '8 nao eh primo\n51 nao eh primo\n7 eh primo\n' }
        ]
    },
    {
        id: '1172',
        name: 'Array Replacement I',
        cpp: `#include <iostream>
using namespace std;
int main() {
    int x[10];
    for (int i = 0; i < 10; i++) {
        cin >> x[i];
        if (x[i] <= 0) x[i] = 1;
        cout << "X[" << i << "] = " << x[i] << endl;
    }
    return 0;
}`,
        tests: [
            { input: '0\n-5\n63\n0\n10\n-2\n5\n8\n0\n1\n', expected: 'X[0] = 1\nX[1] = 1\nX[2] = 63\nX[3] = 1\nX[4] = 10\nX[5] = 1\nX[6] = 5\nX[7] = 8\nX[8] = 1\nX[9] = 1\n' }
        ]
    },
    {
        id: '1173',
        name: 'Array Fill I',
        cpp: `#include <iostream>
using namespace std;
int main() {
    int v;
    if (cin >> v) {
        for (int i = 0; i < 10; i++) {
            cout << "N[" << i << "] = " << v << endl;
            v *= 2;
        }
    }
    return 0;
}`,
        tests: [
            { input: '1\n', expected: 'N[0] = 1\nN[1] = 2\nN[2] = 4\nN[3] = 8\nN[4] = 16\nN[5] = 32\nN[6] = 64\nN[7] = 128\nN[8] = 256\nN[9] = 512\n' }
        ]
    },
    {
        id: '1175',
        name: 'Array Change I',
        cpp: `#include <iostream>
using namespace std;
int main() {
    int n[20];
    for (int i = 0; i < 20; i++) cin >> n[i];
    for (int i = 0; i < 10; i++) {
        int t = n[i];
        n[i] = n[19 - i];
        n[19 - i] = t;
    }
    for (int i = 0; i < 20; i++) {
        cout << "N[" << i << "] = " << n[i] << endl;
    }
    return 0;
}`,
        tests: [
            {
                input: Array.from({length: 20}, (_, i) => String(i)).join('\n') + '\n',
                expected: Array.from({length: 20}, (_, i) => `N[${i}] = ${19 - i}`).join('\n') + '\n'
            }
        ]
    },
    {
        id: '1180',
        name: 'Lowest Number and Position',
        cpp: `#include <iostream>
using namespace std;
int main() {
    int N;
    if (cin >> N) {
        int val, minVal = 1000000, pos = 0;
        for (int i = 0; i < N; i++) {
            cin >> val;
            if (val < minVal) {
                minVal = val;
                pos = i;
            }
        }
        cout << "Menor valor: " << minVal << endl;
        cout << "Posicao: " << pos << endl;
    }
    return 0;
}`,
        tests: [
            { input: '10\n1 2 3 4 -5 6 7 8 9 10\n', expected: 'Menor valor: -5\nPosicao: 4\n' }
        ]
    },
    {
        id: '2003',
        name: 'Sunday Morning',
        cpp: `#include <iostream>
#include <cstdio>
using namespace std;
int main() {
    int h, m;
    char c;
    while (cin >> h >> c >> m) {
        int total = h * 60 + m + 60;
        int maxDelay = total > 480 ? total - 480 : 0;
        cout << "Atraso maximo: " << maxDelay << endl;
    }
    return 0;
}`,
        tests: [
            { input: '7:10\n5:00\n7:59\n', expected: 'Atraso maximo: 10\nAtraso maximo: 0\nAtraso maximo: 59\n' }
        ]
    },
    {
        id: '2006',
        name: 'Identifying Tea',
        cpp: `#include <iostream>
using namespace std;
int main() {
    int T, ans, correct = 0;
    if (cin >> T) {
        for (int i = 0; i < 5; i++) {
            cin >> ans;
            if (ans == T) correct++;
        }
        cout << correct << endl;
    }
    return 0;
}`,
        tests: [
            { input: '1\n1 2 3 2 1\n', expected: '2\n' },
            { input: '3\n4 1 1 2 1\n', expected: '0\n' }
        ]
    },
    {
        id: '2057',
        name: 'Time Zone',
        cpp: `#include <iostream>
using namespace std;
int main() {
    int s, t, f;
    if (cin >> s >> t >> f) {
        int arrival = (s + t + f) % 24;
        if (arrival < 0) arrival += 24;
        cout << arrival << endl;
    }
    return 0;
}`,
        tests: [
            { input: '10 7 3\n', expected: '20\n' },
            { input: '22 6 -2\n', expected: '2\n' },
            { input: '0 3 -4\n', expected: '23\n' }
        ]
    },
    {
        id: '2146',
        name: 'Password',
        cpp: `#include <iostream>
using namespace std;
int main() {
    int n;
    while (cin >> n) {
        cout << n - 1 << endl;
    }
    return 0;
}`,
        tests: [
            { input: '1234\n2000\n1001\n9999\n', expected: '1233\n1999\n1000\n9998\n' }
        ]
    },
    {
        id: '2167',
        name: 'Engine Failure',
        cpp: `#include <iostream>
using namespace std;
int main() {
    int N;
    if (cin >> N) {
        int prev = -1, cur, dropIdx = 0;
        for (int i = 1; i <= N; i++) {
            cin >> cur;
            if (prev != -1 && cur < prev && dropIdx == 0) {
                dropIdx = i;
            }
            prev = cur;
        }
        cout << dropIdx << endl;
    }
    return 0;
}`,
        tests: [
            { input: '3\n1 2 3\n', expected: '0\n' },
            { input: '4\n1 2 1 4\n', expected: '3\n' }
        ]
    },
    {
        id: '2172',
        name: 'Event',
        cpp: `#include <iostream>
using namespace std;
int main() {
    long long x, m;
    while (cin >> x >> m && (x != 0 || m != 0)) {
        cout << x * m << endl;
    }
    return 0;
}`,
        tests: [
            { input: '1 544\n2 392\n3 440\n0 0\n', expected: '544\n784\n1320\n' }
        ]
    },
    {
        id: '2313',
        name: 'Which Triangle',
        cpp: `#include <iostream>
#include <algorithm>
using namespace std;
int main() {
    long long a, b, c;
    if (cin >> a >> b >> c) {
        if (a + b <= c || a + c <= b || b + c <= a) {
            cout << "Invalido" << endl;
        } else {
            if (a == b && b == c) cout << "Valido-Equilatero" << endl;
            else if (a == b || b == c || a == c) cout << "Valido-Isoceles" << endl;
            else cout << "Valido-Escaleno" << endl;
            long long x = a*a, y = b*b, z = c*c;
            if (x + y == z || x + z == y || y + z == x) cout << "Retangulo: S" << endl;
            else cout << "Retangulo: N" << endl;
        }
    }
    return 0;
}`,
        tests: [
            { input: '4 3 5\n', expected: 'Valido-Escaleno\nRetangulo: S\n' },
            { input: '6 6 6\n', expected: 'Valido-Equilatero\nRetangulo: N\n' }
        ]
    },
    {
        id: '2344',
        name: 'Notas da Prova',
        cpp: `#include <iostream>
using namespace std;
int main() {
    int n;
    if (cin >> n) {
        if (n == 0) cout << "E" << endl;
        else if (n <= 35) cout << "D" << endl;
        else if (n <= 60) cout << "C" << endl;
        else if (n <= 85) cout << "B" << endl;
        else cout << "A" << endl;
    }
    return 0;
}`,
        tests: [
            { input: '12\n', expected: 'D\n' },
            { input: '75\n', expected: 'B\n' }
        ]
    },
    {
        id: '2374',
        name: 'Pneu',
        cpp: `#include <iostream>
using namespace std;
int main() {
    int n, m;
    if (cin >> n >> m) {
        cout << n - m << endl;
    }
    return 0;
}`,
        tests: [
            { input: '30\n18\n', expected: '12\n' },
            { input: '27\n27\n', expected: '0\n' }
        ]
    },
    {
        id: '2413',
        name: 'Busca na Internet',
        cpp: `#include <iostream>
using namespace std;
int main() {
    int t;
    if (cin >> t) {
        cout << t * 4 << endl;
    }
    return 0;
}`,
        tests: [
            { input: '2\n', expected: '8\n' },
            { input: '25\n', expected: '100\n' }
        ]
    },
    {
        id: '2753',
        name: 'Alphabet Inputs',
        cpp: `#include <iostream>
using namespace std;
int main() {
    for (int i = 97; i <= 122; i++) {
        cout << i << " e " << (char)i << endl;
    }
    return 0;
}`,
        tests: [
            { input: '', expected: Array.from({length: 26}, (_, i) => `${97 + i} e ${String.fromCharCode(97 + i)}`).join('\n') + '\n' }
        ]
    },
    {
        id: '2757',
        name: 'Input and Output Integer',
        cpp: `#include <iostream>
#include <iomanip>
using namespace std;
int main() {
    int a, b, c;
    if (cin >> a >> b >> c) {
        cout << "A = " << a << ", B = " << b << ", C = " << c << endl;
        cout << "A = " << setw(10) << right << a << ", B = " << setw(10) << right << b << ", C = " << setw(10) << right << c << endl;
        cout << "A = " << setw(10) << setfill('0') << internal << a << ", B = " << setw(10) << setfill('0') << internal << b << ", C = " << setw(10) << setfill('0') << internal << c << endl;
        cout << setfill(' ') << "A = " << setw(10) << left << a << ", B = " << setw(10) << left << b << ", C = " << setw(10) << left << c << endl;
    }
    return 0;
}`,
        tests: [
            {
                input: '6\n24\n28\n',
                expected: 'A = 6, B = 24, C = 28\nA =          6, B =         24, C =         28\nA = 0000000006, B = 0000000024, C = 0000000028\nA = 6         , B = 24        , C = 28        \n'
            }
        ]
    },
    {
        id: '2759',
        name: 'Input and Output Character',
        cpp: `#include <iostream>
using namespace std;
int main() {
    char a, b, c;
    if (cin >> a >> b >> c) {
        cout << "A = " << a << ", B = " << b << ", C = " << c << endl;
        cout << "A = " << b << ", B = " << c << ", C = " << a << endl;
        cout << "A = " << c << ", B = " << a << ", C = " << b << endl;
    }
    return 0;
}`,
        tests: [
            { input: 'a\nb\nc\n', expected: 'A = a, B = b, C = c\nA = b, B = c, C = a\nA = c, B = a, C = b\n' }
        ]
    },
    {
        id: '2787',
        name: 'Chess',
        cpp: `#include <iostream>
using namespace std;
int main() {
    int L, C;
    if (cin >> L >> C) {
        if ((L + C) % 2 == 0) cout << 1 << endl;
        else cout << 0 << endl;
    }
    return 0;
}`,
        tests: [
            { input: '6\n9\n', expected: '0\n' },
            { input: '8\n8\n', expected: '1\n' }
        ]
    },
    {
        id: '2791',
        name: 'Bean',
        cpp: `#include <iostream>
using namespace std;
int main() {
    int c, pos = 0;
    for (int i = 1; i <= 4; i++) {
        cin >> c;
        if (c == 1) pos = i;
    }
    cout << pos << endl;
    return 0;
}`,
        tests: [
            { input: '0 0 1 0\n', expected: '3\n' },
            { input: '1 0 0 0\n', expected: '1\n' }
        ]
    },
    {
        id: '3046',
        name: 'Domino',
        cpp: `#include <iostream>
using namespace std;
int main() {
    int N;
    if (cin >> N) {
        cout << ((N + 1) * (N + 2)) / 2 << endl;
    }
    return 0;
}`,
        tests: [
            { input: '6\n', expected: '28\n' },
            { input: '0\n', expected: '1\n' }
        ]
    },
    {
        id: '3055',
        name: 'Forgotten Note',
        cpp: `#include <iostream>
using namespace std;
int main() {
    int A, M;
    if (cin >> A >> M) {
        cout << 2 * M - A << endl;
    }
    return 0;
}`,
        tests: [
            { input: '100\n70\n', expected: '40\n' },
            { input: '80\n75\n', expected: '70\n' }
        ]
    }
];

// Extend test bank dynamically with 40 more official algorithmic problems across 1000-3000 series
const ADDITIONS = [
    {
        id: '1021', name: 'Banknotes and Coins',
        cpp: `#include <iostream>
#include <iomanip>
#include <cmath>
using namespace std;
int main() {
    double N;
    if (cin >> N) {
        int cents = round(N * 100);
        int notes[] = {10000, 5000, 2000, 1000, 500, 200};
        int coins[] = {100, 50, 25, 10, 5, 1};
        cout << "NOTAS:" << endl;
        for (int i = 0; i < 6; i++) {
            cout << cents / notes[i] << " nota(s) de R$ " << notes[i] / 100 << ".00" << endl;
            cents %= notes[i];
        }
        cout << "MOEDAS:" << endl;
        for (int i = 0; i < 6; i++) {
            double cVal = coins[i] / 100.0;
            cout << fixed << setprecision(2) << cents / coins[i] << " moeda(s) de R$ " << cVal << endl;
            cents %= coins[i];
        }
    }
    return 0;
}`,
        tests: [{ input: '576.73\n', expected: 'NOTAS:\n5 nota(s) de R$ 100.00\n1 nota(s) de R$ 50.00\n1 nota(s) de R$ 20.00\n0 nota(s) de R$ 10.00\n1 nota(s) de R$ 5.00\n0 nota(s) de R$ 2.00\nMOEDAS:\n1 moeda(s) de R$ 1.00\n1 moeda(s) de R$ 0.50\n0 moeda(s) de R$ 0.25\n2 moeda(s) de R$ 0.10\n0 moeda(s) de R$ 0.05\n3 moeda(s) de R$ 0.01\n' }]
    },
    {
        id: '1040', name: 'Average 3',
        cpp: `#include <iostream>
#include <iomanip>
using namespace std;
int main() {
    double n1, n2, n3, n4;
    if (cin >> n1 >> n2 >> n3 >> n4) {
        double media = (n1 * 2 + n2 * 3 + n3 * 4 + n4 * 1) / 10.0;
        cout << fixed << setprecision(1) << "Media: " << media << endl;
        if (media >= 7.0) cout << "Aluno aprovado." << endl;
        else if (media < 5.0) cout << "Aluno reprovado." << endl;
        else {
            cout << "Aluno em exame." << endl;
            double exame;
            if (cin >> exame) {
                cout << "Nota do exame: " << exame << endl;
                double finalMedia = (media + exame) / 2.0;
                if (finalMedia >= 5.0) cout << "Aluno aprovado." << endl;
                else cout << "Aluno reprovado." << endl;
                cout << "Media final: " << finalMedia << endl;
            }
        }
    }
    return 0;
}`,
        tests: [{ input: '2.0 4.0 7.5 8.0\n6.4\n', expected: 'Media: 5.4\nAluno em exame.\nNota do exame: 6.4\nAluno aprovado.\nMedia final: 5.9\n' }]
    },
    {
        id: '1045', name: 'Triangle Types',
        cpp: `#include <iostream>
#include <vector>
#include <algorithm>
using namespace std;
int main() {
    double a, b, c;
    if (cin >> a >> b >> c) {
        vector<double> v;
        v.push_back(a); v.push_back(b); v.push_back(c);
        sort(v.begin(), v.end(), greater<double>());
        double A = v[0], B = v[1], C = v[2];
        if (A >= B + C) cout << "NAO FORMA TRIANGULO" << endl;
        else {
            if (A*A == B*B + C*C) cout << "TRIANGULO RETANGULO" << endl;
            else if (A*A > B*B + C*C) cout << "TRIANGULO OBTUSANGULO" << endl;
            else cout << "TRIANGULO ACUTANGULO" << endl;
            if (A == B && B == C) cout << "TRIANGULO EQUILATERO" << endl;
            else if (A == B || B == C || A == C) cout << "TRIANGULO ISOSCELES" << endl;
        }
    }
    return 0;
}`,
        tests: [{ input: '7.0 5.0 7.0\n', expected: 'TRIANGULO ACUTANGULO\nTRIANGULO ISOSCELES\n' }]
    },
    {
        id: '1047', name: 'Game Time with Minutes',
        cpp: `#include <iostream>
using namespace std;
int main() {
    int h1, m1, h2, m2;
    if (cin >> h1 >> m1 >> h2 >> m2) {
        int start = h1 * 60 + m1;
        int end = h2 * 60 + m2;
        int diff = end - start;
        if (diff <= 0) diff += 24 * 60;
        int h = diff / 60;
        int m = diff % 60;
        cout << "O JOGO DUROU " << h << " HORA(S) E " << m << " MINUTO(S)" << endl;
    }
    return 0;
}`,
        tests: [{ input: '7 8 9 10\n', expected: 'O JOGO DUROU 2 HORA(S) E 2 MINUTO(S)\n' }, { input: '7 7 7 7\n', expected: 'O JOGO DUROU 24 HORA(S) E 0 MINUTO(S)\n' }]
    },
    {
        id: '1051', name: 'Taxes',
        cpp: `#include <iostream>
#include <iomanip>
using namespace std;
int main() {
    double sal;
    if (cin >> sal) {
        if (sal <= 2000.00) cout << "Isento" << endl;
        else {
            double tax = 0;
            if (sal > 4500.00) {
                tax += (sal - 4500.00) * 0.28;
                sal = 4500.00;
            }
            if (sal > 3000.00) {
                tax += (sal - 3000.00) * 0.18;
                sal = 3000.00;
            }
            if (sal > 2000.00) {
                tax += (sal - 2000.00) * 0.08;
            }
            cout << fixed << setprecision(2) << "R$ " << tax << endl;
        }
    }
    return 0;
}`,
        tests: [{ input: '3002.00\n', expected: 'R$ 80.36\n' }, { input: '1701.12\n', expected: 'Isento\n' }]
    },
    {
        id: '1094', name: 'Experiments',
        cpp: `#include <iostream>
#include <iomanip>
using namespace std;
int main() {
    int n;
    if (cin >> n) {
        int total = 0, c = 0, r = 0, s = 0;
        while (n--) {
            int q;
            char t;
            cin >> q >> t;
            total += q;
            if (t == 'C') c += q;
            else if (t == 'R') r += q;
            else if (t == 'S') s += q;
        }
        cout << "Total: " << total << " cobaias" << endl;
        cout << "Total de coelhos: " << c << endl;
        cout << "Total de ratos: " << r << endl;
        cout << "Total de sapos: " << s << endl;
        cout << fixed << setprecision(2);
        cout << "Percentual de coelhos: " << (c * 100.0 / total) << " %" << endl;
        cout << "Percentual de ratos: " << (r * 100.0 / total) << " %" << endl;
        cout << "Percentual de sapos: " << (s * 100.0 / total) << " %" << endl;
    }
    return 0;
}`,
        tests: [{ input: '10\n10 C\n6 R\n14 S\n5 C\n14 R\n10 S\n5 C\n25 R\n10 C\n4 S\n', expected: 'Total: 103 cobaias\nTotal de coelhos: 30\nTotal de ratos: 45\nTotal de sapos: 28\nPercentual de coelhos: 29.13 %\nPercentual de ratos: 43.69 %\nPercentual de sapos: 27.18 %\n' }]
    },
    {
        id: '1098', name: 'Sequence IJ 4',
        cpp: `#include <iostream>
using namespace std;
int main() {
    for (int i = 0; i <= 20; i += 2) {
        for (int j = 10; j <= 30; j += 10) {
            double I = i / 10.0;
            double J = (i + j) / 10.0;
            cout << "I=" << I << " J=" << J << endl;
        }
    }
    return 0;
}`,
        tests: [{ input: '', expected: 'I=0 J=1\nI=0 J=2\nI=0 J=3\nI=0.2 J=1.2\nI=0.2 J=2.2\nI=0.2 J=3.2\nI=0.4 J=1.4\nI=0.4 J=2.4\nI=0.4 J=3.4\nI=0.6 J=1.6\nI=0.6 J=2.6\nI=0.6 J=3.6\nI=0.8 J=1.8\nI=0.8 J=2.8\nI=0.8 J=3.8\nI=1 J=2\nI=1 J=3\nI=1 J=4\nI=1.2 J=2.2\nI=1.2 J=3.2\nI=1.2 J=4.2\nI=1.4 J=2.4\nI=1.4 J=3.4\nI=1.4 J=4.4\nI=1.6 J=2.6\nI=1.6 J=3.6\nI=1.6 J=4.6\nI=1.8 J=2.8\nI=1.8 J=3.8\nI=1.8 J=4.8\nI=2 J=3\nI=2 J=4\nI=2 J=5\n' }]
    },
    {
        id: '1099', name: 'Sum of Consecutive Odd Numbers II',
        cpp: `#include <iostream>
#include <algorithm>
using namespace std;
int main() {
    int n;
    if (cin >> n) {
        while (n--) {
            int x, y;
            cin >> x >> y;
            int mi = min(x, y), ma = max(x, y), s = 0;
            for (int i = mi + 1; i < ma; i++) if (i % 2 != 0) s += i;
            cout << s << endl;
        }
    }
    return 0;
}`,
        tests: [{ input: '3\n4 5\n13 10\n6 4\n', expected: '0\n11\n5\n' }]
    },
    {
        id: '1117', name: 'Score Validation',
        cpp: `#include <iostream>
#include <iomanip>
using namespace std;
int main() {
    double n, sum = 0;
    int valid = 0;
    while (valid < 2 && cin >> n) {
        if (n >= 0.0 && n <= 10.0) {
            sum += n;
            valid++;
        } else {
            cout << "nota invalida" << endl;
        }
    }
    cout << fixed << setprecision(2) << "media = " << (sum / 2.0) << endl;
    return 0;
}`,
        tests: [{ input: '-3.5\n3.5\n11.0\n10.0\n', expected: 'nota invalida\nnota invalida\nmedia = 6.75\n' }]
    },
    {
        id: '1118', name: 'Several Scores with Validation',
        cpp: `#include <iostream>
#include <iomanip>
using namespace std;
int main() {
    int opt = 1;
    while (opt == 1) {
        double n, sum = 0;
        int valid = 0;
        while (valid < 2 && cin >> n) {
            if (n >= 0 && n <= 10) { sum += n; valid++; }
            else cout << "nota invalida" << endl;
        }
        cout << fixed << setprecision(2) << "media = " << (sum / 2.0) << endl;
        do {
            cout << "novo calculo (1-sim 2-nao)" << endl;
            if (!(cin >> opt)) return 0;
        } while (opt != 1 && opt != 2);
    }
    return 0;
}`,
        tests: [{ input: '-3.5\n3.5\n11.0\n10.0\n4\n1\n8.0\n9.0\n2\n', expected: 'nota invalida\nnota invalida\nmedia = 6.75\nnovo calculo (1-sim 2-nao)\nnovo calculo (1-sim 2-nao)\nmedia = 8.50\nnovo calculo (1-sim 2-nao)\n' }]
    },
    {
        id: '1131', name: 'Grenais',
        cpp: `#include <iostream>
using namespace std;
int main() {
    int inter, gremio, resp = 1, interWins = 0, gremioWins = 0, empates = 0, total = 0;
    while (resp == 1) {
        cin >> inter >> gremio;
        total++;
        if (inter > gremio) interWins++;
        else if (gremio > inter) gremioWins++;
        else empates++;
        cout << "Novo de grenal (1-sim 2-nao)" << endl;
        cin >> resp;
    }
    cout << total << " grenais" << endl;
    cout << "Inter:" << interWins << endl;
    cout << "Gremio:" << gremioWins << endl;
    cout << "Empates:" << empates << endl;
    if (interWins > gremioWins) cout << "Inter venceu mais" << endl;
    else if (gremioWins > interWins) cout << "Gremio venceu mais" << endl;
    else cout << "Nao houve vencedor" << endl;
    return 0;
}`,
        tests: [{ input: '3 2\n1\n2 3\n1\n3 1\n2\n', expected: 'Novo de grenal (1-sim 2-nao)\nNovo de grenal (1-sim 2-nao)\nNovo de grenal (1-sim 2-nao)\n3 grenais\nInter:2\nGremio:1\nEmpates:0\nInter venceu mais\n' }]
    },
    {
        id: '1133', name: 'Rest of a Division',
        cpp: `#include <iostream>
#include <algorithm>
using namespace std;
int main() {
    int x, y;
    if (cin >> x >> y) {
        int mi = min(x, y), ma = max(x, y);
        for (int i = mi + 1; i < ma; i++) {
            if (i % 5 == 2 || i % 5 == 3) cout << i << endl;
        }
    }
    return 0;
}`,
        tests: [{ input: '10\n18\n', expected: '12\n13\n17\n' }]
    },
    {
        id: '1145', name: 'Logical Sequence 2',
        cpp: `#include <iostream>
using namespace std;
int main() {
    int x, y;
    if (cin >> x >> y) {
        for (int i = 1; i <= y; i++) {
            cout << i << (i % x == 0 ? "\n" : " ");
        }
    }
    return 0;
}`,
        tests: [{ input: '3 99\n', expected: Array.from({length: 99}, (_, i) => `${i + 1}${ (i + 1) % 3 === 0 ? '\n' : ' ' }`).join('') }]
    },
    {
        id: '1156', name: 'S Sequence II',
        cpp: `#include <iostream>
#include <iomanip>
using namespace std;
int main() {
    double s = 1.0;
    double d = 2.0;
    for (int i = 3; i <= 39; i += 2) {
        s += i / d;
        d *= 2.0;
    }
    cout << fixed << setprecision(2) << s << endl;
    return 0;
}`,
        tests: [{ input: '', expected: '6.00\n' }]
    },
    {
        id: '1158', name: 'Sum of Consecutive Odd Numbers III',
        cpp: `#include <iostream>
using namespace std;
int main() {
    int n;
    if (cin >> n) {
        while (n--) {
            int x, y;
            cin >> x >> y;
            if (x % 2 == 0) x++;
            int sum = 0;
            for (int i = 0; i < y; i++) {
                sum += x + i * 2;
            }
            cout << sum << endl;
        }
    }
    return 0;
}`,
        tests: [{ input: '2\n4 3\n11 2\n', expected: '21\n24\n' }]
    },
    {
        id: '1160', name: 'Population Increase',
        cpp: `#include <iostream>
using namespace std;
int main() {
    int t;
    if (cin >> t) {
        while (t--) {
            long long pa, pb;
            double g1, g2;
            cin >> pa >> pb >> g1 >> g2;
            int years = 0;
            while (pa <= pb && years <= 100) {
                pa += (long long)(pa * (g1 / 100.0));
                pb += (long long)(pb * (g2 / 100.0));
                years++;
            }
            if (years > 100) cout << "Mais de 1 seculo." << endl;
            else cout << years << " anos." << endl;
        }
    }
    return 0;
}`,
        tests: [{ input: '6\n100 150 1.0 0\n45000 384000 2.8 0.5\n565 6565 3.0 1.0\n100000 120000 1.3 0.5\n100000 120000 2.0 1.5\n62422 484317 3.1 1.0\n', expected: '51 anos.\n95 anos.\nMais de 1 seculo.\n23 anos.\n38 anos.\n100 anos.\n' }]
    },
    {
        id: '1164', name: 'Perfect Number',
        cpp: `#include <iostream>
using namespace std;
int main() {
    int n, x;
    if (cin >> n) {
        while (n--) {
            cin >> x;
            int sum = 0;
            for (int i = 1; i < x; i++) {
                if (x % i == 0) sum += i;
            }
            if (sum == x) cout << x << " eh perfeito" << endl;
            else cout << x << " nao eh perfeito" << endl;
        }
    }
    return 0;
}`,
        tests: [{ input: '3\n6\n5\n28\n', expected: '6 eh perfeito\n5 nao eh perfeito\n28 eh perfeito\n' }]
    },
    {
        id: '1174', name: 'Array Selection I',
        cpp: `#include <iostream>
#include <iomanip>
using namespace std;
int main() {
    double a[100];
    for (int i = 0; i < 100; i++) {
        cin >> a[i];
        if (a[i] <= 10.0) {
            cout << fixed << setprecision(1) << "A[" << i << "] = " << a[i] << endl;
        }
    }
    return 0;
}`,
        tests: [{ input: Array.from({length: 100}, (_, i) => String(i === 0 ? 0 : i === 1 ? -5 : i === 2 ? 63 : 15)).join('\n') + '\n', expected: 'A[0] = 0.0\nA[1] = -5.0\n' }]
    },
    {
        id: '1176', name: 'Fibonacci Array',
        cpp: `#include <iostream>
using namespace std;
int main() {
    long long fib[61];
    fib[0] = 0;
    fib[1] = 1;
    for (int i = 2; i <= 60; i++) fib[i] = fib[i - 1] + fib[i - 2];
    int t, n;
    if (cin >> t) {
        while (t--) {
            cin >> n;
            cout << "Fib(" << n << ") = " << fib[n] << endl;
        }
    }
    return 0;
}`,
        tests: [{ input: '3\n0\n4\n2\n', expected: 'Fib(0) = 0\nFib(4) = 3\nFib(2) = 1\n' }]
    },
    {
        id: '1177', name: 'Array Fill II',
        cpp: `#include <iostream>
using namespace std;
int main() {
    int t;
    if (cin >> t) {
        for (int i = 0; i < 1000; i++) {
            cout << "N[" << i << "] = " << (i % t) << endl;
        }
    }
    return 0;
}`,
        tests: [{ input: '3\n', expected: Array.from({length: 1000}, (_, i) => `N[${i}] = ${i % 3}`).join('\n') + '\n' }]
    },
    {
        id: '1178', name: 'Array Fill III',
        cpp: `#include <iostream>
#include <iomanip>
using namespace std;
int main() {
    double x;
    if (cin >> x) {
        for (int i = 0; i < 100; i++) {
            cout << fixed << setprecision(4) << "N[" << i << "] = " << x << endl;
            x /= 2.0;
        }
    }
    return 0;
}`,
        tests: [{ input: '200.0000\n', expected: Array.from({length: 100}, (_, i) => `N[${i}] = ${(200.0 / Math.pow(2, i)).toFixed(4)}`).join('\n') + '\n' }]
    },
    {
        id: '2028', name: 'Sequence of Sequence',
        cpp: `#include <iostream>
using namespace std;
int main() {
    int n, caso = 1;
    while (cin >> n) {
        int total = 1 + (n * (n + 1)) / 2;
        cout << "Caso " << caso++ << ": " << total << (total == 1 ? " numero" : " numeros") << endl;
        cout << 0;
        for (int i = 1; i <= n; i++) {
            for (int j = 0; j < i; j++) cout << " " << i;
        }
        cout << "\n\n";
    }
    return 0;
}`,
        tests: [{ input: '0\n1\n', expected: 'Caso 1: 1 numero\n0\n\nCaso 2: 2 numeros\n0 1\n\n' }]
    },
    {
        id: '2059', name: 'Odd, Even or Cheating',
        cpp: `#include <iostream>
using namespace std;
int main() {
    int p, j1, j2, r, a;
    if (cin >> p >> j1 >> j2 >> r >> a) {
        int sum = j1 + j2;
        int par = (sum % 2 == 0);
        if (r == 1 && a == 1) cout << "Jogador 2 ganha!" << endl;
        else if (r == 1 && a == 0) cout << "Jogador 1 ganha!" << endl;
        else if (r == 0 && a == 1) cout << "Jogador 1 ganha!" << endl;
        else {
            if ((p == 1 && par) || (p == 0 && !par)) cout << "Jogador 1 ganha!" << endl;
            else cout << "Jogador 2 ganha!" << endl;
        }
    }
    return 0;
}`,
        tests: [{ input: '1 4 5 0 0\n', expected: 'Jogador 2 ganha!\n' }, { input: '1 4 4 1 0\n', expected: 'Jogador 1 ganha!\n' }]
    },
    {
        id: '2060', name: "Bino's Challenge",
        cpp: `#include <iostream>
using namespace std;
int main() {
    int n, x, m2 = 0, m3 = 0, m4 = 0, m5 = 0;
    if (cin >> n) {
        while (n--) {
            cin >> x;
            if (x % 2 == 0) m2++;
            if (x % 3 == 0) m3++;
            if (x % 4 == 0) m4++;
            if (x % 5 == 0) m5++;
        }
        cout << m2 << " Multiplo(s) de 2" << endl;
        cout << m3 << " Multiplo(s) de 3" << endl;
        cout << m4 << " Multiplo(s) de 4" << endl;
        cout << m5 << " Multiplo(s) de 5" << endl;
    }
    return 0;
}`,
        tests: [{ input: '4\n2 5 4 20\n', expected: '3 Multiplo(s) de 2\n0 Multiplo(s) de 3\n2 Multiplo(s) de 4\n2 Multiplo(s) de 5\n' }]
    },
    {
        id: '2061', name: 'Closing Tabs',
        cpp: `#include <iostream>
#include <string>
using namespace std;
int main() {
    int n, m;
    if (cin >> n >> m) {
        string action;
        while (m--) {
            cin >> action;
            if (action == "fechou") n++;
            else n--;
        }
        cout << n << endl;
    }
    return 0;
}`,
        tests: [{ input: '2 2\nfechou\nclicou\n', expected: '2\n' }]
    },
    {
        id: '2160', name: 'Name at Form',
        cpp: `#include <iostream>
#include <string>
using namespace std;
int main() {
    string s;
    if (getline(cin, s)) {
        if (s.size() <= 80) cout << "YES" << endl;
        else cout << "NO" << endl;
    }
    return 0;
}`,
        tests: [{ input: 'Fulano de Tal\n', expected: 'YES\n' }]
    },
    {
        id: '2164', name: 'Fast Fibonacci',
        cpp: `#include <iostream>
#include <iomanip>
#include <cmath>
using namespace std;
int main() {
    int n;
    if (cin >> n) {
        double r5 = sqrt(5.0);
        double ans = (pow((1 + r5) / 2.0, n) - pow((1 - r5) / 2.0, n)) / r5;
        cout << fixed << setprecision(1) << ans << endl;
    }
    return 0;
}`,
        tests: [{ input: '1\n', expected: '1.0\n' }, { input: '2\n', expected: '1.0\n' }]
    },
    {
        id: '2165', name: 'Twitting',
        cpp: `#include <iostream>
#include <string>
using namespace std;
int main() {
    string t;
    if (getline(cin, t)) {
        if (t.size() <= 140) cout << "TWEET" << endl;
        else cout << "MUTE" << endl;
    }
    return 0;
}`,
        tests: [{ input: 'RT @TheEllenShow: If only Bradley\'s arm was longer. Best photo ever. #oscars pic.twitter.com/C9U5NOtGap\n', expected: 'TWEET\n' }]
    },
    {
        id: '2176', name: 'Parity',
        cpp: `#include <iostream>
#include <string>
using namespace std;
int main() {
    string s;
    if (cin >> s) {
        int ones = 0;
        for (int i = 0; i < s.size(); i++) {
            if (s[i] == '1') ones++;
        }
        cout << s << (ones % 2 == 0 ? "0" : "1") << endl;
    }
    return 0;
}`,
        tests: [{ input: '001011\n', expected: '0010111\n' }, { input: '100\n', expected: '1001\n' }]
    },
    {
        id: '2234', name: 'Hot Dogs',
        cpp: `#include <iostream>
#include <iomanip>
using namespace std;
int main() {
    double h, p;
    if (cin >> h >> p) {
        cout << fixed << setprecision(2) << (h / p) << endl;
    }
    return 0;
}`,
        tests: [{ input: '10 90\n', expected: '0.11\n' }, { input: '840 11\n', expected: '76.36\n' }]
    },
    {
        id: '2235', name: 'Walking in Time',
        cpp: `#include <iostream>
using namespace std;
int main() {
    int a, b, c;
    if (cin >> a >> b >> c) {
        if (a == b || a == c || b == c || a + b == c || a + c == b || b + c == a) {
            cout << "S" << endl;
        } else {
            cout << "N" << endl;
        }
    }
    return 0;
}`,
        tests: [{ input: '22 5 22\n', expected: 'S\n' }, { input: '31 110 79\n', expected: 'S\n' }, { input: '45 8 7\n', expected: 'N\n' }]
    },
    {
        id: '2483', name: 'Merry Christmaaas',
        cpp: `#include <iostream>
using namespace std;
int main() {
    int n;
    if (cin >> n) {
        cout << "Feliz nat";
        for (int i = 0; i < n; i++) cout << "a";
        cout << "l!" << endl;
    }
    return 0;
}`,
        tests: [{ input: '5\n', expected: 'Feliz nataaaaal!\n' }]
    },
    {
        id: '2581', name: 'I am Toorg!',
        cpp: `#include <iostream>
#include <string>
using namespace std;
int main() {
    int n;
    if (cin >> n) {
        string q;
        cin.ignore();
        while (n--) {
            getline(cin, q);
            cout << "I am Toorg!" << endl;
        }
    }
    return 0;
}`,
        tests: [{ input: '3\nWho are you?\nHow are you?\nWhere are you?\n', expected: 'I am Toorg!\nI am Toorg!\nI am Toorg!\n' }]
    },
    {
        id: '2582', name: 'System of a Download',
        cpp: `#include <iostream>
#include <string>
using namespace std;
int main() {
    int c;
    if (cin >> c) {
        string songs[] = {
            "PROXYCITY", "P.Y.N.G.", "DNSUEY!", "SERVERS", "HOST!",
            "CRIPTONIZE", "OFFLINE DAY", "SALT", "ANSWER!", "RAR?", "WIFI ANTENNAS"
        };
        while (c--) {
            int x, y;
            cin >> x >> y;
            cout << songs[x + y] << endl;
        }
    }
    return 0;
}`,
        tests: [{ input: '3\n3 4\n0 0\n1 0\n', expected: 'SALT\nPROXYCITY\nP.Y.N.G.\n' }]
    },
    {
        id: '2670', name: 'Coffee Machine',
        cpp: `#include <iostream>
#include <algorithm>
using namespace std;
int main() {
    int a1, a2, a3;
    if (cin >> a1 >> a2 >> a3) {
        int f1 = a2 * 2 + a3 * 4;
        int f2 = a1 * 2 + a3 * 2;
        int f3 = a1 * 4 + a2 * 2;
        cout << min({f1, f2, f3}) << endl;
    }
    return 0;
}`,
        tests: [{ input: '10\n20\n30\n', expected: '80\n' }, { input: '10\n30\n20\n', expected: '60\n' }]
    },
    {
        id: '2702', name: 'Hard Choice',
        cpp: `#include <iostream>
using namespace std;
int main() {
    int ca, ba, pa, cr, br, pr;
    if (cin >> ca >> ba >> pa >> cr >> br >> pr) {
        int ans = 0;
        if (cr > ca) ans += (cr - ca);
        if (br > ba) ans += (br - ba);
        if (pr > pa) ans += (pr - pa);
        cout << ans << endl;
    }
    return 0;
}`,
        tests: [{ input: '80 120 120\n100 120 100\n', expected: '20\n' }, { input: '0 0 0\n100 100 100\n', expected: '300\n' }]
    },
    {
        id: '2861', name: 'The Output',
        cpp: `#include <iostream>
#include <string>
using namespace std;
int main() {
    int c;
    if (cin >> c) {
        cin.ignore();
        string q;
        while (c--) {
            getline(cin, q);
            cout << "gzuz" << endl;
        }
    }
    return 0;
}`,
        tests: [{ input: '3\nMe da um cafe?\nQuantos anos voce tem?\nQual o sentido da vida?\n', expected: 'gzuz\ngzuz\ngzuz\n' }]
    },
    {
        id: '2936', name: 'How Much Cassava?',
        cpp: `#include <iostream>
using namespace std;
int main() {
    int c, b, bz, m, l;
    if (cin >> c >> b >> bz >> m >> l) {
        int total = c * 300 + b * 1500 + bz * 600 + m * 1000 + l * 150 + 225;
        cout << total << endl;
    }
    return 0;
}`,
        tests: [{ input: '2\n2\n2\n2\n2\n', expected: '7325\n' }, { input: '1\n2\n3\n4\n5\n', expected: '10075\n' }]
    }
];

export const ALL_100_PROBLEMS = [...PROBLEMS_100, ...ADDITIONS];
console.log(`Total problems in test suite: ${ALL_100_PROBLEMS.length}`);
