import math


class Product:
    def __init__(self, product_id, name, price, amount):
        self.product_id = product_id
        self.name = name
        self.price = price
        self.amount = amount

    def add_stock(self, quantity):
        if quantity > 0:
            self.amount += quantity

    def remove_stock(self, quantity):
        if quantity > 0:
            self.amount = max(0, self.amount - quantity)

    def consume(self):
        if self.amount > 0:
            self.amount -= 1
            print(f"{self.name} was used.")
        else:
            print(f"{self.name} is out of stock.")

    def __str__(self):
        return (
            f"ID: {self.product_id}\n"
            f"Name: {self.name}\n"
            f"Price: {self.price}\n"
            f"Amount: {self.amount}"
        )


class Cake(Product):
    def __init__(self, product_id, name, price, amount, radius, has_cream):
        super().__init__(product_id, name, price, amount)
        self.radius = radius
        self.has_cream = has_cream

    def calculate_area(self):
        return math.pi * self.radius ** 2

    def consume(self):
        if self.amount > 0:
            self.amount -= 1
            print(f"You ate the cake '{self.name}'. Delicious!")
        else:
            print(f"There is no cake '{self.name}' left.")

    def __str__(self):
        return (
            f"{super().__str__()}\n"
            f"Radius: {self.radius}\n"
            f"Has cream: {self.has_cream}"
        )


class Drink(Product):
    def __init__(self, product_id, name, price, amount, volume_ml, is_cold):
        super().__init__(product_id, name, price, amount)
        self.volume_ml = volume_ml
        self.is_cold = is_cold

    def consume(self):
        if self.amount > 0:
            self.amount -= 1
            print(f"You drank '{self.name}'. Refreshing!")
        else:
            print(f"There is no drink '{self.name}' left.")

    def __str__(self):
        return (
            f"{super().__str__()}\n"
            f"Volume: {self.volume_ml} ml\n"
            f"Cold: {self.is_cold}"
        )