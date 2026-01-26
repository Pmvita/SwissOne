#!/usr/bin/env python3
"""Create dev user via Supabase Auth API - uses only Python standard library"""

import urllib.request
import urllib.parse
import json
import time

PROJECT_URL = 'https://amjjhdsbvpnjdgdlvoka.supabase.co'
ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFtampoZHNidnBuamRnZGx2b2thIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjcxMjMwMTEsImV4cCI6MjA4MjY5OTAxMX0.KOvBHQ7VLVnxC_1oz9_UVP3bM5fkOUpFKQa_Cn1x7Xw'

DEV_EMAIL = 'petermvita@hotmail.com'
DEV_USERNAME = 'pmvita'
DEV_PASSWORD = 'admin123'

def make_request(url, method='GET', headers=None, body=None):
    """Make HTTP request using urllib"""
    req = urllib.request.Request(url, method=method, headers=headers or {})
    if body:
        req.data = json.dumps(body).encode('utf-8')
    
    try:
        with urllib.request.urlopen(req) as response:
            data = response.read().decode('utf-8')
            return {
                'status': response.getcode(),
                'data': json.loads(data) if data else {},
                'ok': 200 <= response.getcode() < 300
            }
    except urllib.error.HTTPError as e:
        error_data = e.read().decode('utf-8')
        try:
            return {'status': e.code, 'data': json.loads(error_data), 'ok': False}
        except:
            return {'status': e.code, 'data': error_data, 'ok': False}

def main():
    print('🚀 Creating dev user...\n')
    
    # Step 1: Sign up
    print('📝 Step 1: Signing up user...')
    signup_url = f'{PROJECT_URL}/auth/v1/signup'
    signup_headers = {
        'apikey': ANON_KEY,
        'Content-Type': 'application/json'
    }
    signup_body = {
        'email': DEV_EMAIL,
        'password': DEV_PASSWORD,
        'data': {
            'username': DEV_USERNAME,
            'first_name': 'Peter',
            'last_name': 'Mvita'
        }
    }
    
    signup_res = make_request(signup_url, 'POST', signup_headers, signup_body)
    
    if signup_res['ok'] and 'user' in signup_res['data']:
        print(f"✅ User created: {signup_res['data']['user'].get('email', DEV_EMAIL)}")
        
        # Wait for profile trigger
        print('\n⏳ Waiting for profile creation (2 seconds)...')
        time.sleep(2)
        
        # Step 2: Sign in
        print('🔐 Step 2: Signing in...')
        signin_url = f'{PROJECT_URL}/auth/v1/token?grant_type=password'
        signin_body = {
            'email': DEV_EMAIL,
            'password': DEV_PASSWORD
        }
        
        signin_res = make_request(signin_url, 'POST', signup_headers, signin_body)
        
        if signin_res['ok'] and 'access_token' in signin_res['data']:
            token = signin_res['data']['access_token']
            print('✅ Signed in successfully')
            
            # Step 3: Update profile
            print('\n🔄 Step 3: Updating profile...')
            update_url = f'{PROJECT_URL}/rest/v1/profiles?email=eq.{urllib.parse.quote(DEV_EMAIL)}'
            update_headers = {
                'apikey': ANON_KEY,
                'Authorization': f'Bearer {token}',
                'Content-Type': 'application/json',
                'Prefer': 'return=representation'
            }
            update_body = {
                'username': DEV_USERNAME,
                'role': 'admin',
                'first_name': 'Peter',
                'last_name': 'Mvita',
                'full_name': 'Peter Mvita'
            }
            
            update_res = make_request(update_url, 'PATCH', update_headers, update_body)
            
            if update_res['ok']:
                print('✅ Profile updated successfully!')
                print('\n🎉 Setup Complete!')
                print('\n📋 Dev User Credentials:')
                print(f'   Email: {DEV_EMAIL}')
                print(f'   Username: {DEV_USERNAME}')
                print(f'   Password: {DEV_PASSWORD}')
                print('   Role: admin')
                print('\n🚀 You can now login at http://localhost:3000/login')
            else:
                print(f"⚠️  Profile update failed: {update_res['data']}")
                print('\n📝 Run this SQL manually:')
                print(f"UPDATE profiles SET username = '{DEV_USERNAME}', role = 'admin' WHERE email = '{DEV_EMAIL}';")
        else:
            print(f"⚠️  Sign in failed: {signin_res['data']}")
            print('\n📝 Run this SQL manually:')
            print(f"UPDATE profiles SET username = '{DEV_USERNAME}', role = 'admin' WHERE email = '{DEV_EMAIL}';")
    elif 'message' in signup_res['data'] and 'already' in signup_res['data']['message'].lower():
        print('ℹ️  User already exists')
        print('\n📝 Run this SQL to update profile:')
        print(f"UPDATE profiles SET username = '{DEV_USERNAME}', role = 'admin', first_name = 'Peter', last_name = 'Mvita', full_name = 'Peter Mvita' WHERE email = '{DEV_EMAIL}';")
    else:
        print(f"❌ Signup failed: {signup_res['data']}")
        print('\n⚠️  Please create user manually via Supabase Dashboard')
        print(f'   Email: {DEV_EMAIL}')
        print(f'   Password: {DEV_PASSWORD}')
        print('\n📝 Then run this SQL:')
        print(f"UPDATE profiles SET username = '{DEV_USERNAME}', role = 'admin' WHERE email = '{DEV_EMAIL}';")

if __name__ == '__main__':
    main()

