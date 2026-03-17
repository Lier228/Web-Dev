n = int(input())
prev = int(input())
total = 0

for _ in range(n - 1):
    cur = int(input())
    total += prev * cur
    prev = cur

print(total)