students = []

for _ in range(int(input())):
    name = input()
    score = float(input())
    students.append([name, score])

scores = sorted(set(score for _, score in students))
second_score = scores[1]

names = sorted(name for name, score in students if score == second_score)

for name in names:
    print(name)