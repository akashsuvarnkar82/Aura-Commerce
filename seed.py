"""Run this once after setup to create an admin user and sample products.
Usage: python seed.py
"""
from app import create_app
from app.extensions import db
from app.models import User, Product

app = create_app()

with app.app_context():
    db.create_all()

    # Create admin user
    if not User.query.filter_by(email="admin@example.com").first():
        admin = User(name="Admin", email="admin@example.com", role="admin")
        admin.set_password("admin123")
        db.session.add(admin)

    # Seed products if none exist
    if Product.query.count() == 0:
        sample_products = [
            # ── Headphones ──────────────────────────────────────────
            Product(
                name="Aura Pro Headphones",
                description="Active noise cancelling wireless headphones with 40-hour battery life and Hi-Res audio support.",
                price=299.99,
                category="Headphones",
                stock=50
            ),
            Product(
                name="Aura Buds True Wireless",
                description="Crystal clear audio on the go with 6mm dynamic drivers and IPX5 water resistance.",
                price=149.99,
                category="Headphones",
                stock=100
            ),
            Product(
                name="NoiseFree Elite ANC",
                description="Industry-leading noise cancellation with adaptive EQ and spatial audio for an immersive experience.",
                price=379.99,
                category="Headphones",
                stock=35
            ),
            Product(
                name="Bass X Over-Ear",
                description="Deep, powerful bass response with 50mm drivers. Foldable design perfect for commuters.",
                price=89.99,
                category="Headphones",
                stock=60
            ),
            Product(
                name="Sport Buds Pro",
                description="Secure ear-hook design with 8-hour playback and sweat-proof coating for intense workouts.",
                price=79.99,
                category="Headphones",
                stock=80
            ),
            Product(
                name="Crystal Clear IEM",
                description="In-ear monitors with balanced armature drivers delivering studio-grade clarity for audiophiles.",
                price=199.99,
                category="Headphones",
                stock=25
            ),

            # ── Speakers ────────────────────────────────────────────
            Product(
                name="Studio Monitors X1",
                description="Professional grade studio monitors with bi-amplified design and flat frequency response.",
                price=499.99,
                category="Speakers",
                stock=30
            ),
            Product(
                name="Desktop Soundbar",
                description="Compact yet powerful desktop soundbar with virtual surround sound and USB-C connectivity.",
                price=199.99,
                category="Speakers",
                stock=40
            ),
            Product(
                name="BoomPod Portable Speaker",
                description="Rugged 360° portable speaker with 24-hour battery, IPX7 waterproof rating and loud 20W output.",
                price=129.99,
                category="Speakers",
                stock=55
            ),
            Product(
                name="HomeFill 360 Speaker",
                description="Room-filling omnidirectional sound with multi-room Wi-Fi audio streaming and voice assistant support.",
                price=249.99,
                category="Speakers",
                stock=20
            ),
            Product(
                name="MiniPulse Bluetooth",
                description="Ultra-compact Bluetooth 5.3 speaker that fits in your pocket. 10W output with rich bass.",
                price=49.99,
                category="Speakers",
                stock=90
            ),

            # ── Gaming ──────────────────────────────────────────────
            Product(
                name="Apex Gaming Headset",
                description="7.1 virtual surround sound headset with noise-cancelling mic and RGB lighting for competitive gaming.",
                price=159.99,
                category="Gaming",
                stock=45
            ),
            Product(
                name="ProClick Mechanical KB",
                description="Tactile mechanical keyboard with hot-swappable switches, per-key RGB, and aluminum frame.",
                price=129.99,
                category="Gaming",
                stock=38
            ),
            Product(
                name="PrecisionX Gaming Mouse",
                description="25,600 DPI optical sensor with 6 programmable buttons, ultra-light 68g design and RGB lighting.",
                price=89.99,
                category="Gaming",
                stock=70
            ),
            Product(
                name="HyperPad RGB Mousepad",
                description="XXL desk-covering mousepad with addressable RGB border lighting and micro-textured surface.",
                price=39.99,
                category="Gaming",
                stock=120
            ),
            Product(
                name="GameStream Controller",
                description="Wireless game controller with hall effect sticks, 40-hour battery, and cross-platform compatibility.",
                price=69.99,
                category="Gaming",
                stock=55
            ),

            # ── Wearables ───────────────────────────────────────────
            Product(
                name="Aura Watch Ultra",
                description="Premium smartwatch with AMOLED display, GPS, SpO2, ECG, and 14-day battery life.",
                price=449.99,
                category="Wearables",
                stock=20
            ),
            Product(
                name="FitBand Pro X",
                description="Advanced fitness tracker with continuous heart rate, sleep scoring, and 10-day battery.",
                price=99.99,
                category="Wearables",
                stock=65
            ),
            Product(
                name="SmartRing Vitals",
                description="Discreet titanium smart ring tracking HRV, temperature, sleep stages and readiness score.",
                price=299.99,
                category="Wearables",
                stock=15
            ),

            # ── Accessories ─────────────────────────────────────────
            Product(
                name="Gold Plated Audio Cable",
                description="High fidelity 3.5mm auxiliary cable with gold-plated connectors and OFC conductor for pure audio.",
                price=29.99,
                category="Accessories",
                stock=75
            ),
            Product(
                name="USB-C Hub 8-in-1",
                description="Compact 8-in-1 hub with 4K HDMI, 100W PD charging, USB-A, SD/microSD card slots.",
                price=59.99,
                category="Accessories",
                stock=50
            ),
            Product(
                name="MagCharge Wireless Pad",
                description="15W MagSafe-compatible wireless charging pad with intelligent temperature control and LED indicator.",
                price=44.99,
                category="Accessories",
                stock=85
            ),
            Product(
                name="Cable Organizer Pro",
                description="Premium vegan leather cable organizer with 8 elastic loops — keep your desk spotless.",
                price=19.99,
                category="Accessories",
                stock=200
            ),
            Product(
                name="Portable Power Bank 20K",
                description="20,000mAh power bank with 65W PD fast charging, three outputs, and LED power display.",
                price=79.99,
                category="Accessories",
                stock=60
            ),
        ]
        db.session.add_all(sample_products)

    db.session.commit()
    count = Product.query.count()
    print(f"Seed complete: admin@example.com / admin123 | {count} products in database.")
