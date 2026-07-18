from datetime import datetime
from app.extensions import db


class Product(db.Model):
    __tablename__ = "products"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(200), nullable=False, index=True)
    description = db.Column(db.Text, default="")
    price = db.Column(db.Float, nullable=False)
    category = db.Column(db.String(100), index=True)
    stock = db.Column(db.Integer, default=0)
    image_url = db.Column(db.String(300), default="")
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "description": self.description,
            "price": self.price,
            "category": self.category,
            "stock": self.stock,
            "image_url": self.image_url,
            "created_at": self.created_at.isoformat(),
        }
