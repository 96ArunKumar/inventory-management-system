from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
import models
import schemas
from database import get_db

router = APIRouter(prefix="/api/customers", tags=["customers"])


@router.get("", response_model=List[schemas.CustomerOut])
def list_customers(db: Session = Depends(get_db)):
    customers = db.query(models.Customer).order_by(models.Customer.created_at).all()
    return [schemas.CustomerOut.from_orm_row(c) for c in customers]


@router.post("", response_model=schemas.CustomerOut, status_code=201)
def create_customer(body: schemas.CustomerInput, db: Session = Depends(get_db)):
    existing = db.query(models.Customer).filter(models.Customer.email == body.email).first()
    if existing:
        raise HTTPException(status_code=409, detail=f'Email "{body.email}" is already registered')

    customer = models.Customer(
        name=body.name,
        email=body.email,
        phone=body.phone,
    )
    db.add(customer)
    db.commit()
    db.refresh(customer)
    return schemas.CustomerOut.from_orm_row(customer)


@router.put("/{id}", response_model=schemas.CustomerOut)
def update_customer(id: int, body: schemas.CustomerUpdate, db: Session = Depends(get_db)):
    customer = db.query(models.Customer).filter(models.Customer.id == id).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")

    if body.email is not None:
        conflict = (
            db.query(models.Customer)
            .filter(models.Customer.email == body.email, models.Customer.id != id)
            .first()
        )
        if conflict:
            raise HTTPException(status_code=409, detail=f'Email "{body.email}" is already registered')
        customer.email = body.email

    if body.name is not None:
        customer.name = body.name
    if body.phone is not None:
        customer.phone = body.phone

    db.commit()
    db.refresh(customer)
    return schemas.CustomerOut.from_orm_row(customer)


@router.delete("/{id}", status_code=204)
def delete_customer(id: int, db: Session = Depends(get_db)):
    customer = db.query(models.Customer).filter(models.Customer.id == id).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    db.delete(customer)
    db.commit()
