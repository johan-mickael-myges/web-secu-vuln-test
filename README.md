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

**Solutions** :

**Solution Manuelle** :
```diff
+ // Validation manuelle
+ if (!username || typeof username !== 'string') {
+     throw new Error('Username is required and must be a string');
+ }
+ 
+ if (username.length > 50) {
+     throw new Error('Username too long');
+ }
+ 
+ // Vérifier le format (lettres, chiffres, tirets, underscores)
+ if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
+     throw new Error('Invalid username format');
+ }
+ 
+ const query = { username: username.trim() };
```

**Solution avec Zod** :
```diff
+ // Avec Zod (validation de schéma)
+ import { z } from 'zod';
+ 
+ const UsernameSchema = z.string()
+     .min(1, 'Username is required')
+     .max(50, 'Username too long')
+     .regex(/^[a-zA-Z0-9_-]+$/, 'Invalid username format');
+ 
+ const validatedUsername = UsernameSchema.parse(username);
+ const query = { username: validatedUsername };
```

**Solution avec Joi** :
```diff
+ // Avec Joi (validation alternative)
+ import Joi from 'joi';
+ 
+ const { error, value } = Joi.string()
+     .min(1).max(50)
+     .pattern(/^[a-zA-Z0-9_-]+$/)
+     .validate(username);
+ 
+ if (error) throw new Error(error.details[0].message);
+ const query = { username: value };
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

**Solutions** :

**Solution Manuelle** :
```diff
+ // Sanitisation manuelle
+ if (!content || typeof content !== 'string') {
+     throw new Error('Search content is required and must be a string');
+ }
+ 
+ if (content.length > 200) {
+     throw new Error('Search content too long');
+ }
+ 
+ // Échapper les caractères spéciaux pour les regex
+ const sanitizedContent = content
+     .trim()
+     .replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
+ 
+ const query = { content: { $regex: sanitizedContent, $options: 'i' } };
```

**Solution avec Zod** :
```diff
+ // Avec Zod + escape-regex-string
+ import { z } from 'zod';
+ import escapeRegex from 'escape-regex-string';
+ 
+ const ContentSchema = z.string()
+     .min(1, 'Search content is required')
+     .max(200, 'Search content too long')
+     .transform(val => escapeRegex(val.trim()));
+ 
+ const sanitizedContent = ContentSchema.parse(content);
+ const query = { content: { $regex: sanitizedContent, $options: 'i' } };
```

**Solution avec Joi** :
```diff
+ // Avec Joi + escape-regex-string
+ import Joi from 'joi';
+ import escapeRegex from 'escape-regex-string';
+ 
+ const { error, value } = Joi.string()
+     .min(1).max(200)
+     .validate(content);
+ 
+ if (error) throw new Error(error.details[0].message);
+ const sanitizedContent = escapeRegex(value.trim());
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

**Solutions** :

**Solution Manuelle** :
```diff
+ // Validation manuelle
+ if (!room || typeof room !== 'string') {
+     throw new Error('Room name is required and must be a string');
+ }
+ 
+ if (room.length > 50) {
+     throw new Error('Room name too long');
+ }
+ 
+ // Vérifier le format (lettres, chiffres, tirets, underscores)
+ if (!/^[a-zA-Z0-9_-]+$/.test(room)) {
+     throw new Error('Invalid room name format');
+ }
+ 
+ const query = { room: room.trim() };
```

**Solution avec Zod** :
```diff
+ // Avec Zod (validation de schéma)
+ import { z } from 'zod';
+ 
+ const RoomSchema = z.string()
+     .min(1, 'Room name is required')
+     .max(50, 'Room name too long')
+     .regex(/^[a-zA-Z0-9_-]+$/, 'Invalid room name format');
+ 
+ const validatedRoom = RoomSchema.parse(room);
+ const query = { room: validatedRoom };
```

**Solution avec Joi** :
```diff
+ // Avec Joi (validation alternative)
+ import Joi from 'joi';
+ 
+ const { error, value } = Joi.string()
+     .min(1).max(50)
+     .pattern(/^[a-zA-Z0-9_-]+$/)
+     .validate(room);
+ 
+ if (error) throw new Error(error.details[0].message);
+ const query = { room: value };
```

### 4. Chat en Temps Réel
**Fonctionnalité** : Messagerie instantanée avec Socket.IO

**Vulnérabilité** : Pas de validation du contenu des messages
```diff
- const newMessage: Message = { ...message, timestamp: new Date() };
- // Pas de validation du contenu
```

**Solutions** :

**Solution Manuelle** :
```diff
+ // Validation et sanitisation manuelle
+ if (!message.content || typeof message.content !== 'string') {
+     throw new Error('Message content is required and must be a string');
+ }
+ 
+ if (message.content.length > 1000) {
+     throw new Error('Message content too long');
+ }
+ 
+ // Nettoyer le contenu
+ const sanitizedContent = message.content
+     .trim()
+     .replace(/[<>]/g, '') // Éviter les balises HTML
+     .replace(/\s+/g, ' '); // Normaliser les espaces
+ 
+ if (sanitizedContent.length === 0) {
+     throw new Error('Message content cannot be empty after cleaning');
+ }
+ 
+ const newMessage: Message = { 
+     ...message, 
+     content: sanitizedContent,
+     timestamp: new Date() 
+ };
```

**Solution avec Zod** :
```diff
+ // Avec Zod (validation de schéma)
+ import { z } from 'zod';
+ 
+ const MessageSchema = z.object({
+     content: z.string()
+         .min(1, 'Message cannot be empty')
+         .max(1000, 'Message too long')
+         .transform(val => val.trim())
+         .refine(val => val.length > 0, 'Message cannot be empty after trimming'),
+     username: z.string().min(1).max(50),
+     room: z.string().min(1).max(50)
+ });
+ 
+ const validatedMessage = MessageSchema.parse(message);
+ const newMessage: Message = { 
+     ...validatedMessage, 
+     timestamp: new Date() 
+ };
```

**Solution avec Joi** :
```diff
+ // Avec Joi (validation alternative)
+ import Joi from 'joi';
+ 
+ const messageSchema = Joi.object({
+     content: Joi.string().min(1).max(1000).required(),
+     username: Joi.string().min(1).max(50).required(),
+     room: Joi.string().min(1).max(50).required()
+ });
+ 
+ const { error, value } = messageSchema.validate(message);
+ if (error) throw new Error(error.details[0].message);
+ 
+ const newMessage: Message = { ...value, timestamp: new Date() };
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

## 📚 Librairies de Sécurité Recommandées

### Validation de Données
- **Zod** : Validation de schémas TypeScript-first
- **Joi** : Validation robuste et flexible
- **Yup** : Validation simple et performante

### Sanitisation
- **escape-regex-string** : Échapper les caractères spéciaux pour les regex
- **DOMPurify** : Sanitisation HTML côté client
- **validator.js** : Validation et sanitisation complète

### Protection NoSQL
- **mongodb-sanitize** : Nettoyer les objets MongoDB
- **express-rate-limit** : Limiter les requêtes
- **helmet** : Headers de sécurité HTTP
