from rest_framework import generics
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Category, Product
from .serializers import CategorySerializer, ProductSerializer


class ApiRootView(APIView):
    def get(self, request):
        return Response(
            {
                "products": "/api/products/",
                "product_by_id": "/api/products/<id>/",
                "categories": "/api/categories/",
                "category_by_id": "/api/categories/<id>/",
                "products_by_category": "/api/categories/<id>/products/",
            }
        )


class ProductListView(generics.ListAPIView):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer


class ProductDetailView(generics.RetrieveAPIView):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer


class CategoryListView(generics.ListAPIView):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer


class CategoryDetailView(generics.RetrieveAPIView):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer


class ProductsByCategoryView(generics.ListAPIView):
    serializer_class = ProductSerializer

    def get_queryset(self):
        return Product.objects.filter(category_id=self.kwargs["id"])

# Create your views here.
