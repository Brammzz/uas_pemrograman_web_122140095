from sqlalchemy import (
    Column,
    Integer,
    String,
    DateTime,
    ForeignKey,
    Boolean,
)
from sqlalchemy.orm import relationship
from datetime import datetime, timedelta

from .meta import Base


class Token(Base):
    """Token model for storing authentication tokens."""
    __tablename__ = 'tokens'
    
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    token = Column(String(100), unique=True, nullable=False)
    is_admin = Column(Boolean, default=False)
    expires_at = Column(DateTime, nullable=False)
    created_at = Column(DateTime, default=datetime.now)
    
    # Relationships
    user = relationship("User")
    
    @classmethod
    def create_token(cls, user_id, is_admin=False, expiry_days=1):
        """Create a new token for a user with an expiry date."""
        import secrets
        token = secrets.token_hex(32)
        expires_at = datetime.now() + timedelta(days=expiry_days)
        return cls(
            user_id=user_id,
            token=token,
            is_admin=is_admin,
            expires_at=expires_at
        )
    
    def is_valid(self):
        """Check if the token is still valid (not expired)."""
        return datetime.now() < self.expires_at
    
    def to_dict(self):
        """Convert Token object to dictionary for JSON serialization."""
        return {
            'id': self.id,
            'user_id': self.user_id,
            'token': self.token,
            'is_admin': self.is_admin,
            'expires_at': self.expires_at.isoformat() if self.expires_at else None,
            'created_at': self.created_at.isoformat() if self.created_at else None,
        }
