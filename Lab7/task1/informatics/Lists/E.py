nums = list(map(int, input().split()))

for i in range(len(nums) - 1):
    if nums[i] * nums[i + 1] > 0:
        print(nums[i], nums[i + 1])
        break