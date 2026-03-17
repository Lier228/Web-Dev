nums = list(map(int, input().split()))
mx = nums[0]
idx = 0

for i in range(len(nums)):
    if nums[i] > mx:
        mx = nums[i]
        idx = i

print(mx, idx)