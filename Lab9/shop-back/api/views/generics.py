from django.http import Http404
from rest_framework import generics
from rest_framework.response import Response
from rest_framework.views import APIView

from ..models import Category, Product
from ..serializers import CategorySerializer, ProductSerializer


class ProductListAPIView(generics.ListCreateAPIView):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer


class ProductDetailAPIView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    lookup_url_kwarg = "product_id"


class CategoryListAPIView(generics.ListCreateAPIView):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer


class CategoryDetailAPIView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    lookup_url_kwarg = "category_id"


class CategoryProductsAPIView(APIView):
    def get(self, request, category_id: int):
        try:
            Category.objects.get(id=category_id)
        except Category.DoesNotExist as exc:
            raise Http404 from exc

        products = Product.objects.filter(category_id=category_id)
        serializer = ProductSerializer(products, many=True)
        return Response(serializer.data)

