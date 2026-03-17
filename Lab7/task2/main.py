from models import Cake, Drink


def main():
    chocolate_cake = Cake(1, "Chocolate Cake", 18.5, 3, 12.0, True)
    orange_juice = Drink(2, "Orange Juice", 4.2, 5, 750, True)

    products = [chocolate_cake, orange_juice]

    for product in products:
        print(product)
        product.consume()
        print("-" * 25)

    print("Cake area:", round(chocolate_cake.calculate_area(), 2))


if __name__ == "__main__":
    main()