import os

# Define paths
FILE_PATH = '../backend/app/api/endpoints.py'

# Read file
with open(FILE_PATH, 'r') as f:
    content = f.read()

# 1. Add Imports
if "from cachetools import TTLCache" not in content:
    content = content.replace(
        "from fastapi import APIRouter", 
        "from fastapi import APIRouter\nfrom cachetools import TTLCache"
    )

# 2. Initialize Caches (after router = APIRouter())
if "stats_cache =" not in content:
    content = content.replace(
        "router = APIRouter()",
        "router = APIRouter()\n\n# Caching\nstats_cache = TTLCache(maxsize=1, ttl=300)\nhistory_cache = TTLCache(maxsize=100, ttl=30)"
    )

# 3. Cache Admin Stats
if 'if "stats" in stats_cache:' not in content:
    content = content.replace(
        """@router.get("/admin/stats")
async def get_admin_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin)
):""",
        """@router.get("/admin/stats")
async def get_admin_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin)
):
    if "stats" in stats_cache:
        return stats_cache["stats"]"""
    )
    
    # Needs to capture return
    # This is tricky with simple replace if we don't know the exact return line structure.
    # But usually it ends with 'return {'
    # Let's wrap the logic? No, too complex to regex replace correctly without error.
    # Manual injection at start is easy.
    # Injection at end requires finding the return.
    
    # Alternative: Use a manual return wrapper?
    # Simple replace of the return statement?
    # Original:
    # return {
    #     "total_users": user_count,
    #     ...
    # }
    
    # We can replace the start of the return block?
    
    start_marker = '    return {\n        "total_users": user_count,'
    if start_marker in content:
        content = content.replace(
            start_marker,
            """    result = {
        "total_users": user_count,"""
        )
        # And finding the end of that block?
        # It's an indent based block.
        # "recent_signups": recent_signups\n    }
        
        end_marker = '"recent_signups": recent_signups\n    }'
        content = content.replace(
            end_marker,
            """"recent_signups": recent_signups
    }
    stats_cache["stats"] = result
    return result"""
        )

# 4. Cache Wish History
if 'if current_user.id in history_cache:' not in content:
    content = content.replace(
        """@router.get("/wishes/history")
async def get_wish_history(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):""",
        """@router.get("/wishes/history")
async def get_wish_history(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.id in history_cache:
        return history_cache[current_user.id]"""
    )
    
    # Replace return
    # Original:
    # return db.query(ScheduledWish).filter(
    #    ScheduledWish.user_id == current_user.id
    # ).order_by(ScheduledWish.created_at.desc()).all()
    
    # This is a single line (or multi-line) return.
    target_return = """    return db.query(ScheduledWish).filter(
        ScheduledWish.user_id == current_user.id
    ).order_by(ScheduledWish.created_at.desc()).all()"""
    
    replacement_return = """    results = db.query(ScheduledWish).filter(
        ScheduledWish.user_id == current_user.id
    ).order_by(ScheduledWish.created_at.desc()).all()
    history_cache[current_user.id] = results
    return results"""
    
    content = content.replace(target_return, replacement_return)

with open(FILE_PATH, 'w') as f:
    f.write(content)

print("Successfully injected caching logic.")
