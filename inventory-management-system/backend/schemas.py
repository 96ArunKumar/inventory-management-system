from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, EmailStr, field_validator
import re


# --- Product schemas ---

class ProductBase(BaseModel):
    name: str
    sku: str
    price: float
    stockQuantity: int

    @field_validator("name", "sku")
    @classmethod
    def not_empty(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("must not be empty")
        return v

    @field_validator("price")
    @classmethod
    def positive_price(cls, v: float) -> float:
        if v <= 0:
            raise ValueError("must be greater than 0")
        return v

    @field_validator("stockQuantity")
    @classmethod
    def non_negative_stock(cls, v: int) -> int:
        if v < 0:
            raise ValueError("must be >= 0")
        return v


class ProductInput(ProductBase):
    pass


class ProductUpdate(BaseModel):
    name: Optional[str] = None
    sku: Optional[str] = None
    price: Optional[float] = None
    stockQuantity: Optional[int] = None

    @field_validator("price")
    @classmethod
    def positive_price(cls, v: Optional[float]) -> Optional[float]:
        if v is not None and v <= 0:
            raise ValueError("must be greater than 0")
        return v

    @field_validator("stockQuantity")
    @classmethod
    def non_negative_stock(cls, v: Optional[int]) -> Optional[int]:
        if v is not None and v < 0:
            raise ValueError("must be >= 0")
        return v


class ProductOut(BaseModel):
    id: int
    name: str
    sku: str
    price: float
    stockQuantity: int
    createdAt: datetime

    model_config = {"from_attributes": True}

    @classmethod
    def from_orm_row(cls, row) -> "ProductOut":
        return cls(
            id=row.id,
            name=row.name,
            sku=row.sku,
            price=float(row.price),
            stockQuantity=row.stock_quantity,
            createdAt=row.created_at,
        )


# --- Customer schemas ---

class CustomerInput(BaseModel):
    name: str
    email: EmailStr
    phone: Optional[str] = None

    @field_validator("name")
    @classmethod
    def not_empty(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("must not be empty")
        return v


class CustomerUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None


class CustomerOut(BaseModel):
    id: int
    name: str
    email: str
    phone: Optional[str]
    createdAt: datetime

    model_config = {"from_attributes": True}

    @classmethod
    def from_orm_row(cls, row) -> "CustomerOut":
        return cls(
            id=row.id,
            name=row.name,
            email=row.email,
            phone=row.phone,
            createdAt=row.created_at,
        )


# --- Order schemas ---

class OrderInput(BaseModel):
    customerId: int
    productId: int
    quantity: int

    @field_validator("quantity")
    @classmethod
    def positive_quantity(cls, v: int) -> int:
        if v < 1:
            raise ValueError("must be >= 1")
        return v


class OrderOut(BaseModel):
    id: int
    customerId: int
    productId: int
    quantity: int
    totalPrice: float
    createdAt: datetime
    customerName: str
    customerEmail: str
    productName: str
    productSku: str


# --- Dashboard schemas ---

class LowStockProduct(BaseModel):
    id: int
    name: str
    sku: str
    stockQuantity: int


class RecentOrder(BaseModel):
    id: int
    customerName: str
    productName: str
    quantity: int
    totalPrice: float
    createdAt: datetime


class DashboardStats(BaseModel):
    totalProducts: int
    totalCustomers: int
    totalOrders: int
    totalRevenue: float
    lowStockProducts: List[LowStockProduct]
    recentOrders: List[RecentOrder]


# --- Error schema ---

class ErrorResponse(BaseModel):
    error: str
