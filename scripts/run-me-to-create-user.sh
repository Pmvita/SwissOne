#!/bin/bash
# Simple script to create user via Supabase Auth API

echo "🚀 Creating dev user..."

curl -X POST 'https://amjjhdsbvpnjdgdlvoka.supabase.co/auth/v1/signup' \
  -H 'apikey: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFtampoZHNidnBuamRnZGx2b2thIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjcxMjMwMTEsImV4cCI6MjA4MjY5OTAxMX0.KOvBHQ7VLVnxC_1oz9_UVP3bM5fkOUpFKQa_Cn1x7Xw' \
  -H 'Content-Type: application/json' \
  -d '{
    "email": "petermvita@hotmail.com",
    "password": "admin123",
    "data": {
      "username": "pmvita",
      "first_name": "Peter",
      "last_name": "Mvita"
    }
  }'

echo ""
echo ""
echo "✅ User creation request sent!"
echo ""
echo "📝 Now run this SQL in Supabase Dashboard:"
echo "UPDATE profiles SET username = 'pmvita', role = 'admin', first_name = 'Peter', last_name = 'Mvita', full_name = 'Peter Mvita' WHERE email = 'petermvita@hotmail.com';"

