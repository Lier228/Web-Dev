import re
from pathlib import Path

from django.core.management.base import BaseCommand, CommandError

from api.models import Category, Product


class Command(BaseCommand):
    help = "Seed Category and Product data from Lab5 online-store product.data.ts"

    def handle(self, *args, **options):
        web_dev_root = Path(__file__).resolve().parents[5]
        source_file = (
            web_dev_root
            / "Lab5"
            / "online-store"
            / "src"
            / "app"
            / "data"
            / "product.data.ts"
        )

        if not source_file.exists():
            raise CommandError(f"Source file not found: {source_file}")

        content = source_file.read_text(encoding="utf-8")

        category_matches = re.findall(
            r"\{\s*id:\s*(\d+),\s*name:\s*'([^']+)'\s*\}", content
        )
        product_matches = re.findall(
            r"\{\s*id:\s*\d+,\s*categoryId:\s*(\d+),\s*name:\s*'([^']+)',\s*description:\s*'([^']+)',\s*price:\s*([0-9.]+),",
            content,
            re.DOTALL,
        )

        if not category_matches or not product_matches:
            raise CommandError("Could not parse categories/products from product.data.ts")

        Product.objects.all().delete()
        Category.objects.all().delete()

        source_category_map = {}
        for source_id, name in category_matches:
            category = Category.objects.create(name=name)
            source_category_map[int(source_id)] = category

        products_to_create = []
        for source_category_id, name, description, price in product_matches:
            category = source_category_map.get(int(source_category_id))
            if not category:
                continue
            products_to_create.append(
                Product(
                    name=name,
                    price=float(price),
                    description=description,
                    count=10,
                    is_active=True,
                    category=category,
                )
            )

        Product.objects.bulk_create(products_to_create)

        self.stdout.write(
            self.style.SUCCESS(
                f"Seeded {Category.objects.count()} categories and {Product.objects.count()} products"
            )
        )
