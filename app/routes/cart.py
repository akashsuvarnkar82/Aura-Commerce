from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.extensions import db
from app.models import CartItem, Product

cart_bp = Blueprint("cart", __name__, url_prefix="/api/cart")


@cart_bp.route("", methods=["GET"])
@jwt_required()
def view_cart():
    user_id = get_jwt_identity()
    items = CartItem.query.filter_by(user_id=user_id).all()
    total = sum(item.product.price * item.quantity for item in items)
    return jsonify({
        "items": [item.to_dict() for item in items],
        "total": round(total, 2),
    }), 200


@cart_bp.route("/add", methods=["POST"])
@jwt_required()
def add_to_cart():
    user_id = get_jwt_identity()
    data = request.get_json() or {}
    product_id = data.get("product_id")
    quantity = data.get("quantity", 1)

    product = Product.query.get(product_id)
    if not product:
        return jsonify({"error": "Product not found"}), 404
    if product.stock < quantity:
        return jsonify({"error": "Not enough stock"}), 400

    item = CartItem.query.filter_by(user_id=user_id, product_id=product_id).first()
    if item:
        item.quantity += quantity
    else:
        item = CartItem(user_id=user_id, product_id=product_id, quantity=quantity)
        db.session.add(item)

    db.session.commit()
    return jsonify(item.to_dict()), 201


@cart_bp.route("/update/<int:item_id>", methods=["PUT"])
@jwt_required()
def update_cart_item(item_id):
    user_id = get_jwt_identity()
    item = CartItem.query.filter_by(id=item_id, user_id=user_id).first_or_404()
    data = request.get_json() or {}
    quantity = data.get("quantity")

    if quantity is None or quantity < 1:
        return jsonify({"error": "quantity must be at least 1"}), 400

    item.quantity = quantity
    db.session.commit()
    return jsonify(item.to_dict()), 200


@cart_bp.route("/remove/<int:item_id>", methods=["DELETE"])
@jwt_required()
def remove_from_cart(item_id):
    user_id = get_jwt_identity()
    item = CartItem.query.filter_by(id=item_id, user_id=user_id).first_or_404()
    db.session.delete(item)
    db.session.commit()
    return jsonify({"message": "Item removed from cart"}), 200
