from sqlalchemy import (
    Column,
    Integer,
    Text,
    String,
    Float,
    Boolean,
    DateTime,
    ForeignKey,
)
from sqlalchemy.orm import relationship
from datetime import datetime

from .meta import Base


class Room(Base):
    """Room model for storing room information."""
    __tablename__ = 'rooms'
    
    id = Column(Integer, primary_key=True)
    name = Column(String(100), nullable=False)
    description = Column(Text, nullable=False)
    price_per_night = Column(Float, nullable=False)
    capacity = Column(Integer, nullable=False, default=2)
    room_type = Column(String(50), nullable=False, default='standard')  # e.g., 'standard', 'deluxe', 'suite'
    is_available = Column(Boolean, default=True)
    image_url = Column(String(255), nullable=True)
    amenities = Column(Text, nullable=True)  # Stored as JSON string
    created_at = Column(DateTime, default=datetime.now)
    updated_at = Column(DateTime, default=datetime.now, onupdate=datetime.now)
    
    # Relationships
    bookings = relationship('Booking', back_populates='room')
    reviews = relationship('Review', back_populates='room')
    
    # Relationships sudah didefinisikan di atas, tidak perlu didefinisikan lagi
    # bookings = relationship("Booking", back_populates="room")
    
    def to_dict(self):
        """Convert Room object to dictionary for JSON serialization."""
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'price_per_night': self.price_per_night,
            'capacity': self.capacity,
            'room_type': self.room_type,
            'is_available': self.is_available,
            'image_url': self.image_url,
            'amenities': self.amenities,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }
