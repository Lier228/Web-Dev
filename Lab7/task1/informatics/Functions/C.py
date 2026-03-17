def xor(x, y):
    return (x and not y) or (not x and y)


a = int(input())
b = int(input())

print(int(xor(a, b)))