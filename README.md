# SecuChat - Application de Messagerie en Temps Réel

## 🚀 Comment Démarrer le Projet

### Prérequis
- Docker et Docker Compose installés
- Ports 80, 443 et 3000 disponibles

### Démarrage
```bash
# Cloner le projet
git clone https://github.com/johan-mickael-myges/web-secu-vuln-test.git
cd web-secu-vuln-test

# Nettoyer les conteneurs existants (si nécessaire)
docker compose down
docker system prune -f

# Générer les certificats SSL
chmod +x nginx/generate-ssl.sh
./nginx/generate-ssl.sh

# Démarrer l'application
docker compose up --build -d

# Accéder à l'application
# https://localhost
```

## 🌐 Comment y Accéder

- **URL principale** : `https://localhost`
- **Interface utilisateur** : Connexion avec nom d'utilisateur
- **Navigation** : Sidebar pour changer de salle
- **Recherche** : Panneau de recherche pour trouver des messages

## 🔍 Fonctionnalités et Vulnérabilités

### 1. Recherche par Utilisateur
**Fonctionnalité** : Recherche de messages par nom d'utilisateur

**Vulnérabilité** : Injection NoSQL via JSON parsing
```diff
- let query;
- try {
-     const parsedUsername = JSON.parse(username);
-     query = { username: parsedUsername };
- } catch {
-     query = { username: username };
- }
```

**Solution** :
```diff
+ // Validation de l'input
+ if (typeof username !== 'string' || username.length > 50) {
+     throw new Error('Invalid username');
+ }
+ const query = { username: username };
```

### 2. Recherche par Contenu
**Fonctionnalité** : Recherche dans le texte des messages

**Vulnérabilité** : Injection NoSQL via JSON parsing
```diff
- let query;
- try {
-     const parsedContent = JSON.parse(content);
-     query = { content: parsedContent };
- } catch {
-     query = { content: { $regex: content, $options: 'i' } };
- }
```

**Solution** :
```diff
+ // Sanitisation de l'input
+ const sanitizedContent = content.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
+ const query = { content: { $regex: sanitizedContent, $options: 'i' } };
```

### 3. Recherche par Salle
**Fonctionnalité** : Recherche de messages par salle

**Vulnérabilité** : Injection NoSQL via JSON parsing
```diff
- let query;
- try {
-     const parsedRoom = JSON.parse(room);
-     query = { room: parsedRoom };
+ } catch {
+     query = { room: room };
+ }
```

**Solution** :
```diff
+ // Validation de l'input
+ if (typeof room !== 'string' || room.length > 50) {
+     throw new Error('Invalid room name');
+ }
+ const query = { room: room };
```

### 4. Chat en Temps Réel
**Fonctionnalité** : Messagerie instantanée avec Socket.IO

**Vulnérabilité** : Pas de validation du contenu des messages
```diff
- const newMessage: Message = { ...message, timestamp: new Date() };
- // Pas de validation du contenu
```

**Solution** :
```diff
+ // Validation et sanitisation du contenu
+ if (!message.content || typeof message.content !== 'string') {
+     throw new Error('Message content is required and must be a string');
+ }
+ 
+ // Limiter la longueur et nettoyer les caractères dangereux
+ const sanitizedContent = message.content
+     .trim()
+     .slice(0, 1000)
+     .replace(/[<>]/g, '') // Éviter les balises HTML
+     .replace(/\s+/g, ' '); // Normaliser les espaces
+ 
+ if (sanitizedContent.length === 0) {
+     throw new Error('Message content cannot be empty');
+ }
+ 
+ const newMessage: Message = { 
+     ...message, 
+     content: sanitizedContent,
+     timestamp: new Date() 
+ };
```

## 🧪 Comment Tester les Vulnérabilités

### Via l'Interface Web
1. Connectez-vous à `https://localhost`
2. Ouvrez le panneau de recherche
3. Testez ces payloads :

**Recherche par Utilisateur** :
- Normal : `alice`
- Injection : `{"$ne": null}` → Tous les utilisateurs
- Injection : `{"$regex": ".*"}` → Tous les utilisateurs

**Recherche par Contenu** :
- Normal : `test`
- Injection : `{"$ne": null}` → Tous les messages
- Injection : `{"$regex": ".*"}` → Tous les messages

**Recherche par Salle** :
- Normal : `general`
- Injection : `{"$ne": null}` → Toutes les salles
- Injection : `{"$regex": ".*"}` → Toutes les salles

### Via la Console Browser
```javascript
// Récupérer tous les utilisateurs
socket.emit('search-messages', {
    type: 'username',
    value: '{"$ne": null}'
});
```

## 🏗️ Architecture

- **Frontend** : Next.js 14 + TypeScript + shadcn/ui
- **Backend** : Node.js + Socket.IO
- **Base de données** : MongoDB
- **Proxy** : Nginx + SSL/TLS
- **Containerisation** : Docker Compose
