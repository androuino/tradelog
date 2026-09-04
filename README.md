# Trading Journal

    This is a personal trading journal for my trades. It is a web application that allows me to log my trades and track my performance.

# Deployment

**Deploy to Firebase**

    Step 1: Login to Firebase CLI

    npx -y firebase-tools@latest login

    Step 2: Connect your Firebase Project ID

    npx -y firebase-tools@latest use --add

    Step 3: Build & Deploy Live

    npm run build && npx -y firebase-tools@latest deploy --only hosting