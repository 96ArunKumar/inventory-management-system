import os
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import ValidationError
from routes.products import router as products_router
from routes.customers import router as customers_router
from routes.orders import router as orders_router
from routes.dashboard import router as dashboard_router

app = FastAPI(
    title="Inventory & Order Management API",
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(products_router)
app.include_router(customers_router)
app.include_router(orders_router)
app.include_router(dashboard_router)


@app.exception_handler(ValidationError)
async def validation_exception_handler(request: Request, exc: ValidationError):
    return JSONResponse(status_code=422, content={"error": str(exc)})


@app.get("/")
def root():
    return {"message": "Inventory API Running Successfully"}


@app.get("/api/healthz", tags=["health"])
def health_check():
    return {"status": "ok"}