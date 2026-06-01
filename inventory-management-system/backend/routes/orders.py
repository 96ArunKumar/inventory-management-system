from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
import models
import schemas
from database import get_db

router = APIRouter(prefix="/api/orders", tags=["orders"])


@router.get("", response_model=List[schemas.OrderOut])
def list_orders(db: Session = Depends(get_db)):
    orders = (
        db.query(models.Order)
        .order_by(models.Order.created_at.desc())
        .all()
    )
    result = []
    for o in orders:
        result.append(
            schemas.OrderOut(
                id=o.id,
                customerId=o.customer_id,
                productId=o.product_id,
                quantity=o.quantity,
                totalPrice=float(o.total_price),
                createdAt=o.created_at,
                customerName=o.customer.name,
                customerEmail=o.customer.email,
                productName=o.product.name,
                productSku=o.product.sku,
            )
        )
    return result


@router.post("", response_model=schemas.OrderOut, status_code=201)
def create_order(body: schemas.OrderInput, db: Session = Depends(get_db)):
    customer = db.query(models.Customer).filter(models.Customer.id == body.customerId).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")

    product = db.query(models.Product).filter(models.Product.id == body.productId).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    if product.stock_quantity < body.quantity:
        raise HTTPException(
            status_code=400,
            detail=f"Insufficient stock. Available: {product.stock_quantity}, requested: {body.quantity}",
        )

    total_price = float(product.price) * body.quantity

    # Deduct stock atomically
    product.stock_quantity -= body.quantity

    order = models.Order(
        customer_id=body.customerId,
        product_id=body.productId,
        quantity=body.quantity,
        total_price=total_price,
    )
    db.add(order)
    db.commit()
    db.refresh(order)

    return schemas.OrderOut(
        id=order.id,
        customerId=order.customer_id,
        productId=order.product_id,
        quantity=order.quantity,
        totalPrice=float(order.total_price),
        createdAt=order.created_at,
        customerName=customer.name,
        customerEmail=customer.email,
        productName=product.name,
        productSku=product.sku,
    )
