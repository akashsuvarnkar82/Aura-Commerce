from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required
from app.models import Order, Product
from app.utils.decorators import admin_required

admin_bp = Blueprint("admin", __name__, url_prefix="/api/admin")


@admin_bp.route("/orders", methods=["GET"])
@jwt_required()
@admin_required
def all_orders():
    orders = Order.query.order_by(Order.created_at.desc()).all()
    return jsonify([o.to_dict() for o in orders]), 200


@admin_bp.route("/low-stock", methods=["GET"])
@jwt_required()
@admin_required
def low_stock():
    threshold = 5
    products = Product.query.filter(Product.stock <= threshold).all()
    return jsonify([p.to_dict() for p in products]), 200
