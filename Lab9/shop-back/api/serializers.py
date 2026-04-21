from rest_framework import serializers

from .models import Category, Product


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ["id", "name"]


class ProductSerializer(serializers.ModelSerializer):
    category = CategorySerializer(read_only=True)
    category_id = serializers.IntegerField(write_only=True)

    class Meta:
        model = Product
        fields = ["id", "name", "price", "description", "count", "is_active", "category", "category_id"]

    def create(self, validated_data):
        cat_id = validated_data.pop('category_id')
        
        try:
            category = Category.objects.get(id=cat_id)
        except Category.DoesNotExist:
            raise serializers.ValidationError({"category_id": "Категории с таким ID не существует!"})

        return Product.objects.create(category=category, **validated_data)