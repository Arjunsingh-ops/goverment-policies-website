"""
India Policy Portal — FastAPI Backend
--------------------------------------
Stack: FastAPI + Supabase (via supabase-py)
"""
from fastapi import FastAPI, HTTPException, Depends, Query, Header
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from typing import Optional, List
import os
from dotenv import load_dotenv
from supabase import create_client, Client
from pydantic import BaseModel, Field
from datetime import datetime
import uuid
load_dotenv()
# ─── Supabase client ─────────────────────────────────────────
SUPABASE_URL = os.environ["SUPABASE_URL"]
SUPABASE_SERVICE_KEY = os.environ["SUPABASE_SERVICE_KEY"]  # service role key for admin ops
SUPABASE_ANON_KEY = os.environ["SUPABASE_ANON_KEY"]
supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)
# ─── App ─────────────────────────────────────────────────────
app = FastAPI(
    title="India Policy Portal API",
    description="Backend API for the India Government Policies Portal",
    version="1.0.0",
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        os.getenv("FRONTEND_URL", "http://localhost:3000"),
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
# ─── Models ──────────────────────────────────────────────────
class PolicyCreate(BaseModel):
    title: str
    summary: Optional[str] = None
    description: Optional[str] = None
    category_id: Optional[int] = None
    ministry: Optional[str] = None
    launched_date: Optional[str] = None
    status: str = "Active"
    budget_outlay: Optional[str] = None
    beneficiaries: Optional[str] = None
    eligibility: Optional[str] = None
    benefits: Optional[List[str]] = []
    official_url: Optional[str] = None
    government_level: str = "Central"
    state: Optional[str] = None
    is_featured: bool = False
class PolicyUpdate(PolicyCreate):
    title: Optional[str] = None
class NewsCreate(BaseModel):
    title: str
    content: Optional[str] = None
    summary: Optional[str] = None
    category_id: Optional[int] = None
    policy_id: Optional[str] = None
    tag: Optional[str] = None
    is_published: bool = True
class NewsUpdate(NewsCreate):
    title: Optional[str] = None
# ─── Auth helpers ────────────────────────────────────────────
def get_user_from_token(authorization: Optional[str] = Header(None)):
    """Extract user from Bearer token using Supabase Auth."""
    if not authorization or not authorization.startswith("Bearer "):
        return None
    token = authorization.split(" ")[1]
    try:
        user = supabase.auth.get_user(token)
        return user.user
    except Exception:
        return None
def require_auth(authorization: Optional[str] = Header(None)):
    user = get_user_from_token(authorization)
    if not user:
        raise HTTPException(status_code=401, detail="Authentication required")
    return user
def require_admin(authorization: Optional[str] = Header(None)):
    user = require_auth(authorization)
    profile = supabase.table("profiles").select("role").eq("id", user.id).single().execute()
    if not profile.data or profile.data.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    return user
# ─── Health ──────────────────────────────────────────────────
@app.get("/", tags=["Health"])
def root():
    return {"status": "ok", "service": "India Policy Portal API", "version": "1.0.0"}
@app.get("/health", tags=["Health"])
def health():
    return {"status": "healthy", "timestamp": datetime.utcnow().isoformat()}
# ─── Auth endpoints ──────────────────────────────────────────
@app.post("/auth/signup", tags=["Auth"])
def signup(email: str, password: str, full_name: str = ""):
    try:
        res = supabase.auth.sign_up({
            "email": email,
            "password": password,
            "options": {"data": {"full_name": full_name}}
        })
        return {"message": "Signup successful. Check email to verify.", "user_id": res.user.id if res.user else None}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
@app.post("/auth/login", tags=["Auth"])
def login(email: str, password: str):
    try:
        res = supabase.auth.sign_in_with_password({"email": email, "password": password})
        return {
            "access_token": res.session.access_token,
            "refresh_token": res.session.refresh_token,
            "user": {"id": res.user.id, "email": res.user.email}
        }
    except Exception as e:
        raise HTTPException(status_code=401, detail="Invalid credentials")
@app.get("/auth/me", tags=["Auth"])
def get_me(user=Depends(require_auth)):
    profile = supabase.table("profiles").select("*").eq("id", user.id).single().execute()
    return {"user": {"id": user.id, "email": user.email}, "profile": profile.data}
# ─── Categories ──────────────────────────────────────────────
@app.get("/categories", tags=["Categories"])
def list_categories():
    res = supabase.table("categories").select("*").order("name").execute()
    return {"data": res.data}
# ─── Policies ────────────────────────────────────────────────
@app.get("/policies", tags=["Policies"])
def list_policies(
    search:    Optional[str] = Query(None, description="Full-text search"),
    category:  Optional[str] = Query(None, description="Category slug"),
    status:    Optional[str] = Query(None, description="Active | Draft | Archived"),
    gov_level: Optional[str] = Query(None, description="Central | State | Joint"),
    featured:  Optional[bool] = Query(None),
    page:      int = Query(1, ge=1),
    limit:     int = Query(12, ge=1, le=100),
    sort:      str = Query("created_at", description="Field to sort by"),
    order:     str = Query("desc", description="asc | desc"),
):
    offset = (page - 1) * limit
    query = supabase.table("policies_with_category").select("*", count="exact")
    if search:
        query = query.or_(f"title.ilike.%{search}%,summary.ilike.%{search}%,ministry.ilike.%{search}%")
    if category:
        query = query.eq("category_slug", category)
    if status:
        query = query.eq("status", status)
    if gov_level:
        query = query.eq("government_level", gov_level)
    if featured is not None:
        query = query.eq("is_featured", featured)
    query = query.order(sort, desc=(order == "desc")).range(offset, offset + limit - 1)
    res = query.execute()
    return {
        "data": res.data,
        "total": res.count,
        "page": page,
        "limit": limit,
        "pages": (res.count + limit - 1) // limit if res.count else 0,
    }
@app.get("/policies/{policy_id}", tags=["Policies"])
def get_policy(policy_id: str):
    res = supabase.table("policies_with_category").select("*").eq("id", policy_id).maybe_single().execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="Policy not found")
    # Increment view count
    supabase.table("policies").update({"view_count": res.data["view_count"] + 1}).eq("id", policy_id).execute()
    return {"data": res.data}
