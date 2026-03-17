a = int(input())
b = int(input())

step = 1 if a <= b else -1

for i in range(a, b + step, step):
    print(i, end=" ")