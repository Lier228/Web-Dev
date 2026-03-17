n = int(input())
k = int(input())

fact_n = 1
fact_k = 1
fact_nk = 1

for i in range(2, n + 1):
    fact_n *= i

for i in range(2, k + 1):
    fact_k *= i

for i in range(2, n - k + 1):
    fact_nk *= i

print(fact_n // (fact_k * fact_nk))