@app.post("/policies", tags=["Policies"])
def create_policy(policy: PolicyCreate, user=Depends(require_admin)):
    data = policy.dict()
    data["created_by"] = user.id
    res = supabase.table("policies").insert(data).execute()
    if not res.data:
        raise HTTPException(status_code=500, detail="Failed to create policy")
    return {"data": res.data[0], "message": "Policy created successfully"}
@app.put("/policies/{policy_id}", tags=["Policies"])
def update_policy(policy_id: str, policy: PolicyUpdate, user=Depends(require_admin)):
    data = {k: v for k, v in policy.dict().items() if v is not None}
    res = supabase.table("policies").update(data).eq("id", policy_id).execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="Policy not found")
    return {"data": res.data[0], "message": "Policy updated successfully"}
@app.delete("/policies/{policy_id}", tags=["Policies"])
def delete_policy(policy_id: str, user=Depends(require_admin)):
    supabase.table("policies").delete().eq("id", policy_id).execute()
    return {"message": "Policy deleted successfully"}
# ─── News ────────────────────────────────────────────────────
@app.get("/news", tags=["News"])
def list_news(
    page:  int = Query(1, ge=1),
    limit: int = Query(9, ge=1, le=50),
    tag:   Optional[str] = None,
):
    offset = (page - 1) * limit
    query = supabase.table("news").select("*, categories(name,color,icon)", count="exact").eq("is_published", True)
    if tag:
        query = query.eq("tag", tag)
    query = query.order("published_at", desc=True).range(offset, offset + limit - 1)
    res = query.execute()
    return {"data": res.data, "total": res.count, "page": page, "limit": limit}
@app.get("/news/{news_id}", tags=["News"])
def get_news(news_id: str):
    res = supabase.table("news").select("*, categories(name,color,icon)").eq("id", news_id).maybe_single().execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="News not found")
    return {"data": res.data}
@app.post("/news", tags=["News"])
def create_news(news: NewsCreate, user=Depends(require_admin)):
    data = news.dict()
    data["created_by"] = user.id
    res = supabase.table("news").insert(data).execute()
    return {"data": res.data[0], "message": "News created successfully"}
@app.put("/news/{news_id}", tags=["News"])
def update_news(news_id: str, news: NewsUpdate, user=Depends(require_admin)):
    data = {k: v for k, v in news.dict().items() if v is not None}
    res = supabase.table("news").update(data).eq("id", news_id).execute()
    return {"data": res.data[0], "message": "News updated"}
@app.delete("/news/{news_id}", tags=["News"])
def delete_news(news_id: str, user=Depends(require_admin)):
    supabase.table("news").delete().eq("id", news_id).execute()
    return {"message": "News deleted"}
# ─── Bookmarks ───────────────────────────────────────────────
@app.get("/bookmarks", tags=["Bookmarks"])
def get_bookmarks(user=Depends(require_auth)):
    res = supabase.table("bookmarks").select("*, policies(id,title,summary,status)").eq("user_id", user.id).execute()
    return {"data": res.data}
@app.post("/bookmarks/{policy_id}", tags=["Bookmarks"])
def add_bookmark(policy_id: str, user=Depends(require_auth)):
    try:
        res = supabase.table("bookmarks").insert({"user_id": user.id, "policy_id": policy_id}).execute()
        return {"message": "Bookmarked", "data": res.data[0]}
    except Exception:
        raise HTTPException(status_code=409, detail="Already bookmarked")
@app.delete("/bookmarks/{policy_id}", tags=["Bookmarks"])
def remove_bookmark(policy_id: str, user=Depends(require_auth)):
    supabase.table("bookmarks").delete().eq("user_id", user.id).eq("policy_id", policy_id).execute()
    return {"message": "Bookmark removed"}
# ─── Admin stats ─────────────────────────────────────────────
@app.get("/admin/stats", tags=["Admin"])
def admin_stats(user=Depends(require_admin)):
    policies_res = supabase.table("policies").select("id, status, is_featured", count="exact").execute()
    news_res     = supabase.table("news").select("id", count="exact").execute()
    users_res    = supabase.table("profiles").select("id, role", count="exact").execute()
    active   = sum(1 for p in (policies_res.data or []) if p["status"] == "Active")
    featured = sum(1 for p in (policies_res.data or []) if p["is_featured"])
    admins   = sum(1 for u in (users_res.data or []) if u["role"] == "admin")
    return {
        "total_policies": policies_res.count,
        "active_policies": active,
        "featured_policies": featured,
        "total_news": news_res.count,
        "total_users": users_res.count,
        "admin_users": admins,
    }