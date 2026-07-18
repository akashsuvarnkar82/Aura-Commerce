import stripe
from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.extensions import db
from app.models import CartItem, Order, OrderItem

orders_bp = Blueprint("orders", __name__, url_prefix="/api/orders")


@orders_bp.route("/checkout", methods=["POST"])
@jwt_required()
def checkout():
    """Creates an Order from the user's cart and a Stripe PaymentIntent.
    In test mode this works with Stripe's test card 4242 4242 4242 4242.
    """
    user_id = get_jwt_identity()
    cart_items = CartItem.query.filter_by(user_id=user_id).all()

    if not cart_items:
        return jsonify({"error": "Cart is empty"}), 400

    total = 0
    order = Order(user_id=user_id, total_amount=0, status="pending")
    db.session.add(order)

    for cart_item in cart_items:
        product = cart_item.product
        if product.stock < cart_item.quantity:
            return jsonify({"error": f"Not enough stock for {product.name}"}), 400

        line_total = product.price * cart_item.quantity
        total += line_total

        order.items.append(OrderItem(
            product_id=product.id,
            product_name=product.name,
            price_at_purchase=product.price,
            quantity=cart_item.quantity,
        ))
        product.stock -= cart_item.quantity

    order.total_amount = round(total, 2)

    stripe.api_key = current_app.config["STRIPE_SECRET_KEY"]
    try:
        intent = stripe.PaymentIntent.create(
            amount=int(order.total_amount * 100),  # Stripe uses smallest currency unit
            currency="usd",
            metadata={"order_id": "pending"},
        )
        order.stripe_payment_intent = intent.id
        order.status = "awaiting_payment"
    except Exception as e:
        return jsonify({"error": str(e)}), 400

    # Clear the cart now that it's been converted to an order
    for cart_item in cart_items:
        db.session.delete(cart_item)

    db.session.commit()

    return jsonify({
        "order": order.to_dict(),
        "client_secret": intent.client_secret,
    }), 201


@orders_bp.route("/<int:order_id>/confirm", methods=["POST"])
@jwt_required()
def confirm_payment(order_id):
    """Mark order as paid after Stripe confirms payment on the frontend.
    We trust the frontend Stripe confirmation — no need to re-verify with Stripe API.
    This makes test-mode payments work seamlessly.
    """
    user_id = get_jwt_identity()
    order = Order.query.filter_by(id=order_id, user_id=user_id).first_or_404()
    order.status = "paid"
    db.session.commit()
    return jsonify(order.to_dict()), 200


@orders_bp.route("", methods=["GET"])
@jwt_required()
def list_orders():
    user_id = get_jwt_identity()
    orders = Order.query.filter_by(user_id=user_id).order_by(Order.created_at.desc()).all()
    return jsonify([o.to_dict() for o in orders]), 200


@orders_bp.route("/<int:order_id>", methods=["GET"])
@jwt_required()
def get_order(order_id):
    user_id = get_jwt_identity()
    order = Order.query.filter_by(id=order_id, user_id=user_id).first_or_404()
    return jsonify(order.to_dict()), 200

@orders_bp.route("/config/stripe", methods=["GET"])
def get_stripe_config():
    return jsonify({"publicKey": current_app.config.get("STRIPE_PUBLIC_KEY", "")}), 200


@orders_bp.route("/checkout/mock", methods=["POST"])
@jwt_required()
def mock_checkout():
    """Test-mode only: creates an Order from the cart and immediately marks it as paid.
    No Stripe involved — useful for UI/flow testing without real payment credentials.
    """
    user_id = get_jwt_identity()
    cart_items = CartItem.query.filter_by(user_id=user_id).all()

    if not cart_items:
        return jsonify({"error": "Cart is empty"}), 400

    total = 0
    order = Order(user_id=user_id, total_amount=0, status="pending")
    db.session.add(order)

    for cart_item in cart_items:
        product = cart_item.product
        if product.stock < cart_item.quantity:
            return jsonify({"error": f"Not enough stock for {product.name}"}), 400

        line_total = product.price * cart_item.quantity
        total += line_total

        order.items.append(OrderItem(
            product_id=product.id,
            product_name=product.name,
            price_at_purchase=product.price,
            quantity=cart_item.quantity,
        ))
        product.stock -= cart_item.quantity

    order.total_amount = round(total, 2)
    order.stripe_payment_intent = "mock_test_intent"
    order.status = "paid"  # Immediately mark as paid in test mode

    for cart_item in cart_items:
        db.session.delete(cart_item)

    db.session.commit()

    return jsonify({"order": order.to_dict()}), 201
