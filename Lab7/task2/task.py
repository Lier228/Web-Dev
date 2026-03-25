import math

class Jojo:
    def __init__(self, name, age):
        self.name = name
        self.age = age

    def __str__(self):
        return f" name = {self.name}"


class Jotaro(Jojo):
    def __init__(self, name, age, id):
        super(name,age)
        self.id = id