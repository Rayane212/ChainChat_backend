# Utiliser l'image officielle Node.js
FROM node:20-alpine

# Définir le répertoire de travail
WORKDIR /app

# Installer PNPM manuellement (sans Corepack)
RUN npm install -g pnpm@latest

# Copier les fichiers nécessaires
COPY package.json pnpm-lock.yaml ./

# Installer les dépendances avec PNPM
RUN pnpm install --frozen-lockfile

# Copier le reste des fichiers
COPY . .

# Construire l'application
RUN pnpm run build

# Exposer le port utilisé par le service
EXPOSE 50052

# Démarrer l'application
CMD ["pnpm", "start"]