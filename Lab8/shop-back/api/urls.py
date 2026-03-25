from django.urls import path

from . import views

urlpatterns = [
    path("", views.ApiRootView.as_view(), name="api-root"),
    path("products/", views.ProductListView.as_view(), name="products-list"),
    path("products/<int:pk>/", views.ProductDetailView.as_view(), name="products-detail"),
    path("categories/", views.CategoryListView.as_view(), name="categories-list"),
    path(
        "categories/<int:pk>/",
        views.CategoryDetailView.as_view(),
        name="categories-detail",
    ),
    path(
        "categories/<int:id>/products/",
        views.ProductsByCategoryView.as_view(),
        name="category-products",
    ),
]
