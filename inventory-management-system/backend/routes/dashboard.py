from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
import models
import schemas
from database import get_db

router = APIRouter(prefix="/api/dashboard", tags=["dashboard"])

LOW_STOCK_THRESHOLD = 10


@router.get("/stats", response_model=schemas.DashboardStats)
def get_dashboard_stats(db: Session = Depends(get_db)):
    total_products = db.query(func.count(models.Product.id)).scalar() or 0
    total_customers = db.query(func.count(models.Customer.id)).scalar() or 0
    total_orders = db.query(func.count(models.Order.id)).scalar() or 0
    total_revenue = db.query(func.coalesce(func.sum(models.Order.total_price), 0)).scalar() or 0

    low_stock = (
        db.query(models.Product)
        .filter(models.Product.stock_quantity < LOW_STOCK_THRESHOLD)
        .order_by(models.Product.stock_quantity)
        .all()
    )

    recent_orders = (
        db.query(models.Order)
        .order_by(models.Order.created_at.desc())
        .limit(5)
        .all()
    )

    return schemas.DashboardStats(
        totalProducts=total_products,
        totalCustomers=total_customers,
        totalOrders=total_orders,
        totalRevenue=float(total_revenue),
        lowStockProducts=[
            schemas.LowStockProduct(
                id=p.id,
                name=p.name,
                sku=p.sku,
                stockQuantity=p.stock_quantity,
            )
            for p in low_stock
        ],
        recentOrders=[
            schemas.RecentOrder(
                id=o.id,
                customerName=o.customer.name,
                productName=o.product.name,
                quantity=o.quantity,
                totalPrice=float(o.total_price),
                createdAt=o.created_at,
            )
            for o in recent_orders
        ],
    )
