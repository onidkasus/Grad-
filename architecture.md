
# GRAD+ Server & Database Architecture

This document outlines the hosting and data management strategy for the GRAD+ multi-city template.

## 1. Cloud Infrastructure
- **Serverless API:** Utilizing Node.js with a framework like NestJS or Express, deployed on **Vercel** or **AWS Lambda** for scalability.
- **Micro-services:** Each city can have its own logical namespace, but shared services (Auth, AI, Global Analytics) run as unified micro-services.

## 2. Database Schema (PostgreSQL)
We recommend a relational database like **Supabase (PostgreSQL)** for transactional integrity and real-time capabilities.

### Main Tables:
- `cities`: ID, Name, Logo, Config, RegionCode.
- `users`: ID, NIAS_ID, Name, Role, City_ID, Total_Impact_Score.
- `challenges`: ID, City_ID, Title, Description, Status, Reward, Deadline.
- `ideas`: ID, Challenge_ID, Author_ID, Title, Description, Category, Impact_Score, Stage (Incubator), Status.
- `comments`: ID, Idea_ID, Author_ID, Content, Timestamp.
- `verifications`: ID, User_ID, Claim_Text, Result_JSON, Confidence.

## 3. Persistent Storage
- **Media:** AWS S3 or Google Cloud Storage for idea attachments and documents.
- **Caching:** Redis for high-frequency data like current impact scores and trending challenges.

## 4. e-Građanin (NIAS) Integration
- **Protocol:** SAML 2.0 or OAuth2/OpenID Connect (depending on the specific tier of NIAS being used).
- **Process:** User is redirected to NIAS login -> Successful auth returns a JWT -> Our server validates JWT and creates/updates a user session.

## 5. Security
- **Data Residency:** All databases must be hosted within EU regions (e.g., Frankfurt/Ireland) to comply with GDPR and Croatian local laws.
- **End-to-End Encryption:** All citizen data is encrypted at rest and in transit.
