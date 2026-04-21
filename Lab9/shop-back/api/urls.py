from django.urls import path
from .views import fbv
from .views.cbv import ProductDetailAPIView

from .views import (
    CategoryDetailAPIView,
    CategoryListAPIView,
    CategoryProductsAPIView,
    ProductListAPIView,
)

urlpatterns = [
    path("products/", fbv.products_list, name="products-list"),
    path("products/<int:product_id>/", ProductDetailAPIView.as_view(), name="product-detail"),
    path("categories/", CategoryListAPIView.as_view(), name="categories-list"),
    path("categories/<int:category_id>/", CategoryDetailAPIView.as_view(), name="category-detail"),
    path("categories/<int:category_id>/products/", CategoryProductsAPIView.as_view(), name="category-products"),
]