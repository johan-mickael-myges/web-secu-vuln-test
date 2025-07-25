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

**Pourquoi c'est vulnérable** : Le code utilise `JSON.parse()` sur l'input utilisateur sans validation. Un attaquant peut injecter des opérateurs MongoDB malveillants comme `{"$ne": null}` pour récupérer tous les utilisateurs au lieu d'un seul.
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
+ // Protection contre l'injection 
+ if (typeof username !== 'string') {
+     throw new Error('Username must be a string');
+ }
+ 
+ // Validation stricte : whitelist des caractères autorisés
+ const allowedChars = /^[a-zA-Z0-9_-]+$/;
+ if (!allowedChars.test(username)) {
+     throw new Error('Username contains invalid characters');
+ }
+ 
+ const query = { username: username };
```

**Solution avec Zod** :
```diff
+ // Avec Zod (protection contre l'injection)
+ import { z } from 'zod';
+ 
+ const UsernameSchema = z.string()
+     .regex(/^[a-zA-Z0-9_-]+$/, 'Username contains invalid characters');
+ 
+ const validatedUsername = UsernameSchema.parse(username);
+ const query = { username: validatedUsername };
```

**Solution avec Joi** :
```diff
+ // Avec Joi (protection contre l'injection)
+ import Joi from 'joi';
+ 
+ const { error, value } = Joi.string()
+     .pattern(/^[a-zA-Z0-9_-]+$/)
+     .validate(username);
+ 
+ if (error) throw new Error(error.details[0].message);
+ const query = { username: value };
```

### 2. Recherche par Contenu
**Fonctionnalité** : Recherche dans le texte des messages

**Vulnérabilité** : Injection NoSQL via JSON parsing

**Pourquoi c'est vulnérable** : Le code utilise `JSON.parse()` sur l'input utilisateur. Un attaquant peut injecter des opérateurs MongoDB comme `{"$regex": ".*"}` pour récupérer tous les messages au lieu de faire une recherche normale.
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
+ // Protection contre l'injection
+ if (typeof content !== 'string') {
+     throw new Error('Content must be a string');
+ }
+ 
+ // Utiliser des paramètres préparés au lieu de concaténation
+ const query = { content: { $regex: content, $options: 'i' } };
+ 
+ // Alternative : utiliser l'indexation MongoDB sécurisée
+ // const query = { content: content };
```

**Solution avec Zod** :
```diff
+ // Avec Zod (protection contre l'injection)
+ import { z } from 'zod';
+ 
+ const ContentSchema = z.string();
+ 
+ const validatedContent = ContentSchema.parse(content);
+ const query = { content: { $regex: validatedContent, $options: 'i' } };
```

**Solution avec Joi** :
```diff
+ // Avec Joi (protection contre l'injection)
+ import Joi from 'joi';
+ 
+ const { error, value } = Joi.string().validate(content);
+ 
+ if (error) throw new Error(error.details[0].message);
+ const query = { content: { $regex: value, $options: 'i' } };
```

### 3. Recherche par Salle
**Fonctionnalité** : Recherche de messages par salle

**Vulnérabilité** : Injection NoSQL via JSON parsing

**Pourquoi c'est vulnérable** : Le code utilise `JSON.parse()` sur l'input utilisateur. Un attaquant peut injecter des opérateurs MongoDB comme `{"$ne": null}` pour récupérer tous les messages de toutes les salles au lieu d'une salle spécifique.
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
+ // Protection contre l'injection
+ if (typeof room !== 'string') {
+     throw new Error('Room must be a string');
+ }
+ 
+ // Validation stricte : whitelist des caractères autorisés
+ const allowedChars = /^[a-zA-Z0-9_-]+$/;
+ if (!allowedChars.test(room)) {
+     throw new Error('Room name contains invalid characters');
+ }
+ 
+ const query = { room: room };
```

**Solution avec Zod** :
```diff
+ // Avec Zod (protection contre l'injection)
+ import { z } from 'zod';
+ 
+ const RoomSchema = z.string()
+     .regex(/^[a-zA-Z0-9_-]+$/, 'Room name contains invalid characters');
+ 
+ const validatedRoom = RoomSchema.parse(room);
+ const query = { room: validatedRoom };
```

**Solution avec Joi** :
```diff
+ // Avec Joi (protection contre l'injection)
+ import Joi from 'joi';
+ 
+ const { error, value } = Joi.string()
+     .pattern(/^[a-zA-Z0-9_-]+$/)
+     .validate(room);
+ 
+ if (error) throw new Error(error.details[0].message);
+ const query = { room: value };
```

### 4. Chat en Temps Réel
**Fonctionnalité** : Messagerie instantanée avec Socket.IO

**Vulnérabilité** : Pas de validation du contenu des messages

**Pourquoi c'est vulnérable** : Le code accepte n'importe quel contenu sans validation. Un attaquant peut injecter du code malveillant, des balises HTML dangereuses, ou des scripts qui s'exécutent côté client, créant des vulnérabilités XSS.
```diff
- const newMessage: Message = { ...message, timestamp: new Date() };
- // Pas de validation du contenu
```

**Solutions** :

**Solution Manuelle** :
```diff
+ // Protection contre l'injection 
+ if (typeof message.content !== 'string') {
+     throw new Error('Message content must be a string');
+ }
+ 
+ // Sanitisation : échapper les caractères dangereux
+ const sanitizedContent = message.content
+     .replace(/[<>]/g, '') // Éviter les balises HTML
+     .replace(/javascript:/gi, '') // Éviter les protocoles dangereux
+     .trim();
+ 
+ const newMessage: Message = { 
+     ...message, 
+     content: sanitizedContent,
+     timestamp: new Date() 
+ };
```

**Solution avec Zod** :
```diff
+ // Avec Zod (protection contre l'injection)
+ import { z } from 'zod';
+ 
+ const MessageSchema = z.object({
+     content: z.string()
+         .transform(val => val
+             .replace(/[<>]/g, '')
+             .replace(/javascript:/gi, '')
+             .trim()
+         ),
+     username: z.string(),
+     room: z.string()
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
+ // Avec Joi (protection contre l'injection)
+ import Joi from 'joi';
+ 
+ const messageSchema = Joi.object({
+     content: Joi.string()
+         .custom((val, helpers) => {
+             const sanitized = val
+                 .replace(/[<>]/g, '')
+                 .replace(/javascript:/gi, '')
+                 .trim();
+             return sanitized;
+         })
+         .required(),
+     username: Joi.string().required(),
+     room: Joi.string().required()
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

### Sanitisation et Protection
- **DOMPurify** : Sanitisation HTML côté client
- **validator.js** : Validation et sanitisation complète
- **xss** : Protection contre les attaques XSS
- **sqlstring** : Échapper les caractères pour SQL

### Sécurité Générale
- **helmet** : Headers de sécurité HTTP
- **express-rate-limit** : Limiter les requêtes
- **cors** : Configuration CORS sécurisée
- **bcrypt** : Hachage sécurisé des mots de passe
