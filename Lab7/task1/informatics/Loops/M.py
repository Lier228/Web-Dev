a = int(input())
b = int(input())
c = int(input())
d = int(input())

count = 0

for x in range(1001):
    for y in range(1001):
        if a * x + b * y == c and x + y == d:
            count += 1

print(count)