from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from app.extensions import db
from app.models import Product
from app.utils.decorators import admin_required

products_bp = Blueprint("products", __name__, url_prefix="/api/products")


@products_bp.route("", methods=["GET"])
def list_products():
    query = Product.query

    search = request.args.get("search")
    category = request.args.get("category")
    min_price = request.args.get("min_price", type=float)
    max_price = request.args.get("max_price", type=float)
    page = request.args.get("page", 1, type=int)
    per_page = request.args.get("per_page", 10, type=int)

    if search:
        query = query.filter(Product.name.ilike(f"%{search}%"))
    if category:
        query = query.filter_by(category=category)
    if min_price is not None:
        query = query.filter(Product.price >= min_price)
    if max_price is not None:
        query = query.filter(Product.price <= max_price)

    pagination = query.paginate(page=page, per_page=per_page, error_out=False)
    return jsonify({
        "products": [p.to_dict() for p in pagination.items],
        "total": pagination.total,
        "page": page,
        "pages": pagination.pages,
    }), 200


@products_bp.route("/<int:product_id>", methods=["GET"])
def get_product(product_id):
    product = Product.query.get_or_404(product_id)
    return jsonify(product.to_dict()), 200


@products_bp.route("", methods=["POST"])
@jwt_required()
@admin_required
def create_product():
    data = request.get_json() or {}
    required = ["name", "price"]
    if not all(data.get(f) for f in required):
        return jsonify({"error": "name and price are required"}), 400

    product = Product(
        name=data["name"],
        description=data.get("description", ""),
        price=data["price"],
        category=data.get("category", ""),
        stock=data.get("stock", 0),
        image_url=data.get("image_url", ""),
    )
    db.session.add(product)
    db.session.commit()
    return jsonify(product.to_dict()), 201


@products_bp.route("/<int:product_id>", methods=["PUT"])
@jwt_required()
@admin_required
def update_product(product_id):
    product = Product.query.get_or_404(product_id)
    data = request.get_json() or {}

    for field in ["name", "description", "price", "category", "stock", "image_url"]:
        if field in data:
            setattr(product, field, data[field])

    db.session.commit()
    return jsonify(product.to_dict()), 200


@products_bp.route("/<int:product_id>", methods=["DELETE"])
@jwt_required()
@admin_required
def delete_product(product_id):
    product = Product.query.get_or_404(product_id)
    db.session.delete(product)
    db.session.commit()
    return jsonify({"message": "Product deleted"}), 200
