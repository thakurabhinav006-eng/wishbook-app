from passlib.context import CryptContext

# Replicate the configuration causing issues
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto", bcrypt__rounds=10)

def test_hashing():
    password = "testpassword"
    # 1. Provide a hash generated with default settings (rounds=12 usually)
    # This simulates an existing user's password in the DB
    # Example bcrypt hash (rounds=12)
    old_hash = "$2b$12$K.X.X.X.X.X.X.X.X.X.X.u.X.X.X.X.X.X.X.X.X.X.X.X.X" 
    # Actually, let's generate a real one using default settings first
    
    default_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
    real_old_hash = default_context.hash(password)
    print(f"Old Hash (Default Rounds): {real_old_hash}")
    
    # 2. Try to verify using the NEW context
    try:
        result = pwd_context.verify(password, real_old_hash)
        print(f"Verification Result (Old Hash vs New Context): {result}")
    except Exception as e:
        print(f"Verification Failed with Error: {e}")

    # 3. Test new hash generation
    new_hash = pwd_context.hash(password)
    print(f"New Hash (Rounds=10): {new_hash}")
    print(f"Verification Result (New Hash vs New Context): {pwd_context.verify(password, new_hash)}")

if __name__ == "__main__":
    test_hashing()
