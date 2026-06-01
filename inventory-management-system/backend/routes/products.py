from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from typing import Optional, List
import models
import schemas
from database import get_db

router = APIRouter(prefix="/api/products", tags=["products"])


@router.get("", response_model=List[schemas.ProductOut])
def list_products(search: Optional[str] = Query(None), db: Session = Depends(get_db)):
    query = db.query(models.Product)
    if search:
        query = query.filter(models.Product.name.ilike(f"%{search}%"))
    products = query.order_by(models.Product.created_at).all()
    return [schemas.ProductOut.from_orm_row(p) for p in products]


@router.post("", response_model=schemas.ProductOut, status_code=201)
def create_product(body: schemas.ProductInput, db: Session = Depends(get_db)):
    existing = db.query(models.Product).filter(models.Product.sku == body.sku).first()
    if existing:
        raise HTTPException(status_code=409, detail=f'SKU "{body.sku}" already exists')

    product = models.Product(
        name=body.name,
        sku=body.sku,
        price=body.price,
        stock_quantity=body.stockQuantity,
    )
    db.add(product)
    db.commit()
    db.refresh(product)
    return schemas.ProductOut.from_orm_row(product)


@router.put("/{id}", response_model=schemas.ProductOut)
def update_product(id: int, body: schemas.ProductUpdate, db: Session = Depends(get_db)):
    product = db.query(models.Product).filter(models.Product.id == id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    if body.sku is not None:
        conflict = (
            db.query(models.Product)
            .filter(models.Product.sku == body.sku, models.Product.id != id)
            .first()
        )
        if conflict:
            raise HTTPException(status_code=409, detail=f'SKU "{body.sku}" already exists')
        product.sku = body.sku

    if body.name is not None:
        product.name = body.name
    if body.price is not None:
        product.price = body.price
    if body.stockQuantity is not None:
        product.stock_quantity = body.stockQuantity

    db.commit()
    db.refresh(product)
    return schemas.ProductOut.from_orm_row(product)


@router.delete("/{id}", status_code=204)
def delete_product(id: int, db: Session = Depends(get_db)):
    product = db.query(models.Product).filter(models.Product.id == id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    db.delete(product)
    db.commit()
