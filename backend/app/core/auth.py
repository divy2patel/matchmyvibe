import logging
from typing import Optional, Dict, Any
from fastapi import Header, HTTPException, Depends, Security
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from backend.app.core.database import get_supabase_client
from backend.app.core.config import settings

logger = logging.getLogger("matchmyvibe.auth")

security = HTTPBearer(auto_error=False)


class AuthenticatedUser(BaseModel):
    id: str
    email: Optional[str] = None
    role: str = "student"
    full_name: Optional[str] = None
    name: Optional[str] = None
    batch: Optional[str] = None
    branch: Optional[str] = None


async def get_optional_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Security(security),
    x_user_id: Optional[str] = Header(default=None),
) -> Optional[AuthenticatedUser]:
    """
    Extracts authenticated user from Bearer JWT token (Supabase Auth)
    or fallback header during dev/testing. Returns None if unauthenticated.
    """
    token = credentials.credentials if credentials else None

    # 1. Verify Supabase JWT token if provided
    if token:
        sb = get_supabase_client()
        if sb:
            try:
                user_resp = sb.auth.get_user(token)
                if user_resp and user_resp.user:
                    sb_user = user_resp.user
                    uid = sb_user.id
                    email = sb_user.email
                    meta = sb_user.user_metadata or {}
                    
                    # Fetch profile for role and details
                    role = meta.get("role", "student")
                    full_name = meta.get("full_name") or meta.get("name")
                    batch = meta.get("batch")
                    branch = meta.get("branch")

                    try:
                        p_res = sb.table("profiles").select("*").eq("user_id", uid).execute()
                        if p_res.data and len(p_res.data) > 0:
                            p = p_res.data[0]
                            role = p.get("role") or role
                            full_name = p.get("full_name") or p.get("name") or full_name
                            batch = p.get("batch") or batch
                            branch = p.get("branch") or branch
                    except Exception as pe:
                        logger.debug("Profile fetch in auth: %s", pe)

                    return AuthenticatedUser(
                        id=uid,
                        email=email,
                        role=role,
                        full_name=full_name,
                        name=full_name,
                        batch=batch,
                        branch=branch,
                    )
            except Exception as e:
                logger.warning("Supabase token validation error: %s", e)
                # Invalid token
                return None

        # Dev / Testing mock token handling
        if token.startswith("test_") or token.startswith("mock_"):
            is_admin = "admin" in token
            return AuthenticatedUser(
                id=token,
                email=f"{token}@aatmoday.edu",
                role="admin" if is_admin else "student",
                full_name="Test Admin" if is_admin else "Test Student",
                name="Test Admin" if is_admin else "Test Student",
                batch="2026",
                branch="Computer Science",
            )

    # 2. Check x-user-id header for backward compatibility / dev testing
    if x_user_id and x_user_id != "anonymous":
        is_admin = "admin" in x_user_id.lower()
        return AuthenticatedUser(
            id=x_user_id,
            email=f"{x_user_id}@aatmoday.edu",
            role="admin" if is_admin else "student",
            full_name="Student User" if not is_admin else "Admin User",
            name="Student User" if not is_admin else "Admin User",
        )

    return None


async def get_current_user(
    user: Optional[AuthenticatedUser] = Depends(get_optional_user),
) -> AuthenticatedUser:
    """
    Enforces authentication. Raises 401 Unauthorized if no valid session exists.
    """
    if not user:
        raise HTTPException(
            status_code=401,
            detail="Authentication required. Please log in with your student account.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return user


async def require_admin(
    user: AuthenticatedUser = Depends(get_current_user),
) -> AuthenticatedUser:
    """
    Enforces student admin authorization. Raises 403 Forbidden if not admin.
    """
    if user.role != "admin":
        logger.warning("User %s attempted unauthorized admin access.", user.id)
        raise HTTPException(
            status_code=403,
            detail="Forbidden: Campus administrator privileges required.",
        )
    return user
